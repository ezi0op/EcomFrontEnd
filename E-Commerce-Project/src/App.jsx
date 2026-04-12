import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Page1 from './Components/Page1/Page1'
import Login from './Components/User/Login'
import Register from './Components/User/Register'
import Update from './Components/User/Update'
import Cart from './Components/Page1/Cart'
import Orders from './Components/Page1/Orders'
import PrivateRoute from './Components/PrivateRoute'

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Page1 />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes */}
        <Route
          path="/profile/update"
          element={
            <PrivateRoute>
              <Update />
            </PrivateRoute>
          }
        />
        {/* Cart — accessible without login (guest cart via localStorage) */}
        <Route path="/cart" element={<Cart />} />
        <Route
          path="/orders"
          element={
            <PrivateRoute>
              <Orders />
            </PrivateRoute>
          }
        />

        {/* Redirect unknown routes to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App