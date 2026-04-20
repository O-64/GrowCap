const pool = require('../server/config/db');

async function patchDB() {
  try {
    console.log('🏁 Starting Database Patch...');
    
    // Check if initial_ai_risk column exists
    const [columns] = await pool.execute('SHOW COLUMNS FROM risk_metrics');
    const columnNames = columns.map(c => c.Field);
    
    if (!columnNames.includes('initial_ai_risk')) {
      console.log('➕ Adding initial_ai_risk column...');
      await pool.execute('ALTER TABLE risk_metrics ADD COLUMN initial_ai_risk VARCHAR(50) AFTER sector_concentration');
    }
    
    if (!columnNames.includes('level_1_risk')) {
      console.log('➕ Adding level_1_risk column...');
      await pool.execute('ALTER TABLE risk_metrics ADD COLUMN level_1_risk VARCHAR(50) AFTER initial_ai_risk');
    }
    
    if (!columnNames.includes('level_2_risk')) {
      console.log('➕ Adding level_2_risk column...');
      await pool.execute('ALTER TABLE risk_metrics ADD COLUMN level_2_risk VARCHAR(50) AFTER level_1_risk');
    }

    console.log('✅ Database Patch Applied Successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Patch Failed:', err.message);
    process.exit(1);
  }
}

patchDB();
