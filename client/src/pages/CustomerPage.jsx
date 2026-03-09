// src/pages/CustomerPage.jsx

import { useState, useEffect }            from 'react'
import { useNavigate }                    from 'react-router-dom'
import { useAuth }                        from '../context/AuthContext'
import { getMyOrders, createOrder }       from '../services/api'

function CustomerPage() {
  const { user }                          = useAuth()
  const navigate                          = useNavigate()
  const [orders,      setOrders]          = useState([])
  const [loading,     setLoading]         = useState(true)
  const [activeTab,   setActiveTab]       = useState('orders')
  const [successMsg,  setSuccessMsg]      = useState('')
  const [error,       setError]           = useState('')

  // New order form
  const [form, setForm] = useState({
    pickupAddress: '',
    pickupLat:     '',
    pickupLng:     '',
    dropAddress:   '',
    dropLat:       '',
    dropLng:       '',
    items:         '',
    totalAmount:   '',
  })

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const res = await getMyOrders()
      setOrders(res.data.orders)
    } catch (err) {
      setError('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handlePlaceOrder = async () => {
    if (!form.pickupAddress || !form.dropAddress) {
      return setError('Please fill in pickup and drop address')
    }
    try {
      setError('')
      const payload = {
        pickupLocation: {
          address: form.pickupAddress,
          lat:     parseFloat(form.pickupLat) || 31.5204,
          lng:     parseFloat(form.pickupLng) || 74.3587,
        },
        dropLocation: {
          address: form.dropAddress,
          lat:     parseFloat(form.dropLat) || 31.4800,
          lng:     parseFloat(form.dropLng) || 74.4000,
        },
        orderDetails: {
          items:       form.items,
          totalAmount: parseFloat(form.totalAmount) || 0,
        },
      }
      const res = await createOrder(payload)
      setSuccessMsg(`✅ Order placed! Your Tracking ID: ${res.data.order.trackingId}`)
      setForm({
        pickupAddress: '', pickupLat: '', pickupLng: '',
        dropAddress:   '', dropLat:   '', dropLng:   '',
        items: '', totalAmount: '',
      })
      fetchOrders()
      setActiveTab('orders')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order')
    }
  }

  return (
    <div style={pageStyle}>

      {/* Header */}
      <div style={headerStyle}>
        <h2 style={{ margin: 0 }}>🛍️ My Orders</h2>
        <span style={{ fontSize: '14px', opacity: 0.8 }}>👤 {user?.name}</span>
      </div>

      {/* Alerts */}
      {error      && <div style={alertStyle('red')}>{error}</div>}
      {successMsg && <div style={alertStyle('green')}>{successMsg}</div>}

      {/* Tabs */}
      <div style={tabRowStyle}>
        <button
          style={tabBtnStyle(activeTab === 'orders')}
          onClick={() => setActiveTab('orders')}
        >
          📦 My Orders
        </button>
        <button
          style={tabBtnStyle(activeTab === 'place')}
          onClick={() => setActiveTab('place')}
        >
          ➕ Place New Order
        </button>
      </div>

      {/* ── Tab: My Orders ── */}
      {activeTab === 'orders' && (
        <div>
          {loading ? (
            <p style={{ textAlign: 'center', padding: '40px' }}>Loading your orders...</p>
          ) : orders.length === 0 ? (
            <div style={emptyStyle}>
              <p style={{ fontSize: '40px' }}>📭</p>
              <p>No orders yet!</p>
              <button
                style={greenBtn}
                onClick={() => setActiveTab('place')}
              >
                ➕ Place Your First Order
              </button>
            </div>
          ) : (
            orders.map((order) => (
              <div key={order._id} style={orderCardStyle}>

                {/* Order Header */}
                <div style={orderHeaderStyle}>
                  <div>
                    <strong style={{ fontSize: '15px' }}>
                      #{order.trackingId}
                    </strong>
                    <span style={badgeStyle(order.status)}>
                      {order.status}
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#888' }}>
                    {new Date(order.createdAt).toLocaleDateString()}
                  </div>
                </div>

                {/* Order Info */}
                <div style={{ fontSize: '13px', color: '#555', margin: '8px 0' }}>
                  <div>📍 <strong>From:</strong> {order.pickupLocation?.address}</div>
                  <div style={{ marginTop: '4px' }}>
                    🏠 <strong>To:</strong> {order.dropLocation?.address}
                  </div>
                </div>

                {/* Driver Info */}
                <div style={{ fontSize: '13px', marginBottom: '10px' }}>
                  🚗 Driver:{' '}
                  {order.driver
                    ? <strong>{order.driver?.name || 'Assigned'}</strong>
                    : <span style={{ color: '#888' }}>Waiting for driver...</span>
                  }
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '10px' }}>
                  {/* Track button — only if driver assigned */}
                  {order.driver && order.status !== 'delivered' && (
                    <button
                      style={blueBtn}
                      onClick={() => navigate(`/track/${order.trackingId}`)}
                    >
                      📍 Track Live
                    </button>
                  )}
                  {/* Always show tracking link */}
                  <button
                    style={outlineBtn}
                    onClick={() => navigate(`/track/${order.trackingId}`)}
                  >
                    🔗 View Order
                  </button>
                </div>

              </div>
            ))
          )}
        </div>
      )}

      {/* ── Tab: Place New Order ── */}
      {activeTab === 'place' && (
        <div style={cardStyle}>
          <h3 style={{ marginTop: 0 }}>➕ Place New Order</h3>

          <label style={labelStyle}>📍 Pickup Address *</label>
          <input
            style={inputStyle}
            name="pickupAddress"
            placeholder="e.g. Johar Town, Lahore"
            value={form.pickupAddress}
            onChange={handleChange}
          />

          <div style={rowStyle}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Pickup Latitude (optional)</label>
              <input
                style={inputStyle}
                name="pickupLat"
                placeholder="e.g. 31.5204"
                value={form.pickupLat}
                onChange={handleChange}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Pickup Longitude (optional)</label>
              <input
                style={inputStyle}
                name="pickupLng"
                placeholder="e.g. 74.3587"
                value={form.pickupLng}
                onChange={handleChange}
              />
            </div>
          </div>

          <label style={labelStyle}>🏠 Drop Address *</label>
          <input
            style={inputStyle}
            name="dropAddress"
            placeholder="e.g. DHA Phase 5, Lahore"
            value={form.dropAddress}
            onChange={handleChange}
          />

          <div style={rowStyle}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Drop Latitude (optional)</label>
              <input
                style={inputStyle}
                name="dropLat"
                placeholder="e.g. 31.4800"
                value={form.dropLat}
                onChange={handleChange}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Drop Longitude (optional)</label>
              <input
                style={inputStyle}
                name="dropLng"
                placeholder="e.g. 74.4000"
                value={form.dropLng}
                onChange={handleChange}
              />
            </div>
          </div>

          <label style={labelStyle}>🛍️ Items</label>
          <input
            style={inputStyle}
            name="items"
            placeholder="e.g. 2x Pizza, 1x Burger"
            value={form.items}
            onChange={handleChange}
          />

          <label style={labelStyle}>💰 Total Amount (PKR)</label>
          <input
            style={inputStyle}
            name="totalAmount"
            type="number"
            placeholder="e.g. 1500"
            value={form.totalAmount}
            onChange={handleChange}
          />

          <button style={greenBtn} onClick={handlePlaceOrder}>
            🛍️ Place Order
          </button>
        </div>
      )}

    </div>
  )
}

