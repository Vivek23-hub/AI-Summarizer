const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const { OpenAI } = require('openai');
const Document = require('../models/Document');
const fs = require('fs');
const { authMW, requireAuth } = require('../middleware/auth');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Initialize OpenAI client
// Note: If OPENAI_API_KEY is an invalid key, the API request will fail. We will return the error to the user cleanly.
const getOpenAIClient = () => {
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key_here') {
    throw new Error('Please configure a valid OPENAI_API_KEY in the backend .env file');
  }
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
};

router.post('/upload', requireAuth, upload.single('file'), async (req, res) => {
  try {
    let extractedText = '';
    let originalname = 'Pasted Text';

    if (req.file) {
      const { mimetype, path, originalname: filename } = req.file;
      originalname = filename;
      
      if (mimetype === 'application/pdf') {
        const dataBuffer = fs.readFileSync(path);
        const data = await pdfParse(dataBuffer);
        extractedText = data.text;
      } else if (mimetype === 'text/plain') {
        extractedText = fs.readFileSync(path, 'utf8');
      } else {
        return res.status(400).json({ error: 'Unsupported file type. Please upload a PDF or plain text file.' });
      }
      
      // Clean up uploaded file
      try {
        fs.unlinkSync(path);
      } catch (e) {
        console.error(e);
      }
    } else if (req.body.text) {
      extractedText = req.body.text;
    } else {
      return res.status(400).json({ error: 'No file or text provided' });
    }

    if (!extractedText || extractedText.trim() === '') {
      return res.status(400).json({ error: 'Could not extract text from the input.' });
    }

    // Attempt to get OpenAI client
    let openai;
    try {
      openai = getOpenAIClient();
    } catch (configError) {
      return res.status(500).json({ error: configError.message });
    }

    // Generate summary using OpenAI
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that summarizes documents. Please summarize the following text comprehensively.',
        },
        {
          role: 'user',
          content: extractedText.substring(0, 15000), // Limiting text length to avoid token limits.
        },
      ],
      max_tokens: 500,
    });

    const summary = response.choices[0].message.content.trim();

    // Save history to MongoDB
    const newDoc = new Document({
      originalName: originalname,
      extractedText: extractedText,
      summary: summary,
      user: req.user ? req.user.id : undefined,
    });
    // We intentionally do not block on failure to save history so the user can still see the summary, but here we wait to verify mongodb connection.
    try {
        await newDoc.save();
    } catch (saveErr) {
        console.error("Failed to save to DB:", saveErr);
        // It's fine if MongoDB is down, we still return the summary
    }



    res.json({ success: true, summary, originalName: originalname });
  } catch (error) {
    console.error('Error in /upload route:', error);
    res.status(500).json({ error: error.message || 'An error occurred during summarization.' });
  }
});

// GET /api/summaries - Fetch summaries for the logged-in user
router.get('/summaries', requireAuth, async (req, res) => {
  try {
    const documents = await Document.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(documents);
  } catch (err) {
    console.error('Error fetching summaries:', err);
    res.status(500).send('Server error');
  }
});

module.exports = router;
