const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const auth = require('../middleware/auth');
const { chatWithGroq } = require('../services/groqService');

// Complete Onboarding Plan (Basic)
router.post('/complete', auth, async (req, res) => {
  try {
    const { expenses_pct, equity_pct, safe_pct, emergency_pct, retirement_pct, monthly_income } = req.body;
    
    await pool.execute(
      'INSERT INTO financial_plans (user_id, expenses_pct, equity_pct, safe_pct, emergency_pct, retirement_pct) VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE expenses_pct=?, equity_pct=?, safe_pct=?, emergency_pct=?, retirement_pct=?',
      [req.user.id, expenses_pct, equity_pct, safe_pct, emergency_pct, retirement_pct, expenses_pct, equity_pct, safe_pct, emergency_pct, retirement_pct]
    );

    await pool.execute(
      'UPDATE users SET onboarding_completed = TRUE WHERE id = ?',
      [req.user.id]
    );
    
    if (monthly_income) {
      await pool.execute(
        'UPDATE financial_profiles SET monthly_income = ? WHERE user_id = ?',
         [monthly_income, req.user.id]
      );
    }

    res.json({ message: 'Onboarding completed successfully' });
  } catch (err) {
    console.error('Onboarding Error:', err);
    res.status(500).json({ error: 'Failed to complete onboarding' });
  }
});

