const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pool = require('../config/db');
const auth = require('../middleware/auth');
const { chatWithGroq, chatWithRAG } = require('../services/groqService');
const { searchTavily } = require('../services/tavilyService');
const { processDocument, processZipFile } = require('../services/ragService');

// Chat with AI assistant
router.post('/chat', auth, async (req, res) => {
  try {
    const { message, session_id, use_rag } = req.body;
    if (!message) return res.status(400).json({ error: 'Message is required' });

    const sessionId = session_id || `session_${Date.now()}`;

    // Save user message
    await pool.execute(
      'INSERT INTO chat_history (user_id, role, message, session_id) VALUES (?, ?, ?, ?)',
      [req.user.id, 'user', message, sessionId]
    );

    let response;

    if (use_rag !== false) {
      // ONLY pull from user_id = 1 (System / Cloudinary knowledge) AND user specific chunks if needed.
      // Modifying to heavily rely on system files as requested.
      const [chunks] = await pool.execute(
        `SELECT dc.content FROM document_chunks dc
         JOIN documents d ON dc.document_id = d.id
         WHERE (dc.user_id = 1 OR dc.user_id = ?) AND d.status = 'ready'
         ORDER BY dc.id DESC LIMIT 40`,
        [req.user.id]
      );

      // Context gathering based on type
      let goals = [], expenses = [], holdings = [];
      let cashFlow = [], invoices = [];
      let activePlan = null;
      let userData = { monthly_income: 0 };
      const [uData] = await pool.execute('SELECT monthly_income FROM financial_profiles WHERE user_id = ?', [req.user.id]);
      userData = uData[0] || userData;

      if (req.user.user_type === 'individual') {
        [holdings] = await pool.execute('SELECT type, name, invested_amount, current_value FROM holdings WHERE user_id = ? LIMIT 20', [req.user.id]);
        [goals] = await pool.execute('SELECT name, target_amount, current_amount, status FROM financial_goals WHERE user_id = ? LIMIT 10', [req.user.id]);
        [expenses] = await pool.execute('SELECT category, SUM(amount) as total FROM expenses WHERE user_id = ? GROUP BY category', [req.user.id]);
        const [plans] = await pool.execute('SELECT * FROM financial_plans WHERE user_id = ?', [req.user.id]);
        activePlan = plans[0] || null;
      } else {
        [cashFlow] = await pool.execute('SELECT type, category, amount FROM cash_flows WHERE user_id = ? LIMIT 20', [req.user.id]);
        [invoices] = await pool.execute('SELECT status, amount FROM invoices WHERE user_id = ? LIMIT 20', [req.user.id]);
      }

      const context = {
        documentChunks: chunks.map(c => c.content),
        userProfileInfo: { type: req.user.user_type, monthly_income: userData.monthly_income },
        activePlan,
        portfolio: holdings,
        goals,
        expenses,
        businessData: { cashFlow, invoices }
      };

      response = await chatWithRAG(message, context, req.user.name);
    } else {
      response = await chatWithGroq(message, req.user.name);
    }

    // Save assistant response
    await pool.execute(
      'INSERT INTO chat_history (user_id, role, message, session_id) VALUES (?, ?, ?, ?)',
      [req.user.id, 'assistant', response, sessionId]
    );

    res.json({ response, session_id: sessionId });
  } catch (err) {
    console.error('AI Chat error:', err);
    res.status(500).json({ error: 'AI assistant failed to respond' });
  }
});

// Search with Tavily
router.post('/search', auth, async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) return res.status(400).json({ error: 'Query is required' });

    const results = await searchTavily(query);

    const summary = await chatWithGroq(
      `Summarize these financial search results concisely:\n\nQuery: "${query}"\n\nResults:\n${results.map(r => `- ${r.title}: ${r.content}`).join('\n')}`,
      req.user.name
    );

    res.json({ query, results, summary });
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ error: 'Search failed' });
  }
});

// Get chat history for user
router.get('/history', auth, async (req, res) => {
  try {
    const { session_id } = req.query;
    let query = 'SELECT role, message as content, session_id, created_at FROM chat_history WHERE user_id = ?';
    const params = [req.user.id];

    if (session_id) {
      query += ' AND session_id = ?';
      params.push(session_id);
    }

    query += ' ORDER BY created_at ASC LIMIT 100';
    const [history] = await pool.execute(query, params);
    res.json(history);
  } catch (err) {
    console.error('Failed to fetch chat history:', err);
    res.status(500).json({ error: 'Failed to fetch chat history' });
  }
});

// One-click profile review
router.post('/portfolio-review', auth, async (req, res) => {
  try {
    // Individual & Business summarized from common holdings & profile tables
    const [holdings] = await pool.execute('SELECT * FROM holdings WHERE user_id = ?', [req.user.id]);
    const [profile] = await pool.execute('SELECT * FROM financial_profiles WHERE user_id = ?', [req.user.id]);
    
    const userSummary = holdings.map(h => `${h.name}: ₹${h.current_value || h.invested_amount}`).join(', ');
    const profileSummary = profile[0] ? `Monthly Income: ${profile[0].monthly_income}, Essential: ${profile[0].essential_expenses}` : '';
    
    const summaryText = `Context for ${req.user.name} (${req.user.user_type}):\nPortfolio: ${userSummary}\nProfile: ${profileSummary}`;

    const prompt = `You are an expert AI financial string analyst. Provide a comprehensive brief review for ${req.user.name} who is a ${req.user.user_type}.\nData summary: ${summaryText}`;
    const review = await chatWithGroq(prompt, req.user.name);

    res.json({ review, session_id: 'review_' + Date.now() });
  } catch (err) {
    console.error('Portfolio review error:', err);
    res.status(500).json({ error: 'Portfolio review failed' });
  }
});

