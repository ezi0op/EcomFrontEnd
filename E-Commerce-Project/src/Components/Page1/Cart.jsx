import React, { useState, useEffect } from 'react'
import Header from './Header'
import Footer from './Footer'
import {
  ShoppingBag, Trash2, Plus, Minus, ShoppingCart,
  ArrowLeft, MapPin, CreditCard, X, CheckCircle,
  Smartphone, Building2, Wallet, Truck, ChevronRight, Lock,
  Download, Mail, Ticket
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

// ── Dynamically load Razorpay SDK once ────────────────────────────────────────
const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (document.getElementById('razorpay-sdk')) return resolve(true)
    const script = document.createElement('script')
    script.id = 'razorpay-sdk'
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })

// ✅ DB enum: COD | UPI | CARD | NET_BANKING
const PAYMENT_OPTIONS = [
  {
    value: 'COD',
    label: 'Cash on Delivery',
    icon: Truck,
    color: 'emerald',
    desc: 'Pay when your order arrives',
    badge: 'No extra charges',
  },
  {
    value: 'UPI',
    label: 'UPI',
    icon: Smartphone,
    color: 'purple',
    desc: 'Pay via any UPI app',
    badge: 'Instant payment',
  },
  {
    value: 'CARD',
    label: 'Credit / Debit Card',
    icon: CreditCard,
    color: 'blue',
    desc: 'Visa, Mastercard, RuPay',
    badge: 'Secure & fast',
  },
  {
    value: 'NET_BANKING',
    label: 'Net Banking',
    icon: Building2,
    color: 'cyan',
    desc: 'All major banks supported',
    badge: 'Bank transfer',
  },
]

const colorMap = {
  emerald: { bg: 'bg-emerald-50', border: 'border-emerald-500', icon: 'text-emerald-600', badge: 'bg-emerald-100 text-emerald-700', btn: 'from-emerald-600 to-emerald-500' },
  purple: { bg: 'bg-purple-50', border: 'border-purple-500', icon: 'text-purple-600', badge: 'bg-purple-100 text-purple-700', btn: 'from-purple-600 to-purple-500' },
  blue: { bg: 'bg-blue-50', border: 'border-blue-500', icon: 'text-blue-600', badge: 'bg-blue-100 text-blue-700', btn: 'from-blue-600 to-blue-500' },
  cyan: { bg: 'bg-cyan-50', border: 'border-cyan-500', icon: 'text-cyan-600', badge: 'bg-cyan-100 text-cyan-700', btn: 'from-cyan-600 to-cyan-500' },
}

// ── COD Confirmation Screen ────────────────────────────────────────────────────
const CodConfirm = ({ amount, address, onConfirm, loading }) => (
  <div className='text-center'>
    <div className='w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4'>
      <Truck className='w-10 h-10 text-emerald-600' />
    </div>
    <h3 className='text-lg font-bold text-gray-800 mb-1'>Cash on Delivery</h3>
    <p className='text-gray-500 text-sm mb-4'>
      Pay <strong className='text-emerald-600'>₹{amount.toFixed(2)}</strong> when your order arrives
    </p>
    <div className='bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 mb-4 text-left space-y-1.5'>
      <p className='text-sm text-emerald-700 font-medium'>✓ No online payment required</p>
      <p className='text-sm text-emerald-700 font-medium'>✓ Pay cash at the time of delivery</p>
      <p className='text-sm text-emerald-700 font-medium'>✓ Payment status will be <em>Pending</em> until delivered</p>
    </div>
    {address && (
      <div className='bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-4 text-left'>
        <p className='text-xs text-gray-500 font-semibold uppercase mb-1'>Delivering to</p>
        <p className='text-sm text-gray-700 font-medium'>{address}</p>
      </div>
    )}
    <button onClick={onConfirm} disabled={loading}
      className='w-full py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-bold rounded-xl hover:scale-105 transition-all disabled:opacity-60'>
      {loading ? 'Placing Order…' : '✓ Confirm & Place Order'}
    </button>
  </div>
)
// ────────────────────────────────────────────────────────────────────────────

