// src/pages/AdminPage.jsx

import { getAllOrders, assignDriver, updateOrderStatus, createOrder, getAllDrivers } from '../services/api'
import { useState, useEffect }          from 'react'
import { useNavigate }                  from 'react-router-dom'
import { useAuth }                      from '../context/AuthContext'


function AdminPage() {
  const { user, logout }              = useAuth()
  const navigate                      = useNavigate()
  const [orders,      setOrders]      = useState([])
  const [drivers, setDrivers] = useState([])
  const [loading,     setLoading]     = useState(true)
  const [activeTab,   setActiveTab]   = useState('orders')
  const [error,       setError]       = useState('')
  const [successMsg,  setSuccessMsg]  = useState('')

  // New order form state
  const [newOrder, setNewOrder] = useState({
    pickupAddress:  '',
    pickupLat:      '',
    pickupLng:      '',
    dropAddress:    '',
    dropLat:        '',
    dropLng:        '',
    driverIdInput:  '',
    items:          '',
    totalAmount:    '',
  })

  // Redirect if not admin
  useEffect(() => {
    if (user && user.role !== 'admin') navigate('/')
  }, [user])

  useEffect(() => {
    fetchOrders()
    fetchDrivers()
  }, [])

  const fetchDrivers = async () => {
    try {
      const res = await getAllDrivers()
      setDrivers(res.data.drivers)
    } catch (err) {
      console.error('Failed to fetch drivers')
    }
  }
  const fetchOrders = async () => {
    try {
      setLoading(true)
      const res = await getAllOrders()
      setOrders(res.data.orders)
    } catch (err) {
      setError('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (orderId, status) => {
    try {
      await updateOrderStatus(orderId, status)
      showSuccess('Status updated!')
      fetchOrders()
    } catch (err) {
      setError('Failed to update status')
    }
  }

  const handleAssignDriver = async (orderId, driverId) => {
    if (!driverId.trim()) return alert('Enter a driver ID')
    try {
      await assignDriver(orderId, driverId)
      showSuccess('Driver assigned!')
      fetchOrders()
    } catch (err) {
      setError('Failed to assign driver')
    }
  }

  const handleCreateOrder = async () => {
    try {
      const payload = {
        pickupLocation: {
          address: newOrder.pickupAddress,
          lat:     parseFloat(newOrder.pickupLat),
          lng:     parseFloat(newOrder.pickupLng),
        },
        dropLocation: {
          address: newOrder.dropAddress,
          lat:     parseFloat(newOrder.dropLat),
          lng:     parseFloat(newOrder.dropLng),
        },
        orderDetails: {
          items:       newOrder.items,
          totalAmount: parseFloat(newOrder.totalAmount),
        },
      }
      await createOrder(payload)
      showSuccess('Order created!')
      setNewOrder({
        pickupAddress: '', pickupLat: '', pickupLng: '',
        dropAddress:   '', dropLat:   '', dropLng:   '',
        driverIdInput: '', items: '', totalAmount: '',
      })
      fetchOrders()
      setActiveTab('orders')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create order')
    }
  }

  const showSuccess = (msg) => {
    setSuccessMsg(msg)
    setTimeout(() => setSuccessMsg(''), 3000)
  }

  // ── Stats ──────────────────────────────────────────────
  const stats = {
    total:     orders.length,
    pending:   orders.filter(o => o.status === 'pending').length,
    active:    orders.filter(o => ['assigned','picked_up','on_the_way'].includes(o.status)).length,
    delivered: orders.filter(o => o.status === 'delivered').length,
  }

  return (
    <div style={pageStyle}>

      {/* Header */}
      <div style={headerStyle}>
        <h2 style={{ margin: 0 }}>⚙️ Admin Dashboard</h2>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span style={{ fontSize: '14px' }}>👤 {user?.name}</span>
          <button style={smallRedBtn} onClick={() => { logout(); navigate('/login') }}>
            Logout
          </button>
        </div>
      </div>

      {/* Alerts */}
      {error      && <div style={alertStyle('red')}>{error}</div>}
      {successMsg && <div style={alertStyle('green')}>{successMsg}</div>}

      {/* Stats Cards */}
      <div style={statsRowStyle}>
        <StatCard label="Total Orders"  value={stats.total}     color="#2196F3" />
        <StatCard label="Pending"       value={stats.pending}   color="#FF9800" />
        <StatCard label="Active"        value={stats.active}    color="#9C27B0" />
        <StatCard label="Delivered"     value={stats.delivered} color="#4CAF50" />
      </div>

      {/* Tabs */}
      <div style={tabRowStyle}>
        <button
          style={tabBtnStyle(activeTab === 'orders')}
          onClick={() => setActiveTab('orders')}
        >
          📦 All Orders
        </button>
        <button
          style={tabBtnStyle(activeTab === 'create')}
          onClick={() => setActiveTab('create')}
        >
          ➕ Create Order
        </button>
      </div>

      {/* ── Tab: All Orders ── */}
      {activeTab === 'orders' && (
        <div>
          {loading ? (
            <p style={{ textAlign: 'center', padding: '40px' }}>Loading orders...</p>
          ) : orders.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
              No orders yet.
            </p>
          ) : (
            orders.map((order) => (
              <OrderCard
                key={order._id}
                order={order}
                onStatusChange={handleStatusChange}
                onAssignDriver={handleAssignDriver}
                drivers={drivers}
              />
            ))
          )}
        </div>
      )}

      {/* ── Tab: Create Order ── */}
      {activeTab === 'create' && (
        <div style={cardStyle}>
          <h3 style={{ marginTop: 0 }}>➕ Create New Order</h3>

          <label style={labelStyle}>Pickup Address</label>
          <input
            style={inputStyle}
            placeholder="e.g. Johar Town, Lahore"
            value={newOrder.pickupAddress}
            onChange={(e) => setNewOrder({ ...newOrder, pickupAddress: e.target.value })}
          />

          <div style={rowStyle}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Pickup Latitude</label>
              <input
                style={inputStyle}
                placeholder="e.g. 31.5204"
                value={newOrder.pickupLat}
                onChange={(e) => setNewOrder({ ...newOrder, pickupLat: e.target.value })}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Pickup Longitude</label>
              <input
                style={inputStyle}
                placeholder="e.g. 74.3587"
                value={newOrder.pickupLng}
                onChange={(e) => setNewOrder({ ...newOrder, pickupLng: e.target.value })}
              />
            </div>
          </div>

          <label style={labelStyle}>Drop Address</label>
          <input
            style={inputStyle}
            placeholder="e.g. DHA Phase 5, Lahore"
            value={newOrder.dropAddress}
            onChange={(e) => setNewOrder({ ...newOrder, dropAddress: e.target.value })}
          />

          <div style={rowStyle}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Drop Latitude</label>
              <input
                style={inputStyle}
                placeholder="e.g. 31.4800"
                value={newOrder.dropLat}
                onChange={(e) => setNewOrder({ ...newOrder, dropLat: e.target.value })}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Drop Longitude</label>
              <input
                style={inputStyle}
                placeholder="e.g. 74.4000"
                value={newOrder.dropLng}
                onChange={(e) => setNewOrder({ ...newOrder, dropLng: e.target.value })}
              />
            </div>
          </div>

          <label style={labelStyle}>Items Description</label>
          <input
            style={inputStyle}
            placeholder="e.g. 2x Pizza, 1x Burger"
            value={newOrder.items}
            onChange={(e) => setNewOrder({ ...newOrder, items: e.target.value })}
          />

          <label style={labelStyle}>Total Amount (PKR)</label>
          <input
            style={inputStyle}
            type="number"
            placeholder="e.g. 1500"
            value={newOrder.totalAmount}
            onChange={(e) => setNewOrder({ ...newOrder, totalAmount: e.target.value })}
          />

          <button style={createBtnStyle} onClick={handleCreateOrder}>
            ➕ Create Order
          </button>
        </div>
      )}

    </div>
  )
}

// ─── Order Card Component ────────────────────────────────
function OrderCard({ order, onStatusChange, onAssignDriver, drivers }) {
  const [expanded,  setExpanded]  = useState(false)
  const [selectedDriver, setSelectedDriver] = useState('')

  const trackUrl = `${window.location.origin}/track/${order.trackingId}`

  return (
    <div style={orderCardStyle}>

      <div style={orderHeaderStyle}>
        <div>
          <strong>#{order.trackingId}</strong>
          <span style={badgeStyle(order.status)}>{order.status}</span>
        </div>
        <button style={smallBlueBtn} onClick={() => setExpanded(!expanded)}>
          {expanded ? '▲ Less' : '▼ More'}
        </button>
      </div>

      <div style={{ fontSize: '13px', color: '#555', marginTop: '5px' }}>
        📍 {order.pickupLocation?.address} → 🏠 {order.dropLocation?.address}
      </div>

      {expanded && (
        <div style={{ marginTop: '15px', borderTop: '1px solid #eee', paddingTop: '15px' }}>

          {/* Driver Info */}
          <div style={{ marginBottom: '10px', fontSize: '13px' }}>
            🚗 Driver:{' '}
            {order.driver
              ? <strong>{order.driver?.name || 'Assigned'}</strong>
              : <span style={{ color: '#888' }}>Not assigned</span>
            }
          </div>

          {/* Assign Driver — Dropdown */}
          {!order.driver && (
            <div style={rowStyle}>
              <select
                style={{ ...inputStyle, margin: 0 }}
                value={selectedDriver}
                onChange={(e) => setSelectedDriver(e.target.value)}
              >
                <option value="">-- Select a Driver --</option>
                {drivers.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name} ({d.email})
                  </option>
                ))}
              </select>
              <button
                style={smallBlueBtn}
                onClick={() => onAssignDriver(order._id, selectedDriver)}
              >
                Assign
              </button>
            </div>
          )}

          {/* Status Changer */}
          <div style={{ marginTop: '10px' }}>
            <label style={labelStyle}>Update Status:</label>
            <select
              style={{ ...inputStyle, margin: '5px 0' }}
              value={order.status}
              onChange={(e) => onStatusChange(order._id, e.target.value)}
            >
              <option value="pending">pending</option>
              <option value="assigned">assigned</option>
              <option value="picked_up">picked_up</option>
              <option value="on_the_way">on_the_way</option>
              <option value="delivered">delivered</option>
              <option value="cancelled">cancelled</option>
            </select>
          </div>

          {/* Tracking Link */}
          <div style={{ marginTop: '10px', fontSize: '13px' }}>
            🔗 <a href={trackUrl} target="_blank" rel="noreferrer"
               style={{ color: '#2196F3', wordBreak: 'break-all' }}>
              {trackUrl}
            </a>
          </div>

        </div>
      )}
    </div>
  )
}

