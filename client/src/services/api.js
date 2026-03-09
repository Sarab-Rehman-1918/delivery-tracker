// src/services/api.js

import axios from 'axios'

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
})

// Automatically add token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Auth APIs
export const registerUser = (data) => API.post('/api/auth/register', data)
export const loginUser    = (data) => API.post('/api/auth/login', data)
export const getProfile   = ()     => API.get('/api/auth/profile')
export const getDriverOrders = () => API.get('/api/orders/my-driver-orders')

// Order APIs
export const createOrder      = (data) => API.post('/api/orders', data)
// Add this line to src/services/api.js
export const getAllDrivers = () => API.get('/api/auth/drivers')
export const getMyOrders      = ()     => API.get('/api/orders/my-orders')
export const getAllOrders      = ()     => API.get('/api/orders/all')
export const getOrderByTracking = (id) => API.get(`/api/orders/track/${id}`)
export const updateOrderStatus = (id, status) => API.put(`/api/orders/${id}/status`, { status })
export const assignDriver      = (id, driverId) => API.put(`/api/orders/${id}/assign`, { driverId })

export default API