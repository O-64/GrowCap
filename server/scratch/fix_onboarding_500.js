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
    
    await conn.query('ALTER TABLE financial_profiles ADD COLUMN ai_suggestion TEXT;');
    console.log('✅ Column ai_suggestion added successfully');
    
    await conn.end();
    process.exit(0);
  } catch (err) {
    if (err.code === 'ER_DUP_COLUMN_NAME') {
      console.log('⚠️ Column ai_suggestion already exists');
      process.exit(0);
    }
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  }
}

run();
