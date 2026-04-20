const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

async function audit() {
  const config = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'Root',
    database: process.env.DB_NAME || 'growcap',
  };

  try {
    const conn = await mysql.createConnection(config);
    const tables = ['users', 'financial_profiles', 'financial_plans', 'portfolios', 'holdings', 'transactions', 'business_profiles', 'risk_metrics'];
    
    for (const table of tables) {
      try {
        console.log(`\n--- TABLE: ${table} ---`);
        const [columns] = await conn.query(`DESCRIBE ${table}`);
        columns.forEach(c => console.log(`${c.Field} (${c.Type})`));
      } catch (e) {
        console.log(`ERROR describing ${table}:`, e.message);
      }
    }
    
    await conn.end();
    process.exit(0);
  } catch (err) {
    console.error('Audit failed:', err.message);
    process.exit(1);
  }
}

audit();
