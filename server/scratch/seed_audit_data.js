const mysql = require('mysql2/promise');
const path = require('path');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

async function seed() {
  const config = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'Root',
    database: process.env.DB_NAME || 'growcap',
  };

  try {
    const conn = await mysql.createConnection(config);
    console.log('Connected to MySQL');

    // 1. Create Test User
    const email = 'audituser@example.com';
    const password = await bcrypt.hash('password123', 10);
    
    // Check if user exists
    const [existing] = await conn.query('SELECT id FROM users WHERE email = ?', [email]);
    let userId;
    
    if (existing.length === 0) {
      const [uResult] = await conn.execute(
        'INSERT INTO users (name, email, password, user_type, onboarding_completed, birth_date) VALUES (?, ?, ?, ?, ?, ?)',
        ['Audit Test User', email, password, 'individual', true, '1990-01-01']
      );
      userId = uResult.insertId;
      console.log('✅ Created test user:', email);
    } else {
      userId = existing[0].id;
      console.log('⚠️ Test user already exists, reusing ID:', userId);
    }

    // 2. Add Financial Profile
    // Surplus Calculation: 50,000 (income) - (10,000 + 5,000 + 15,000 + 0 + 5,000) = 15,000 Surplus
    await conn.execute(
      `INSERT INTO financial_profiles (user_id, monthly_income, essential_expenses, non_essential_expenses, rent_emi, other_needs, emergency_fund_value, retirement_fund_value, ai_risk_score, risk_category)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE monthly_income=VALUES(monthly_income), essential_expenses=VALUES(essential_expenses), non_essential_expenses=VALUES(non_essential_expenses), rent_emi=VALUES(rent_emi), other_needs=VALUES(other_needs)`,
      [userId, 50000, 10000, 5000, 15000, 5000, 1500, 4500, 'Medium', 'medium']
    );
    console.log('✅ Financial profile seeded');

    // 3. Add Financial Plan (Strategy)
    // Equity: 40% (6,000), Safe: 20% (3,000), Emergency: 10% (1,500), Retirement: 30% (4,500)
    await conn.execute(
      `INSERT INTO financial_plans (user_id, expenses_pct, equity_pct, safe_pct, emergency_pct, retirement_pct)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE equity_pct=VALUES(equity_pct), safe_pct=VALUES(safe_pct), emergency_pct=VALUES(emergency_pct), retirement_pct=VALUES(retirement_pct)`,
      [userId, 0, 40, 20, 10, 30]
    );
    console.log('✅ Financial plan seeded');

    // 4. Create a default portfolio if missing
    const [portfolios] = await conn.query('SELECT id FROM portfolios WHERE user_id = ?', [userId]);
    let portfolioId;
    if (portfolios.length === 0) {
      const [pResult] = await conn.execute(
        'INSERT INTO portfolios (user_id, name, description) VALUES (?, ?, ?)',
        [userId, 'Main Portfolio', 'Demo Portfolio for Audit']
      );
      portfolioId = pResult.insertId;
      console.log('✅ Created portfolio');
    } else {
      portfolioId = portfolios[0].id;
    }

    // 5. Add Strategy Allocation Transactions (for Auto-Synced items)
    // Normal Transaction: emergency_pct (10% of 15,000 = 1,500)
    // Retirement: retirement_pct (30% of 15,000 = 4,500)
    
    // Clear old strategy transactions for this user to avoid duplication during testing
    await conn.execute('DELETE FROM transactions WHERE user_id = ? AND type = ?', [userId, 'strategy_allocation']);

    const strategicTransactions = [
      { amount: 1500, type: 'Emergency target auto-sync' },
      { amount: 4500, type: 'Retirement target auto-sync' }
    ];

    for (const t of strategicTransactions) {
      await conn.execute(
        'INSERT INTO transactions (user_id, holding_id, type, amount) VALUES (?, ?, ?, ?)',
        [userId, null, 'strategy_allocation', t.amount]
      );
    }
    console.log('✅ Strategic allocation transactions seeded');

    await conn.end();
    console.log('🏁 Seeding completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
    process.exit(1);
  }
}

seed();
