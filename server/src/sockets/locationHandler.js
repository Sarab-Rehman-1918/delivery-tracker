const locationService = require('../services/locationService')

const locationHandler = (io, socket) => {

  // Driver joins order room
  socket.on('driver:join', async ({ orderId, driverId }) => {
    socket.join(`order:${orderId}`)
    console.log(`🚗 Driver ${driverId} joined order room: ${orderId}`)
  })

  // Customer joins order room
  socket.on('customer:join', async ({ orderId }) => {
    socket.join(`order:${orderId}`)
    console.log(`👤 Customer joined order room: ${orderId}`)

    // ← THIS IS THE FIX
    // Send last known driver location immediately when customer joins
    try {
      const lastLocation = await locationService.getDriverLocation(orderId)
      if (lastLocation) {
        console.log('📍 Sending last known location to customer:', lastLocation)
        socket.emit('location:updated', {
          lat:       lastLocation.lat,
          lng:       lastLocation.lng,
          timestamp: lastLocation.timestamp,
          eta:       lastLocation.eta,
          distance:  lastLocation.distance,
        })
      } else {
        console.log('No previous location found for order:', orderId)
      }
    } catch (err) {
      console.error('Error fetching last location:', err.message)
    }
  })

  // Driver sends live location
  socket.on('driver:location', async ({ orderId, driverId, lat, lng, timestamp }) => {
    try {
      // Save to Redis + MongoDB
      await locationService.saveDriverLocation(orderId, driverId, lat, lng)

      // Calculate ETA
      const Order = require('../models/Order')
      const order = await Order.findById(orderId)

      let eta      = null
      let distance = null

      if (order?.dropLocation?.lat) {
        const result = await locationService.updateOrderETA(
          orderId, lat, lng,
          order.dropLocation.lat,
          order.dropLocation.lng
        )
        eta      = result?.eta
        distance = result?.distance
      }

      // Broadcast to everyone in the order room
      io.to(`order:${orderId}`).emit('location:updated', {
        lat,
        lng,
        timestamp,
        eta,
        distance,
      })

      console.log(`📡 Location broadcast for order ${orderId}: ${lat}, ${lng}`)

    } catch (err) {
      console.error('Location handler error:', err.message)
    }
  })

  // Driver stopped sharing
  socket.on('driver:stop', ({ orderId, driverId }) => {
    console.log(`⏹ Driver ${driverId} stopped sharing for order ${orderId}`)
    io.to(`order:${orderId}`).emit('status:updated', {
      status:    'delivered',
      message:   '✅ Delivery completed!',
      timestamp: new Date(),
    })
  })

  // Driver arrived
  socket.on('driver:arrived', ({ orderId, driverId }) => {
    console.log(`📍 Driver arrived for order ${orderId}`)
    io.to(`order:${orderId}`).emit('driver:arrived', {
      message:   '🔔 Your driver has arrived!',
      timestamp: new Date(),
    })
  })

}

module.exports = locationHandler