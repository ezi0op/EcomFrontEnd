import React, { useState, useEffect } from 'react'
import axios from 'axios'
const API_URL = import.meta.env.VITE_API_URL;
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock, ShoppingBag, Zap, Shield, Truck } from 'lucide-react'

const Login = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [toast, setToast]       = useState(null)

  useEffect(() => {
    if (localStorage.getItem('token')) navigate('/')
  }, [navigate])

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleChange = (e) => setFormData(p => ({ ...p, [e.target.name]: e.target.value }))

  // Merge guest cart into backend after login
  const mergeGuestCart = async (userId, token) => {
    const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]')
    if (!guestCart.length) return
    await Promise.allSettled(
      guestCart.map(item =>
        axios.post(`${API_URL}/cart/add`,
          { userId: parseInt(userId), productId: item.productId, quantity: item.quantity },
          { headers: { Authorization: `Bearer ${token}` } }
        )
      )
    )
    localStorage.removeItem('guestCart')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await axios.post('http://13.53.206.121:8080/auth/login', {
      const res = await axios.post(`${API_URL}/auth/login`, {
        email: formData.email,
        password: formData.password,
      })
      if (res.data.success) {
        const { token, userId, role, name, active } = res.data.data
        
        // Ensure blocked users cannot log in
        if (active === false) {
           setError('Account has been blocked by an Administrator.')
           setLoading(false)
           return
        }

        localStorage.setItem('token',    token)
        localStorage.setItem('userId',   userId)
        localStorage.setItem('userRole', role)
        localStorage.setItem('userName', name)
        // Merge any guest cart items
        await mergeGuestCart(userId, token)
        showToast(`Welcome back, ${name}! 🎉`)
        setTimeout(() => navigate('/'), 1200)
      }
    } catch (err) {
      if (err.response?.data?.message?.toLowerCase().includes('blocked') || err.response?.data?.message?.toLowerCase().includes('inactive')) {
         setError('Account has been blocked by an Administrator.')
      } else {
         setError(err.response?.data?.message || 'Invalid email or password')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='min-h-screen flex'>

      {/* ── Floating Toast ── */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl text-white font-semibold text-sm
          ${toast.type === 'success' ? 'bg-gradient-to-r from-emerald-500 to-emerald-600' : 'bg-gradient-to-r from-red-500 to-red-600'}`}>
          {toast.msg}
        </div>
      )}

      {/* ── Left decorative panel ── */}
      <div className='hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 flex-col items-center justify-center p-12 relative overflow-hidden'>
        {/* Background blobs */}
        <div className='absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-32 -translate-y-32' />
        <div className='absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full translate-x-32 translate-y-32' />
        <div className='absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_60%,_rgba(0,0,0,0.2)_100%)]' />

        <div className='relative z-10 text-center text-white'>
          {/* Logo */}
          <div className='w-24 h-24 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl border border-white/30'>
            <ShoppingBag className='w-12 h-12 text-white' />
          </div>
          <h1 className='text-4xl font-bold mb-2'>ShopEasy</h1>
          <p className='text-emerald-100 text-lg mb-12'>Your favourite online store</p>

          {/* Features */}
          <div className='space-y-5 text-left'>
            {[
              { icon: Zap,     text: 'Lightning fast checkout experience' },
              { icon: Shield,  text: 'Secure payments & data protection' },
              { icon: Truck,   text: 'Free shipping on all orders' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className='flex items-center gap-4'>
                <div className='w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0'>
                  <Icon className='w-5 h-5 text-white' />
                </div>
                <p className='text-emerald-50 font-medium'>{text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className='w-full lg:w-1/2 bg-gradient-to-br from-emerald-50 to-green-100 flex items-center justify-center px-6 py-12'>
        <div className='w-full max-w-md'>

          {/* Mobile logo */}
          <div className='lg:hidden flex items-center gap-3 mb-8'>
            <div className='w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center'>
              <ShoppingBag className='w-5 h-5 text-white' />
            </div>
            <span className='text-2xl font-bold text-gray-800'>ShopEasy</span>
          </div>

          <div className='bg-white rounded-3xl shadow-2xl p-8'>
            <div className='mb-8'>
              <h2 className='text-3xl font-bold text-gray-800 mb-1'>Welcome back 👋</h2>
              <p className='text-gray-500 text-sm'>Sign in to your account to continue</p>
            </div>

            {/* Error */}
            {error && (
              <div className='flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm font-medium'>
                <span className='text-red-500 text-base'>⚠</span> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className='space-y-5'>

              {/* Email */}
              <div>
                <label className='block text-sm font-semibold text-gray-700 mb-1.5'>Email Address</label>
                <div className='relative'>
                  <Mail className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' />
                  <input
                    type='email' name='email' value={formData.email} onChange={handleChange}
                    placeholder='your@email.com' required
                    className='w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all text-sm'
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className='block text-sm font-semibold text-gray-700 mb-1.5'>Password</label>
                <div className='relative'>
                  <Lock className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' />
                  <input
                    type={showPass ? 'text' : 'password'} name='password' value={formData.password} onChange={handleChange}
                    placeholder='Enter your password' required
                    className='w-full pl-10 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all text-sm'
                  />
                  <button type='button' onClick={() => setShowPass(p => !p)}
                    className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-emerald-600 transition-colors'>
                    {showPass ? <EyeOff className='w-4 h-4' /> : <Eye className='w-4 h-4' />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button type='submit' disabled={loading}
                className='w-full py-3.5 bg-gradient-to-r from-emerald-600 to-cyan-500 text-white font-bold text-base rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed mt-2'>
                {loading
                  ? <span className='flex items-center justify-center gap-2'><span className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />Signing in...</span>
                  : 'Sign In'}
              </button>
            </form>

            <div className='mt-6 pt-6 border-t border-gray-100 text-center'>
              <p className='text-gray-500 text-sm'>
                Don't have an account?{' '}
                <button onClick={() => navigate('/register')}
                  className='text-emerald-600 font-bold hover:text-emerald-700 transition-colors'>
                  Create one →
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login