// AI Asset Allocation Analysis matching strict numerical target
router.post('/analyse-allocation', auth, async (req, res) => {
  try {
    const { category, assetType, mode, targetValue } = req.body;
    
    // Get RAG Context (System Cloudinary + User uploads)
    const [chunks] = await pool.execute(
      `SELECT dc.content FROM document_chunks dc
       JOIN documents d ON dc.document_id = d.id
       WHERE (dc.user_id = 1 OR dc.user_id = ?) AND d.status = 'ready'
       ORDER BY dc.id DESC LIMIT 40`,
      [req.user.id]
    );
    
    let searchContext = '';
    // If Cloudinary context is sparse, fetch from search/Tavily
    if (chunks.length < 5) {
      try {
        const { searchTavily } = require('../services/tavilyService');
        const searchResults = await searchTavily(`best ${assetType} in India for ${category} portfolio with PE > 25 growth metrics`);
        searchContext = searchResults.map(r => `${r.title}: ${r.content}`).join('\n');
      } catch (se) {
        console.error('Tavily fallback fail:', se.message);
      }
    }

    const globalContext = [
      chunks.map(c => c.content).join('\n---\n'),
      searchContext ? `\n--- WEB SEARCH RESULTS ---\n${searchContext}` : ''
    ].filter(Boolean).join('\n');

    const prompt = `
      You are a precise financial engine terminal behaving like Alpha Vantage or Bloomberg.
      Your task is to recommend a SPECIFIC asset to fulfill an exact strategy gap.
      
      User Rules: 
      - Category: ${category}
      - Asset Type: ${assetType}
      - Investment Mode: ${mode}
      - Exact Target Portfolio Gap: ₹${targetValue}
      
      Analytical Constraints:
      If Equity/Stocks: PE > 25, PB > 20, Debt-to-Equity > 1 (Find matching or simulate safely based on context). 
      If MF/ETF: Use context.
      
      Global Market/System Context available (Cloudinary + Search):
      ${globalContext || 'NO RELEVANT DOCUMENTS OR SEARCH DATA FOUND.'}
      
      INSTRUCTIONS IF CONTEXT IS MISSING:
      If globalContext is empty or irrelevant, you MUST act as a Global Financial Terminal with internal data access to Alpha Vantage and common market indices. 
      Generate a realistic, high-quality asset recommendation (e.g., NIFTY 50 ETF, HDFC Bank, SBI Mutual Fund) based on your training data of current top-tier Indian assets.
      
      CRITICAL MATH RULE:
      You MUST return exactly ONE asset where (Quantity * Price) = ${targetValue}.
      
      YOU MUST RETURN ONLY A VALID JSON ARRAY OF 1 OBJECT. NO MARKDOWN OR OTHER TEXT.
      [
        {
          "name": "Asset Name or Symbol",
          "price": "Number denoting current price",
          "quantity": "Number denoting quantity to buy",
          "total_value": ${targetValue},
          "reason": "Short one line analysis based on constraints"
        }
      ]
    `;

    const response = await chatWithGroq(prompt, "System Analytics");

    // Extract JSON safely
    let aiJson;
    try {
      const match = response.match(/\[[\s\S]*?\]/);
      aiJson = match ? JSON.parse(match[0]) : JSON.parse(response);
    } catch (e) {
      // Fallback generator if AI fails to return strict json
      aiJson = [{
        name: "Mock AI Assessed ETF",
        price: targetValue,
        quantity: 1,
        total_value: targetValue,
        reason: "Matched system constraints fallback."
      }];
    }

    res.json(aiJson);
  } catch (err) {
    console.error('Analyse Allocation Error:', err);
    res.status(500).json({ error: 'Failed to generate allocation analysis' });
  }
});

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9) + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});

// Upload document for RAG (BUSINESS ONLY)
router.post('/upload', auth, upload.single('file'), async (req, res) => {
  try {
    if (req.user.user_type !== 'business') {
      return res.status(403).json({ error: 'Only business accounts can upload proprietary documents.' });
    }
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const file = req.file;
    const ext = path.extname(file.originalname).toLowerCase();
    let fileType = 'pdf';
    if (['.xlsx', '.xls'].includes(ext)) fileType = 'excel';
    else if (ext === '.csv') fileType = 'csv';
    else if (ext === '.zip') fileType = 'zip';

    const [result] = await pool.execute(
      'INSERT INTO documents (user_id, filename, original_name, file_type, file_size, status) VALUES (?, ?, ?, ?, ?, ?)',
      [req.user.id, file.filename, file.originalname, fileType, file.size, 'processing']
    );

    const docId = result.insertId;

    if (fileType === 'zip') {
      processZipFile(file.path, docId, req.user.id, pool).catch(console.error);
    } else {
      processDocument(file.path, fileType, docId, req.user.id, pool).catch(console.error);
    }

    res.status(201).json({ message: 'File uploaded', document_id: docId });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Failed to upload' });
  }
});

// Get documents
router.get('/documents', auth, async (req, res) => {
  try {
    const [docs] = await pool.execute('SELECT id, original_name, status FROM documents WHERE user_id = ? ORDER BY uploaded_at DESC', [req.user.id]);
    res.json(docs);
  } catch (err) {
    res.status(500).json({ error: 'Failed' });
  }
});

// Delete document
router.delete('/documents/:id', auth, async (req, res) => {
  try {
    await pool.execute('DELETE FROM documents WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed' });
  }
});

module.exports = router;
