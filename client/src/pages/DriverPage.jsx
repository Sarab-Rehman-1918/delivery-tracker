// src/pages/DriverPage.jsx

import { useState, useEffect, useRef } from 'react'
import { useNavigate }                  from 'react-router-dom'
import { useAuth }                      from '../context/AuthContext'
import useGeolocation                   from '../hooks/useGeolocation'
import useSocket                        from '../hooks/useSocket'
import { getAllOrders, updateOrderStatus } from '../services/api'
import { getDriverOrders } from '../services/api'


function DriverPage() {
  const { user, logout }              = useAuth()
  const navigate                      = useNavigate()
  const [isTracking, setIsTracking]   = useState(false)
  const [activeOrder, setActiveOrder] = useState(null)
  const [orders,      setOrders]      = useState([])
  const [statusMsg,   setStatusMsg]   = useState('')
  const { location, error: gpsError } = useGeolocation(isTracking)
  const { socket, connected }         = useSocket()

  // Redirect if not a driver
  useEffect(() => {
    if (user && user.role !== 'driver') navigate('/')
  }, [user])

  // Load assigned orders for this driver
  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const res = await getDriverOrders()
      setOrders(res.data.orders)
    } catch (err) {
      console.error('Failed to fetch orders:', err)
    }
  }

  // Send location to server via socket whenever it updates
  useEffect(() => {
    if (!location || !isTracking || !socket || !activeOrder) return

    socket.emit('driver:location', {
      orderId:   activeOrder._id,
      driverId:  user._id,
      lat:       location.lat,
      lng:       location.lng,
      timestamp: location.timestamp,
    })

    console.log('📡 Sent location:', location.lat, location.lng)
  }, [location])

  const startTracking = () => {
    if (!activeOrder) {
      alert('Please select an order first!')
      return
    }
    // Join the order room
    socket.emit('driver:join', {
      orderId:  activeOrder._id,
      driverId: user._id,
    })
    setIsTracking(true)
    setStatusMsg('📡 Sharing live location...')
  }

  const stopTracking = () => {
    socket.emit('driver:stop', {
      orderId:  activeOrder._id,
      driverId: user._id,
    })
    setIsTracking(false)
    setStatusMsg('⏸ Location sharing stopped')
  }

  const markArrived = async () => {
    if (!activeOrder) return
    socket.emit('driver:arrived', {
      orderId:  activeOrder._id,
      driverId: user._id,
    })
    setStatusMsg('📍 Customer notified of arrival!')
  }

  const markDelivered = async () => {
    if (!activeOrder) return
    try {
      await updateOrderStatus(activeOrder._id, 'delivered')
      socket.emit('driver:stop', {
        orderId:  activeOrder._id,
        driverId: user._id,
      })
      setIsTracking(false)
      setStatusMsg('✅ Order marked as delivered!')
      fetchOrders()
    } catch (err) {
      alert('Failed to update order status')
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div style={pageStyle}>

      {/* Header */}
      <div style={headerStyle}>
        <h2 style={{ margin: 0 }}>🚗 Driver Dashboard</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '12px', color: connected ? '#4CAF50' : '#f44336' }}>
            {connected ? '🟢 Connected' : '🔴 Disconnected'}
          </span>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '14px' }}>👤 {user?.name}</div>
            <div style={{ fontSize: '11px', opacity: 0.7, marginTop: '3px' }}>
              ID: {user?._id}
              <button
                style={{ marginLeft: '8px', padding: '2px 8px', fontSize: '11px', cursor: 'pointer', borderRadius: '4px', border: 'none', backgroundColor: '#4CAF50', color: 'white' }}
                onClick={() => {
                  navigator.clipboard.writeText(user?._id)
                  alert('Driver ID copied!')
                }}
              >
                Copy
              </button>
            </div>
          </div>
          <button style={smallBtnStyle} onClick={handleLogout}>Logout</button>
        </div>
      </div>

      {/* Order Selector */}
      <div style={cardStyle}>
        <h3>📦 Select Active Order</h3>
        {orders.length === 0 ? (
          <p style={{ color: '#888' }}>No orders assigned to you yet.</p>
        ) : (
          orders.map((order) => (
            <div
              key={order._id}
              onClick={() => setActiveOrder(order)}
              style={{
                ...orderItemStyle,
                border: activeOrder?._id === order._id
                  ? '2px solid #4CAF50'
                  : '1px solid #ddd',
              }}
            >
              <strong>#{order.trackingId}</strong>
              <span style={badgeStyle(order.status)}>{order.status}</span>
              <div style={{ fontSize: '13px', color: '#555', marginTop: '5px' }}>
                📍 {order.pickupLocation?.address} → {order.dropLocation?.address}
              </div>
            </div>
          ))
        )}
      </div>

      {/* GPS Status */}
      {activeOrder && (
        <div style={cardStyle}>
          <h3>📡 Live Location</h3>
          {gpsError && <p style={{ color: 'red' }}>GPS Error: {gpsError}</p>}
          {location ? (
            <p style={{ color: '#4CAF50' }}>
              ✅ Lat: {location.lat.toFixed(5)}, Lng: {location.lng.toFixed(5)}
            </p>
          ) : (
            <p style={{ color: '#888' }}>Waiting for GPS signal...</p>
          )}
          {statusMsg && <p style={{ color: '#2196F3' }}>{statusMsg}</p>}

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '10px' }}>
            {!isTracking ? (
              <button style={greenBtn} onClick={startTracking}>
                ▶ Start Sharing
              </button>
            ) : (
              <button style={redBtn} onClick={stopTracking}>
                ⏹ Stop Sharing
              </button>
            )}
            <button style={blueBtn} onClick={markArrived}>
              📍 I've Arrived
            </button>
            <button style={orangeBtn} onClick={markDelivered}>
              ✅ Mark Delivered
            </button>
          </div>
        </div>
      )}

    </div>
  )
}

