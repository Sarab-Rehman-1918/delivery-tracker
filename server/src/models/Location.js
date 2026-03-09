// server/src/models/Location.js

const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },

    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    coordinates: [
      {
        lat:       { type: Number, required: true },
        lng:       { type: Number, required: true },
        timestamp: { type: Date, default: Date.now },
      },
    ],

    currentLat: {
      type: Number,
      required: true,
    },

    currentLng: {
      type: Number,
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true, // true = driver is moving
    },
  },
  {
    timestamps: true,
  }
);

const Location = mongoose.model('Location', locationSchema);

module.exports = Location;