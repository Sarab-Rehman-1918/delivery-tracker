const express          = require('express')
const router           = express.Router()
const authenticate     = require('../middleware/auth.middleware')
const orderController  = require('../controllers/order.controller')
const Order            = require('../models/Order')
const mongoose         = require('mongoose')

// Create order
router.post('/', authenticate, orderController.createOrder)

// Get customer orders
router.get('/my-orders', authenticate, orderController.getMyOrders)

// Get all orders (admin)
router.get('/all', authenticate, orderController.getAllOrders)

// Get driver orders
router.get('/my-driver-orders', authenticate, async (req, res) => {
  try {
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

// Track order by tracking ID (public)
router.get('/track/:trackingId', orderController.getOrderByTracking)

// Update order status
router.put('/:id/status', authenticate, orderController.updateOrderStatus)

// Assign driver
router.put('/:id/assign', authenticate, async (req, res) => {
  try {
    const { driverId } = req.body
    console.log('Assigning driverID:', driverId)

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

module.exports = router