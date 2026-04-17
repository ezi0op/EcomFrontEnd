import React, { useState, useEffect } from 'react'
import Header from './Header'
import Footer from './Footer'
import { Package, Calendar, MapPin, CreditCard, Truck, CheckCircle, Clock, ArrowLeft, ShoppingBag, ChevronDown, ChevronUp, XCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const Orders = () => {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [expandedOrderId, setExpandedOrderId] = useState(null)
  const [cancelConfirmId, setCancelConfirmId] = useState(null)  // order id pending cancel
  const [toast, setToast] = useState(null)  // { message, type: 'success'|'error' }

  const userId = localStorage.getItem('userId')
  const token = localStorage.getItem('token')

  useEffect(() => {
    if (!userId || !token) {
      setError('Not logged in. Redirecting to login...')
      setTimeout(() => navigate('/login'), 1000)
      return
    }
    fetchOrders()
  }, [userId, token, navigate])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await axios.get(`http://13.53.206.121:8080/orders/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (response.data.success && response.data.data) {
        setOrders(response.data.data)
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to load orders'
      setError(errorMsg)
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3500)
  }

  const handleCancelOrder = async (orderId) => {
    // Show floating confirmation instead of window.confirm
    setCancelConfirmId(orderId)
  }

  const confirmCancel = async () => {
    const orderId = cancelConfirmId
    setCancelConfirmId(null)
    try {
      const response = await axios.put(
        `http://13.53.206.121:8080/orders/${orderId}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (response.data.success) {
        fetchOrders()
        showToast('Order cancelled successfully', 'success')
      }
    } catch (err) {
      showToast('Failed to cancel order. Please try again.', 'error')
    }
  }

  const getStatusStyle = (status) => {
    const styleMap = {
      'PENDING': { pill: 'bg-gray-100 text-gray-700 border-gray-300', bar: 'from-gray-300 to-gray-400', step: 'bg-gray-400' },
      'PLACED': { pill: 'bg-blue-100 text-blue-800 border-blue-300', bar: 'from-blue-400 to-blue-600', step: 'bg-blue-500' },
      'CONFIRMED': { pill: 'bg-purple-100 text-purple-800 border-purple-300', bar: 'from-purple-400 to-purple-600', step: 'bg-purple-500' },
      'SHIPPED': { pill: 'bg-cyan-100 text-cyan-800 border-cyan-300', bar: 'from-cyan-400 to-emerald-500', step: 'bg-cyan-500' },
      'DELIVERED': { pill: 'bg-emerald-100 text-emerald-800 border-emerald-300', bar: 'from-emerald-400 to-emerald-600', step: 'bg-emerald-500' },
      'CANCELLED': { pill: 'bg-red-100 text-red-800 border-red-300', bar: 'from-red-400 to-red-600', step: 'bg-red-400' },
    }
    return styleMap[status] || { pill: 'bg-gray-100 text-gray-800 border-gray-300', bar: 'from-gray-300 to-gray-400', step: 'bg-gray-300' }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'SHIPPED': return <Truck className='w-4 h-4' />
      case 'DELIVERED': return <CheckCircle className='w-4 h-4' />
      case 'CANCELLED': return <XCircle className='w-4 h-4' />
      default: return <Clock className='w-4 h-4' />
    }
  }

  const getStatusProgress = (status) => {
    // DB enum: PENDING | PLACED | CONFIRMED | SHIPPED | DELIVERED | CANCELLED
    const progressMap = {
      'PENDING': 10,
      'PLACED': 25,
      'CONFIRMED': 50,
      'SHIPPED': 75,
      'DELIVERED': 100,
      'CANCELLED': 0,
    }
    return progressMap[status] || 0
  }

  // Steps that match DB enum flow (excluding CANCELLED/PENDING which are edge states)
  const steps = ['PLACED', 'CONFIRMED', 'SHIPPED', 'DELIVERED']
  const stepLabels = { PLACED: 'Placed', CONFIRMED: 'Confirmed', SHIPPED: 'Shipped', DELIVERED: 'Delivered' }

  const isStepActive = (step, currentStatus) => {
    if (currentStatus === 'CANCELLED') return false
    return steps.indexOf(step) <= steps.indexOf(currentStatus)
  }

  // Loading state
  if (loading) {
    return (
      <div>
        <Header />
        <div className='min-h-screen bg-gradient-to-br from-emerald-50 to-green-100 flex items-center justify-center'>
          <div className='text-center'>
            {error ? (
              <p className='text-lg font-semibold text-red-600'>{error}</p>
            ) : (
              <>
                <div className='w-16 h-16 border-4 border-emerald-300 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4'></div>
                <p className='text-lg font-semibold text-emerald-700'>Loading your orders...</p>
              </>
            )}
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  // Empty orders state
  if (orders.length === 0) {
    return (
      <div>
        <Header />
        <div className='min-h-screen bg-gradient-to-br from-emerald-50 to-green-100 flex flex-col items-center justify-center px-4 py-12'>
          <div className='mb-6 p-6 bg-white rounded-full shadow-lg'>
            <Package className='w-16 h-16 text-emerald-400' />
          </div>
          <h1 className='text-3xl font-bold text-gray-800 mb-2'>No Orders Yet</h1>
          <p className='text-gray-500 mb-8'>Start shopping to place your first order</p>
          <button
            onClick={() => navigate('/')}
            className='px-8 py-3 bg-gradient-to-r from-emerald-600 to-cyan-500 text-white font-semibold rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300'
          >
            Continue Shopping
          </button>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className='relative'>

      {/* ── Floating Toast (top-right, auto-dismiss) ── */}
      {toast && (
        <div className={`fixed top-5 right-5 z-[100] flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl text-white font-semibold text-sm transition-all duration-300 animate-bounce-in
          ${toast.type === 'success' ? 'bg-gradient-to-r from-emerald-500 to-emerald-600' : 'bg-gradient-to-r from-red-500 to-red-600'}`}>
          {toast.type === 'success'
            ? <CheckCircle className='w-5 h-5 flex-shrink-0' />
            : <XCircle className='w-5 h-5 flex-shrink-0' />}
          {toast.message}
          <button onClick={() => setToast(null)} className='ml-2 opacity-70 hover:opacity-100'>✕</button>
        </div>
      )}

      {/* ── Floating Cancel Confirmation Dialog ── */}
      {cancelConfirmId && (
        <div className='fixed inset-0 z-[90] flex items-center justify-center bg-black/40 backdrop-blur-sm'>
          <div className='bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full mx-4 text-center'>
            <div className='w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4'>
              <XCircle className='w-9 h-9 text-red-500' />
            </div>
            <h3 className='text-xl font-bold text-gray-800 mb-2'>Cancel Order?</h3>
            <p className='text-gray-500 text-sm mb-6'>
              Are you sure you want to cancel this order?<br />
              <span className='text-red-500 font-medium'>This action cannot be undone.</span>
            </p>
            <div className='flex gap-3'>
              <button
                onClick={() => setCancelConfirmId(null)}
                className='flex-1 py-3 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all'>
                Keep Order
              </button>
              <button
                onClick={confirmCancel}
                className='flex-1 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold rounded-xl hover:scale-105 hover:shadow-lg transition-all'>
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      <Header />
      <div className='min-h-screen bg-gradient-to-br from-emerald-50 to-green-100 py-12'>
        <div className='max-w-5xl mx-auto px-4'>

          {/* Page Title */}
          <div className='mb-10 flex items-center gap-4'>
            <button
              onClick={() => navigate('/')}
              className='p-2 hover:bg-emerald-100 rounded-lg transition-colors'
            >
              <ArrowLeft className='w-6 h-6 text-emerald-600' />
            </button>
            <div>
              <h1 className='text-4xl font-bold text-gray-800'>
                My <span className='text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-cyan-500'>Orders</span>
              </h1>
              <p className='text-gray-500 mt-1'>{orders.length} order{orders.length !== 1 ? 's' : ''} in total</p>
            </div>
          </div>

          {/* Alerts */}
          {error && (
            <div className='mb-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-lg font-semibold'>
              {error}
            </div>
          )}
          {success && (
            <div className='mb-6 p-4 bg-emerald-100 border-l-4 border-emerald-500 text-emerald-700 rounded-lg font-semibold'>
              {success}
            </div>
          )}

          {/* Orders List */}
          <div className='space-y-6'>
            {orders.map((order) => {
              const style = getStatusStyle(order.orderStatus)
              const isExpanded = expandedOrderId === order.id
              const isCancelled = order.orderStatus === 'CANCELLED'

              return (
                <div key={order.id} className='bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300'>

                  {/* Order Header */}
                  <div className='bg-gradient-to-r from-emerald-50 to-cyan-50 px-6 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-emerald-100'>
                    <div className='flex items-center gap-4'>
                      <div className='p-3 bg-white rounded-xl shadow-sm'>
                        <Package className='w-6 h-6 text-emerald-600' />
                      </div>
                      <div>
                        <p className='text-xs text-gray-500 font-medium uppercase tracking-wide'>Order ID</p>
                        <h2 className='text-xl font-bold text-gray-800'>#{order.id}</h2>
                      </div>
                    </div>

                    <div className='flex flex-wrap items-center gap-4'>
                      <div className='flex items-center gap-2 text-gray-600 text-sm'>
                        <Calendar className='w-4 h-4 text-emerald-500' />
                        <span>{order.orderDate ? new Date(order.orderDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}</span>
                      </div>
                      <div className={`px-4 py-1.5 rounded-full border-2 flex items-center gap-2 font-semibold text-sm ${style.pill}`}>
                        {getStatusIcon(order.orderStatus)}
                        {order.orderStatus || 'UNKNOWN'}
                      </div>
                      <p className='text-xl font-bold text-emerald-600'>₹{(order.totalAmount || 0).toFixed(2)}</p>
                    </div>
                  </div>

                  {/* Progress Tracker — hidden for cancelled */}
                  {!isCancelled && (
                    <div className='px-6 py-5 border-b border-gray-100'>
                      {/* Progress Bar */}
                      <div className='w-full bg-gray-200 rounded-full h-2 mb-4 overflow-hidden'>
                        <div
                          className={`bg-gradient-to-r ${style.bar} h-full rounded-full transition-all duration-700`}
                          style={{ width: `${getStatusProgress(order.orderStatus)}%` }}
                        ></div>
                      </div>

                      {/* Step Labels */}
                      <div className='grid grid-cols-4 gap-2 text-center'>
                        {steps.map((step) => {
                          const active = isStepActive(step, order.orderStatus)
                          return (
                            <div key={step} className='flex flex-col items-center gap-1'>
                              <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 ${active ? style.step + ' shadow-md' : 'bg-gray-200'}`}>
                                {active && <CheckCircle className='w-4 h-4 text-white' />}
                              </div>
                              <span className={`text-xs font-semibold ${active ? 'text-gray-700' : 'text-gray-400'}`}>
                                {stepLabels[step]}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Cancelled badge */}
                  {isCancelled && (
                    <div className='px-6 py-4 bg-red-50 border-b border-red-100 flex items-center gap-3'>
                      <XCircle className='w-5 h-5 text-red-500' />
                      <p className='text-red-700 font-semibold'>This order has been cancelled.</p>
                    </div>
                  )}

                  {/* Order Info Grid */}
                  <div className='px-6 py-5 grid grid-cols-1 sm:grid-cols-3 gap-5 border-b border-gray-100'>

                    <div className='flex items-start gap-3'>
                      <div className='p-2.5 bg-emerald-100 rounded-lg flex-shrink-0'>
                        <MapPin className='w-5 h-5 text-emerald-600' />
                      </div>
                      <div>
                        <p className='text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1'>Delivery Address</p>
                        <p className='text-sm font-semibold text-gray-800'>{order.address || 'Not specified'}</p>
                      </div>
                    </div>

                    <div className='flex items-start gap-3'>
                      <div className='p-2.5 bg-cyan-100 rounded-lg flex-shrink-0'>
                        <CreditCard className='w-5 h-5 text-cyan-600' />
                      </div>
                      <div>
                        <p className='text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1'>Payment Method</p>
                        <p className='text-sm font-semibold text-gray-800'>{order.paymentMethod || 'Not specified'}</p>
                      </div>
                    </div>

                    <div className='flex items-start gap-3'>
                      <div className='p-2.5 bg-green-100 rounded-lg flex-shrink-0'>
                        <ShoppingBag className='w-5 h-5 text-green-600' />
                      </div>
                      <div>
                        <p className='text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1'>Payment Status</p>
                        <p className={`text-sm font-semibold ${
                          // DB enum: PAID | PENDING
                          order.paymentStatus === 'PAID' ? 'text-emerald-600' : 'text-amber-600'
                          }`}>  {order.paymentStatus || 'PENDING'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Expandable Order Details */}
                  <button
                    onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                    className='w-full px-6 py-4 bg-gray-50 hover:bg-emerald-50 transition-colors flex items-center justify-between'
                  >
                    <span className='font-semibold text-gray-700'>Order Details</span>
                    {isExpanded
                      ? <ChevronUp className='w-5 h-5 text-emerald-600' />
                      : <ChevronDown className='w-5 h-5 text-gray-500' />
                    }
                  </button>

                  {isExpanded && (
                    <div className='px-6 py-6 bg-white border-t border-gray-100'>
                      <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>

                        {/* Items Ordered */}
                        <div>
                          <h4 className='font-bold text-gray-800 mb-4 flex items-center gap-2'>
                            <Package className='w-4 h-4 text-emerald-600' />
                            Items Ordered
                          </h4>
                          {/* order.items comes from Order entity → List<OrderItem> */}
                          {/* Each OrderItem: { id, product: { name, price, ... }, quantity, price } */}
                          {order.items && order.items.length > 0 ? (
                            <div className='space-y-3'>
                              <div className='grid grid-cols-3 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-200 pb-2'>
                                <span>Product</span>
                                <span className='text-center'>Qty</span>
                                <span className='text-right'>Price</span>
                              </div>
                              {order.items.map((item, idx) => (
                                <div key={item.id || idx} className='grid grid-cols-3 text-sm text-gray-700 py-2 border-b border-gray-50 items-center'>
                                  {/* item.product.name from OrderItem → Product entity */}
                                  <span className='font-medium truncate pr-2'>
                                    {item.product?.name || `Item ${idx + 1}`}
                                  </span>
                                  <span className='text-center text-gray-600'>× {item.quantity}</span>
                                  {/* item.price = product price at time of order */}
                                  <span className='text-right font-semibold text-emerald-600'>
                                    ₹{(item.price * item.quantity || 0).toFixed(2)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className='flex items-center gap-3 p-4 bg-gray-50 rounded-lg'>
                              <Package className='w-8 h-8 text-gray-300' />
                              <p className='text-sm text-gray-500'>No item details available.</p>
                            </div>
                          )}
                        </div>

                        {/* Price Summary */}
                        <div>
                          <h4 className='font-bold text-gray-800 mb-4 flex items-center gap-2'>
                            <CreditCard className='w-4 h-4 text-emerald-600' />
                            Price Summary
                          </h4>
                          <div className='space-y-3 bg-emerald-50 rounded-xl p-4'>
                            <div className='flex justify-between text-gray-600 text-sm'>
                              <span>Subtotal</span>
                              <span className='font-semibold'>₹{(order.totalAmount || 0).toFixed(2)}</span>
                            </div>
                            <div className='flex justify-between text-gray-600 text-sm'>
                              <span>Shipping</span>
                              <span className='font-semibold text-emerald-600'>FREE</span>
                            </div>
                            <div className='flex justify-between text-gray-600 text-sm'>
                              <span>Tax</span>
                              <span className='font-semibold'>₹0.00</span>
                            </div>
                            <div className='border-t-2 border-emerald-200 pt-3 flex justify-between items-center'>
                              <span className='font-bold text-gray-800'>Total</span>
                              <span className='text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-cyan-500'>
                                ₹{(order.totalAmount || 0).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Cancel Button */}
                  {!['DELIVERED', 'CANCELLED'].includes(order.orderStatus) && (
                    <div className='px-6 py-4 bg-gray-50 border-t border-gray-100'>
                      <button
                        onClick={() => handleCancelOrder(order.id)}
                        className='px-6 py-2.5 border-2 border-red-300 text-red-600 font-semibold rounded-xl hover:bg-red-50 hover:border-red-400 transition-all duration-300 text-sm'
                      >
                        Cancel Order
                      </button>
                    </div>
                  )}

                </div>
              )
            })}
          </div>

        </div>
      </div>
      <Footer />
    </div>
  )
}

export default Orders


