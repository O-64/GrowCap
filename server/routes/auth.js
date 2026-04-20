const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const auth = require('../middleware/auth');

// Register
router.post('/register', async (req, res) => {
  try {
    const { 
      name, email, password, user_type, whatsapp_number, company_name
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required' });
    }

    const type = user_type === 'business' ? 'business' : 'individual';

    // Check if user exists
    const [existing] = await pool.execute('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert user
    const [result] = await pool.execute(
      'INSERT INTO users (name, email, password, whatsapp_number, user_type, onboarding_completed) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, hashedPassword, whatsapp_number || null, type, false]
    );

    const userId = result.insertId;

    // Initialize blank financial profile for RAG and Risk engines
    await pool.execute(
      'INSERT INTO financial_profiles (user_id, monthly_income, risk_category) VALUES (?, ?, ?)',
      [userId, 0, 'medium']
    );

    if (type === 'individual') {
      // Create default portfolio for individual
      await pool.execute(
        'INSERT INTO portfolios (user_id, name, description) VALUES (?, ?, ?)',
        [userId, 'My Portfolio', 'Default portfolio']
      );
    } else {
      // Create business profile
      await pool.execute(
        'INSERT INTO business_profiles (user_id, company_name) VALUES (?, ?)',
        [userId, company_name || 'My Company']
      );
    }

    // Generate token
    const token = jwt.sign(
      { id: userId, email, name, user_type: type, onboarding_completed: false },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Fetch the newly created profile info for immediate dashboard sync
    const [fp] = await pool.execute('SELECT * FROM financial_profiles WHERE user_id = ?', [userId]);
    const profile = fp[0] || {};

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: { 
        id: userId, 
        name, 
        email, 
        user_type: type, 
        onboarding_completed: false,
        ...profile
      }
    });

  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Registration failed. Please ensure the server is running and database is connected.' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const [users] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, user_type: user.user_type, onboarding_completed: Boolean(user.onboarding_completed) },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Fetch full profile info for immediate dashboard sync
    const [fp] = await pool.execute('SELECT * FROM financial_profiles WHERE user_id = ?', [user.id]);
    const profile = fp[0] || {};

    res.json({
      message: 'Login successful',
      token,
      user: { 
        id: user.id, 
        name: user.name, 
        email: user.email, 
        user_type: user.user_type, 
        onboarding_completed: Boolean(user.onboarding_completed),
        ...profile // Include profile data like monthly_income, revenue, etc.
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get Profile
router.get('/profile', auth, async (req, res) => {
  try {
    const [users] = await pool.execute(
      'SELECT id, name, email, whatsapp_number, user_type, onboarding_completed, birth_date FROM users WHERE id = ?',
      [req.user.id]
    );
    if (users.length === 0) return res.status(404).json({ error: 'User not found' });

    const userData = users[0];

    // Fetch latest user status (bypass stale JWT data)
    userData.onboarding_completed = Boolean(userData.onboarding_completed);

    if (userData.user_type === 'business') {
      const [bp] = await pool.execute('SELECT * FROM business_profiles WHERE user_id = ?', [req.user.id]);
      userData.business_profile = bp[0] || null;
    }

    // Fetch discovery profile
    const [fp] = await pool.execute('SELECT * FROM financial_profiles WHERE user_id = ?', [req.user.id]);
    const profile = fp[0] || {};
    
    userData.financial_profile = profile;
    userData.monthly_income = profile.monthly_income || 0;
    userData.revenue = profile.revenue || 0;
    userData.risk_tolerance = profile.risk_category || 'medium';
    userData.ai_risk_score = profile.ai_risk_score || 'Pending';

    res.json(userData);
  } catch (err) {
    console.error('Profile error:', err);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

module.exports = router;
