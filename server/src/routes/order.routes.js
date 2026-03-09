// server/src/routes/order.routes.js

const express = require('express');
const router  = express.Router();
const authenticate = require('../middleware/auth.middleware')
const protect = require('../middleware/auth.middleware');
const {
  createOrder,
  getAllOrders,
  getMyOrders,
  getOrderByTrackingId,
  updateOrderStatus,
  assignDriver,
} = require('../controllers/order.controller');

// Customer routes
router.post('/',           protect, createOrder);
router.get('/my-orders',   protect, getMyOrders);

// Public route (shareable tracking link)
router.get('/track/:trackingId', getOrderByTrackingId);
// Get orders assigned to logged-in driver
  router.get('/my-driver-orders', authenticate, async (req, res) => {
    try {
      const Order    = require('../models/Order')
      const mongoose = require('mongoose')

      // Convert driver ID to ObjectId to ensure proper matching
      const driverId = new mongoose.Types.ObjectId(req.user._id)

      console.log('Looking for orders with driver:', driverId)

      const orders = await Order.find({ driver: driverId })
        .populate('customer', 'name email')
        .populate('driver',   'name email')
        .sort({ createdAt: -1 })

      console.log('Orders found:', orders.length)

      res.json({ orders })
    } catch (err) {
      console.error('Error:', err.message)
      res.status(500).json({ message: 'Failed to fetch orders' })
    }
  })

router.post('/', authenticate, async (req, res) => {
  const orderController = require('../controllers/order.controller')
  return orderController.createOrder(req, res)
})

// Driver/Admin routes
router.put('/:id/status',  protect, updateOrderStatus);
router.put('/:id/assign', authenticate, async (req, res) => {
  try {
    const Order    = require('../models/Order')
    const mongoose = require('mongoose')
    const { driverId } = req.body

    console.log('Assigning driverID:', driverId)

    // Convert to ObjectId before saving
    const driverObjectId = new mongoose.Types.ObjectId(driverId)

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { driver: driverObjectId, status: 'assigned' },
      { new: true }
    )

    console.log('Saved driver on order:', order.driver)

    res.json({ order })
  } catch (err) {
    console.error('Assign error:', err.message)
    res.status(500).json({ message: 'Failed to assign driver' })
  }
})


// Admin only
router.get('/all',         protect, getAllOrders);

module.exports = router;