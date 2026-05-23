const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');
const fetchDefault = require('node-fetch');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const { body, validationResult } = require('express-validator');
require('dotenv').config();

// ---------------------------------------------------------------------------
// Hoisted helpers (no dependency on app instance / env). These are shared by
// buildApp() and startServer().
// ---------------------------------------------------------------------------

// Constant-time string comparison to defeat timing attacks on the admin API key.
function safeCompare(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const aBuf = Buffer.from(a, 'utf8');
  const bBuf = Buffer.from(b, 'utf8');
  if (aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
}

// Neutralize CSV formula injection. Spreadsheet apps (Excel/LibreOffice/Numbers/
// Google Sheets) interpret a cell that starts with =, +, -, @, tab, or CR as a
// formula, which can exfiltrate data or execute DDE. Prefix such cells with a
// single quote so they are treated as literal text, then quote every cell.
function csvEscape(value) {
  if (value === null || value === undefined) return '""';
  let str = String(value);
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }
  return `"${str.replace(/"/g, '""')}"`;
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
      csvEscape(f.id),
      csvEscape(f.name || ''),
      csvEscape(f.email || ''),
      csvEscape(f.rating),
      csvEscape(f.category),
      csvEscape(f.message || ''),
      csvEscape(f.timestamp),
      csvEscape(f.userAgent || ''),
      csvEscape(f.referrer || '')
    ].join(','))
  ];

  return csvRows.join('\n');
}

// Ensure data directories exist
async function ensureDirectories(paths) {
  try {
    await fs.mkdir(path.dirname(paths.FEEDBACK_FILE), { recursive: true });
    await fs.mkdir(paths.CSV_DIR, { recursive: true });
  } catch (error) {
    console.error('Error creating directories:', error);
  }
}

// Initialize data file if it doesn't exist
async function initializeDataFile(feedbackFile) {
  try {
    await fs.access(feedbackFile);
  } catch (error) {
    // File doesn't exist, create it with empty array
    await fs.writeFile(feedbackFile, JSON.stringify([], null, 2));
  }
}

