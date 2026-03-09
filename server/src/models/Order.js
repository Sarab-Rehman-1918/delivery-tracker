// server/src/models/Order.js

const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    trackingId: {
      type: String,
      unique: true,
      required: true,
    },

    status: {
      type: String,
      enum: [
        'pending',       // order placed
        'assigned',      // driver assigned
        'picked_up',     // driver picked up order
        'on_the_way',    // driver heading to customer
        'delivered',     // order delivered
        'cancelled',     // order cancelled
      ],
      default: 'pending',
    },

    pickupLocation: {
      address: { type: String, required: true },
      lat:     { type: Number, required: true },
      lng:     { type: Number, required: true },
    },

    dropLocation: {
      address: { type: String, required: true },
      lat:     { type: Number, required: true },
      lng:     { type: Number, required: true },
    },

    estimatedTime: {
      type: String,
      default: 'Calculating...',
    },

    distance: {
      type: String,
      default: '0 km',
    },

    orderDetails: {
      items:       { type: String },
      totalAmount: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;