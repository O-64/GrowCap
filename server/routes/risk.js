const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const auth = require('../middleware/auth');

// Get risk analysis for a portfolio — Strategy-Aware Two-Layer Engine
router.get('/:portfolioId', auth, async (req, res) => {
  try {
    const portfolioId = req.params.portfolioId;

    // Fetch holdings
    const [holdings] = await pool.execute(
      'SELECT * FROM holdings WHERE portfolio_id = ? AND user_id = ?',
      [portfolioId, req.user.id]
    );

    // Fetch user's active strategy/plan
    const [plans] = await pool.execute('SELECT * FROM financial_plans WHERE user_id = ?', [req.user.id]);
    const activePlan = plans[0] || null;

    // Fetch user profile and income from financial_profiles (Decoupled Schema)
    const [profileRows] = await pool.execute('SELECT * FROM financial_profiles WHERE user_id = ?', [req.user.id]);
    const profile = profileRows[0] || {};
    
    const income = Number(profile.monthly_income) || 0;
    const essential = Number(profile.essential_expenses) || 0;
    const nonEssential = Number(profile.non_essential_expenses) || 0;
    const rent = Number(profile.rent_emi) || 0;
    const totalExpenses = essential + nonEssential + rent;
    
    // Cash Drain check
    let isCashDrain = false;
    if (income > 0 && totalExpenses > income * 0.8) {
       isCashDrain = true;
    }

    // ============================================
    // LAYER 1: Strategy Base Risk
    // ============================================
    let strategyRisk = 'Low';
    let strategyName = activePlan?.strategy_name || 'No Strategy Selected';
    
    if (activePlan) {
      const eq = parseFloat(activePlan.equity_pct) || 0;
      if (eq >= 70) strategyRisk = 'High';
      else if (eq >= 40) strategyRisk = 'Moderate';
      else strategyRisk = 'Low';
    }

    // If no holdings, return strategy-only risk
    if (holdings.length === 0) {
      return res.json({
        // Layer 1
        strategyRisk,
        strategyName,
        targetAllocation: activePlan ? {
          equity_pct: parseFloat(activePlan.equity_pct),
          safe_pct: parseFloat(activePlan.safe_pct),
          emergency_pct: parseFloat(activePlan.emergency_pct),
          retirement_pct: parseFloat(activePlan.retirement_pct),
        } : null,
        // Layer 2 — no data yet
        riskScore: strategyRisk.toLowerCase(),
        deviationRisk: 'On Track',
        deviationPct: 0,
        volatility: 0,
        diversificationScore: 0,
        maxDrawdown: 0,
        typeAllocation: {},
        actualAllocation: { equity_pct: 0, safe_pct: 0 },
        recommendations: ['Add investments to your portfolio to see live risk analysis.'],
        holdingsCount: 0,
        totalValue: 0
      });
    }

    // ============================================
    // LAYER 2: Portfolio Deviation Risk
    // ============================================
    const totalValue = holdings.reduce((sum, h) => sum + parseFloat(h.current_value || h.invested_amount), 0);

    // Type concentration
    const typeAllocation = {};
    holdings.forEach(h => {
      typeAllocation[h.type] = (typeAllocation[h.type] || 0) + parseFloat(h.current_value || h.invested_amount);
    });
    const typeConcentrations = Object.values(typeAllocation).map(v => v / totalValue);
    const maxConcentration = Math.max(...typeConcentrations);

    // HHI diversification
    const hhi = typeConcentrations.reduce((sum, c) => sum + c * c, 0);
    const diversificationScore = Math.max(0, (1 - hhi) * 100);

    // Volatility
    const volatilityWeights = { stock: 0.25, mutual_fund: 0.15, sip: 0.12, fd: 0.02 };
    let weightedVolatility = 0;
    holdings.forEach(h => {
      const weight = parseFloat(h.current_value || h.invested_amount) / totalValue;
      weightedVolatility += weight * (volatilityWeights[h.type] || 0.15);
    });

    // Max drawdown
    let maxDrawdown = 0;
    holdings.forEach(h => {
      const invested = parseFloat(h.invested_amount);
      const current = parseFloat(h.current_value || invested);
      const dd = invested > 0 ? Math.max(0, (invested - current) / invested) : 0;
      maxDrawdown = Math.max(maxDrawdown, dd);
    });

    // Calculate actual allocation percentages
    const riskyValue = (typeAllocation.stock || 0) + (typeAllocation.mutual_fund || 0) + (typeAllocation.sip || 0);
    const safeValue = (typeAllocation.fd || 0);
    const actualEquityPct = totalValue > 0 ? (riskyValue / totalValue) * 100 : 0;
    const actualSafePct = totalValue > 0 ? (safeValue / totalValue) * 100 : 0;

    // Compare actual vs strategy target
    let deviationRisk = 'On Track';
    let deviationPct = 0;
    
    if (activePlan) {
      const targetEquity = parseFloat(activePlan.equity_pct) || 0;
      deviationPct = Math.abs(actualEquityPct - targetEquity);
      
      if (deviationPct > 40) {
        // Massive deviation — risk jumps to High
        deviationRisk = 'High';
      } else if (deviationPct > 20) {
        // Significant deviation — risk shifts up one level
        if (strategyRisk === 'Low') deviationRisk = 'Moderate';
        else deviationRisk = 'High';
      } else if (deviationPct > 10) {
        // Minor deviation — caution
        deviationRisk = 'Moderate';
      } else {
        deviationRisk = 'On Track';
      }
    }

    // Determine final composite risk score
    let riskScore = strategyRisk.toLowerCase();
    
    // Override with deviation if it's worse
    if (deviationRisk === 'High') riskScore = 'high';
    else if (deviationRisk === 'Moderate' && riskScore === 'low') riskScore = 'medium';
    
    // Cash drain always escalates to high
    if (isCashDrain) {
      riskScore = 'high';
      deviationRisk = 'High';
    }

    const initialAiRisk = profile.ai_risk_score || 'Pending';

    // Generate recommendations
    const recommendations = [];
    if (isCashDrain) {
      recommendations.push('CRITICAL: Your expenses consume over 80% of income. Investment contributions are at risk.');
    }
    if (deviationPct > 20 && activePlan) {
      const targetEq = parseFloat(activePlan.equity_pct);
      if (actualEquityPct > targetEq) {
        recommendations.push(`Your equity allocation (${Math.round(actualEquityPct)}%) exceeds your strategy target (${targetEq}%). Consider moving funds to safe assets.`);
      } else {
        recommendations.push(`Your equity allocation (${Math.round(actualEquityPct)}%) is below your strategy target (${targetEq}%). Consider adding equity investments.`);
      }
    }
    if (maxConcentration > 0.6) {
      recommendations.push('Portfolio heavily concentrated in one asset type. Diversify to reduce risk.');
    }
    if (!typeAllocation.fd && !typeAllocation.sip) {
      recommendations.push('No fixed-income assets detected. Consider adding FDs or SIPs for stability.');
    }
    if (diversificationScore < 50) {
      recommendations.push('Diversification is low. Spread investments across more asset types.');
    }
    if (deviationRisk === 'On Track' && recommendations.length === 0) {
      recommendations.push('Your portfolio is well-aligned with your selected strategy. Keep it up!');
    }

    const riskData = {
      // Layer 0: AI Initial
      initialAiRisk,
      // Layer 1: Strategy
      strategyRisk,
      strategyName,
      targetAllocation: activePlan ? {
        equity_pct: parseFloat(activePlan.equity_pct),
        safe_pct: parseFloat(activePlan.safe_pct),
        emergency_pct: parseFloat(activePlan.emergency_pct),
        retirement_pct: parseFloat(activePlan.retirement_pct),
      } : null,
      // Layer 2: Deviation
      riskScore,
      deviationRisk,
      deviationPct: Math.round(deviationPct * 10) / 10,
      actualAllocation: {
        equity_pct: Math.round(actualEquityPct * 10) / 10,
        safe_pct: Math.round(actualSafePct * 10) / 10,
      },
      // Metrics
      volatility: Math.round(weightedVolatility * 10000) / 100,
      diversificationScore: Math.round(diversificationScore * 100) / 100,
      maxDrawdown: Math.round(maxDrawdown * 10000) / 100,
      typeAllocation,
      recommendations,
      holdingsCount: holdings.length,
      totalValue
    };

    // Save to DB
    await pool.execute(
      `INSERT INTO risk_metrics 
       (portfolio_id, user_id, volatility, max_drawdown, sector_concentration, initial_ai_risk, level_1_risk, level_2_risk, risk_score)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE 
         volatility=VALUES(volatility), 
         max_drawdown=VALUES(max_drawdown), 
         sector_concentration=VALUES(sector_concentration), 
         initial_ai_risk=VALUES(initial_ai_risk),
         level_1_risk=VALUES(level_1_risk),
         level_2_risk=VALUES(level_2_risk),
         risk_score=VALUES(risk_score), 
         calculated_at=NOW()`,
      [portfolioId, req.user.id, weightedVolatility, maxDrawdown, maxConcentration, initialAiRisk, strategyRisk, deviationRisk, riskScore]
    );

    res.json(riskData);
  } catch (err) {
    console.error('Risk analysis error:', err);
    res.status(500).json({ error: 'Failed to calculate risk metrics' });
  }
});

module.exports = router;
