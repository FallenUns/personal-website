const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const fetch = require('node-fetch');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const { body, validationResult } = require('express-validator');
require('dotenv').config();

const app = express();

// Security Middleware
app.use(helmet()); // Adds various HTTP headers for security

// CORS configuration
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
  methods: ['GET', 'POST', 'DELETE'],
  credentials: true
}));

// Body parser with size limits
app.use(express.json({ limit: '10kb' })); // Limit request body size

// Trust proxy (important for rate limiting behind nginx)
app.set('trust proxy', 1);

// Global rate limiter - general protection
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { success: false, message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict rate limiter for LLM endpoint
const llmLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // Limit each IP to 10 LLM requests per minute
  message: { 
    success: false, 
    message: 'Too many AI requests. Please wait a moment before trying again.' 
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false, // Count all requests
});

// Feedback submission rate limiter
const feedbackLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 feedback submissions per hour
  message: { 
    success: false, 
    message: 'You have submitted too much feedback. Please try again later.' 
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply global rate limiter to all routes
app.use('/api/', globalLimiter);

// Feedback storage file paths
const FEEDBACK_FILE = path.join(__dirname, 'data', 'feedback.json');
const CSV_DIR = path.join(__dirname, 'data', 'csv');

// Ensure data directories exist
async function ensureDirectories() {
  try {
    await fs.mkdir(path.dirname(FEEDBACK_FILE), { recursive: true });
    await fs.mkdir(CSV_DIR, { recursive: true });
  } catch (error) {
    console.error('Error creating directories:', error);
  }
}

// Initialize data file if it doesn't exist
async function initializeDataFile() {
  try {
    await fs.access(FEEDBACK_FILE);
  } catch (error) {
    // File doesn't exist, create it with empty array
    await fs.writeFile(FEEDBACK_FILE, JSON.stringify([], null, 2));
  }
}

// Read feedback from file
async function readFeedback() {
  try {
    const data = await fs.readFile(FEEDBACK_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading feedback:', error);
    return [];
  }
}

// Write feedback to file
async function writeFeedback(feedbackArray) {
  try {
    await fs.writeFile(FEEDBACK_FILE, JSON.stringify(feedbackArray, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing feedback:', error);
    return false;
  }
}

// Generate CSV content
function generateCSV(feedbackArray) {
  const headers = [
    'ID', 'Name', 'Email', 'Rating', 'Category', 'Message', 
    'Timestamp', 'User Agent', 'Referrer'
  ];

  const csvRows = [
    headers.join(','),
    ...feedbackArray.map(f => [
      f.id,
      `"${(f.name || '').replace(/"/g, '""')}"`,
      f.email || '',
      f.rating,
      f.category,
      `"${(f.message || '').replace(/"/g, '""')}"`,
      f.timestamp,
      `"${(f.userAgent || '').replace(/"/g, '""')}"`,
      `"${(f.referrer || '').replace(/"/g, '""')}"`
    ].join(','))
  ];

  return csvRows.join('\n');
}

// Save CSV to server
async function saveCSVToServer(feedbackArray) {
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `feedback-${timestamp}.csv`;
  const filepath = path.join(CSV_DIR, filename);
  
  try {
    const csvContent = generateCSV(feedbackArray);
    await fs.writeFile(filepath, csvContent);
    return { success: true, filename, filepath };
  } catch (error) {
    console.error('Error saving CSV:', error);
    return { success: false, error: error.message };
  }
}

// API Routes

// Submit feedback with validation and rate limiting
app.post('/api/feedback', 
  feedbackLimiter,
  [
    body('name').trim().notEmpty().isLength({ max: 100 }).escape(),
    body('email').optional().trim().isEmail().normalizeEmail(),
    body('rating').isInt({ min: 1, max: 5 }),
    body('category').trim().notEmpty().isIn(['design', 'content', 'functionality', 'performance', 'general']),
    body('message').trim().notEmpty().isLength({ min: 10, max: 1000 }).escape(),
    body('userAgent').optional().trim().isLength({ max: 500 }),
    body('referrer').optional().trim().isLength({ max: 500 })
  ],
  async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid input data',
        errors: errors.array()
      });
    }

    const { name, email, rating, category, message, userAgent, referrer } = req.body;

    const feedback = {
      id: `feedback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      email: email || '',
      rating,
      category,
      message,
      timestamp: new Date().toISOString(),
      userAgent: userAgent || '',
      referrer: referrer || ''
    };

    // Read existing feedback
    const feedbackArray = await readFeedback();
    
    // Add new feedback
    feedbackArray.push(feedback);
    
    // Keep only last 1000 entries
    if (feedbackArray.length > 1000) {
      feedbackArray.splice(0, feedbackArray.length - 1000);
    }

    // Save to file
    const saved = await writeFeedback(feedbackArray);
    
    if (saved) {
      // Also save CSV backup
      await saveCSVToServer(feedbackArray);
      
      res.json({
        success: true,
        message: 'Thank you for your feedback! Your input has been saved and will help make this portfolio better. 🙏',
        id: feedback.id
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to save feedback. Please try again.'
      });
    }
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get all feedback (for dashboard)
app.get('/api/feedback', async (req, res) => {
  try {
    const feedbackArray = await readFeedback();
    res.json({
      success: true,
      data: feedbackArray
    });
  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch feedback'
    });
  }
});

// Get feedback statistics
app.get('/api/feedback/stats', async (req, res) => {
  try {
    const feedbackArray = await readFeedback();
    
    if (feedbackArray.length === 0) {
      return res.json({
        success: true,
        data: {
          totalFeedback: 0,
          averageRating: 0,
          categories: {},
          recentFeedback: []
        }
      });
    }

    const totalRatings = feedbackArray.reduce((sum, f) => sum + f.rating, 0);
    const averageRating = totalRatings / feedbackArray.length;
    
    const categories = feedbackArray.reduce((acc, f) => {
      acc[f.category] = (acc[f.category] || 0) + 1;
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        totalFeedback: feedbackArray.length,
        averageRating: Math.round(averageRating * 10) / 10,
        categories,
        recentFeedback: feedbackArray.slice(-5).reverse()
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics'
    });
  }
});

// Export CSV
app.get('/api/feedback/export-csv', async (req, res) => {
  try {
    const feedbackArray = await readFeedback();
    
    if (feedbackArray.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No feedback data to export'
      });
    }

    const csvContent = generateCSV(feedbackArray);
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `portfolio-feedback-${timestamp}.csv`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csvContent);
  } catch (error) {
    console.error('Error exporting CSV:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export CSV'
    });
  }
});

// Delete all feedback (with confirmation)
app.delete('/api/feedback', async (req, res) => {
  try {
    const { confirm } = req.body;
    
    if (confirm !== 'DELETE_ALL_FEEDBACK') {
      return res.status(400).json({
        success: false,
        message: 'Confirmation required'
      });
    }

    await writeFeedback([]);
    
    res.json({
      success: true,
      message: 'All feedback has been deleted'
    });
  } catch (error) {
    console.error('Error deleting feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete feedback'
    });
  }
});

// LLM Chat endpoint with strict rate limiting and validation
app.post('/api/llm/chat', 
  llmLimiter,
  [
    body('messages').isArray({ min: 1, max: 20 }),
    body('messages.*.role').isIn(['user', 'assistant', 'system']),
    body('messages.*.content').isString().isLength({ min: 1, max: 2000 }),
    body('model').optional().isString().isLength({ max: 100 })
  ],
  async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid message format',
        errors: errors.array()
      });
    }

    const { messages, model } = req.body;
    
    if (!process.env.LLM_API_KEY) {
      return res.status(500).json({
        success: false,
        message: 'LLM API key not configured'
      });
    }

    // Add timeout to prevent hanging requests
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    try {
      const response = await fetch(process.env.VITE_LLM_API_URL || 'https://models.inference.ai.azure.com/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.LLM_API_KEY}`
        },
        body: JSON.stringify({
          messages,
          model: model || process.env.VITE_LLM_MODEL || 'gpt-4.1-mini',
          temperature: 0.5,
          max_tokens: 300
        }),
        signal: controller.signal
      });

      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error(`LLM API error: ${response.status}`);
      }

      const data = await response.json();
      res.json({
        success: true,
        data
      });
    } catch (fetchError) {
      clearTimeout(timeout);
      if (fetchError.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw fetchError;
    }
  } catch (error) {
    console.error('Error calling LLM API:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process chat request'
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Initialize and start server
async function startServer() {
  await ensureDirectories();
  await initializeDataFile();
  
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`Feedback server running on port ${PORT}`);
    console.log(`Feedback data stored in: ${FEEDBACK_FILE}`);
    console.log(`CSV files stored in: ${CSV_DIR}`);
  });
}

startServer().catch(console.error);