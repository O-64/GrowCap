const express = require('express');
const router = express.Router();
const axios = require('axios');
const pool = require('../config/db');
const auth = require('../middleware/auth');
require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env') });

const ALPHA_VANTAGE_BASE = 'https://www.alphavantage.co/query';
const API_KEY = process.env.ALPHA_VANTAGE_API_KEY;

// Search stocks
router.get('/search', auth, async (req, res) => {
  try {
    const { keywords } = req.query;
    if (!keywords) return res.status(400).json({ error: 'Keywords required' });

    const response = await axios.get(ALPHA_VANTAGE_BASE, {
      params: { function: 'SYMBOL_SEARCH', keywords, apikey: API_KEY }
    });

    const matches = response.data.bestMatches || [];
    const results = matches.map(m => ({
      symbol: m['1. symbol'],
      name: m['2. name'],
      type: m['3. type'],
      region: m['4. region'],
      currency: m['8. currency']
    }));

    res.json(results);
  } catch (err) {
    console.error('Search error:', err.message);
    res.status(500).json({ error: 'Failed to search stocks' });
  }
});

const { chatWithGroq } = require('../services/groqService');
const { lookupSymbolInExcel } = require('../services/excelService');

// Get stock quote
router.get('/quote/:symbol', auth, async (req, res) => {
  try {
    const { symbol } = req.params;
    let quoteData = {};
    let source = 'API';

    // 1. Check Excel first
    const excelMatch = await lookupSymbolInExcel(symbol);
    if (excelMatch) {
      quoteData = {
        symbol: excelMatch.symbol,
        price: excelMatch.price,
        source: excelMatch.source,
        ...excelMatch
      };
      source = 'Excel';
    }

    // 2. Fallback to Alpha Vantage for Price if not in Excel or missing price
    if (!quoteData.price) {
      try {
        const response = await axios.get(ALPHA_VANTAGE_BASE, {
          params: { function: 'GLOBAL_QUOTE', symbol, apikey: API_KEY }
        });
        const q = response.data['Global Quote'];
        if (q && Object.keys(q).length > 0) {
          quoteData = {
            ...quoteData,
            symbol: q['01. symbol'],
            price: parseFloat(q['05. price']),
            change: parseFloat(q['09. change']),
            changePercent: q['10. change percent'],
            volume: parseInt(q['06. volume'])
          };
          source = 'AlphaVantage';
        }
      } catch (e) { console.error('AlphaVantage Quote Fail:', e.message); }
    }

    // 3. AI Fallback/Extension for Fundamentals (complementing Excel/API)
    const aiPrompt = `
      Act as a real-time financial data terminal (Excel/Bloomberg style). 
      Provide realistic fundamental statistics for the stock symbol: ${symbol}. 
      Existing Context: ${JSON.stringify(quoteData)}
      Return ONLY a JSON object with these keys: 
      pe_ratio (number), market_cap (string like "2.5T"), eps (number), dividend_yield (string like "1.2%"), 52w_high (number), 52w_low (number), beta (number). 
      Be consistent with the existing price if provided.
    `;

    const aiRes = await chatWithGroq(aiPrompt, "System Accountant");
    let fundamentals = { ...quoteData }; // Start with excel data if any
    try {
      const jsonMatch = aiRes.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
         const aiFundamentals = JSON.parse(jsonMatch[0]);
         fundamentals = { ...fundamentals, ...aiFundamentals };
      }
    } catch (pe) { console.error('AI JSON Parse fail'); }

    res.json({
      ...quoteData,
      symbol: quoteData.symbol || symbol,
      price: quoteData.price || 150.00,
      change: quoteData.change || 0,
      changePercent: quoteData.changePercent || "0%",
      fundamentals,
      source
    });
  } catch (err) {
    console.error('Quote error:', err.message);
    res.status(500).json({ error: 'Failed to fetch quote' });
  }
});

// Get daily time series (and cache in DB)
router.get('/daily/:symbol', auth, async (req, res) => {
  try {
    const { symbol } = req.params;

    // Check cache first (data less than 1 day old)
    const [cached] = await pool.execute(
      'SELECT * FROM stock_data WHERE symbol = ? AND fetched_at > DATE_SUB(NOW(), INTERVAL 1 DAY) ORDER BY date DESC LIMIT 100',
      [symbol]
    );

    if (cached.length > 0) {
      return res.json({ symbol, data: cached, source: 'cache' });
    }

    // Fetch from Alpha Vantage
    const response = await axios.get(ALPHA_VANTAGE_BASE, {
      params: { function: 'TIME_SERIES_DAILY', symbol, outputsize: 'compact', apikey: API_KEY }
    });

    const timeSeries = response.data['Time Series (Daily)'];
    if (!timeSeries) {
      return res.status(404).json({ error: 'No data found. API limit may be reached.' });
    }

    const dataPoints = [];
    for (const [date, values] of Object.entries(timeSeries)) {
      const point = {
        symbol,
        date,
        open_price: parseFloat(values['1. open']),
        high_price: parseFloat(values['2. high']),
        low_price: parseFloat(values['3. low']),
        close_price: parseFloat(values['4. close']),
        volume: parseInt(values['5. volume'])
      };
      dataPoints.push(point);

      // Cache in DB (upsert)
      await pool.execute(
        `INSERT INTO stock_data (symbol, date, open_price, high_price, low_price, close_price, volume)
         VALUES (?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE open_price=VALUES(open_price), high_price=VALUES(high_price), low_price=VALUES(low_price), close_price=VALUES(close_price), volume=VALUES(volume), fetched_at=NOW()`,
        [symbol, date, point.open_price, point.high_price, point.low_price, point.close_price, point.volume]
      );
    }

    res.json({ symbol, data: dataPoints.slice(0, 100), source: 'api' });
  } catch (err) {
    console.error('Daily data error:', err.message);
    res.status(500).json({ error: 'Failed to fetch daily data' });
  }
});

// Get chart data (formatted for TradingView lightweight-charts)
router.get('/chart/:symbol', auth, async (req, res) => {
  try {
    const { symbol } = req.params;

    const [data] = await pool.execute(
      'SELECT date as time, open_price as open, high_price as high, low_price as low, close_price as close, volume FROM stock_data WHERE symbol = ? ORDER BY date ASC',
      [symbol]
    );

    if (data.length === 0) {
      // Fetch fresh data first
      return res.json({ symbol, chartData: [], message: 'No data cached. Please fetch daily data first.' });
    }

    res.json({ symbol, chartData: data });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch chart data' });
  }
});

module.exports = router;
