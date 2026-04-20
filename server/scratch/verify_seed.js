const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

async function verify() {
  const config = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'Root',
    database: process.env.DB_NAME || 'growcap',
  };

  try {
    const conn = await mysql.createConnection(config);
    console.log('Connected for verification');

    const [users] = await conn.query('SELECT id, email FROM users WHERE email = "audituser@example.com"');
    console.log('User Found:', users.length > 0 ? users[0] : 'None');

    if (users.length > 0) {
      const [profiles] = await conn.query('SELECT * FROM financial_profiles WHERE user_id = ?', [users[0].id]);
      console.log('Profile Found:', profiles.length > 0 ? 'Yes' : 'No', 'Surplus:', profiles[0]?.monthly_income);

      const [plans] = await conn.query('SELECT * FROM financial_plans WHERE user_id = ?', [users[0].id]);
      console.log('Plan Found:', plans.length > 0 ? 'Yes' : 'No', 'Equity%:', plans[0]?.equity_pct);

      const [txs] = await conn.query('SELECT * FROM transactions WHERE user_id = ?', [users[0].id]);
      console.log('Transactions Count:', txs.length);
    }

    await conn.end();
    process.exit(0);
  } catch (err) {
    console.error('Verification failed:', err.message);
    process.exit(1);
  }
}

verify();
