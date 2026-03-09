// src/pages/TrackOrder.jsx

import { useState, useEffect }      from 'react'
import { useParams }                from 'react-router-dom'
import { getOrderByTracking }       from '../services/api'
import { io }                       from 'socket.io-client'
import LiveMap                      from '../components/Map/LiveMap'

function TrackOrder() {
  const { trackingId }                    = useParams()
  const [order,          setOrder]        = useState(null)
  const [driverLocation, setDriverLocation] = useState(null)
  const [eta,            setEta]          = useState(null)
  const [distance,       setDistance]     = useState(null)
  const [statusMsg,      setStatusMsg]    = useState('')
  const [loading,        setLoading]      = useState(true)
  const [error,          setError]        = useState('')

  // Load order details
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await getOrderByTracking(trackingId)
        setOrder(res.data.order)
      } catch (err) {
        setError('Order not found. Please check your tracking ID.')
      } finally {
        setLoading(false)
      }
    }
    fetchOrder()
  }, [trackingId])

  // Connect to socket & listen for live updates
  useEffect(() => {
    if (!order) return

    const socket = io(import.meta.env.VITE_API_URL)

    // Join order room as customer
    socket.on('connect', () => {
      socket.emit('customer:join', { orderId: order._id })
    })

    // Receive live driver location
    socket.on('location:updated', (data) => {
      setDriverLocation({ lat: data.lat, lng: data.lng })
      if (data.eta)      setEta(data.eta)
      if (data.distance) setDistance(data.distance)
    })

    // Receive status updates
    socket.on('status:updated', (data) => {
      setStatusMsg(data.message || `Status: ${data.status}`)
      setOrder((prev) => ({ ...prev, status: data.status }))
    })

    // Driver arrived notification
    socket.on('driver:arrived', (data) => {
      setStatusMsg('🔔 Your driver has arrived!')
    })

    return () => socket.disconnect()
  }, [order])

  if (loading) return <div style={centerStyle}>Loading order details...</div>
  if (error)   return <div style={{ ...centerStyle, color: 'red' }}>{error}</div>
  if (!order)  return null

  return (
    <div style={pageStyle}>

      {/* Header */}
      <div style={headerStyle}>
        <h2 style={{ margin: 0 }}>📍 Track Your Order</h2>
        <span style={{ fontSize: '14px', opacity: 0.8 }}>#{order.trackingId}</span>
      </div>

      {/* Status Banner */}
      <div style={statusBannerStyle(order.status)}>
        <span style={{ fontSize: '24px' }}>{statusEmoji(order.status)}</span>
        <div>
          <div style={{ fontWeight: 'bold', fontSize: '16px' }}>
            {statusLabel(order.status)}
          </div>
          {statusMsg && (
            <div style={{ fontSize: '13px', marginTop: '4px' }}>{statusMsg}</div>
          )}
        </div>
      </div>

      {/* ETA Card */}
      {(eta || distance) && (
        <div style={etaCardStyle}>
          {eta && (
            <div style={etaItemStyle}>
              <span style={{ fontSize: '24px' }}>⏱</span>
              <div>
                <div style={{ fontSize: '12px', color: '#888' }}>ETA</div>
                <div style={{ fontWeight: 'bold', fontSize: '18px' }}>{eta} mins</div>
              </div>
            </div>
          )}
          {distance && (
            <div style={etaItemStyle}>
              <span style={{ fontSize: '24px' }}>📏</span>
              <div>
                <div style={{ fontSize: '12px', color: '#888' }}>Distance</div>
                <div style={{ fontWeight: 'bold', fontSize: '18px' }}>{distance} km</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Live Map */}
      <div style={cardStyle}>
        <h3 style={{ marginTop: 0 }}>🗺 Live Map</h3>
        {driverLocation ? (
          <LiveMap
            driverLocation={driverLocation}
            pickupLocation={order.pickupLocation}
            dropLocation={order.dropLocation}
          />
        ) : (
          <div style={mapPlaceholderStyle}>
            <p>⏳ Waiting for driver to start sharing location...</p>
            {/* Always show map, with or without driver location */}
            <LiveMap
              driverLocation={driverLocation}
              pickupLocation={order.pickupLocation}
              dropLocation={order.dropLocation}
            />
            {!driverLocation && (
              <p style={{ textAlign: 'center', color: '#888', marginTop: '10px' }}>
                ⏳ Waiting for driver to start sharing location...
              </p>
            )}
          </div>
        )}
      </div>

      {/* Order Details */}
      <div style={cardStyle}>
        <h3 style={{ marginTop: 0 }}>📦 Order Details</h3>
        <div style={detailRowStyle}>
          <span>📍 Pickup</span>
          <span>{order.pickupLocation?.address}</span>
        </div>
        <div style={detailRowStyle}>
          <span>🏠 Drop</span>
          <span>{order.dropLocation?.address}</span>
        </div>
        {order.driver && (
          <div style={detailRowStyle}>
            <span>🚗 Driver</span>
            <span>{order.driver?.name || 'Assigned'}</span>
          </div>
        )}
        <div style={detailRowStyle}>
          <span>📋 Status</span>
          <span style={{ color: statusColor(order.status), fontWeight: 'bold' }}>
            {order.status}
          </span>
        </div>
      </div>

    </div>
  )
}

// ─── Helpers ────────────────────────────────────────────
const statusEmoji = (s) => ({
  pending:    '🕐',
  assigned:   '🚗',
  picked_up:  '📦',
  on_the_way: '🚀',
  delivered:  '✅',
  cancelled:  '❌',
}[s] || '📋')

const statusLabel = (s) => ({
  pending:    'Looking for a driver...',
  assigned:   'Driver assigned!',
  picked_up:  'Package picked up',
  on_the_way: 'On the way to you!',
  delivered:  'Delivered!',
  cancelled:  'Order cancelled',
}[s] || s)

const statusColor = (s) => ({
  pending:    '#FF9800',
  assigned:   '#2196F3',
  picked_up:  '#9C27B0',
  on_the_way: '#2196F3',
  delivered:  '#4CAF50',
  cancelled:  '#f44336',
}[s] || '#333')

// ─── Styles ─────────────────────────────────────────────
const pageStyle = {
  maxWidth:   '700px',
  margin:     '0 auto',
  padding:    '20px',
  fontFamily: 'sans-serif',
}

const centerStyle = {
  textAlign:  'center',
  padding:    '100px 20px',
  fontFamily: 'sans-serif',
}

const headerStyle = {
  display:         'flex',
  justifyContent:  'space-between',
  alignItems:      'center',
  padding:         '15px 20px',
  backgroundColor: '#1a1a2e',
  color:           'white',
  borderRadius:    '10px',
  marginBottom:    '20px',
}

const statusBannerStyle = (status) => ({
  display:         'flex',
  alignItems:      'center',
  gap:             '15px',
  padding:         '15px 20px',
  backgroundColor: status === 'delivered' ? '#E8F5E9' : '#E3F2FD',
  borderRadius:    '10px',
  marginBottom:    '15px',
  border:          `1px solid ${statusColor(status)}`,
})

const etaCardStyle = {
  display:         'flex',
  gap:             '15px',
  marginBottom:    '15px',
}

const etaItemStyle = {
  display:         'flex',
  alignItems:      'center',
  gap:             '10px',
  flex:            1,
  backgroundColor: 'white',
  padding:         '15px',
  borderRadius:    '10px',
  boxShadow:       '0 2px 8px rgba(0,0,0,0.08)',
}

const cardStyle = {
  backgroundColor: 'white',
  borderRadius:    '10px',
  padding:         '20px',
  marginBottom:    '15px',
  boxShadow:       '0 2px 8px rgba(0,0,0,0.08)',
}

const mapPlaceholderStyle = {
  textAlign: 'center',
  color:     '#888',
  padding:   '10px 0',
}

const detailRowStyle = {
  display:        'flex',
  justifyContent: 'space-between',
  padding:        '10px 0',
  borderBottom:   '1px solid #f0f0f0',
  fontSize:       '14px',
}

export default TrackOrder