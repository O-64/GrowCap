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
    
    // Add monthly_income if missing
    try {
      await conn.query('ALTER TABLE financial_profiles ADD COLUMN monthly_income DECIMAL(15, 2) DEFAULT 0;');
      console.log('✅ Column monthly_income added');
    } catch (e) {
      if (e.code === 'ER_DUP_COLUMN_NAME') console.log('⚠️ Column monthly_income already exists');
      else console.error('Error adding monthly_income:', e.message);
    }

    // Add risk_category if missing
    try {
      await conn.query("ALTER TABLE financial_profiles ADD COLUMN risk_category ENUM('low', 'medium', 'high') DEFAULT 'medium';");
      console.log('✅ Column risk_category added');
    } catch (e) {
      if (e.code === 'ER_DUP_COLUMN_NAME') console.log('⚠️ Column risk_category already exists');
      else console.error('Error adding risk_category:', e.message);
    }

    await conn.end();
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  }
}

run();
