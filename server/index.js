require('dotenv').config()
const express = require('express')
const http    = require('http')
const { Server } = require('socket.io')
const connectDB  = require('./src/config/db')
const redisClient = require('./src/config/redis')
const initializeSockets = require('./src/sockets/index')
const authRoutes  = require('./src/routes/auth.routes')
const orderRoutes = require('./src/routes/order.routes')

const app    = express()
const server = http.createServer(app)

// Allow all Vercel preview URLs + localhost
const allowedOrigins = (origin, callback) => {
  if (
    !origin ||
    origin.includes('localhost') ||
    origin.includes('vercel.app')
  ) {
    callback(null, true)
  } else {
    callback(new Error('Not allowed by CORS'))
  }
}

const io = new Server(server, {
  cors: {
    origin:  allowedOrigins,
    methods: ['GET', 'POST'],
  }
})


// Connect databases
connectDB()

// Middleware
app.use(express.json())
app.use(require('cors')({ origin: allowedOrigins }))

// Routes
app.use('/api/auth',   authRoutes)
app.use('/api/orders', orderRoutes)


// Initialize sockets
initializeSockets(io)

// Health check route
app.get('/', (req, res) => {
  res.json({ message: '🚚 Delivery Tracker API Running!' })
})

// ← THIS IS THE FIX
// Use Render's PORT environment variable
const PORT = process.env.PORT || 5000
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`)
})