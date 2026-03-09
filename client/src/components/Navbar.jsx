// src/components/Navbar.jsx

import { useNavigate } from 'react-router-dom'
import { useAuth }     from '../context/AuthContext'

function Navbar() {
  const { user, logout } = useAuth()
  const navigate         = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav style={navStyle}>
      <div style={brandStyle} onClick={() => navigate('/')}>
        🚚 DeliveryTracker
      </div>

      <div style={linksStyle}>
        {user ? (
          <>
            <span style={greetStyle}>👤 {user.name}</span>
            {user.role === 'customer' && (
              <button style={navBtn} onClick={() => navigate('/customer')}>
                🛍️ My Orders
              </button>
            )}
            {user.role === 'driver' && (
              <button style={navBtn} onClick={() => navigate('/driver')}>
                🚗 Driver
              </button>
            )}
            {user.role === 'admin' && (
              <button style={navBtn} onClick={() => navigate('/admin')}>
                ⚙️ Admin
              </button>
            )}
            <button style={redNavBtn} onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <button style={navBtn} onClick={() => navigate('/login')}>
              Login
            </button>
            <button style={greenNavBtn} onClick={() => navigate('/register')}>
              Register
            </button>
          </>
        )}
      </div>
    </nav>
  )
}

const navStyle   = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 24px', backgroundColor: '#1a1a2e', color: 'white', position: 'sticky', top: 0, zIndex: 1000, boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }
const brandStyle = { fontSize: '20px', fontWeight: 'bold', cursor: 'pointer', letterSpacing: '1px' }
const linksStyle = { display: 'flex', alignItems: 'center', gap: '10px' }
const greetStyle = { fontSize: '14px', opacity: 0.8 }
const navBtn     = { padding: '7px 14px', backgroundColor: '#2a2a4a', color: 'white', border: '1px solid #444', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }
const greenNavBtn = { ...navBtn, backgroundColor: '#4CAF50', border: 'none' }
const redNavBtn   = { ...navBtn, backgroundColor: '#f44336', border: 'none' }

export default Navbar