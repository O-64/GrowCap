const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

async function migrate() {
  const config = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
  };
  const dbName = process.env.DB_NAME || 'growcap';

  try {
    console.log('🚀 Starting full migration...');

    // Create database if not exists
    const conn = await mysql.createConnection(config);
    await conn.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    await conn.end();
    console.log(`✅ Database "${dbName}" ready`);

    // Connect to actual database
    const pool = await mysql.createPool({ ...config, database: dbName });

    // 1. Users
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        whatsapp_number VARCHAR(20),
        user_type ENUM('individual', 'business') DEFAULT 'individual',
        onboarding_completed BOOLEAN DEFAULT FALSE,
        birth_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Users table');

    // 2. Portfolios
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS portfolios (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        total_value DECIMAL(15, 2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    
    // Add total_value if it doesn't exist (for existing DBs)
    try {
      await pool.execute('ALTER TABLE portfolios ADD COLUMN total_value DECIMAL(15, 2) DEFAULT 0');
    } catch (err) {
      // Column already exists probably
    }
    console.log('✅ Portfolios table');

    // 3. Holdings
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS holdings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        portfolio_id INT NOT NULL,
        user_id INT NOT NULL,
        type ENUM('stock', 'mutual_fund', 'sip', 'fd', 'gov_bond') NOT NULL,
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
    
    // Migration: add gov_bond type
    try {
      await pool.execute("ALTER TABLE holdings MODIFY type ENUM('stock', 'mutual_fund', 'sip', 'fd', 'gov_bond') NOT NULL");
    } catch (err) {}
    console.log('✅ Holdings table');

    // 3b. Transactions
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        holding_id INT,
        type ENUM('buy', 'sell', 'strategy_allocation') NOT NULL,
        amount DECIMAL(15, 2) NOT NULL,
        quantity DECIMAL(15, 4) DEFAULT 0,
        price DECIMAL(15, 2) DEFAULT 0,
        transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (holding_id) REFERENCES holdings(id) ON DELETE SET NULL
      )
    `);
    
    // Migration: make holding_id nullable and add strategy_allocation type
    try {
      await pool.execute('ALTER TABLE transactions MODIFY holding_id INT NULL');
      await pool.execute("ALTER TABLE transactions MODIFY type ENUM('buy', 'sell', 'strategy_allocation') NOT NULL");
    } catch (err) {}
    console.log('✅ Transactions table');

    // 4. Financial Goals
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
    console.log('✅ Financial Goals table');

    // 4b. Expenses
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS expenses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        category VARCHAR(50) NOT NULL,
        amount DECIMAL(15, 2) NOT NULL,
        description TEXT,
        expense_date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Expenses table');

    // 5. Financial Profiles (Discovery)
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
        monthly_income DECIMAL(15,2) DEFAULT 0,
        risk_category ENUM('low', 'medium', 'high') DEFAULT 'medium',
        emergency_fund_value DECIMAL(15,2) DEFAULT 0,
        retirement_fund_value DECIMAL(15,2) DEFAULT 0,
        discovery_data_raw JSON,
        ai_risk_score VARCHAR(50),
        ai_suggestion TEXT,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY user_discovery (user_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Financial Profiles table');

    // 6. Appointments
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
    console.log('✅ Appointments table');

    // 6b. Business Tables
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS business_profiles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL UNIQUE,
        company_name VARCHAR(255) NOT NULL,
        industry VARCHAR(100),
        employees INT DEFAULT 1,
        tax_id VARCHAR(50),
        annual_revenue DECIMAL(15, 2) DEFAULT 0,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Business Profiles table');

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS cash_flows (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        type ENUM('income', 'expense') NOT NULL,
        category VARCHAR(100) NOT NULL,
        amount DECIMAL(15, 2) NOT NULL,
        description TEXT,
        transaction_date DATE NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Cash Flows table');

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS invoices (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        client_name VARCHAR(255) NOT NULL,
        amount DECIMAL(15, 2) NOT NULL,
        status ENUM('draft', 'sent', 'paid', 'overdue') DEFAULT 'draft',
        due_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Invoices table');

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS payroll (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        employee_name VARCHAR(255) NOT NULL,
        salary DECIMAL(15, 2) NOT NULL,
        payment_date DATE NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Payroll table');

    // 7. Financial Plans
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS financial_plans (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        expenses_pct DECIMAL(5,2) DEFAULT 50,
        equity_pct DECIMAL(5,2) DEFAULT 40,
        safe_pct DECIMAL(5,2) DEFAULT 20,
        emergency_pct DECIMAL(5,2) DEFAULT 20,
        retirement_pct DECIMAL(5,2) DEFAULT 20,
        strategy_name VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY user_plan (user_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Financial Plans table');

    // 8. Risk Metrics
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS risk_metrics (
        id INT AUTO_INCREMENT PRIMARY KEY,
        portfolio_id INT NOT NULL,
        user_id INT NOT NULL,
        volatility DECIMAL(5,2) DEFAULT 0,
        max_drawdown DECIMAL(5,2) DEFAULT 0,
        sector_concentration DECIMAL(5,2) DEFAULT 0,
        initial_ai_risk VARCHAR(50),
        level_1_risk VARCHAR(50),
        level_2_risk VARCHAR(50),
        risk_score VARCHAR(50),
        calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY portfolio_risk (portfolio_id),
        FOREIGN KEY (portfolio_id) REFERENCES portfolios(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Risk Metrics table');

    // 8b. Stock Data Cache
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS stock_data (
        id INT AUTO_INCREMENT PRIMARY KEY,
        symbol VARCHAR(50) NOT NULL,
        date DATE NOT NULL,
        open_price DECIMAL(15, 4),
        high_price DECIMAL(15, 4),
        low_price DECIMAL(15, 4),
        close_price DECIMAL(15, 4),
        volume BIGINT,
        fetched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_symbol_date (symbol, date)
      )
    `);
    console.log('✅ Stock Data table');

    // 9. Chat History
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS chat_history (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        role ENUM('user', 'assistant') NOT NULL,
        message TEXT NOT NULL,
        session_id VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Chat History table');

    // 10. Document & RAG Tables
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS documents (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        filename VARCHAR(255) NOT NULL,
        original_name VARCHAR(255) NOT NULL,
        file_type ENUM('pdf', 'excel', 'csv', 'zip') NOT NULL,
        file_size INT DEFAULT 0,
        chunk_count INT DEFAULT 0,
        parent_doc_id INT DEFAULT NULL,
        status ENUM('processing', 'ready', 'error') DEFAULT 'processing',
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (parent_doc_id) REFERENCES documents(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Documents table');

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS document_chunks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        document_id INT NOT NULL,
        user_id INT NOT NULL,
        chunk_index INT NOT NULL,
        content TEXT NOT NULL,
        tokens INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Document Chunks table');

    console.log('🎉 Migration completed successfully!');
    await pool.end();
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  }
}

migrate();
