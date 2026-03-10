const Order              = require('../models/Order')
const generateTrackingId = require('../utils/generateTrackingId')  // ← only here once

const createOrder = async (req, res) => {
  try {
    console.log('Creating order, user:', req.user._id)
    console.log('Request body:', req.body)

    const { pickupLocation, dropLocation, orderDetails } = req.body

    const trackingId = generateTrackingId()  // ← just call it directly, no require

    const order = await Order.create({
      customer:     req.user._id,
      trackingId,
      pickupLocation,
      dropLocation,
      orderDetails,
      status:       'pending',
    })

    console.log('Order created:', order.trackingId)

    res.status(201).json({ order })

  } catch (err) {
    console.error('Create order error:', err.message)
    res.status(500).json({ message: err.message })
  }
}

const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.user._id })
      .populate('driver', 'name email')
      .sort({ createdAt: -1 })
    res.json({ orders })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const getOrderByTracking = async (req, res) => {
  try {
    const order = await Order.findOne({ trackingId: req.params.trackingId })
      .populate('customer', 'name email')
      .populate('driver',   'name email')
    if (!order) return res.status(404).json({ message: 'Order not found' })
    res.json({ order })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    )
    res.json({ order })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate('customer', 'name email')
      .populate('driver',   'name email')
      .sort({ createdAt: -1 })
    res.json({ orders })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

module.exports = {
  createOrder,
  getMyOrders,
  getOrderByTracking,
  updateOrderStatus,
  getAllOrders,
}