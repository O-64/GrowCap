const express = require('express');
const router = express.Router();

// SIP Calculator
router.post('/sip', (req, res) => {
  try {
    const { monthly_investment, annual_rate, duration_years } = req.body;
    const P = parseFloat(monthly_investment);
    const r = parseFloat(annual_rate) / 100 / 12; // monthly rate
    const n = parseInt(duration_years) * 12; // total months

    // SIP formula: P * [(1+r)^n - 1] / r * (1+r)
    const maturityAmount = P * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
    const totalInvested = P * n;
    const wealthGained = maturityAmount - totalInvested;

    const maturityDate = new Date();
    maturityDate.setMonth(maturityDate.getMonth() + n);

    res.json({
      monthly_investment: P,
      annual_rate: parseFloat(annual_rate),
      duration_years: parseInt(duration_years),
      total_months: n,
      total_invested: Math.round(totalInvested),
      wealth_gained: Math.round(wealthGained),
      maturity_amount: Math.round(maturityAmount),
      maturity_date: maturityDate.toISOString().split('T')[0]
    });
  } catch (err) {
    res.status(400).json({ error: 'Invalid inputs for SIP calculation' });
  }
});

// Mutual Fund Calculator (Lumpsum)
router.post('/mutual-fund', (req, res) => {
  try {
    const { principal, annual_rate, duration_years } = req.body;
    const P = parseFloat(principal);
    const r = parseFloat(annual_rate) / 100;
    const n = parseInt(duration_years);

    // Compound interest: P * (1 + r)^n
    const maturityAmount = P * Math.pow(1 + r, n);
    const totalReturns = maturityAmount - P;

    // Year-by-year projection
    const projection = [];
    for (let year = 1; year <= n; year++) {
      projection.push({
        year,
        value: Math.round(P * Math.pow(1 + r, year))
      });
    }

    const maturityDate = new Date();
    maturityDate.setFullYear(maturityDate.getFullYear() + n);

    res.json({
      principal: P,
      annual_rate: parseFloat(annual_rate),
      duration_years: n,
      maturity_amount: Math.round(maturityAmount),
      total_returns: Math.round(totalReturns),
      maturity_date: maturityDate.toISOString().split('T')[0],
      projection
    });
  } catch (err) {
    res.status(400).json({ error: 'Invalid inputs for Mutual Fund calculation' });
  }
});

// FD Calculator
router.post('/fd', (req, res) => {
  try {
    const { principal, annual_rate, tenure_months, compounding } = req.body;
    const P = parseFloat(principal);
    const r = parseFloat(annual_rate) / 100;
    const t = parseInt(tenure_months) / 12; // convert to years
    const freq = compounding === 'monthly' ? 12 : compounding === 'half-yearly' ? 2 : 4; // default quarterly

    // A = P * (1 + r/n)^(n*t)
    const maturityAmount = P * Math.pow(1 + r / freq, freq * t);
    const interestEarned = maturityAmount - P;

    const maturityDate = new Date();
    maturityDate.setMonth(maturityDate.getMonth() + parseInt(tenure_months));

    res.json({
      principal: P,
      annual_rate: parseFloat(annual_rate),
      tenure_months: parseInt(tenure_months),
      compounding: compounding || 'quarterly',
      maturity_amount: Math.round(maturityAmount * 100) / 100,
      interest_earned: Math.round(interestEarned * 100) / 100,
      maturity_date: maturityDate.toISOString().split('T')[0]
    });
  } catch (err) {
    res.status(400).json({ error: 'Invalid inputs for FD calculation' });
  }
});

// EMI Calculator
router.post('/emi', (req, res) => {
  try {
    const { principal, annual_rate, tenure_months } = req.body;
    const P = parseFloat(principal);
    const r = parseFloat(annual_rate) / 100 / 12;
    const n = parseInt(tenure_months);

    // EMI = P * r * (1+r)^n / ((1+r)^n - 1)
    const emi = P * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
    const totalPayment = emi * n;
    const totalInterest = totalPayment - P;

    res.json({
      principal: P,
      annual_rate: parseFloat(annual_rate),
      tenure_months: n,
      monthly_emi: Math.round(emi * 100) / 100,
      total_payment: Math.round(totalPayment),
      total_interest: Math.round(totalInterest)
    });
  } catch (err) {
    res.status(400).json({ error: 'Invalid inputs for EMI calculation' });
  }
});

module.exports = router;