const Cart = () => {
  const navigate = useNavigate()

  // Cart state
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [total, setTotal] = useState(0)
  const [updating, setUpdating] = useState({})
  const [productMap, setProductMap] = useState({})  // productId → product
  const [razorpayKeyId, setRazorpayKeyId] = useState('')

  // Inline checkout flow: 'cart' | 'checkout' | 'cod-confirm' | 'success'
  const [step, setStep] = useState('cart')
  const [checkoutForm, setCheckoutForm] = useState({ address: '', paymentMethod: '', couponCode: '' })
  const [checkoutError, setCheckoutError] = useState('')
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [placedOrder, setPlacedOrder] = useState(null)
  const [invoiceLoading, setInvoiceLoading] = useState(false)
  const [emailLoading, setEmailLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  // Verify Coupon state
  const [appliedCoupon, setAppliedCoupon] = useState(null)
  const [verifyingCoupon, setVerifyingCoupon] = useState(false)
  const [couponMsg, setCouponMsg] = useState({ text: '', type: '' })

  const userId = localStorage.getItem('userId')
  const token = localStorage.getItem('token')
  const isGuest = !userId || !token   // guest = not logged in

  useEffect(() => {
    fetchProductMap()   // always fetch product images (public endpoint)
    loadRazorpayScript() // preload Razorpay SDK
    fetchRazorpayConfig() // fetch key id
    if (isGuest) {
      // Guest mode — load from localStorage, no API needed
      const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]')
      setCartItems(guestCart)
      setTotal(guestCart.reduce((s, i) => s + (i.total || 0), 0))
      setLoading(false)
    } else {
      fetchCartItems()
    }
  }, [])

  // Fetch Razorpay Key ID from backend
  const fetchRazorpayConfig = async () => {
    try {
      const res = await axios.get('https://e-commerceweb-back.onrender.com/payment/config', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })
      if (res.data.success) setRazorpayKeyId(res.data.data.keyId)
    } catch (e) {
      console.warn('Could not fetch Razorpay config:', e)
    }
  }

  // ── API ────────────────────────────────────────────────────────────────────

  const fetchCartItems = async () => {
    try {
      setLoading(true)
      setError('')
      const res = await axios.get(`https://e-commerceweb-back.onrender.com/cart/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.data.success && res.data.data) {
        const items = res.data.data
        setCartItems(items)
        fetchTotal()
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load cart')
      setCartItems([])
    } finally {
      setLoading(false)
    }
  }

  const fetchTotal = async () => {
    try {
      const res = await axios.get(`https://e-commerceweb-back.onrender.com/cart/total/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.data.success) setTotal(res.data.data || 0)
    } catch { }
  }

  // Public endpoint — get product images/names
  const fetchProductMap = async () => {
    try {
      const res = await fetch('https://e-commerceweb-back.onrender.com/products?size=1000')
      const data = await res.json()
      const map = {}
      const items = data.data?.content || data.data || []
      items.forEach(p => { map[p.id] = p })
      setProductMap(map)
    } catch (e) {
      console.error('Failed to fetch product map for cart:', e)
    }
  }

  // ── Update quantity ───────────────────────────────────────────────────
  const handleUpdateQuantity = async (cartItemId, newQty) => {
    if (newQty < 1) return
    if (isGuest) {
      // Update in localStorage
      const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]')
      const item = guestCart.find(i => i.id === cartItemId)
      if (item) { item.quantity = newQty; item.total = item.price * newQty }
      localStorage.setItem('guestCart', JSON.stringify(guestCart))
      setCartItems([...guestCart])
      setTotal(guestCart.reduce((s, i) => s + (i.total || 0), 0))
      return
    }
    // Logged in — backend
    setUpdating(prev => ({ ...prev, [cartItemId]: true }))
    try {
      const res = await axios.put(
        `https://e-commerceweb-back.onrender.com/cart/update/${cartItemId}`,
        { quantity: newQty },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (res.data.success) { fetchCartItems(); setSuccess('Cart updated!'); setTimeout(() => setSuccess(''), 2000) }
    } catch { setError('Failed to update'); setTimeout(() => setError(''), 2000) }
    finally { setUpdating(prev => ({ ...prev, [cartItemId]: false })) }
  }

  // ── Remove item ──────────────────────────────────────────────────────
  const handleRemoveItem = async (cartItemId) => {
    if (isGuest) {
      const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]').filter(i => i.id !== cartItemId)
      localStorage.setItem('guestCart', JSON.stringify(guestCart))
      setCartItems([...guestCart])
      setTotal(guestCart.reduce((s, i) => s + (i.total || 0), 0))
      return
    }
    try {
      const res = await axios.delete(`https://e-commerceweb-back.onrender.com/cart/remove/${cartItemId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.data.success) { fetchCartItems(); setSuccess('Item removed'); setTimeout(() => setSuccess(''), 2000) }
    } catch { setError('Failed to remove'); setTimeout(() => setError(''), 2000) }
  }

  // ── Clear cart ───────────────────────────────────────────────────────
  const handleClearCart = async () => {
    if (!window.confirm('Clear all items?')) return
    if (isGuest) {
      localStorage.removeItem('guestCart')
      setCartItems([])
      setTotal(0)
      return
    }
    try {
      const res = await axios.delete(`https://e-commerceweb-back.onrender.com/cart/clear/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.data.success) { setCartItems([]); setTotal(0) }
    } catch { setError('Failed to clear cart') }
  }

  // ── Verify Coupon ─────────────────────────────────────────────────────────
  const handleVerifyCoupon = async () => {
    if (!checkoutForm.couponCode?.trim()) {
      setCouponMsg({ text: 'Please enter a coupon code.', type: 'error' })
      return
    }
    setVerifyingCoupon(true)
    setCouponMsg({ text: '', type: '' })
    try {
      const res = await axios.post(
        'https://e-commerceweb-back.onrender.com/orders/verify-coupon',
        { code: checkoutForm.couponCode.trim(), amount: total.toString() },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (res.data.valid) {
        setAppliedCoupon({
          code: checkoutForm.couponCode.trim(),
          discount: res.data.discount,
          finalAmount: res.data.finalAmount
        })
        setCouponMsg({ text: `Code applied! You save ₹${res.data.discount.toFixed(2)}`, type: 'success' })
      }
    } catch (err) {
      setAppliedCoupon(null)
      setCouponMsg({ text: err.response?.data?.message || 'Invalid or expired coupon.', type: 'error' })
    } finally {
      setVerifyingCoupon(false)
    }
  }

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null)
    setCheckoutForm(p => ({ ...p, couponCode: '' }))
    setCouponMsg({ text: '', type: '' })
  }

  // ── COD: place order directly ──────────────────────────────────────────────
  // POST /orders/place  { userId, address, paymentMethod }
  const handlePlaceOrder = async () => {
    setCheckoutLoading(true)
    setCheckoutError('')
    try {
      const res = await axios.post(
        'https://e-commerceweb-back.onrender.com/orders/place',
        {
          userId: parseInt(userId),
          address: checkoutForm.address.trim(),
          paymentMethod: checkoutForm.paymentMethod,
          couponCode: checkoutForm.couponCode?.trim() || null
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (res.data.success) {
        setPlacedOrder(res.data.data)
        setCartItems([])
        setTotal(0)
        setStep('success')
      }
    } catch (err) {
      setCheckoutError(err.response?.data?.message || 'Failed to place order. Try again.')
    } finally {
      setCheckoutLoading(false)
    }
  }

  // ── Razorpay: place order → create razorpay order → open modal → verify ───
  const handleRazorpayPayment = async () => {
    setCheckoutLoading(true)
    setCheckoutError('')
    try {
      // Step 1: Place the order in our DB first to get orderId
      const orderRes = await axios.post(
        'https://e-commerceweb-back.onrender.com/orders/place',
        {
          userId: parseInt(userId),
          address: checkoutForm.address.trim(),
          paymentMethod: checkoutForm.paymentMethod,
          couponCode: checkoutForm.couponCode?.trim() || null
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (!orderRes.data.success) throw new Error('Failed to create order')
      const order = orderRes.data.data

      // Step 2: Create Razorpay order on backend
      const rpOrderRes = await axios.post(
        'https://e-commerceweb-back.onrender.com/payment/create-order',
        { amount: Math.round(order.totalAmount), orderId: order.id },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (!rpOrderRes.data.success) throw new Error('Failed to create Razorpay order')
      const { id: razorpayOrderId, amount: rpAmount, currency } = rpOrderRes.data.data

      // Step 3: Ensure SDK is ready
      const sdkReady = await loadRazorpayScript()
      if (!sdkReady) throw new Error('Razorpay SDK failed to load')

      // Step 4: Open Razorpay checkout popup
      const options = {
        key: razorpayKeyId,
        amount: rpAmount,
        currency: currency || 'INR',
        name: 'E-Commerce Store',
        description: `Order #${order.id}`,
        order_id: razorpayOrderId,
        prefill: {
          name: localStorage.getItem('userName') || '',
          email: localStorage.getItem('userEmail') || '',
        },
        theme: { color: '#10b981' },
        modal: {
          ondismiss: () => {
            setCheckoutLoading(false)
            setCheckoutError('Payment was cancelled. Please try again.')
          },
        },
        handler: async (response) => {
          // Step 5: Verify payment on backend
          try {
            await axios.post(
              'https://e-commerceweb-back.onrender.com/payment/verify',
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              },
              { headers: { Authorization: `Bearer ${token}` } }
            )
            // Payment verified — show success
            setPlacedOrder(order)
            setCartItems([])
            setTotal(0)
            setStep('success')
          } catch (verifyErr) {
            setCheckoutError(
              verifyErr.response?.data?.message || 'Payment verification failed. Contact support.'
            )
          } finally {
            setCheckoutLoading(false)
          }
        },
      }

      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (err) {
      setCheckoutError(err.response?.data?.message || err.message || 'Payment failed. Try again.')
      setCheckoutLoading(false)
    }
  }

  // ── Download Invoice PDF ──────────────────────────────────────────────
  const handleDownloadInvoice = async () => {
    if (!placedOrder?.id) return
    setInvoiceLoading(true)
    try {
      const res = await axios.get(`https://e-commerceweb-back.onrender.com/orders/${placedOrder.id}/invoice`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob',
      })
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `Invoice_Order_${placedOrder.id}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (e) {
      console.error('Failed to download invoice:', e)
    } finally {
      setInvoiceLoading(false)
    }
  }

  // ── Send Invoice to Email ────────────────────────────────────────────
  const handleSendInvoice = async () => {
    if (!placedOrder?.id) return
    setEmailLoading(true)
    setEmailSent(false)
    try {
      await axios.get(`https://e-commerceweb-back.onrender.com/orders/${placedOrder.id}/send-invoice`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setEmailSent(true)
      setTimeout(() => setEmailSent(false), 4000)
    } catch (e) {
      console.error('Failed to send invoice email:', e)
    } finally {
      setEmailLoading(false)
    }
  }

  const handleCheckoutSubmit = (e) => {
    e.preventDefault()
    if (!checkoutForm.address.trim()) { setCheckoutError('Please enter a delivery address.'); return }
    if (!checkoutForm.paymentMethod) { setCheckoutError('Please select a payment method.'); return }
    setCheckoutError('')
    // COD → show confirmation screen first; everything else → Razorpay popup directly
    if (checkoutForm.paymentMethod === 'COD') {
      setStep('cod-confirm')
    } else {
      handleRazorpayPayment()
    }
  }

  // ── Right Panel content based on step ─────────────────────────────────────

  const renderRightPanel = () => {
    // ── STEP: cart → Order Summary ──────────────────────────────────────────
    if (step === 'cart') return (
      <div className='bg-white rounded-2xl shadow-lg p-7'>
        <h2 className='text-2xl font-bold text-gray-800 mb-5'>
          Order <span className='text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-cyan-500'>Summary</span>
        </h2>
        <div className='space-y-3 mb-5 pb-5 border-b-2 border-gray-100'>
          <div className='flex justify-between text-gray-600 text-sm'>
            <span>Subtotal ({cartItems.length} item{cartItems.length !== 1 ? 's' : ''})</span>
            <span className='font-semibold text-gray-800'>₹{total.toFixed(2)}</span>
          </div>
          <div className='flex justify-between text-gray-600 text-sm'>
            <span>Shipping</span>
            <span className='font-semibold text-emerald-600'>FREE</span>
          </div>
          <div className='flex justify-between text-gray-600 text-sm'>
            <span>Tax</span>
            <span className='font-semibold text-gray-800'>₹0.00</span>
          </div>
        </div>
        <div className='flex justify-between items-center mb-7'>
          <span className='text-lg font-semibold text-gray-800'>Total</span>
          <span className='text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-cyan-500'>
            ₹{total.toFixed(2)}
          </span>
        </div>
        {/* Proceed to Checkout: for guests → redirect to login */}
        <button
          onClick={() => isGuest ? navigate('/login') : setStep('checkout')}
          className='w-full py-3 bg-gradient-to-r from-emerald-600 to-cyan-500 text-white font-bold rounded-xl shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 mb-3'
        >
          {isGuest ? 'Login to Checkout' : 'Proceed to Checkout'} <ChevronRight className='w-5 h-5' />
        </button>
        {isGuest && (
          <p className='text-xs text-center text-gray-500 mb-2'>
            Your cart items will be saved when you log in
          </p>
        )}
        <button onClick={handleClearCart}
          className='w-full py-2.5 border-2 border-gray-200 text-gray-600 font-semibold rounded-xl hover:border-red-300 hover:text-red-600 hover:bg-red-50 transition-all text-sm'>
          Clear Cart
        </button>
        <button onClick={() => navigate('/')}
          className='w-full mt-2 py-2 text-emerald-600 font-semibold text-sm hover:text-emerald-700 transition-colors'>
          ← Continue Shopping
        </button>
      </div>
    )

    // ── STEP: checkout → Address + Payment Method ───────────────────────────
    if (step === 'checkout') return (
      <div className='bg-white rounded-2xl shadow-lg p-7'>
        <div className='flex items-center gap-3 mb-5'>
          <button onClick={() => { setStep('cart'); setCheckoutError('') }}
            className='p-1.5 hover:bg-gray-100 rounded-lg transition-colors'>
            <ArrowLeft className='w-5 h-5 text-gray-500' />
          </button>
          <h2 className='text-xl font-bold text-gray-800'>Checkout</h2>
        </div>

        {/* Total reminder */}
        <div className='bg-emerald-50 rounded-xl px-4 py-3 mb-5'>
          <div className='flex justify-between items-center mb-1'>
            <span className='text-sm text-gray-600 font-medium'>Subtotal</span>
            <span className='text-sm font-semibold text-gray-800'>₹{total.toFixed(2)}</span>
          </div>
          {appliedCoupon && (
            <div className='flex justify-between items-center mb-1 text-emerald-600'>
              <span className='text-sm font-medium'>Discount ({appliedCoupon.code})</span>
              <span className='text-sm font-bold'>-₹{appliedCoupon.discount.toFixed(2)}</span>
            </div>
          )}
          <div className='flex justify-between items-center pt-2 mt-2 border-t border-emerald-200/50'>
            <span className='text-base text-gray-800 font-bold'>Order Total</span>
            <span className='text-xl font-bold text-emerald-600'>
              ₹{appliedCoupon ? appliedCoupon.finalAmount.toFixed(2) : total.toFixed(2)}
            </span>
          </div>
        </div>

        {checkoutError && (
          <div className='mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 rounded text-sm font-medium'>
            {checkoutError}
          </div>
        )}

        <form onSubmit={handleCheckoutSubmit} className='space-y-5'>
          {/* Delivery Address */}
          <div>
            <label className='flex items-center gap-2 text-sm font-bold text-gray-700 mb-2'>
              <MapPin className='w-4 h-4 text-emerald-600' /> Delivery Address
            </label>
            <textarea
              value={checkoutForm.address}
              onChange={e => setCheckoutForm(p => ({ ...p, address: e.target.value }))}
              placeholder='Enter your full delivery address…'
              rows={3}
              required
              className='w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all resize-none text-sm'
            />
          </div>

          {/* Coupon Code */}
          <div>
            <label className='flex items-center gap-2 text-sm font-bold text-gray-700 mb-2'>
               <Ticket className='w-4 h-4 text-emerald-600' /> Promo/Coupon Code <span className='text-xs font-normal text-gray-400'>(optional)</span>
            </label>
            <div className='flex gap-2 relative'>
              <input
                value={checkoutForm.couponCode || ''}
                onChange={e => {
                  setCheckoutForm(p => ({ ...p, couponCode: e.target.value.toUpperCase() }))
                  if (appliedCoupon && e.target.value.toUpperCase() !== appliedCoupon.code) {
                    setAppliedCoupon(null) // invalidate if they type a new code
                    setCouponMsg({ text: '', type: '' })
                  }
                }}
                disabled={appliedCoupon !== null}
                placeholder='Enter code here...'
                maxLength={20}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all text-sm font-bold tracking-wider ${
                  appliedCoupon 
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-800' 
                    : 'border-gray-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 text-gray-700'
                }`}
              />
              {appliedCoupon ? (
                <button type='button' onClick={handleRemoveCoupon}
                  className='px-5 py-3 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100 transition-colors shrink-0'>
                  Remove
                </button>
              ) : (
                <button type='button' onClick={handleVerifyCoupon} disabled={verifyingCoupon || !checkoutForm.couponCode?.trim()}
                  className='px-6 py-3 bg-gray-800 text-white font-bold rounded-xl shadow-md hover:bg-gray-900 hover:shadow-lg transition-all shrink-0 disabled:opacity-50'>
                  {verifyingCoupon ? '...' : 'Apply'}
                </button>
              )}
            </div>
            {couponMsg.text && (
              <p className={`mt-2 text-xs font-bold ${couponMsg.type === 'success' ? 'text-emerald-600' : 'text-red-500'}`}>
                {couponMsg.text}
              </p>
            )}
          </div>

          {/* Payment Method Selection */}
          <div>
            <label className='flex items-center gap-2 text-sm font-bold text-gray-700 mb-3'>
              <Wallet className='w-4 h-4 text-emerald-600' /> Payment Method
            </label>
            <div className='space-y-2'>
              {PAYMENT_OPTIONS.map(opt => {
                const Icon = opt.icon
                const c = colorMap[opt.color]
                const selected = checkoutForm.paymentMethod === opt.value
                return (
                  <label key={opt.value}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 cursor-pointer transition-all ${selected ? `${c.border} ${c.bg}` : 'border-gray-200 hover:border-gray-300'}`}>
                    <input
                      type='radio' name='paymentMethod' value={opt.value}
                      checked={selected}
                      onChange={e => setCheckoutForm(p => ({ ...p, paymentMethod: e.target.value }))}
                      className='sr-only'
                    />
                    <div className={`p-1.5 rounded-lg ${selected ? c.bg : 'bg-gray-100'}`}>
                      <Icon className={`w-4 h-4 ${selected ? c.icon : 'text-gray-500'}`} />
                    </div>
                    <div className='flex-1 min-w-0'>
                      <p className={`text-sm font-bold ${selected ? 'text-gray-900' : 'text-gray-700'}`}>{opt.label}</p>
                      <p className='text-xs text-gray-500'>{opt.desc}</p>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${selected ? c.badge : 'bg-gray-100 text-gray-500'}`}>
                      {opt.badge}
                    </span>
                  </label>
                )
              })}
            </div>
          </div>

          {/* Razorpay info banner for online payments */}
          {checkoutForm.paymentMethod && checkoutForm.paymentMethod !== 'COD' && (
            <div className='flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-xl'>
              <Lock className='w-4 h-4 text-blue-600 flex-shrink-0' />
              <p className='text-xs text-blue-700 font-medium'>
                Razorpay secure checkout will open — pay via Card, UPI, Net Banking & more.
              </p>
            </div>
          )}

          <button type='submit' disabled={checkoutLoading}
            className='w-full py-3 bg-gradient-to-r from-emerald-600 to-cyan-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2 disabled:opacity-60'>
            {checkoutLoading
              ? <><span className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block' /> Processing…</>
              : checkoutForm.paymentMethod === 'COD'
                ? <>Review Order <ChevronRight className='w-5 h-5' /></>
                : <><Lock className='w-4 h-4' /> Proceed to Pay ₹{(appliedCoupon ? appliedCoupon.finalAmount : total).toFixed(2)}</>
            }
          </button>
        </form>
      </div>
    )

    // ── STEP: cod-confirm → COD Confirmation screen ───────────────────────────
    if (step === 'cod-confirm') return (
      <div className='bg-white rounded-2xl shadow-lg p-7'>
        <div className='flex items-center gap-3 mb-5'>
          <button onClick={() => { setStep('checkout'); setCheckoutError('') }}
            className='p-1.5 hover:bg-gray-100 rounded-lg transition-colors'>
            <ArrowLeft className='w-5 h-5 text-gray-500' />
          </button>
          <div>
            <h2 className='text-xl font-bold text-gray-800'>Confirm Order</h2>
            <p className='text-xs text-gray-500'>Cash on Delivery</p>
          </div>
        </div>

        {checkoutError && (
          <div className='mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 rounded text-sm font-medium'>
            {checkoutError}
          </div>
        )}

        <CodConfirm
          amount={appliedCoupon ? appliedCoupon.finalAmount : total}
          address={checkoutForm.address}
          onConfirm={handlePlaceOrder}
          loading={checkoutLoading}
        />
      </div>
    )

    return null
  }

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) return (
    <div>
      <Header />
      <div className='min-h-screen bg-gradient-to-br from-emerald-50 to-green-100 flex items-center justify-center'>
        <div className='text-center'>
          {error
            ? <p className='text-lg font-semibold text-red-600'>{error}</p>
            : <><div className='w-16 h-16 border-4 border-emerald-300 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4'></div>
              <p className='text-lg font-semibold text-emerald-700'>Loading your cart…</p></>
          }
        </div>
      </div>
      <Footer />
    </div>
  )

  // ── Success screen ─────────────────────────────────────────────────────────
  if (step === 'success') return (
    <div>
      <Header />
      <div className='min-h-screen bg-gradient-to-br from-emerald-50 to-green-100 flex items-center justify-center px-4'>
        <div className='bg-white rounded-3xl shadow-2xl p-10 max-w-lg w-full text-center'>

          {/* Success icon */}
          <div className='w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6'>
            <CheckCircle className='w-14 h-14 text-emerald-500' />
          </div>
          <h1 className='text-3xl font-bold text-gray-800 mb-2'>Order Placed! 🎉</h1>
          <p className='text-gray-500 mb-2'>Your order has been placed successfully.</p>

          {placedOrder && (
            <div className='flex flex-col items-center gap-1 mb-5'>
              <p className='text-sm font-semibold text-emerald-600'>
                Order #{placedOrder.id} · {checkoutForm.paymentMethod}
                {checkoutForm.paymentMethod === 'COD' ? ' · Payment on Delivery' : ' · Payment Done ✓'}
              </p>
              {placedOrder.couponCode && (
                <p className='text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full'>
                  Code '{placedOrder.couponCode}' Applied! (-₹{placedOrder.discountAmount})
                </p>
              )}
            </div>
          )}

          <div className='bg-emerald-50 rounded-xl p-4 mb-5 text-left'>
            <p className='text-sm text-gray-600'><span className='font-semibold'>Delivery to: </span>{checkoutForm.address}</p>
          </div>

          {/* ─ Invoice Actions ─ */}
          {placedOrder && (
            <div className='mb-5 bg-gray-50 border border-gray-100 rounded-2xl p-4'>
              <div className='flex items-center gap-2 mb-3'>
                <div className='flex-1 h-px bg-gray-200' />
                <span className='text-xs font-bold text-gray-400 uppercase tracking-widest px-2'>Invoice</span>
                <div className='flex-1 h-px bg-gray-200' />
              </div>

              <div className='space-y-2.5'>
                {/* Download PDF */}
                <button
                  onClick={handleDownloadInvoice}
                  disabled={invoiceLoading}
                  className='w-full py-3 flex items-center justify-center gap-2.5 bg-gradient-to-r from-violet-600 to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 hover:shadow-indigo-300 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100'>
                  {invoiceLoading
                    ? <span className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
                    : <Download className='w-4 h-4' />}
                  <span>{invoiceLoading ? 'Generating PDF…' : 'Download Invoice PDF'}</span>
                </button>

                {/* Send to Email */}
                <button
                  onClick={handleSendInvoice}
                  disabled={emailLoading || emailSent}
                  className={`w-full py-3 flex items-center justify-center gap-2.5 font-bold rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:hover:scale-100 ${
                    emailSent
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-200'
                      : 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg shadow-rose-200 hover:shadow-rose-300 disabled:opacity-60'
                  }`}>
                  {emailLoading
                    ? <span className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
                    : <Mail className='w-4 h-4' />}
                  <span>
                    {emailLoading ? 'Sending Email…' : emailSent ? '✓ Invoice Sent to Email!' : 'Send Invoice to Email'}
                  </span>
                </button>
              </div>

              {emailSent && (
                <p className='text-xs text-emerald-600 font-semibold mt-2.5 text-center'>
                  📧 Check your inbox — invoice has been delivered!
                </p>
              )}
            </div>
          )}

          {/* Navigation */}
          <div className='flex gap-3'>
            <button onClick={() => navigate('/orders')}
              className='flex-1 py-3 bg-gradient-to-r from-emerald-600 to-cyan-500 text-white font-bold rounded-xl hover:scale-105 transition-all'>
              Track Order
            </button>
            <button onClick={() => navigate('/')}
              className='flex-1 py-3 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all'>
              Shop More
            </button>
          </div>

        </div>
      </div>
      <Footer />
    </div>
  )

  // ── Empty cart ─────────────────────────────────────────────────────────────
  if (cartItems.length === 0) return (
    <div>
      <Header />
      <div className='min-h-screen bg-gradient-to-br from-emerald-50 to-green-100 flex flex-col items-center justify-center px-4'>
        <div className='mb-6 p-6 bg-white rounded-full shadow-lg'>
          <ShoppingCart className='w-16 h-16 text-emerald-400' />
        </div>
        <h1 className='text-3xl font-bold text-gray-800 mb-2'>Your Cart is Empty</h1>
        <p className='text-gray-500 mb-8'>Add some amazing products to get started</p>
        <button onClick={() => navigate('/')}
          className='px-8 py-3 bg-gradient-to-r from-emerald-600 to-cyan-500 text-white font-semibold rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all'>
          Start Shopping
        </button>
      </div>
      <Footer />
    </div>
  )

  // ── Main view ──────────────────────────────────────────────────────────────
  return (
    <div>
      <Header />
      <div className='min-h-screen bg-gradient-to-br from-emerald-50 to-green-100 py-12'>
        <div className='max-w-7xl mx-auto px-4'>

          {/* Title + step breadcrumb */}
          <div className='mb-8 flex items-center gap-4'>
            <button onClick={() => {
              if (step === 'cod-confirm') { setStep('checkout'); setCheckoutError('') }
              else if (step !== 'cart') setStep('cart')
              else navigate('/')
            }}
              className='p-2 hover:bg-emerald-100 rounded-lg transition-colors'>
              <ArrowLeft className='w-6 h-6 text-emerald-600' />
            </button>
            <div>
              <h1 className='text-4xl font-bold text-gray-800'>
                Shopping <span className='text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-cyan-500'>Cart</span>
              </h1>
              {/* Step indicator */}
              <div className='flex items-center gap-2 mt-1'>
                {['Cart', 'Checkout', 'Confirm'].map((s, i) => {
                  const stepOrder = ['cart', 'checkout', 'cod-confirm']
                  const current = step === 'cod-confirm' ? 2 : stepOrder.indexOf(step)
                  const active = i <= current
                  // Only show 'Confirm' step when COD is selected
                  if (s === 'Confirm' && step !== 'cod-confirm') return null
                  return (
                    <React.Fragment key={s}>
                      {i > 0 && (s !== 'Confirm' || step === 'cod-confirm') && <span className='text-gray-300 text-xs'>›</span>}
                      <span className={`text-xs font-semibold ${active ? 'text-emerald-600' : 'text-gray-400'}`}>{s}</span>
                    </React.Fragment>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Alerts */}
          {error && <div className='mb-5 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-lg font-semibold'>{error}</div>}
          {success && <div className='mb-5 p-4 bg-emerald-100 border-l-4 border-emerald-500 text-emerald-700 rounded-lg font-semibold'>{success}</div>}

          <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>

            {/* ── Left: Cart Items (always visible) ── */}
            <div className='lg:col-span-2 space-y-4'>
              {cartItems.map(item => {
                const product = item.product || productMap[item.productId]
                return (
                  <div key={item.id}
                    className={`bg-white rounded-2xl shadow-md p-5 flex gap-5 transition-all duration-300 ${step === 'cart' ? 'hover:shadow-xl' : 'opacity-80'}`}>

                    {/* Product image via productId → productMap */}
                    <div className='w-20 h-20 rounded-xl flex-shrink-0 overflow-hidden border border-emerald-100 bg-gradient-to-br from-emerald-50 to-green-100 flex items-center justify-center'>
                      {product?.image
                        ? <img src={product.image} alt={product.name || 'Product'} className='w-full h-full object-cover' onError={e => { e.target.style.display = 'none' }} />
                        : <ShoppingBag className='w-9 h-9 text-emerald-400' />
                      }
                    </div>

                    {/* Info */}
                    <div className='flex-1 min-w-0'>
                      <h3 className='text-base font-bold text-gray-800 mb-0.5 truncate'>
                        {item.productName || product?.name || 'Product'}
                      </h3>
                      {product?.category && (
                        <span className='text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded font-semibold capitalize'>
                          {product.category}
                        </span>
                      )}
                      <p className='text-lg font-bold text-emerald-600 mt-1'>
                        ₹{(item.price || product?.price || 0).toFixed(2)}
                        <span className='text-xs text-gray-400 font-normal ml-1'>per unit</span>
                      </p>
                    </div>

                    {/* Actions — only editable on cart step */}
                    <div className='flex flex-col items-end justify-between flex-shrink-0'>
                      {step === 'cart' ? (
                        <>
                          <button onClick={() => handleRemoveItem(item.id)}
                            className='p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all' title='Remove'>
                            <Trash2 className='w-5 h-5' />
                          </button>
                          <div className='flex items-center gap-1 border-2 border-emerald-200 rounded-lg p-1 bg-emerald-50'>
                            <button onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                              disabled={updating[item.id] || item.quantity <= 1}
                              className='p-1 hover:bg-emerald-200 rounded transition-all disabled:opacity-40'>
                              <Minus className='w-4 h-4 text-emerald-700' />
                            </button>
                            <span className='px-3 font-bold text-gray-800 min-w-8 text-center text-sm'>
                              {updating[item.id] ? '…' : item.quantity}
                            </span>
                            <button onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                              disabled={updating[item.id]}
                              className='p-1 hover:bg-emerald-200 rounded transition-all disabled:opacity-40'>
                              <Plus className='w-4 h-4 text-emerald-700' />
                            </button>
                          </div>
                        </>
                      ) : (
                        <span className='text-sm text-gray-400 font-medium'>× {item.quantity}</span>
                      )}
                      <p className='text-base font-bold text-gray-800'>₹{(item.total || 0).toFixed(2)}</p>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* ── Right: Dynamic panel based on step ── */}
            <div className='lg:col-span-1'>
              <div className='sticky top-24'>
                {renderRightPanel()}
              </div>
            </div>

          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default Cart


