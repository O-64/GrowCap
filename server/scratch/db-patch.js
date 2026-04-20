const mysql = require('mysql2/promise');

async function run() {
  const c = await mysql.createConnection({host:'localhost', user:'root', database:'growcap'});
  
  try {
     await c.query('ALTER TABLE users DROP COLUMN monthly_income;');
     console.log('Dropped monthly_income');
  } catch (e) {
     console.log('Skipped drop monthly_income:', e.message);
  }

  try {
     await c.query('ALTER TABLE users DROP COLUMN risk_tolerance;');
     console.log('Dropped risk_tolerance');
  } catch (e) {
     console.log('Skipped drop risk_tolerance:', e.message);
  }

  try {
     await c.query("ALTER TABLE holdings MODIFY COLUMN type ENUM('stock', 'mutual_fund', 'sip', 'fd', 'gov_bond') NOT NULL;");
     console.log('Updated holdings enum');
  } catch (e) {
     console.log('Failed updating enum:', e.message);
  }

  console.log('Done');
  process.exit(0);
}

run();