// Detailed Discovery Form
router.post('/discovery', auth, async (req, res) => {
  try {
    // Re-fetch user_type from DB (JWT may not have it)
    const [userRows] = await pool.execute('SELECT user_type FROM users WHERE id = ?', [req.user.id]);
    const isBusiness = userRows[0]?.user_type === 'business';
    const discoveryData = req.body;
    
    // Save to financial_profiles
    const columns = isBusiness 
      ? '(user_id, monthly_income, revenue, payroll, opex, tax_liability, discovery_data_raw)'
      : '(user_id, monthly_income, rent_emi, essential_expenses, non_essential_expenses, other_needs, discovery_data_raw)';
    
    const incomeValue = isBusiness ? discoveryData.revenue : discoveryData.income;
    const values = isBusiness
      ? [req.user.id, incomeValue || 0, discoveryData.revenue || 0, discoveryData.payroll || 0, discoveryData.opex || 0, discoveryData.tax_liability || 0, JSON.stringify(discoveryData)]
      : [req.user.id, incomeValue || 0, discoveryData.rent_emi || 0, discoveryData.essential_expenses || 0, discoveryData.non_essential_expenses || 0, discoveryData.other_needs || 0, JSON.stringify(discoveryData)];

    const placeholders = values.map(() => '?').join(', ');
    const updateClause = isBusiness
      ? 'monthly_income=?, revenue=?, payroll=?, opex=?, tax_liability=?, discovery_data_raw=?'
      : 'monthly_income=?, rent_emi=?, essential_expenses=?, non_essential_expenses=?, other_needs=?, discovery_data_raw=?';

    await pool.execute(
      `INSERT INTO financial_profiles ${columns} VALUES (${placeholders}) ON DUPLICATE KEY UPDATE ${updateClause}`,
      [...values, ...values.slice(1)]
    );

    // Update birth_date if provided
    let age = 30; // default assumption
    if (discoveryData.birth_date) {
      await pool.execute('UPDATE users SET birth_date = ? WHERE id = ?', [discoveryData.birth_date, req.user.id]);
      age = new Date().getFullYear() - new Date(discoveryData.birth_date).getFullYear();
    } else {
       // Try fetching existing birth_date
       const [u] = await pool.execute('SELECT birth_date FROM users WHERE id = ?', [req.user.id]);
       if (u[0]?.birth_date) {
          age = new Date().getFullYear() - new Date(u[0].birth_date).getFullYear();
       }
    }

    if (discoveryData.income || discoveryData.revenue) {
      await pool.execute('UPDATE financial_profiles SET monthly_income = ? WHERE user_id = ?', [discoveryData.income || discoveryData.revenue, req.user.id]);
    }

    // Calculate deterministic risk based on initial assets if provided
    const totalAssets = parseFloat(discoveryData.initial_stocks || 0) + parseFloat(discoveryData.initial_mf || 0) + parseFloat(discoveryData.initial_sip || 0) + parseFloat(discoveryData.initial_fd || 0);
    const equityAssets = parseFloat(discoveryData.initial_stocks || 0) + parseFloat(discoveryData.initial_mf || 0);
    
    // AI Analysis (non-fatal if it fails)
    let aiResponse = 'Your financial profile has been saved. AI analysis will be available shortly.';
    let riskScore = 'Medium';
    
    // Deterministic Rule: Basic Safe Allocation Match (Optional Check)
    if (totalAssets > 0) {
       const userEquityPct = (equityAssets / totalAssets) * 100;
       const fdPct = (parseFloat(discoveryData.initial_fd || 0) / totalAssets) * 100;
       const sipPct = (parseFloat(discoveryData.initial_sip || 0) / totalAssets) * 100;
       if (Math.abs(userEquityPct - 40) < 10 && Math.abs(fdPct - 30) < 10 && Math.abs(sipPct - 20) < 10) {
          riskScore = 'Safe (Optimal)';
          aiResponse = 'Your allocation perfectly matches the Basic Safe benchmark. Great job diversifying!';
       }
    }

    try {
      if (riskScore === 'Medium') { // Always run AI unless it's a perfect Safe match
        const prompt = `You are a financial advisor. Determine Risk Category and give advice STRICTLY via this rule matrix based on Age:
        Age 18-30: Safe (Eq 40-50%, Safe 20-30%, Emergency 15-20%); Moderate (Eq 60-70%, Safe 10-20%, Emerg 10-15%); High (Eq 75-85%, Safe 5-10%, Emerg 10%).
        Age 30-45: Safe (Eq 30-40%, Safe 40-50%, Emerg 15-20%); Moderate (Eq 50-60%, Safe 25-35%, Emerg 10-15%); High (Eq 65-75%, Safe 10-20%, Emerg 10-15%).
        Age 45+: Safe (Eq 15-25%, Safe 55-65%, Emerg 20%); Moderate (Eq 30-40%, Safe 40-50%, Emerg 15-20%); High (Eq 45-55%, Safe 25-35%, Emerg 15-20%).
        Compare the user's initial portfolio vs these standards to find their Category.
        
        Keep your response VERY SHORT (MAX 3 sentences total). Give:
        1. One-line financial health assessment.
        2. Risk level (OUTPUT EXACTLY ONE OF: Low, Medium, High).
        3. One actionable tip.
        
        Data: Age ${age}, ${JSON.stringify(discoveryData)}`;
        
        aiResponse = await chatWithGroq(prompt, req.user.name);
        
        if (aiResponse.toLowerCase().includes('low') || aiResponse.toLowerCase().includes('safe')) riskScore = 'Low';
        else if (aiResponse.toLowerCase().includes('high')) riskScore = 'High';
        else if (aiResponse.toLowerCase().includes('moderate') || aiResponse.toLowerCase().includes('medium')) riskScore = 'Medium';
      }
    } catch (aiErr) {
      console.error('AI analysis failed (non-fatal):', aiErr.message);
    }

    // Map AI Score to standard string enum for safety matching
    let standardCategory = 'medium';
    if (riskScore.includes('Safe') || riskScore.includes('Low')) standardCategory = 'low';
    if (riskScore.includes('High')) standardCategory = 'high';

    // Save AI feedback & category
    await pool.execute(
      'UPDATE financial_profiles SET ai_risk_score = ?, risk_category = ?, ai_suggestion = ? WHERE user_id = ?',
      [riskScore, standardCategory, aiResponse, req.user.id]
    );

    // Set onboarding as completed
    await pool.execute('UPDATE users SET onboarding_completed = TRUE WHERE id = ?', [req.user.id]);

    // No default plan — user will select a strategy from the Dashboard

    res.json({ 
      message: 'Discovery completed', 
      riskScore, 
      aiSuggestion: aiResponse 
    });
  } catch (err) {
    console.error('Discovery Error:', err);
    res.status(500).json({ error: err.message || 'Failed to complete discovery' });
  }
});