// ─── Styles ─────────────────────────────────────────────
const pageStyle       = { maxWidth: '700px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif' }
const headerStyle     = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', backgroundColor: '#1a1a2e', color: 'white', borderRadius: '10px', marginBottom: '20px' }
const tabRowStyle     = { display: 'flex', gap: '10px', marginBottom: '20px' }
const cardStyle       = { backgroundColor: 'white', borderRadius: '10px', padding: '20px', marginBottom: '15px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }
const orderCardStyle  = { ...cardStyle, marginBottom: '12px' }
const orderHeaderStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }
const emptyStyle      = { textAlign: 'center', padding: '60px 20px', color: '#888' }
const inputStyle      = { display: 'block', width: '100%', padding: '10px', margin: '6px 0 12px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '14px', boxSizing: 'border-box' }
const labelStyle      = { fontSize: '13px', color: '#555', fontWeight: 'bold' }
const rowStyle        = { display: 'flex', gap: '10px' }
const tabBtnStyle     = (active) => ({ padding: '10px 20px', backgroundColor: active ? '#1a1a2e' : '#eee', color: active ? 'white' : '#333', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: active ? 'bold' : 'normal' })
const badgeStyle      = (status) => ({ marginLeft: '10px', padding: '2px 8px', borderRadius: '12px', fontSize: '12px', backgroundColor: status === 'delivered' ? '#4CAF50' : status === 'on_the_way' ? '#2196F3' : status === 'assigned' ? '#FF9800' : '#9E9E9E', color: 'white' })
const alertStyle      = (color) => ({ padding: '12px 16px', backgroundColor: color === 'green' ? '#E8F5E9' : '#FFEBEE', color: color === 'green' ? '#2e7d32' : '#c62828', borderRadius: '8px', marginBottom: '15px', fontSize: '14px' })
const greenBtn        = { padding: '12px 20px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', marginTop: '10px', width: '100%' }
const blueBtn         = { padding: '8px 14px', backgroundColor: '#2196F3', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }
const outlineBtn      = { padding: '8px 14px', backgroundColor: 'white', color: '#2196F3', border: '1px solid #2196F3', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }

export default CustomerPage