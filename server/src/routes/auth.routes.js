// server/src/routes/auth.routes.js

const express = require('express');
const router  = express.Router();
const authenticate = require('../middleware/auth.middleware')
const { register, login, getProfile } = require('../controllers/auth.controller');
const protect = require('../middleware/auth.middleware');

// Public routes
router.post('/register', register);
router.post('/login',    login);

// Protected route (need to be logged in)
router.get('/profile', protect, getProfile);
// Add this route
router.get('/drivers', authenticate, async (req, res) => {
  try {
    const User    = require('../models/User')
    const drivers = await User.find({ role: 'driver' }).select('name email _id phone')
    res.json({ drivers })
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch drivers' })
  }
})

module.exports = router;