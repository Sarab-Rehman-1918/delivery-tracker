require('dotenv').config()
const express  = require('express')
const http     = require('http')
const cors     = require('cors')
const { Server } = require('socket.io')
const connectDB  = require('./src/config/db')
const initializeSockets = require('./src/sockets/index')
const authRoutes  = require('./src/routes/auth.routes')
const orderRoutes = require('./src/routes/order.routes')

const app    = express()
const server = http.createServer(app)

// ← THIS FIXES CORS PERMANENTLY
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests from localhost, vercel.app, or no origin (mobile/postman)
    if (
      !origin ||
      origin.includes('localhost') ||
      origin.includes('vercel.app')
    ) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  methods:     ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
}

const io = new Server(server, {
  cors: corsOptions,
})

// Connect databases
connectDB()

// Middleware
app.use(cors(corsOptions))
app.use(express.json())

// Handle preflight requests
app.options('*', cors(corsOptions))

// Routes
app.use('/api/auth',   authRoutes)
app.use('/api/orders', orderRoutes)

// Initialize sockets
initializeSockets(io)

// Health check
app.get('/', (req, res) => {
  res.json({ message: '🚚 Delivery Tracker API Running!' })
})

// Keep Render awake
setInterval(() => {
  fetch(`https://delivery-tracker-backend-psu2.onrender.com`)
    .then(() => console.log('🏃 Keeping server awake'))
    .catch(() => {})
}, 14 * 60 * 1000)

const PORT = process.env.PORT || 5000
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`)
})