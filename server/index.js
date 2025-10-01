const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const fetch = require('node-fetch'); // Add fetch for LLM API calls
require('dotenv').config(); // Load environment variables
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

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

// Submit feedback
app.post('/api/feedback', async (req, res) => {
  try {
    const { name, email, rating, category, message, userAgent, referrer } = req.body;
    
    // Validate required fields
    if (!name || !rating || !category || !message) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: name, rating, category, message'
      });
    }

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

// LLM Chat endpoint (proxy to protect API key)
app.post('/api/llm/chat', async (req, res) => {
  try {
    const { messages, model } = req.body;
    
    if (!process.env.LLM_API_KEY) {
      return res.status(500).json({
        success: false,
        message: 'LLM API key not configured'
      });
    }

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
      })
    });

    if (!response.ok) {
      throw new Error(`LLM API error: ${response.status}`);
    }

    const data = await response.json();
    res.json({
      success: true,
      data
    });
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