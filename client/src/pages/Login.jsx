// src/pages/Login.jsx

import { useState }      from 'react'
import { useNavigate }   from 'react-router-dom'
import { loginUser }     from '../services/api'
import { useAuth }       from '../context/AuthContext'

function Login() {
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const { login }               = useAuth()
  const navigate                = useNavigate()

  const handleLogin = async () => {
    try {
      setLoading(true)
      setError('')
      const res = await loginUser({ email, password })

      login(res.data.user, res.data.token)

      const role = res.data.user.role
      if (role === 'driver')        navigate('/driver')
      else if (role === 'admin')    navigate('/admin')
      else                          navigate('/customer')

    } catch (err) {
      setError(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={containerStyle}>
      <h2>🔐 Login</h2>
      {error && (
        <p style={{ color: 'red', marginBottom: '10px' }}>
          {error}
        </p>
      )}
      <input
        style={inputStyle}
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        style={inputStyle}
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button
        style={btnStyle}
        onClick={handleLogin}
        disabled={loading}
      >
        {loading ? 'Logging in...' : 'Login'}
      </button>
      <p style={{ marginTop: '15px' }}>
        No account?{' '}
        <a href="/register">Register here</a>
      </p>
    </div>
  )
}

const containerStyle = {
  maxWidth:     '400px',
  margin:       '100px auto',
  padding:      '30px',
  boxShadow:    '0 0 10px rgba(0,0,0,0.1)',
  borderRadius: '10px',
  textAlign:    'center',
}

const inputStyle = {
  display:      'block',
  width:        '100%',
  padding:      '10px',
  margin:       '10px 0',
  borderRadius: '5px',
  border:       '1px solid #ccc',
  fontSize:     '16px',
  boxSizing:    'border-box',
}

const btnStyle = {
  width:           '100%',
  padding:         '10px',
  backgroundColor: '#4CAF50',
  color:           'white',
  border:          'none',
  borderRadius:    '5px',
  fontSize:        '16px',
  cursor:          'pointer',
  marginTop:       '10px',
}

export default Login