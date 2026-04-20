const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const auth = require('../middleware/auth');

// Get all goals
router.get('/', auth, async (req, res) => {
  try {
    const [goals] = await pool.execute(
      'SELECT * FROM financial_goals WHERE user_id = ? ORDER BY priority DESC, target_date ASC',
      [req.user.id]
    );

    // Add progress percentage
    const goalsWithProgress = goals.map(g => ({
      ...g,
      progress: g.target_amount > 0 ? Math.min(100, ((g.current_amount / g.target_amount) * 100).toFixed(1)) : 0,
      remaining: Math.max(0, g.target_amount - g.current_amount)
    }));

    res.json(goalsWithProgress);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch goals' });
  }
});

// Create goal
router.post('/', auth, async (req, res) => {
  try {
    const { name, target_amount, current_amount, monthly_contribution, target_date, category, priority } = req.body;
    const [result] = await pool.execute(
      `INSERT INTO financial_goals (user_id, name, target_amount, current_amount, monthly_contribution, target_date, category, priority)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, name, target_amount, current_amount || 0, monthly_contribution || 0, target_date || null, category || 'other', priority || 'medium']
    );

    // Sync to Profile
    if (parseFloat(monthly_contribution) > 0) {
      await pool.execute('UPDATE financial_profiles SET other_needs = other_needs + ? WHERE user_id = ?', [parseFloat(monthly_contribution), req.user.id]);
      
      // Sync to Expenses Table
      await pool.execute(
        'INSERT INTO expenses (user_id, category, amount, description, expense_date) VALUES (?, ?, ?, ?, CURDATE())',
        [req.user.id, 'Goal Contribution', monthly_contribution, `Monthly saving for goal: ${name}`]
      );
    }

    res.status(201).json({ id: result.insertId, message: 'Goal created and synced to profile/expenses' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create goal' });
  }
});

// Update goal
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, target_amount, current_amount, monthly_contribution, target_date, category, priority, status } = req.body;
    
    // Update Sync
    const [oldGoal] = await pool.execute('SELECT name, monthly_contribution FROM financial_goals WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    
    await pool.execute(
      `UPDATE financial_goals SET name=?, target_amount=?, current_amount=?, monthly_contribution=?, target_date=?, category=?, priority=?, status=? WHERE id=? AND user_id=?`,
      [name, target_amount, current_amount, monthly_contribution, target_date, category, priority, status || 'active', req.params.id, req.user.id]
    );

    // Sync expenses
    if (oldGoal.length > 0) {
       // Remove old expense entry
       await pool.execute('DELETE FROM expenses WHERE user_id = ? AND category = ? AND description = ?', [req.user.id, 'Goal Contribution', `Monthly saving for goal: ${oldGoal[0].name}`]);
       
       // Add new if contribution > 0
       if (parseFloat(monthly_contribution) > 0) {
         await pool.execute(
           'INSERT INTO expenses (user_id, category, amount, description, expense_date) VALUES (?, ?, ?, ?, CURDATE())',
           [req.user.id, 'Goal Contribution', monthly_contribution, `Monthly saving for goal: ${name}`]
         );
       }
    }

    res.json({ message: 'Goal updated and expenses synced' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update goal' });
  }
});

// Delete goal
router.delete('/:id', auth, async (req, res) => {
  try {
    const [goal] = await pool.execute('SELECT name, monthly_contribution FROM financial_goals WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    
    if (goal.length > 0) {
       if (parseFloat(goal[0].monthly_contribution) > 0) {
          await pool.execute('UPDATE financial_profiles SET other_needs = GREATEST(0, other_needs - ?) WHERE user_id = ?', [goal[0].monthly_contribution, req.user.id]);
       }
       // Remove expense entry
       await pool.execute('DELETE FROM expenses WHERE user_id = ? AND category = ? AND description = ?', [req.user.id, 'Goal Contribution', `Monthly saving for goal: ${goal[0].name}`]);
    }

    await pool.execute('DELETE FROM financial_goals WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    res.json({ message: 'Goal deleted and profile/expenses synced' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete goal' });
  }
});

const { chatWithGroq } = require('../services/groqService');

// Validate goal timeline vs active plan
router.post('/validate/:id', auth, async (req, res) => {
  try {
    const [goals] = await pool.execute('SELECT * FROM financial_goals WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    const [plans] = await pool.execute('SELECT * FROM financial_plans WHERE user_id = ?', [req.user.id]);
    const [profiles] = await pool.execute('SELECT monthly_income FROM financial_profiles WHERE user_id = ?', [req.user.id]);

    if (!goals.length) return res.status(404).json({ error: 'Goal not found' });
    const goal = goals[0];
    const plan = plans[0];
    const income = profiles[0]?.monthly_income || 0;

    if (!plan || !income) {
      return res.status(400).json({ error: 'Please set up your financial plan and income on the dashboard first.' });
    }

    // Math: Monthly contribution from plan (Equity + Safe + Retirement + Emergency)
    const investmentPct = parseFloat(plan.equity_pct) + parseFloat(plan.safe_pct) + parseFloat(plan.retirement_pct) + parseFloat(plan.emergency_pct);
    const totalMonthlyRaw = (investmentPct / 100) * income;
    
    // Calculate required months
    const remaining = goal.target_amount - goal.current_amount;
    const monthsNeeded = totalMonthlyRaw > 0 ? Math.ceil(remaining / totalMonthlyRaw) : Infinity;
    
    // Check vs target_date
    let isOnTrack = true;
    let targetMonths = Infinity;
    if (goal.target_date) {
      const now = new Date();
      const target = new Date(goal.target_date);
      targetMonths = (target.getFullYear() - now.getFullYear()) * 12 + (target.getMonth() - now.getMonth());
      if (monthsNeeded > targetMonths) isOnTrack = false;
    }

    const aiPrompt = `
      User: ${req.user.name}
      Goal: ${goal.name} (Target: ₹${goal.target_amount}, Current: ₹${goal.current_amount})
      Monthly Plan Contribution: ₹${totalMonthlyRaw.toFixed(0)} (${investmentPct}% of ₹${income})
      Timeline: Needs ${monthsNeeded} months. Target date says ${targetMonths} months.
      Status: ${isOnTrack ? 'ON TRACK' : 'OFF TRACK'}
      
      Act as an AI Financial Planner. 
      If OFF TRACK: Suggest a specific plan change (e.g. "Switch to Aggressive Plan" or "Increase Monthly Income by ₹X").
      If ON TRACK: Provide a tip for wealth acceleration.
      Output ONLY the advice in 2-3 sentences.
    `;

    const suggestion = await chatWithGroq(aiPrompt, req.user.name);

    // Dynamic Alternative Plan Suggestion
    let alternativePlan = null;
    if (!isOnTrack && investmentPct < 50) {
      alternativePlan = "Aggressive Plan (50% Equity)";
    } else if (!isOnTrack && investmentPct >= 50) {
      alternativePlan = "High-Yield Side Income (Freelance/Business)";
    }

    res.json({
      monthsNeeded,
      isOnTrack,
      totalMonthlyRaw,
      suggestion,
      alternativePlan
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Validation failed' });
  }
});

module.exports = router;
