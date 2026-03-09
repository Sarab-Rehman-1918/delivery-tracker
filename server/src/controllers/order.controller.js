// server/src/controllers/order.controller.js

const Order = require('../models/Order');
const generateTrackingId = require('../utils/generateTrackingId');

  const createOrder = async (req, res) => {
    try {
      const Order = require('../models/Order')

      console.log('Creating order, user:', req.user._id)  // ← add this
      console.log('Request body:', req.body)               // ← add this

      const {
        pickupLocation,
        dropLocation,
        orderDetails,
      } = req.body

      const trackingId = require('../utils/generateTrackingId')()

      const order = await Order.create({
        customer:        req.user._id,
        trackingId,
        pickupLocation,
        dropLocation,
        orderDetails,
        status:          'pending',
      })

      console.log('Order created:', order.trackingId)     // ← add this

      res.status(201).json({ order })

    } catch (err) {
      console.error('Create order error:', err.message)   // ← add this
      res.status(500).json({ message: err.message })
    }
  }

// ─── GET ALL ORDERS (Admin) ──────────────────
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('customer', 'name email phone')
      .populate('driver',   'name email phone')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ─── GET MY ORDERS (Customer) ───────────────
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.user.id })
      .populate('driver', 'name email phone')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ─── GET SINGLE ORDER BY TRACKING ID ────────
const getOrderByTrackingId = async (req, res) => {
  try {
    const order = await Order.findOne({
      trackingId: req.params.trackingId
    })
      .populate('customer', 'name phone')
      .populate('driver',   'name phone currentLocation');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.status(200).json({
      success: true,
      order,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ─── UPDATE ORDER STATUS ─────────────────────
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Order status updated',
      order,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ─── ASSIGN DRIVER TO ORDER ──────────────────
const assignDriver = async (req, res) => {
  try {
    const { driverId } = req.body;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        driver: driverId,
        status: 'assigned'
      },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Driver assigned successfully',
      order,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  createOrder,
  getAllOrders,
  getMyOrders,
  getOrderByTrackingId,
  updateOrderStatus,
  assignDriver,
};