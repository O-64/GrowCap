const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const auth = require('../middleware/auth');

// Book an appointment
router.post('/', auth, async (req, res) => {
  try {
    const { advisor_name, requirement, date, time } = req.body;
    
    if (!advisor_name || !date || !time) {
      return res.status(400).json({ error: 'Advisor, date and time are required' });
    }

    const [result] = await pool.execute(
      'INSERT INTO appointments (user_id, advisor_name, requirement, appointment_date, appointment_time, status) VALUES (?, ?, ?, ?, ?, ?)',
      [req.user.id, advisor_name, requirement || 'General Consultation', date, time, 'pending']
    );

    res.status(201).json({ 
      message: 'Appointment booked successfully', 
      id: result.insertId,
      advisor_name,
      appointment_date: date,
      appointment_time: time
    });
  } catch (err) {
    console.error('Book Appointment Error:', err);
    res.status(500).json({ error: 'Failed to book appointment' });
  }
});

// Get user appointments
router.get('/', auth, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM appointments WHERE user_id = ? AND appointment_date >= CURDATE() ORDER BY appointment_date, appointment_time',
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    console.error('Fetch Appointments Error:', err);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

// Update status
router.patch('/:id', auth, async (req, res) => {
  try {
    const { status } = req.body;
    await pool.execute(
      'UPDATE appointments SET status = ? WHERE id = ? AND user_id = ?',
      [status, req.params.id, req.user.id]
    );
    res.json({ message: 'Status updated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update' });
  }
});

module.exports = router;
