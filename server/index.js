// server/index.js

require('dotenv').config();
const express    = require('express');
const http       = require('http');
const { Server } = require('socket.io');
const connectDB  = require('./src/config/db');
const redisClient = require('./src/config/redis');
const supabase   = require('./src/config/supabase');
const initializeSockets = require('./src/sockets/index');

// Routes
const authRoutes  = require('./src/routes/auth.routes');
const orderRoutes = require('./src/routes/order.routes')


const app    = express();
const server = http.createServer(app);
const io     = new Server(server, {
  cors: {
    origin:  'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

// Connect Databases
connectDB();

// Middleware
app.use(express.json());
app.use(require('cors')());

// Routes
app.use('/api/auth',   authRoutes);
app.use('/api/orders', orderRoutes);


// Sockets
initializeSockets(io);

// Test Route
app.get('/', (req, res) => {
  res.json({ message: '🚚 Delivery Tracker API Running!' });
});

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});