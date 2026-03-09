// server/src/sockets/index.js

const locationHandler = require('./locationHandler');
const orderHandler    = require('./orderHandler');

const initializeSockets = (io) => {

  io.on('connection', (socket) => {
    console.log(`⚡ New connection: ${socket.id}`);

    // Initialize handlers
    locationHandler(io, socket);
    orderHandler(io, socket);

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`❌ Disconnected: ${socket.id}`);
    });
  });

};

module.exports = initializeSockets;