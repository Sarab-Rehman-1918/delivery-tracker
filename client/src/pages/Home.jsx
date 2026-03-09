// src/pages/Home.jsx

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Home() {
  const [trackingId, setTrackingId] = useState('')
  const { user, logout }            = useAuth()
  const navigate                    = useNavigate()

  const handleTrack = () => {
    if (!trackingId.trim()) return alert('Enter a tracking ID')
    navigate(`/track/${trackingId.trim()}`)
  }

  return (
    <div style={pageStyle}>
      <div style={heroStyle}>
        <h1 style={{ fontSize: '2rem', margin: '0 0 10px' }}>🚚 Delivery Tracker</h1>
        <p style={{ opacity: 0.8, marginBottom: '30px' }}>
          Track your delivery in real time
        </p>

        {/* Tracking Input */}
        <div style={trackBoxStyle}>
          <input
            style={trackInputStyle}
            placeholder="Enter Tracking ID (e.g. TRK-abc123)"
            value={trackingId}
            onChange={(e) => setTrackingId(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleTrack()}
          />
          <button style={trackBtnStyle} onClick={handleTrack}>
            Track 🔍
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={btnGroupStyle}>
        {user ? (
          <>
            <p>Welcome back, <strong>{user.name}</strong>! 👋</p>
            {user.role === 'driver' && (
              <button style={greenBtn} onClick={() => navigate('/driver')}>
                🚗 Go to Driver Dashboard
              </button>
            )}
            {user.role === 'admin' && (
              <button style={blueBtn} onClick={() => navigate('/admin')}>
                ⚙️ Go to Admin Dashboard
              </button>
            )}
            <button style={redBtn} onClick={() => { logout(); navigate('/') }}>
              Logout
            </button>
          </>
        ) : (
          <>
            <button style={greenBtn} onClick={() => navigate('/login')}>
              Login
            </button>
            <button style={blueBtn} onClick={() => navigate('/register')}>
              Register
            </button>
          </>
        )}
      </div>
    </div>
  )
}

const pageStyle   = { maxWidth: '600px', margin: '0 auto', padding: '40px 20px', fontFamily: 'sans-serif', textAlign: 'center' }
const heroStyle   = { backgroundColor: '#1a1a2e', color: 'white', padding: '40px 30px', borderRadius: '15px', marginBottom: '30px' }
const trackBoxStyle    = { display: 'flex', gap: '10px' }
const trackInputStyle  = { flex: 1, padding: '12px', borderRadius: '8px', border: 'none', fontSize: '15px' }
const trackBtnStyle    = { padding: '12px 20px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }
const btnGroupStyle    = { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }
const greenBtn  = { padding: '12px 24px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', width: '100%', maxWidth: '300px', fontSize: '15px' }
const blueBtn   = { ...greenBtn, backgroundColor: '#2196F3' }
const redBtn    = { ...greenBtn, backgroundColor: '#f44336' }

export default Home