// ─── Stat Card Component ─────────────────────────────────
function StatCard({ label, value, color }) {
  return (
    <div style={{ ...cardStyle, textAlign: 'center', flex: 1, borderTop: `4px solid ${color}` }}>
      <div style={{ fontSize: '28px', fontWeight: 'bold', color }}>{value}</div>
      <div style={{ fontSize: '13px', color: '#888', marginTop: '5px' }}>{label}</div>
    </div>
  )
}

// ─── Styles ─────────────────────────────────────────────
const pageStyle      = { maxWidth: '800px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif' }
const headerStyle    = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', backgroundColor: '#1a1a2e', color: 'white', borderRadius: '10px', marginBottom: '20px' }
const statsRowStyle  = { display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap' }
const tabRowStyle    = { display: 'flex', gap: '10px', marginBottom: '20px' }
const cardStyle      = { backgroundColor: 'white', borderRadius: '10px', padding: '20px', marginBottom: '15px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }
const orderCardStyle = { ...cardStyle, marginBottom: '12px' }
const orderHeaderStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }
const inputStyle     = { display: 'block', width: '100%', padding: '10px', margin: '8px 0', borderRadius: '6px', border: '1px solid #ddd', fontSize: '14px', boxSizing: 'border-box' }
const labelStyle     = { fontSize: '13px', color: '#555', fontWeight: 'bold' }
const rowStyle       = { display: 'flex', gap: '10px', alignItems: 'center' }
const createBtnStyle = { width: '100%', padding: '12px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '8px', fontSize: '15px', cursor: 'pointer', marginTop: '10px' }
const smallRedBtn    = { padding: '6px 12px', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }
const smallBlueBtn   = { padding: '6px 12px', backgroundColor: '#2196F3', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', whiteSpace: 'nowrap' }
const tabBtnStyle    = (active) => ({ padding: '10px 20px', backgroundColor: active ? '#1a1a2e' : '#eee', color: active ? 'white' : '#333', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: active ? 'bold' : 'normal' })
const badgeStyle     = (status) => ({ marginLeft: '10px', padding: '2px 8px', borderRadius: '12px', fontSize: '12px', backgroundColor: status === 'delivered' ? '#4CAF50' : status === 'on_the_way' ? '#2196F3' : status === 'assigned' ? '#FF9800' : '#9E9E9E', color: 'white' })
const alertStyle     = (color) => ({ padding: '12px 16px', backgroundColor: color === 'green' ? '#E8F5E9' : '#FFEBEE', color: color === 'green' ? '#2e7d32' : '#c62828', borderRadius: '8px', marginBottom: '15px', fontSize: '14px' })

export default AdminPage