const redisClient  = require('../config/redis')
const Location     = require('../models/Location')
const etaService   = require('./etaService')

// Save driver location to Redis + MongoDB
const saveDriverLocation = async (orderId, driverId, lat, lng) => {
  try {
    const locationData = JSON.stringify({
      lat, lng,
      timestamp: new Date().toISOString()
    })

    // Save to Redis with 5 min expiry
    await redisClient.set(
      `location:${orderId}`,
      locationData,
      { EX: 300 }
    )

    // Save to MongoDB
    await Location.findOneAndUpdate(
      { order: orderId },
      {
        driver:     driverId,
        currentLat: lat,
        currentLng: lng,
        isActive:   true,
        $push: {
          coordinates: { lat, lng, timestamp: new Date() }
        }
      },
      { upsert: true, new: true }
    )

  } catch (err) {
    console.error('saveDriverLocation error:', err.message)
  }
}

// Get last known driver location
const getDriverLocation = async (orderId) => {
  try {
    // Try Redis first (fastest)
    const cached = await redisClient.get(`location:${orderId}`)
    if (cached) {
      console.log('📍 Location from Redis cache')
      return JSON.parse(cached)
    }

    // Fallback to MongoDB
    const location = await Location.findOne({ order: orderId })
    if (location) {
      console.log('📍 Location from MongoDB')
      return {
        lat:       location.currentLat,
        lng:       location.currentLng,
        timestamp: location.updatedAt,
      }
    }

    return null
  } catch (err) {
    console.error('getDriverLocation error:', err.message)
    return null
  }
}

// Update ETA on order
const updateOrderETA = async (orderId, driverLat, driverLng, destLat, destLng) => {
  try {
    const Order    = require('../models/Order')
    const distance = etaService.calculateDistance(driverLat, driverLng, destLat, destLng)
    const eta      = etaService.calculateETA(distance)

    await Order.findByIdAndUpdate(orderId, { estimatedTime: eta, distance })

    return { eta, distance }
  } catch (err) {
    console.error('updateOrderETA error:', err.message)
    return null
  }
}

module.exports = {
  saveDriverLocation,
  getDriverLocation,
  updateOrderETA,
}