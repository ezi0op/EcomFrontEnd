import React, { useState, useEffect } from 'react'
import axios from 'axios'
const API_URL = import.meta.env.VITE_API_URL;
import { Users, Package, ShoppingCart, Loader, AlertTriangle, CheckCircle, Clock } from 'lucide-react'

const AdminOverview = () => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${API_URL}/admin/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (response.data.success) {
        setStats(response.data.data)
      }
    } catch (err) {
      setError('Failed to load dashboard statistics.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-[50vh]'>
        <Loader className='w-12 h-12 animate-spin text-emerald-600' />
      </div>
    )
  }

  if (error) {
    return (
      <div className='p-6 bg-red-50 text-red-700 rounded-xl flex items-center gap-3'>
        <AlertTriangle className='w-6 h-6' />
        <p className='font-semibold'>{error}</p>
      </div>
    )
  }

  const cards = [
    { title: 'Total Customers', value: stats.totalUsers || 0, icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
    { title: 'Total Products', value: stats.totalProducts || 0, icon: Package, color: 'text-violet-600', bg: 'bg-violet-100' },
    { title: 'Total Orders', value: stats.totalOrders || 0, icon: ShoppingCart, color: 'text-indigo-600', bg: 'bg-indigo-100' },
    { title: 'Pending Orders', value: stats.pendingOrders || 0, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100' },
    { title: 'Delivered Orders', value: stats.deliveredOrders || 0, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { title: 'Cancelled Orders', value: stats.cancelledOrders || 0, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-100' },
  ]

  return (
    <div className='space-y-6 sm:space-y-8 animate-fade-in'>
      <div>
        <h2 className='text-2xl sm:text-3xl font-bold text-gray-800'>Dashboard Overview</h2>
        <p className='text-gray-500 text-sm sm:text-base mt-2'>Welcome to the admin control panel. Here's what's happening today.</p>
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6'>
        {cards.map((card, idx) => (
          <div key={idx} className='bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6'>
            <div className={`w-12 sm:w-16 h-12 sm:h-16 rounded-2xl flex items-center justify-center flex-shrink-0 ${card.bg}`}>
              <card.icon className={`w-6 sm:w-8 h-6 sm:h-8 ${card.color}`} />
            </div>
            <div className='flex-1 min-w-0'>
              <p className='text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wider'>{card.title}</p>
              <h3 className='text-2xl sm:text-3xl font-bold text-gray-800 mt-1'>{card.value}</h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default AdminOverview