// Apply Financial Strategy
router.post('/apply-strategy', auth, async (req, res) => {
  try {
    const { equity_pct, safe_pct, emergency_pct, retirement_pct, name } = req.body;
    
    await pool.execute(
      `INSERT INTO financial_plans (user_id, equity_pct, safe_pct, emergency_pct, retirement_pct, strategy_name)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE equity_pct=VALUES(equity_pct), safe_pct=VALUES(safe_pct), emergency_pct=VALUES(emergency_pct), retirement_pct=VALUES(retirement_pct), strategy_name=VALUES(strategy_name)`,
      [req.user.id, equity_pct, safe_pct, emergency_pct, retirement_pct, name || null]
    );

    // Calculate and persist fund values
    const [profiles] = await pool.execute('SELECT * FROM financial_profiles WHERE user_id = ?', [req.user.id]);
    const profile = profiles[0];
    const [userRows] = await pool.execute('SELECT user_type FROM users WHERE id = ?', [req.user.id]);
    const userType = userRows[0]?.user_type;

    if (profile) {
      let surplus = 0;
      if (userType === 'business') {
        surplus = (profile.revenue || 0) - (Number(profile.payroll || 0) + Number(profile.opex || 0));
      } else {
        surplus = (profile.monthly_income || 0) - (Number(profile.essential_expenses || 0) + Number(profile.rent_emi || 0) + Number(profile.other_needs || 0) + Number(profile.non_essential_expenses || 0));
      }
      
      const emergencyValue = Math.max(0, surplus * (emergency_pct / 100));
      const retirementValue = Math.max(0, surplus * (retirement_pct / 100));
      const equityValue = Math.max(0, surplus * (equity_pct / 100));
      const safeValue = Math.max(0, surplus * (safe_pct / 100));

      await pool.execute(
        'UPDATE financial_profiles SET emergency_fund_value = ?, retirement_fund_value = ? WHERE user_id = ?',
        [emergencyValue, retirementValue, req.user.id]
      );

      // --- NEW: Log Strategic Allocations to Transactions (WITHOUT forced holdings) ---
      const strategicTransactions = [
        { type: 'Strategic Equity Target', amount: equityValue },
        { type: 'Strategic Safe Assets Target', amount: safeValue },
        { type: 'Strategic Emergency Fund Target', amount: emergencyValue },
        { type: 'Strategic Retirement Fund Target', amount: retirementValue }
      ];

      for (const t of strategicTransactions) {
        if (t.amount > 0) {
          await pool.execute(
            'INSERT INTO transactions (user_id, holding_id, type, amount) VALUES (?, ?, ?, ?)',
            [req.user.id, null, 'strategy_allocation', t.amount]
          );
        }
      }
    }

    res.json({ message: 'Strategy applied successfully' });
  } catch (err) {
    console.error('Apply Strategy Error:', err);
    res.status(500).json({ error: 'Failed to apply strategy' });
  }
});

