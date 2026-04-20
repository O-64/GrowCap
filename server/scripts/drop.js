const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

async function dropTables() {
  const config = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'growcap'
  };

  try {
    const conn = await mysql.createConnection(config);
    console.log('Dropping unused tables...');
    await conn.query('DROP TABLE IF EXISTS expenses');
    await conn.query('DROP TABLE IF EXISTS transactions');
    await conn.query('DROP TABLE IF EXISTS business_profiles');
    console.log('Successfully dropped tables to enforce strict limits.');
    await conn.end();
    process.exit(0);
  } catch (err) {
    console.error('Error dropping tables:', err);
    process.exit(1);
  }
}

dropTables();
