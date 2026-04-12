import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Loader, Package, CheckCircle, Clock, XCircle, Search, User } from 'lucide-react'

const AdminOrders = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [toast, setToast] = useState(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await axios.get('https://e-commerce-project-backend-fq6y.onrender.com/admin/orders', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.data.success) {
        setOrders(res.data.data || [])
      }
    } catch (err) {
      console.error('Failed to fetch orders', err)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('token')
      await axios.put(`https://e-commerce-project-backend-fq6y.onrender.com/admin/order/status/${orderId}`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setOrders(orders.map(o => o.id === orderId ? { ...o, orderStatus: newStatus } : o))
      showToast('Order status updated to ' + newStatus, 'success')
    } catch (err) {
      showToast('Failed to update order status', 'error')
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'bg-amber-100 text-amber-700'
      case 'PLACED': return 'bg-blue-100 text-blue-700'
      case 'SHIPPED': return 'bg-indigo-100 text-indigo-700'
      case 'DELIVERED': return 'bg-emerald-100 text-emerald-700'
      case 'CANCELLED': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const filteredOrders = orders.filter(o => 
    o.id.toString().includes(searchTerm) || 
    (o.user && o.user.name?.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  if (loading) {
    return <div className='flex justify-center p-12'><Loader className='w-10 h-10 animate-spin text-emerald-600' /></div>
  }

  return (
    <div className='animate-fade-in relative'>

      {/* ── Floating Toast ── */}
      {toast && (
        <div className={`fixed top-5 right-5 z-[9999] flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl text-white font-semibold text-sm transition-all
          ${toast.type === 'success' ? 'bg-gradient-to-r from-emerald-500 to-emerald-600' : 'bg-gradient-to-r from-red-500 to-red-600'}`}>
          {toast.type === 'success' ? <CheckCircle className='w-5 h-5' /> : <XCircle className='w-5 h-5' />}
          {toast.msg}
          <button onClick={() => setToast(null)} className='ml-2 opacity-70 hover:opacity-100 transition-opacity'>✕</button>
        </div>
      )}

      <div className='flex justify-between items-end mb-6'>
        <div>
          <h2 className='text-3xl font-bold text-gray-800'>Order Management</h2>
          <p className='text-gray-500 mt-1'>View and track customer orders.</p>
        </div>
        <div className='flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm'>
          <Search className='w-5 h-5 text-gray-400' />
          <input 
            type='text' 
            placeholder='Search by Order ID or Name...' 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='outline-none bg-transparent w-64'
          />
        </div>
      </div>

      <div className='bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden'>
        <table className='w-full text-left border-collapse'>
          <thead>
            <tr className='bg-gray-50 border-b border-gray-200'>
              <th className='p-4 font-semibold text-gray-600'>Order ID</th>
              <th className='p-4 font-semibold text-gray-600'>Customer</th>
              <th className='p-4 font-semibold text-gray-600'>Total Amount</th>
              <th className='p-4 font-semibold text-gray-600'>Date</th>
              <th className='p-4 font-semibold text-gray-600'>Status</th>
              <th className='p-4 font-semibold text-gray-600 text-right'>Update Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map(order => (
              <tr key={order.id} className='border-b border-gray-100 hover:bg-gray-50 transition-colors'>
                <td className='p-4 font-bold text-gray-800'>#{order.id}</td>
                <td className='p-4'>
                  <div className='flex items-center gap-3'>
                    {order.user?.image ? (
                      <img src={order.user.image} alt='User' className='w-8 h-8 rounded-full border border-gray-200 object-cover flex-shrink-0' />
                    ) : (
                      <div className='w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center border border-emerald-200 flex-shrink-0'>
                        <User className='w-4 h-4 text-emerald-600' />
                      </div>
                    )}
                    <span className='font-semibold text-gray-700'>{order.user?.name || 'Unknown'}</span>
                  </div>
                </td>
                <td className='p-4 font-bold text-emerald-600'>${order.totalAmount}</td>
                <td className='p-4 text-gray-500 text-sm'>
                  {new Date(order.orderDate).toLocaleDateString()}
                </td>
                <td className='p-4'>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(order.orderStatus)}`}>
                    {order.orderStatus}
                  </span>
                </td>
                <td className='p-4 text-right'>
                  <select 
                    value={order.orderStatus} 
                    onChange={e => handleStatusChange(order.id, e.target.value)}
                    className='bg-white border border-gray-300 text-gray-700 text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block w-32 ml-auto p-2 outline-none font-semibold'
                  >
                    <option value='PENDING'>PENDING</option>
                    <option value='PLACED'>PLACED</option>
                    <option value='SHIPPED'>SHIPPED</option>
                    <option value='DELIVERED'>DELIVERED</option>
                    <option value='CANCELLED'>CANCELLED</option>
                  </select>
                </td>
              </tr>
            ))}
            {filteredOrders.length === 0 && (
              <tr>
                <td colSpan='6' className='p-8 text-center text-gray-500'>No orders found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default AdminOrders