// ─── Styles ─────────────────────────────────────────────
const pageStyle = {
  maxWidth:  '700px',
  margin:    '0 auto',
  padding:   '20px',
  fontFamily: 'sans-serif',
}

const headerStyle = {
  display:        'flex',
  justifyContent: 'space-between',
  alignItems:     'center',
  padding:        '15px 20px',
  backgroundColor: '#1a1a2e',
  color:          'white',
  borderRadius:   '10px',
  marginBottom:   '20px',
}

const cardStyle = {
  backgroundColor: 'white',
  borderRadius:    '10px',
  padding:         '20px',
  marginBottom:    '20px',
  boxShadow:       '0 2px 8px rgba(0,0,0,0.1)',
}

const orderItemStyle = {
  padding:      '12px',
  borderRadius: '8px',
  marginBottom: '10px',
  cursor:       'pointer',
  transition:   'all 0.2s',
}

const badgeStyle = (status) => ({
  marginLeft:      '10px',
  padding:         '2px 8px',
  borderRadius:    '12px',
  fontSize:        '12px',
  backgroundColor:
    status === 'delivered' ? '#4CAF50' :
    status === 'on_the_way' ? '#2196F3' :
    status === 'assigned' ? '#FF9800' : '#9E9E9E',
  color: 'white',
})

const smallBtnStyle = {
  padding:         '5px 12px',
  backgroundColor: '#f44336',
  color:           'white',
  border:          'none',
  borderRadius:    '5px',
  cursor:          'pointer',
}

const greenBtn  = { ...smallBtnStyle, backgroundColor: '#4CAF50',  padding: '10px 16px' }
const redBtn    = { ...smallBtnStyle, backgroundColor: '#f44336',  padding: '10px 16px' }
const blueBtn   = { ...smallBtnStyle, backgroundColor: '#2196F3',  padding: '10px 16px' }
const orangeBtn = { ...smallBtnStyle, backgroundColor: '#FF9800',  padding: '10px 16px' }

export default DriverPage
