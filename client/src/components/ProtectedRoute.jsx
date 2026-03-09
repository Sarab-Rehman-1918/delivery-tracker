// src/components/ProtectedRoute.jsx

import { Navigate } from 'react-router-dom'
import { useAuth }  from '../context/AuthContext'

function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px', fontSize: '18px' }}>
        Loading...
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />

  if (role && user.role !== role) return <Navigate to="/" replace />

  return children
}

export default ProtectedRoute