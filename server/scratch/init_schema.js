const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

async function initSchema() {
  const config = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'Root',
    database: process.env.DB_NAME || 'growcap',
  };

  console.log(`🚀 Initializing full schema for database: ${config.database}...`);
  
  try {
    const pool = await mysql.createPool(config);

    // 1. Users Table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        whatsapp_number VARCHAR(20),
        user_type ENUM('individual', 'business') DEFAULT 'individual',
        monthly_income DECIMAL(15,2) DEFAULT 0,
        risk_tolerance ENUM('low', 'medium', 'high') DEFAULT 'medium',
        onboarding_completed BOOLEAN DEFAULT FALSE,
        birth_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Users table ready');

    // 2. Portfolios Table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS portfolios (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Portfolios table ready');

    // 3. Holdings Table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS holdings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        portfolio_id INT NOT NULL,
        user_id INT NOT NULL,
        type ENUM('stock', 'mutual_fund', 'sip', 'fd') NOT NULL,
        symbol VARCHAR(50),
        name VARCHAR(255) NOT NULL,
        quantity DECIMAL(15,4) DEFAULT 0,
        buy_price DECIMAL(15,2) DEFAULT 0,
        current_price DECIMAL(15,2) DEFAULT 0,
        invested_amount DECIMAL(15,2) DEFAULT 0,
        current_value DECIMAL(15,2) DEFAULT 0,
        interest_rate DECIMAL(5,2) DEFAULT 0,
        maturity_date DATE,
        sip_day INT,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (portfolio_id) REFERENCES portfolios(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Holdings table ready');

    // 4. Transactions Table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        holding_id INT,
        type ENUM('buy', 'sell', 'dividend', 'interest') NOT NULL,
        amount DECIMAL(15,2) NOT NULL,
        quantity DECIMAL(15,4) DEFAULT 0,
        price DECIMAL(15,2) DEFAULT 0,
        transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Transactions table ready');

    // 5. Expenses Table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS expenses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        category VARCHAR(100) NOT NULL,
        amount DECIMAL(15,2) NOT NULL,
        description TEXT,
        expense_date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Expenses table ready');

    // 6. Financial Goals Table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS financial_goals (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        target_amount DECIMAL(15,2) NOT NULL,
        current_amount DECIMAL(15,2) DEFAULT 0,
        monthly_contribution DECIMAL(15,2) DEFAULT 0,
        target_date DATE,
        category VARCHAR(100),
        priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
        status ENUM('active', 'achieved', 'paused') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Financial Goals table ready');

    // 7. Financial Profiles (Discovery) Table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS financial_profiles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        rent_emi DECIMAL(15,2) DEFAULT 0,
        essential_expenses DECIMAL(15,2) DEFAULT 0,
        non_essential_expenses DECIMAL(15,2) DEFAULT 0,
        other_needs DECIMAL(15,2) DEFAULT 0,
        revenue DECIMAL(15,2) DEFAULT 0,
        payroll DECIMAL(15,2) DEFAULT 0,
        opex DECIMAL(15,2) DEFAULT 0,
        tax_liability DECIMAL(15,2) DEFAULT 0,
        discovery_data_raw JSON,
        ai_risk_score VARCHAR(50),
        ai_suggestion TEXT,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY user_discovery (user_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Financial Profiles table ready');

    // 8. Appointments Table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS appointments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        advisor_name VARCHAR(100) NOT NULL,
        advisor_id INT,
        requirement VARCHAR(255),
        appointment_date DATE NOT NULL,
        appointment_time TIME NOT NULL,
        status ENUM('pending', 'confirmed', 'completed', 'cancelled') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Appointments table ready');

    // 9. Business Profiles Table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS business_profiles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        company_name VARCHAR(255) DEFAULT '',
        industry VARCHAR(100) DEFAULT 'Other',
        employees INT DEFAULT 1,
        annual_revenue DECIMAL(15,2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY user_bp (user_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Business Profiles table ready');

    // 10. Financial Plans Table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS financial_plans (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        expenses_pct DECIMAL(5,2) DEFAULT 50,
        equity_pct DECIMAL(5,2) DEFAULT 40,
        safe_pct DECIMAL(5,2) DEFAULT 20,
        emergency_pct DECIMAL(5,2) DEFAULT 20,
        retirement_pct DECIMAL(5,2) DEFAULT 20,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY user_plan (user_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Financial Plans table ready');

    console.log('🎉 Full schema initialization completed successfully!');
    await pool.end();
    process.exit(0);
  } catch (err) {
    console.error('❌ Schema initialization failed:', err.message);
    process.exit(1);
  }
}

initSchema();
