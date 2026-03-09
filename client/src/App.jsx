// src/App.jsx  — final version


import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar          from './components/Navbar'
import ProtectedRoute  from './components/ProtectedRoute'
import Home            from './pages/Home'
import Login           from './pages/Login'
import Register        from './pages/Register'
import DriverPage      from './pages/DriverPage'
import TrackOrder      from './pages/TrackOrder'
import CustomerPage from './pages/CustomerPage'
import AdminPage       from './pages/AdminPage'

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        
        <Route path="/"                  element={<Home />} />
        <Route path="/login"             element={<Login />} />
        <Route path="/register"          element={<Register />} />
        <Route path="/track/:trackingId" element={<TrackOrder />} />
        <Route path="/customer" element={
            <ProtectedRoute role="customer">
            <CustomerPage />
            </ProtectedRoute>
        } />
        <Route path="/driver" element={
          <ProtectedRoute role="driver">
            <DriverPage />
          </ProtectedRoute>
        } />

        <Route path="/admin" element={
          <ProtectedRoute role="admin">
            <AdminPage />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  )
}

export default App