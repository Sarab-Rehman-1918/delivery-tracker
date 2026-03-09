// server/src/sockets/orderHandler.js

const Order = require('../models/Order');

const orderHandler = (io, socket) => {

  // ─── UPDATE ORDER STATUS ────────────────────
  socket.on('order:status', async (data) => {
    const { trackingId, status } = data;

    try {
      // Update in MongoDB
      const order = await Order.findOneAndUpdate(
        { trackingId },
        { status },
        { new: true }
      );

      // Broadcast to customer tracking this order
      io.to(`order:${trackingId}`).emit('status:updated', {
        status,
        message: getStatusMessage(status),
        timestamp: Date.now(),
      });

      console.log(`📦 Order ${trackingId} status: ${status}`);

    } catch (error) {
      console.log('❌ Order Status Error:', error.message);
    }
  });

  // ─── DRIVER ARRIVED ─────────────────────────
  socket.on('driver:arrived', (data) => {
    const { trackingId } = data;

    io.to(`order:${trackingId}`).emit('driver:arrived', {
      message: '🚗 Driver has arrived!',
      timestamp: Date.now(),
    });
  });

};

// Helper function for status messages
const getStatusMessage = (status) => {
  const messages = {
    pending:    '⏳ Order is pending',
    assigned:   '✅ Driver has been assigned',
    picked_up:  '📦 Order has been picked up',
    on_the_way: '🚗 Driver is on the way',
    delivered:  '🎉 Order has been delivered',
    cancelled:  '❌ Order has been cancelled',
  };
  return messages[status] || 'Status updated';
};

module.exports = orderHandler;