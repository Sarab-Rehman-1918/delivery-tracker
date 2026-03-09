// src/pages/Register.jsx

import { useState }    from 'react'
import { useNavigate } from 'react-router-dom'
import { registerUser } from '../services/api'
import { useAuth }     from '../context/AuthContext'

function Register() {
  const [form, setForm]     = useState({
    name: '', email: '', password: '', role: 'customer', phone: ''
  })
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)
  const { login }             = useAuth()
  const navigate              = useNavigate()

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleRegister = async () => {
    try {
      setLoading(true)
      setError('')
      const res = await registerUser(form)

      login(res.data.user, res.data.token)

      const role = res.data.user.role
      if (role === 'driver')     navigate('/driver')
      else if (role === 'admin') navigate('/admin')
      else                       navigate('/customer')

    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={containerStyle}>
      <h2>📝 Register</h2>
      {error && (
        <p style={{ color: 'red', marginBottom: '10px' }}>
          {error}
        </p>
      )}
      <input style={inputStyle} name="name"     placeholder="Full Name"    onChange={handleChange} />
      <input style={inputStyle} name="email"    placeholder="Email"        onChange={handleChange} type="email" />
      <input style={inputStyle} name="password" placeholder="Password"     onChange={handleChange} type="password" />
      <input style={inputStyle} name="phone"    placeholder="Phone Number" onChange={handleChange} />
      <select style={inputStyle} name="role" onChange={handleChange}>
        <option value="customer">Customer</option>
        <option value="driver">Driver</option>
        <option value="admin">Admin</option>
      </select>
      <button
        style={btnStyle}
        onClick={handleRegister}
        disabled={loading}
      >
        {loading ? 'Registering...' : 'Register'}
      </button>
      <p style={{ marginTop: '15px' }}>
        Have account?{' '}
        <a href="/login">Login here</a>
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

export default Register
