-- ============================================
-- GrowCap Database Schema (B2B & B2C)
-- ============================================

CREATE DATABASE IF NOT EXISTS growcap;
USE growcap;

-- Users table (Identity & Auth Only)
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  whatsapp_number VARCHAR(20),
  user_type ENUM('individual', 'business') DEFAULT 'individual',
  onboarding_completed BOOLEAN DEFAULT FALSE,
  birth_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Financial Profiles (Strict strategy parameters)
CREATE TABLE IF NOT EXISTS financial_profiles (
  user_id INT PRIMARY KEY,
  monthly_income DECIMAL(15, 2) DEFAULT 0,
  tax_liability DECIMAL(15, 2) DEFAULT 0,
  revenue DECIMAL(15, 2) DEFAULT 0,
  payroll DECIMAL(15, 2) DEFAULT 0,
  opex DECIMAL(15, 2) DEFAULT 0,
  rent_emi DECIMAL(15, 2) DEFAULT 0,
  essential_expenses DECIMAL(15, 2) DEFAULT 0,
  non_essential_expenses DECIMAL(15, 2) DEFAULT 0,
  other_needs DECIMAL(15, 2) DEFAULT 0,
  emergency_fund_value DECIMAL(15, 2) DEFAULT 0,
  retirement_fund_value DECIMAL(15, 2) DEFAULT 0,
  ai_risk_score ENUM('Low', 'Medium', 'High', 'Safe (Optimal)') DEFAULT 'Medium',
  risk_category ENUM('low', 'medium', 'high') DEFAULT 'medium',
  ai_suggestion TEXT,
  discovery_data_raw JSON,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Financial Plans Table
CREATE TABLE IF NOT EXISTS financial_plans (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  expenses_pct DECIMAL(5, 2) NOT NULL,
  equity_pct DECIMAL(5, 2) NOT NULL,
  safe_pct DECIMAL(5, 2) NOT NULL,
  emergency_pct DECIMAL(5, 2) NOT NULL,
  retirement_pct DECIMAL(5, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =================INDIVIDUAL TABLES=================
CREATE TABLE IF NOT EXISTS portfolios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  total_value DECIMAL(15, 2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS holdings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  portfolio_id INT NOT NULL,
  user_id INT NOT NULL,
  type ENUM('stock', 'mutual_fund', 'sip', 'fd', 'gov_bond') NOT NULL,
  symbol VARCHAR(50),
  name VARCHAR(255) NOT NULL,
  quantity DECIMAL(15, 4) DEFAULT 0,
  buy_price DECIMAL(15, 2) DEFAULT 0,
  current_price DECIMAL(15, 2) DEFAULT 0,
  invested_amount DECIMAL(15, 2) NOT NULL,
  current_value DECIMAL(15, 2),
  interest_rate DECIMAL(5, 2) DEFAULT 0,
  maturity_date DATE,
  sip_day INT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (portfolio_id) REFERENCES portfolios(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  holding_id INT NULL,
  type ENUM('buy', 'sell', 'strategy_allocation') NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  quantity DECIMAL(15, 4) DEFAULT 0,
  price DECIMAL(15, 2) DEFAULT 0,
  transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (holding_id) REFERENCES holdings(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS financial_goals (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  target_amount DECIMAL(15, 2) NOT NULL,
  current_amount DECIMAL(15, 2) DEFAULT 0,
  monthly_contribution DECIMAL(15, 2) DEFAULT 0,
  target_date DATE,
  category VARCHAR(50),
  priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
  progress DECIMAL(5, 2) GENERATED ALWAYS AS ((current_amount / target_amount) * 100) STORED,
  status ENUM('active', 'paused', 'completed') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS expenses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  category VARCHAR(50) NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  description TEXT,
  expense_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =================BUSINESS TABLES=================
CREATE TABLE IF NOT EXISTS business_profiles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  company_name VARCHAR(255) NOT NULL,
  industry VARCHAR(100),
  employees INT DEFAULT 1,
  tax_id VARCHAR(50),
  annual_revenue DECIMAL(15, 2) DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS cash_flows (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  type ENUM('income', 'expense') NOT NULL,
  category VARCHAR(100) NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  description TEXT,
  transaction_date DATE NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS invoices (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  client_name VARCHAR(255) NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  status ENUM('draft', 'sent', 'paid', 'overdue') DEFAULT 'draft',
  due_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS payroll (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  employee_name VARCHAR(255) NOT NULL,
  salary DECIMAL(15, 2) NOT NULL,
  payment_date DATE NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =================SYSTEM & AI TABLES=================
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
);

CREATE TABLE IF NOT EXISTS chat_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  session_id VARCHAR(100) NOT NULL,
  role ENUM('user', 'assistant') NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

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
);

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
);

-- Risk Metrics (Cache/Audit)
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
);