// Update Profile & AI Risk Recalibration
router.put('/profile', auth, async (req, res) => {
  try {
    const { 
      monthly_income, essential_expenses, non_essential_expenses, 
      rent_emi, other_needs, revenue, payroll, opex, tax_liability, birth_date 
    } = req.body;
    
    // Update birth_date in Users table
    if (birth_date !== undefined) {
      await pool.execute(
        'UPDATE users SET birth_date = ? WHERE id = ?', 
        [birth_date || null, req.user.id]
      );
    }
    
    // Update Financial Profiles (including monthly_income)
    await pool.execute(
      `UPDATE financial_profiles SET 
       monthly_income = ?,
       essential_expenses = ?, non_essential_expenses = ?, rent_emi = ?, 
       other_needs = ?, revenue = ?, payroll = ?, opex = ?, tax_liability = ?
       WHERE user_id = ?`,
      [
        monthly_income || 0,
        essential_expenses || 0, non_essential_expenses || 0, rent_emi || 0, 
        other_needs || 0, revenue || 0, payroll || 0, opex || 0, tax_liability || 0, 
        req.user.id
      ]
    );
    
    // Recalibrate AI Assessment
    const [userRows] = await pool.execute('SELECT user_type, birth_date FROM users WHERE id = ?', [req.user.id]);
    const userData = userRows[0];
    const [fpRows] = await pool.execute('SELECT monthly_income FROM financial_profiles WHERE user_id = ?', [req.user.id]);
    const monthly_income_val = fpRows[0]?.monthly_income || 0;
    const isBusiness = userData.user_type === 'business';

    let age = 30;
    if (userData.birth_date) {
        age = new Date().getFullYear() - new Date(userData.birth_date).getFullYear();
    }
    
    let aiResponse = 'Profile updated. AI risk analysis is being recalculated.';
    let riskScore = 'Medium';
    
    try {
        const prompt = `You are a professional financial risk auditor. Determine the Risk Category based on this updated profile.
        
        STRICT RULE MATRIX BY AGE:
        Age 18-30: Safe (Eq 40-50%, Safe 20-30%, Emerg 15-20%); Moderate (Eq 60-70%, Safe 10-20%, Emerg 10-15%); High (Eq 75-85%, Safe 5-10%, Emerg 10%).
        Age 30-45: Safe (Eq 30-40%, Safe 40-50%, Emerg 15-20%); Moderate (Eq 50-60%, Safe 25-35%, Emerg 10-15%); High (Eq 65-75%, Safe 10-20%, Emerg 10-15%).
        Age 45+: Safe (Eq 15-25%, Safe 55-65%, Emerg 20%); Moderate (Eq 30-40%, Safe 40-50%, Emerg 15-20%); High (Eq 45-55%, Safe 25-35%, Emerg 15-20%).
        
        Keep response VERY SHORT (MAX 3 sentences). Give:
        1. One-line health assessment focusing on cash flows (Insolvency Risk).
        2. Risk level (OUTPUT EXACTLY ONE OF: Low, Medium, High).
        3. One actionable tip.
        
        Profile Data:
        - Type: ${userData.user_type}
        - Age: ${age}
        - Monthly Cash In: ${isBusiness ? revenue : monthly_income_val}
        - Monthly Burn: ${isBusiness ? (Number(payroll)+Number(opex)) : (Number(essential_expenses)+Number(rent_emi)+Number(other_needs))}
        - Tax Liability: ${tax_liability}
        
        Calculate the fixed obligation ratio. If it exceeds 80% of income, return High risk regardless of allocation.`;
        
        aiResponse = await chatWithGroq(prompt, req.user.name);
        
        if (aiResponse.toLowerCase().includes('low') || aiResponse.toLowerCase().includes('safe')) riskScore = 'Low';
        else if (aiResponse.toLowerCase().includes('high')) riskScore = 'High';
        else if (aiResponse.toLowerCase().includes('moderate') || aiResponse.toLowerCase().includes('medium')) riskScore = 'Medium';
    } catch (aiErr) {
       console.error('AI profile update recalibration failed:', aiErr.message);
    }
    
    // Save updated insight
    await pool.execute(
      'UPDATE financial_profiles SET ai_risk_score = ?, ai_suggestion = ? WHERE user_id = ?',
      [riskScore, aiResponse, req.user.id]
    );

    res.json({ message: 'Profile updated and AI recalibrated successfully', riskScore });
  } catch(err) {
    console.error('Update profile error', err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Fetch discovery data
router.get('/discovery', auth, async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT fp.*, u.birth_date, u.name as user_name, u.email as user_email
      FROM financial_profiles fp
      JOIN users u ON fp.user_id = u.id
      WHERE fp.user_id = ?
    `, [req.user.id]);
    
    if (!rows.length) return res.json(null);
    res.json(rows[0]);
  } catch (err) {
    console.error('Discovery fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch discovery' });
  }
});

router.get('/plan', auth, async (req, res) => {
  try {
    const [plan] = await pool.execute('SELECT * FROM financial_plans WHERE user_id = ?', [req.user.id]);
    res.json(plan[0] || null);
  } catch (err) {
    console.error('Plan fetch error:', err);
    res.json(null);
  }
});

module.exports = router;
