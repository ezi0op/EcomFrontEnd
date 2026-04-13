import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock, User, Phone, MapPin, Camera, ShoppingBag, Zap, Shield, Truck, Link } from 'lucide-react'

const Register = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', mobile: '', address: '', image: ''
  })
  const [imagePreview, setImagePreview] = useState(null)
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [toast, setToast]     = useState(null)

  useEffect(() => {
    if (localStorage.getItem('token')) navigate('/')
  }, [navigate])

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(p => ({ ...p, [name]: value }))
    if (name === 'password' || name === 'mobile') setError('')
  }

  // Password strength
  const pwStrength = (() => {
    const p = formData.password
    if (!p) return null
    if (p.length < 4) return { label: 'Weak', color: 'bg-red-400', width: 'w-1/4' }
    if (p.length < 6) return { label: 'Fair', color: 'bg-amber-400', width: 'w-2/4' }
    if (p.length < 9) return { label: 'Good', color: 'bg-emerald-400', width: 'w-3/4' }
    return { label: 'Strong', color: 'bg-emerald-600', width: 'w-full' }
  })()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Client-side validation matching backend constraints
    if (formData.password.length < 6 || formData.password.length > 10) {
      setError('Password must be 6 to 10 characters')
      return
    }
    if (!/^[0-9]{10}$/.test(formData.mobile)) {
      setError('Mobile number must be exactly 10 digits')
      return
    }

    setLoading(true)
    try {
      const res = await axios.post('https://e-commerceweb-back.onrender.com/auth/register', {
        name:     formData.name,
        email:    formData.email,
        password: formData.password,
        mobile:   formData.mobile,
        address:  formData.address,
        image:    formData.image,
        role:     'USER',
        active:   true,
      })
      if (res.data.success) {
        showToast('Account created! Please sign in. 🎉')
        setTimeout(() => navigate('/login'), 1500)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.')
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
      <div className='hidden lg:flex lg:w-1/2 bg-gradient-to-br from-cyan-600 via-teal-600 to-emerald-600 flex-col items-center justify-center p-12 relative overflow-hidden'>
        <div className='absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full translate-x-32 -translate-y-32' />
        <div className='absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full -translate-x-32 translate-y-32' />

        <div className='relative z-10 text-center text-white'>
          <div className='w-24 h-24 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl border border-white/30'>
            <ShoppingBag className='w-12 h-12 text-white' />
          </div>
          <h1 className='text-4xl font-bold mb-2'>Join ShopEasy</h1>
          <p className='text-emerald-100 text-lg mb-12'>Create your account in seconds</p>

          <div className='space-y-5 text-left'>
            {[
              { icon: Zap,    text: 'Shop thousands of products' },
              { icon: Shield, text: '100% secure & private' },
              { icon: Truck,  text: 'Track every order in real-time' },
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
      <div className='w-full lg:w-1/2 bg-gradient-to-br from-emerald-50 to-green-100 flex items-center justify-center px-6 py-10 overflow-y-auto'>
        <div className='w-full max-w-md'>

          {/* Mobile logo */}
          <div className='lg:hidden flex items-center gap-3 mb-8'>
            <div className='w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center'>
              <ShoppingBag className='w-5 h-5 text-white' />
            </div>
            <span className='text-2xl font-bold text-gray-800'>ShopEasy</span>
          </div>

          <div className='bg-white rounded-3xl shadow-2xl p-8'>
            <div className='mb-6'>
              <h2 className='text-3xl font-bold text-gray-800 mb-1'>Create Account ✨</h2>
              <p className='text-gray-500 text-sm'>Fill in your details to get started</p>
            </div>

            {/* Error */}
            {error && (
              <div className='flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-5 text-sm font-medium'>
                <span className='text-red-500'>⚠</span> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className='space-y-4'>

              {/* Profile Image URL */}
              <div>
                <label className='flex items-center gap-2 text-sm font-bold text-gray-700 mb-1.5'>
                  <Link className='w-4 h-4 text-emerald-600' /> Profile Image URL
                  <span className='text-xs font-normal text-gray-400'>(paste any image link)</span>
                </label>
                <div className='flex gap-3 items-start'>
                  <div className='flex-1 relative'>
                    <input
                      type='url'
                      name='image'
                      value={formData.image}
                      onChange={(e) => {
                        const url = e.target.value
                        setFormData(p => ({ ...p, image: url }))
                        setImagePreview(url || null)
                      }}
                      placeholder='https://example.com/photo.jpg'
                      className='w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all text-sm'
                    />
                  </div>
                  {/* Live preview thumbnail */}
                  {formData.image ? (
                    <img
                      src={formData.image}
                      alt='Preview'
                      onError={(e) => { e.target.style.display = 'none' }}
                      onLoad={(e)  => { e.target.style.display = 'block' }}
                      className='w-12 h-12 rounded-xl object-cover border-2 border-gray-200 flex-shrink-0'
                    />
                  ) : (
                    <div className='w-12 h-12 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center flex-shrink-0'>
                      <Camera className='w-5 h-5 text-gray-300' />
                    </div>
                  )}
                </div>
              </div>

              {/* Name */}
              <div>
                <label className='block text-sm font-semibold text-gray-700 mb-1.5'>Full Name</label>
                <div className='relative'>
                  <User className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' />
                  <input type='text' name='name' value={formData.name} onChange={handleChange}
                    placeholder='John Doe' required
                    className='w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all text-sm' />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className='block text-sm font-semibold text-gray-700 mb-1.5'>Email Address</label>
                <div className='relative'>
                  <Mail className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' />
                  <input type='email' name='email' value={formData.email} onChange={handleChange}
                    placeholder='your@email.com' required
                    className='w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all text-sm' />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className='block text-sm font-semibold text-gray-700 mb-1.5'>Password <span className='text-gray-400 font-normal text-xs'>(6–10 characters)</span></label>
                <div className='relative'>
                  <Lock className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' />
                  <input type={showPass ? 'text' : 'password'} name='password' value={formData.password} onChange={handleChange}
                    placeholder='Create a password' required
                    className='w-full pl-10 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all text-sm' />
                  <button type='button' onClick={() => setShowPass(p => !p)}
                    className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-emerald-600 transition-colors'>
                    {showPass ? <EyeOff className='w-4 h-4' /> : <Eye className='w-4 h-4' />}
                  </button>
                </div>
                {/* Password strength bar */}
                {pwStrength && (
                  <div className='mt-2'>
                    <div className='h-1.5 bg-gray-100 rounded-full overflow-hidden'>
                      <div className={`h-full rounded-full transition-all duration-300 ${pwStrength.color} ${pwStrength.width}`} />
                    </div>
                    <p className={`text-xs mt-1 font-medium ${pwStrength.label === 'Weak' ? 'text-red-500' : pwStrength.label === 'Fair' ? 'text-amber-500' : 'text-emerald-600'}`}>
                      {pwStrength.label}
                    </p>
                  </div>
                )}
              </div>

              {/* Mobile */}
              <div>
                <label className='block text-sm font-semibold text-gray-700 mb-1.5'>Mobile Number <span className='text-gray-400 font-normal text-xs'>(10 digits)</span></label>
                <div className='relative'>
                  <Phone className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' />
                  <input type='tel' name='mobile' value={formData.mobile} onChange={handleChange}
                    placeholder='9876543210' maxLength={10} required
                    className='w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all text-sm' />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className='block text-sm font-semibold text-gray-700 mb-1.5'>Address <span className='text-gray-400 font-normal'>(optional)</span></label>
                <div className='relative'>
                  <MapPin className='absolute left-3 top-3.5 w-4 h-4 text-gray-400' />
                  <textarea name='address' value={formData.address} onChange={handleChange}
                    placeholder='Your delivery address...' rows={2}
                    className='w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all text-sm resize-none' />
                </div>
              </div>

              {/* Submit */}
              <button type='submit' disabled={loading}
                className='w-full py-3.5 bg-gradient-to-r from-emerald-600 to-cyan-500 text-white font-bold text-base rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed mt-2'>
                {loading
                  ? <span className='flex items-center justify-center gap-2'><span className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />Creating account...</span>
                  : 'Create Account'}
              </button>
            </form>

            <div className='mt-6 pt-6 border-t border-gray-100 text-center'>
              <p className='text-gray-500 text-sm'>
                Already have an account?{' '}
                <button onClick={() => navigate('/login')}
                  className='text-emerald-600 font-bold hover:text-emerald-700 transition-colors'>
                  Sign in →
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register


