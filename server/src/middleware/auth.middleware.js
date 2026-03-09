const jwt = require('jsonwebtoken')
const User = require('../models/User')

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization

    console.log('Auth header:', authHeader)  // ← add this

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' })
    }

    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    console.log('Decoded token:', decoded)  // ← add this

    const user = await User.findById(decoded.id)

    console.log('User found:', user?.email)  // ← add this

    if (!user) {
      return res.status(401).json({ message: 'User not found' })
    }

    req.user = user
    next()

  } catch (err) {
    console.error('Auth error:', err.message)
    return res.status(401).json({ message: 'Invalid token' })
  }
}

module.exports = authenticate