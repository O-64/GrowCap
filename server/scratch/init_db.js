const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

async function initDB() {
  const config = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'Root',
  };

  const dbName = 'growcap';

  console.log(`Connecting to MySQL at ${config.host}:${config.port} as ${config.user}...`);
  
  try {
    const connection = await mysql.createConnection(config);
    console.log('✅ Connected to MySQL server.');

    console.log(`Creating database "${dbName}" if it doesn't exist...`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
    console.log(`✅ Database "${dbName}" is ready.`);

    await connection.end();
    process.exit(0);
  } catch (err) {
    console.error('❌ Failed to initialize database:', err.message);
    process.exit(1);
  }
}

initDB();
