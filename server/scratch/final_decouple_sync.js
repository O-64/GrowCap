const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

async function run() {
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
    
    // 1. Remove monthly_income and risk_tolerance from users if they exist
    try {
      await conn.query('ALTER TABLE users DROP COLUMN monthly_income;');
      console.log('✅ Column monthly_income dropped from users');
    } catch (e) { console.log('⚠️ users.monthly_income already gone or error:', e.message); }

    try {
        await conn.query('ALTER TABLE users DROP COLUMN risk_tolerance;');
        console.log('✅ Column risk_tolerance dropped from users');
    } catch (e) { console.log('⚠️ users.risk_tolerance already gone or error:', e.message); }

    // 2. Add fund values to financial_profiles if they miss
    try {
      await conn.query('ALTER TABLE financial_profiles ADD COLUMN emergency_fund_value DECIMAL(15, 2) DEFAULT 0;');
      console.log('✅ financial_profiles.emergency_fund_value added');
    } catch (e) { console.log('⚠️ emergency_fund_value already exists or error:', e.message); }

    try {
        await conn.query('ALTER TABLE financial_profiles ADD COLUMN retirement_fund_value DECIMAL(15, 2) DEFAULT 0;');
        console.log('✅ financial_profiles.retirement_fund_value added');
    } catch (e) { console.log('⚠️ retirement_fund_value already exists or error:', e.message); }

    await conn.end();
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  }
}

run();
