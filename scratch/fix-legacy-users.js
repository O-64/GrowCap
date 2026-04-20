const pool = require('../server/config/db');

async function repairUsers() {
  try {
    console.log('🏁 Starting Legacy User Repair...');
    
    // 1. Find users missing financial_profiles
    const [users] = await pool.execute(`
      SELECT u.id, u.user_type 
      FROM users u 
      LEFT JOIN financial_profiles fp ON u.id = fp.user_id 
      WHERE fp.id IS NULL
    `);
    
    console.log(`🔍 Found ${users.length} users missing financial profiles.`);
    
    for (const user of users) {
      console.log(`➕ Repairing User ID: ${user.id} (${user.user_type})`);
      await pool.execute(
        'INSERT INTO financial_profiles (user_id, monthly_income, risk_category) VALUES (?, ?, ?)',
        [user.id, 0, 'medium']
      );
      
      if (user.user_type === 'business') {
        // Also check business_profiles
        const [bp] = await pool.execute('SELECT id FROM business_profiles WHERE user_id = ?', [user.id]);
        if (bp.length === 0) {
           await pool.execute('INSERT INTO business_profiles (user_id, company_name) VALUES (?, ?)', [user.id, 'My Company']);
        }
      }
    }

    console.log('✅ User Repair Completed Successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Repair Failed:', err.message);
    process.exit(1);
  }
}

repairUsers();
