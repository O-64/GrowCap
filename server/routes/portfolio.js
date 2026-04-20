const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const auth = require('../middleware/auth');

// Get all portfolios for user
router.get('/', auth, async (req, res) => {
  try {
    const [portfolios] = await pool.execute(
      'SELECT * FROM portfolios WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(portfolios);
  } catch (err) {
    console.error('Error fetching portfolios:', err);
    res.status(500).json({ error: 'Failed to fetch portfolios' });
  }
});

// Create portfolio
router.post('/', auth, async (req, res) => {
  try {
    const { name, description } = req.body;
    const [result] = await pool.execute(
      'INSERT INTO portfolios (user_id, name, description) VALUES (?, ?, ?)',
      [req.user.id, name || 'New Portfolio', description || '']
    );
    res.status(201).json({ id: result.insertId, message: 'Portfolio created' });
  } catch (err) {
    console.error('Error creating portfolio:', err);
    res.status(500).json({ error: 'Failed to create portfolio' });
  }
});

// Get portfolio summary with holdings
router.get('/:id/summary', auth, async (req, res) => {
  try {
    const [portfolio] = await pool.execute(
      'SELECT * FROM portfolios WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    if (portfolio.length === 0) return res.status(404).json({ error: 'Portfolio not found' });

    const [holdings] = await pool.execute(
      'SELECT * FROM holdings WHERE portfolio_id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    // Calculate totals
    let totalInvested = 0, totalCurrent = 0;
    const allocation = { stock: 0, mutual_fund: 0, sip: 0, fd: 0 };

    holdings.forEach(h => {
      totalInvested += parseFloat(h.invested_amount);
      totalCurrent += parseFloat(h.current_value || h.invested_amount);
      allocation[h.type] += parseFloat(h.current_value || h.invested_amount);
    });

    const totalPnL = totalCurrent - totalInvested;
    const pnlPercent = totalInvested > 0 ? ((totalPnL / totalInvested) * 100).toFixed(2) : 0;

    // Convert allocation to percentages
    const allocationPercent = {};
    for (const key of Object.keys(allocation)) {
      allocationPercent[key] = totalCurrent > 0 ? ((allocation[key] / totalCurrent) * 100).toFixed(2) : 0;
    }

    res.json({
      portfolio: portfolio[0],
      holdings,
      summary: {
        totalInvested,
        totalCurrent,
        totalPnL,
        pnlPercent: parseFloat(pnlPercent),
        allocationPercent,
        allocationValues: allocation,
        holdingsCount: holdings.length
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch portfolio summary' });
  }
});

// Helper to sync portfolio total value
async function syncPortfolioTotal(portfolioId, userId) {
  try {
    const [holdings] = await pool.execute(
      'SELECT current_value, invested_amount FROM holdings WHERE portfolio_id = ? AND user_id = ?',
      [portfolioId, userId]
    );
    
    const total = holdings.reduce((sum, h) => sum + parseFloat(h.current_value || h.invested_amount || 0), 0);
    
    await pool.execute(
      'UPDATE portfolios SET total_value = ? WHERE id = ? AND user_id = ?',
      [total, portfolioId, userId]
    );
    return total;
  } catch (err) {
    console.error('Failed to sync portfolio total:', err);
  }
}

// Get all holdings for user (across all portfolios)
router.get('/holdings/all', auth, async (req, res) => {
  try {
    const [holdings] = await pool.execute(
      'SELECT h.*, p.name as portfolio_name FROM holdings h JOIN portfolios p ON h.portfolio_id = p.id WHERE h.user_id = ? ORDER BY h.created_at DESC',
      [req.user.id]
    );
    res.json(holdings);
  } catch (err) {
    console.error('Error fetching all holdings:', err);
    res.status(500).json({ error: 'Failed to fetch holdings' });
  }
});

// Add holding to portfolio
router.post('/:id/holdings', auth, async (req, res) => {
  try {
    const { type, symbol, name, quantity, buy_price, invested_amount, interest_rate, maturity_date, sip_day, notes } = req.body;

    const currentValue = type === 'fd'
      ? invested_amount * (1 + (interest_rate / 100))
      : (quantity || 0) * (buy_price || 0);

    const [result] = await pool.execute(
      `INSERT INTO holdings (portfolio_id, user_id, type, symbol, name, quantity, buy_price, current_price, invested_amount, current_value, interest_rate, maturity_date, sip_day, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.params.id, req.user.id, type, symbol || null, name, quantity || 0, buy_price || 0, buy_price || 0, invested_amount, currentValue, interest_rate || 0, maturity_date || null, sip_day || null, notes || null]
    );

    // Track Transaction
    await pool.execute(
      'INSERT INTO transactions (user_id, holding_id, type, amount, quantity, price) VALUES (?, ?, ?, ?, ?, ?)',
      [req.user.id, result.insertId, 'buy', invested_amount, quantity || 0, buy_price || 0]
    );

    // Sync Portfolio Total
    await syncPortfolioTotal(req.params.id, req.user.id);

    res.status(201).json({ id: result.insertId, message: 'Holding added and transaction recorded' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add holding' });
  }
});

// Update holding
router.put('/holdings/:holdingId', auth, async (req, res) => {
  try {
    const { current_price, current_value, notes, portfolio_id } = req.body;
    await pool.execute(
      'UPDATE holdings SET current_price = ?, current_value = ?, notes = ? WHERE id = ? AND user_id = ?',
      [current_price, current_value, notes, req.params.holdingId, req.user.id]
    );

    if (portfolio_id) {
       await syncPortfolioTotal(portfolio_id, req.user.id);
    }

    res.json({ message: 'Holding updated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update holding' });
  }
});

// Delete holding
router.delete('/holdings/:holdingId', auth, async (req, res) => {
  try {
    // Get info before delete for sync
    const [h] = await pool.execute('SELECT portfolio_id FROM holdings WHERE id = ? AND user_id = ?', [req.params.holdingId, req.user.id]);
    
    await pool.execute('DELETE FROM holdings WHERE id = ? AND user_id = ?', [req.params.holdingId, req.user.id]);
    
    if (h.length > 0) {
       await syncPortfolioTotal(h[0].portfolio_id, req.user.id);
    }

    res.json({ message: 'Holding deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete holding' });
  }
});

// Transaction endpoint removed due to lean schema transition
router.get('/transactions', auth, async (req, res) => {
  res.json([]); // Return empty array to prevent frontend breakage
});

module.exports = router;
