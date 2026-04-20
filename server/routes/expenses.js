const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const auth = require('../middleware/auth');

// Get all expenses
router.get('/', auth, async (req, res) => {
  try {
    const { month, year } = req.query;
    let query = 'SELECT * FROM expenses WHERE user_id = ?';
    const params = [req.user.id];

    if (month && year) {
      query += ' AND MONTH(expense_date) = ? AND YEAR(expense_date) = ?';
      params.push(month, year);
    }
    query += ' ORDER BY expense_date DESC';

    const [expenses] = await pool.execute(query, params);
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
});

// Get expense analytics
router.get('/analytics', auth, async (req, res) => {
  try {
    const { month, year } = req.query;
    const m = month || new Date().getMonth() + 1;
    const y = year || new Date().getFullYear();

    // Category breakdown
    const [breakdown] = await pool.execute(
      `SELECT category, SUM(amount) as total, COUNT(*) as count 
       FROM expenses WHERE user_id = ? AND MONTH(expense_date) = ? AND YEAR(expense_date) = ?
       GROUP BY category ORDER BY total DESC`,
      [req.user.id, m, y]
    );

    // Monthly total
    const [monthTotal] = await pool.execute(
      `SELECT SUM(amount) as total FROM expenses WHERE user_id = ? AND MONTH(expense_date) = ? AND YEAR(expense_date) = ?`,
      [req.user.id, m, y]
    );

    // Needs / Wants / Investments split
    const [nwi] = await pool.execute(
      `SELECT 
        CASE 
          WHEN category IN ('needs','food','transport','utilities','health') THEN 'needs'
          WHEN category IN ('wants','entertainment') THEN 'wants'
          WHEN category = 'investments' THEN 'investments'
          ELSE 'other'
        END as group_name,
        SUM(amount) as total
       FROM expenses WHERE user_id = ? AND MONTH(expense_date) = ? AND YEAR(expense_date) = ?
       GROUP BY group_name`,
      [req.user.id, m, y]
    );

    // Last 6 months trend
    const [trend] = await pool.execute(
      `SELECT MONTH(expense_date) as month, YEAR(expense_date) as year, SUM(amount) as total
       FROM expenses WHERE user_id = ? AND expense_date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
       GROUP BY YEAR(expense_date), MONTH(expense_date)
       ORDER BY year, month`,
      [req.user.id]
    );

    res.json({
      month: m,
      year: y,
      total: monthTotal[0]?.total || 0,
      breakdown,
      needsWantsInvestments: nwi,
      trend
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Add expense
router.post('/', auth, async (req, res) => {
  try {
    const { category, amount, description, expense_date } = req.body;
    const [result] = await pool.execute(
      'INSERT INTO expenses (user_id, category, amount, description, expense_date) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, category, amount, description || '', expense_date || new Date().toISOString().split('T')[0]]
    );

    // Sync to global profile based on category
    const isNeeds = ['needs','food','transport','utilities','health'].includes(category);
    const isWants = ['wants','entertainment'].includes(category);
    
    if (isNeeds) {
       await pool.execute('UPDATE financial_profiles SET essential_expenses = essential_expenses + ? WHERE user_id = ?', [amount, req.user.id]);
    } else if (isWants) {
       await pool.execute('UPDATE financial_profiles SET non_essential_expenses = non_essential_expenses + ? WHERE user_id = ?', [amount, req.user.id]);
    } else {
       await pool.execute('UPDATE financial_profiles SET other_needs = other_needs + ? WHERE user_id = ?', [amount, req.user.id]);
    }

    res.status(201).json({ id: result.insertId, message: 'Expense added and profile synced' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add expense' });
  }
});

// Delete expense
router.delete('/:id', auth, async (req, res) => {
  try {
    // Need to decrement profile based on the expense being deleted
    const [exp] = await pool.execute('SELECT category, amount FROM expenses WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    
    if (exp.length > 0) {
      const { category, amount } = exp[0];
      const isNeeds = ['needs','food','transport','utilities','health'].includes(category);
      const isWants = ['wants','entertainment'].includes(category);

      if (isNeeds) {
         await pool.execute('UPDATE financial_profiles SET essential_expenses = GREATEST(0, essential_expenses - ?) WHERE user_id = ?', [amount, req.user.id]);
      } else if (isWants) {
         await pool.execute('UPDATE financial_profiles SET non_essential_expenses = GREATEST(0, non_essential_expenses - ?) WHERE user_id = ?', [amount, req.user.id]);
      } else {
         await pool.execute('UPDATE financial_profiles SET other_needs = GREATEST(0, other_needs - ?) WHERE user_id = ?', [amount, req.user.id]);
      }
    }

    await pool.execute('DELETE FROM expenses WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    res.json({ message: 'Expense deleted and profile synced' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete expense' });
  }
});

module.exports = router;