// Read feedback from file
async function readFeedback(feedbackFile) {
  try {
    const data = await fs.readFile(feedbackFile, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading feedback:', error);
    return [];
  }
}

// Write feedback to file
async function writeFeedback(feedbackFile, feedbackArray) {
  try {
    await fs.writeFile(feedbackFile, JSON.stringify(feedbackArray, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing feedback:', error);
    return false;
  }
}

// Save CSV to server
async function saveCSVToServer(csvDir, feedbackArray) {
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `feedback-${timestamp}.csv`;
  const filepath = path.join(csvDir, filename);

  try {
    const csvContent = generateCSV(feedbackArray);
    await fs.writeFile(filepath, csvContent);
    return { success: true, filename, filepath };
  } catch (error) {
    console.error('Error saving CSV:', error);
    return { success: false, error: error.message };
  }
}

// ---------------------------------------------------------------------------
// App factory
// ---------------------------------------------------------------------------

function buildApp(opts = {}) {
  const env = opts.env || process.env;
  const fetch = opts.fetch || fetchDefault;

  // Environment validation - fail fast if critical variables are missing
  if (!env.LLM_API_KEY) {
    throw new Error('FATAL: LLM_API_KEY environment variable is not set');
  }

  // Configuration Constants
  const CONFIG = {
    PORT: env.PORT || 3001,
    MAX_FEEDBACK_ENTRIES: 1000,
    MAX_FEEDBACK_AGE_DAYS: 365,
    LLM_TIMEOUT_MS: 30000,
    LLM_API_URL: env.VITE_LLM_API_URL || 'https://models.inference.ai.azure.com/chat/completions',
    LLM_MODEL: env.VITE_LLM_MODEL || 'gpt-4.1-mini',
  };

  // Rate Limiting Constants
  const RATE_LIMITS = {
    GLOBAL: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // requests per window
    },
    LLM: {
      windowMs: 60 * 1000, // 1 minute
      max: 10, // requests per window
    },
    FEEDBACK: {
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 5, // submissions per window
    },
  };

  const app = express();

  // Security Middleware
  app.use(helmet()); // Adds various HTTP headers for security

  // CORS configuration - Use specific origins in production
  const allowedOrigins = env.ALLOWED_ORIGINS
    ? env.ALLOWED_ORIGINS.split(',')
    : env.NODE_ENV === 'production'
      ? ['https://patrickadrianus.com', 'https://www.patrickadrianus.com']
      : ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'];

  app.use(cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'DELETE'],
    credentials: true
  }));

  // Body parser with size limits
  app.use(express.json({ limit: '50kb' })); // Increased to 50kb to accommodate system prompts with knowledge base

  // Trust proxy (important for rate limiting behind nginx)
  // Only trust loopback, link-local, and unique local addresses
  app.set('trust proxy', 'loopback, linklocal, uniquelocal');

  // Global rate limiter - general protection
  const globalLimiter = rateLimit({
    windowMs: RATE_LIMITS.GLOBAL.windowMs,
    max: RATE_LIMITS.GLOBAL.max,
    message: { success: false, message: 'Too many requests, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
  });

  // Strict rate limiter for LLM endpoint
  const llmLimiter = rateLimit({
    windowMs: RATE_LIMITS.LLM.windowMs,
    max: RATE_LIMITS.LLM.max,
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
    windowMs: RATE_LIMITS.FEEDBACK.windowMs,
    max: RATE_LIMITS.FEEDBACK.max,
    message: {
      success: false,
      message: 'You have submitted too much feedback. Please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
  });

  // Admin API key authentication middleware
  const adminAuth = (req, res, next) => {
    const apiKey = req.headers['x-admin-api-key'];
    const validApiKey = env.ADMIN_API_KEY;

    if (!validApiKey) {
      // If no admin key is configured, only allow in development
      if (env.NODE_ENV !== 'production') {
        return next();
      }
      return res.status(503).json({
        success: false,
        message: 'Admin API not configured'
      });
    }

    if (!safeCompare(apiKey, validApiKey)) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Invalid or missing API key'
      });
    }

    next();
  };

  // Apply global rate limiter to all routes
  app.use('/api/', globalLimiter);

  // Feedback storage file paths
  const FEEDBACK_FILE = path.join(__dirname, 'data', 'feedback.json');
  const CSV_DIR = path.join(__dirname, 'data', 'csv');

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
      const feedbackArray = await readFeedback(FEEDBACK_FILE);

      // Add new feedback
      feedbackArray.push(feedback);

      // Keep only last N entries as configured
      if (feedbackArray.length > CONFIG.MAX_FEEDBACK_ENTRIES) {
        feedbackArray.splice(0, feedbackArray.length - CONFIG.MAX_FEEDBACK_ENTRIES);
      }

      // Save to file
      const saved = await writeFeedback(FEEDBACK_FILE, feedbackArray);

      if (saved) {
        // Also save CSV backup
        await saveCSVToServer(CSV_DIR, feedbackArray);

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

  // Get all feedback (for dashboard) - Admin only
  app.get('/api/feedback', adminAuth, async (req, res) => {
    try {
      const feedbackArray = await readFeedback(FEEDBACK_FILE);
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

  // Get feedback statistics (with caching)
  app.get('/api/feedback/stats', async (req, res) => {
    try {
      const feedbackArray = await readFeedback(FEEDBACK_FILE);

      // Add cache control header - cache for 60 seconds
      res.setHeader('Cache-Control', 'public, max-age=60');

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

  // Export CSV - Admin only
  app.get('/api/feedback/export-csv', adminAuth, async (req, res) => {
    try {
      const feedbackArray = await readFeedback(FEEDBACK_FILE);

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

  // Delete all feedback (with confirmation) - Admin only
  app.delete('/api/feedback', adminAuth, async (req, res) => {
    try {
      const { confirm } = req.body;

      if (confirm !== 'DELETE_ALL_FEEDBACK') {
        return res.status(400).json({
          success: false,
          message: 'Confirmation required'
        });
      }

      await writeFeedback(FEEDBACK_FILE, []);

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
      // Allow longer content for system messages (up to 10000 chars), shorter for user messages
      body('messages.*.content').isString().isLength({ min: 1, max: 10000 }),
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

      // Add timeout to prevent hanging requests
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), CONFIG.LLM_TIMEOUT_MS);

      try {
        const response = await fetch(CONFIG.LLM_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${env.LLM_API_KEY}`
          },
          body: JSON.stringify({
            messages,
            model: model || CONFIG.LLM_MODEL,
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

  return { app, paths: { FEEDBACK_FILE, CSV_DIR }, config: CONFIG };
}

// ---------------------------------------------------------------------------
// Server boot
// ---------------------------------------------------------------------------

async function startServer() {
  const { app, paths, config } = buildApp();
  await ensureDirectories(paths);
  await initializeDataFile(paths.FEEDBACK_FILE);

  app.listen(config.PORT, () => {
    console.log(`✅ Server running on port ${config.PORT}`);
    console.log(`📊 Feedback data: ${paths.FEEDBACK_FILE}`);
    console.log(`📁 CSV files: ${paths.CSV_DIR}`);
    console.log(`🤖 LLM Model: ${config.LLM_MODEL}`);
    console.log(`⚡ Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

if (require.main === module) {
  startServer().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = { buildApp };
