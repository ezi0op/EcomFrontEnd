import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
const API_URL = import.meta.env.VITE_API_URL;
import {
  ArrowLeft, User, Phone, MapPin, Camera, Save, Edit2,
  Mail, Shield, CheckCircle, XCircle, Lock, Link
} from 'lucide-react'

const Update = () => {
  const navigate = useNavigate()
  const [isEditMode, setIsEditMode]   = useState(false)
  const [initialLoad, setInitialLoad] = useState(true)
  const [loading, setLoading]         = useState(false)
  const [toast, setToast]             = useState(null)
  const [evicted, setEvicted]         = useState(false)

  // Full user data from GET /users/{id}
  const [user, setUser]           = useState(null)
  // Only editable fields matching UpdateUserDTO: name, address, mobile, image
  const [form, setForm]           = useState({ name: '', address: '', mobile: '', image: '' })
  const [formOriginal, setFormOriginal] = useState({})
  const [imagePreview, setImagePreview] = useState(null)

  const userId = localStorage.getItem('userId')
  const token  = localStorage.getItem('token')

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  useEffect(() => {
    if (!userId || !token) { navigate('/login'); return }
    fetchUser()
  }, [])

  const fetchUser = async () => {
    try {
      const res = await axios.get(`http://13.53.206.121:8080/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const u = res.data.data
      
      // Ensure blocked users are evicted if they try to view their profile
      if (u && u.active === false) {
         localStorage.clear()
         setEvicted(true)
         return
      }

      setUser(u)
      // Only map UpdateUserDTO fields for the form
      const editable = {
        name:    u.name    || '',
        address: u.address || '',
        mobile:  u.mobile  || '',
        image:   u.image   || '',
      }
      setForm(editable)
      setFormOriginal(editable)
      setImagePreview(u.image || null)
    } catch {
      showToast('Failed to load profile data', 'error')
    } finally {
      setInitialLoad(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(p => ({ ...p, [name]: value }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => {
      setForm(p => ({ ...p, image: reader.result }))
      setImagePreview(reader.result)
    }
    reader.readAsDataURL(file)
  }

  const handleCancel = () => {
    setForm(formOriginal)
    setImagePreview(formOriginal.image || null)
    setIsEditMode(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.mobile && !/^[0-9]{10}$/.test(form.mobile)) {
      showToast('Mobile number must be exactly 10 digits', 'error')
      return
    }
    setLoading(true)
    try {
      // PUT /users/update/{id}  → UpdateUserDTO: name, address, mobile, image ONLY
      const res = await axios.put(
        `${API_URL}/users/update/${userId}`,
        { name: form.name, address: form.address, mobile: form.mobile, image: form.image },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (res.data.success) {
        setFormOriginal({ ...form })
        setIsEditMode(false)
        showToast('Profile updated successfully! ✓')
        // Refresh user data
        fetchUser()
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Update failed. Please try again.', 'error')
    } finally {
      setLoading(false)
    }
  }

  // ── Loading ────────────────────────────────────────────────────────────────
  if (initialLoad) return (
    <div className='min-h-screen bg-gradient-to-br from-emerald-50 to-green-100 flex items-center justify-center'>
      <div className='text-center'>
        <div className='w-16 h-16 border-4 border-emerald-300 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4' />
        <p className='text-lg font-semibold text-emerald-700'>Loading your profile…</p>
      </div>
    </div>
  )

  const avatarSrc = imagePreview || form.image || null

  return (
    <>
      {evicted && (
        <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
           <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl transform transition-all scale-100 opacity-100">
               <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5">
                   <Lock className="w-10 h-10 text-red-600" />
               </div>
               <h2 className="text-2xl font-bold text-gray-800 mb-2">Account Suspended</h2>
               <p className="text-sm text-gray-500 mb-6 px-2">Your access has been revoked by an administrator. You have been logged out of your session.</p>
               <button onClick={() => window.location.href = '/'} className="w-full py-3 bg-gradient-to-r from-red-600 to-red-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all">
                  Return to Store
               </button>
           </div>
        </div>
      )}

      <div className='min-h-screen bg-gradient-to-br from-emerald-50 to-green-100 py-10 px-4 relative'>

        {/* ── Floating Toast ── */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl text-white font-semibold text-sm transition-all
          ${toast.type === 'success' ? 'bg-gradient-to-r from-emerald-500 to-emerald-600' : 'bg-gradient-to-r from-red-500 to-red-600'}`}>
          {toast.type === 'success' ? <CheckCircle className='w-5 h-5' /> : <XCircle className='w-5 h-5' />}
          {toast.msg}
          <button onClick={() => setToast(null)} className='ml-1 opacity-70 hover:opacity-100'>✕</button>
        </div>
      )}

      <div className='max-w-3xl mx-auto'>

        {/* ── Page header ── */}
        <div className='flex items-center gap-4 mb-8'>
          <button onClick={() => navigate('/')}
            className='p-2 hover:bg-white hover:shadow-md rounded-xl transition-all'>
            <ArrowLeft className='w-6 h-6 text-emerald-600' />
          </button>
          <div className='flex-1'>
            <h1 className='text-3xl font-bold text-gray-800'>
              My <span className='text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-cyan-500'>Profile</span>
            </h1>
            <p className='text-gray-500 text-sm mt-0.5'>Manage your account details</p>
          </div>
          {!isEditMode && (
            <button onClick={() => setIsEditMode(true)}
              className='flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-cyan-500 text-white font-semibold rounded-xl hover:shadow-lg hover:scale-105 transition-all'>
              <Edit2 className='w-4 h-4' /> Edit Profile
            </button>
          )}
        </div>

        {/* ── Main card ── */}
        <div className='bg-white rounded-3xl shadow-2xl overflow-hidden'>

          {/* ── Hero banner + avatar ── */}
          <div className='bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 h-32 relative'>
            <div className='absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.15),_transparent_60%)]' />
          </div>

          {/* Avatar (overlaps banner) */}
          <div className='px-8 pb-6 relative'>
            <div className='flex items-end gap-5 -mt-12 mb-5'>
              <div className='relative flex-shrink-0'>
                {avatarSrc ? (
                  <img src={avatarSrc} alt='Avatar'
                    className='w-24 h-24 rounded-2xl border-4 border-white shadow-xl object-cover' />
                ) : (
                  <div className='w-24 h-24 rounded-2xl border-4 border-white shadow-xl bg-gradient-to-br from-emerald-200 to-cyan-200 flex items-center justify-center'>
                    <User className='w-12 h-12 text-emerald-600' />
                  </div>
                )}
                {/* No camera button — use URL input in form below */}
              </div>
              <div className='pb-1'>
                <h2 className='text-2xl font-bold text-gray-800'>{form.name || '—'}</h2>
                <div className='flex items-center gap-2'>
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${user?.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-emerald-100 text-emerald-700'}`}>
                    {user?.role || 'USER'}
                  </span>
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${user?.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {user?.active ? '● Active' : '○ Inactive'}
                  </span>
                </div>
              </div>
            </div>

            {/* ── View mode ── */}
            {!isEditMode ? (
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                {[
                  { icon: Mail,   label: 'Email',   value: user?.email,   locked: true },
                  { icon: Phone,  label: 'Mobile',  value: form.mobile || 'Not set' },
                  { icon: MapPin, label: 'Address', value: form.address || 'Not set', full: true },
                ].map(({ icon: Icon, label, value, locked, full }) => (
                  <div key={label} className={`bg-gray-50 rounded-2xl p-4 border border-gray-100 ${full ? 'md:col-span-2' : ''}`}>
                    <div className='flex items-center gap-2 mb-1'>
                      <Icon className='w-4 h-4 text-emerald-600' />
                      <span className='text-xs font-bold text-gray-500 uppercase tracking-wide'>{label}</span>
                      {locked && <Lock className='w-3 h-3 text-gray-400 ml-auto' />}
                    </div>
                    <p className='text-gray-800 font-semibold text-sm'>{value}</p>
                  </div>
                ))}
              </div>
            ) : (
              /* ── Edit mode ── */
              <form onSubmit={handleSubmit} className='space-y-5'>

                {/* Read-only: Email */}
                <div>
                  <label className='flex items-center gap-2 text-sm font-bold text-gray-600 mb-1.5'>
                    <Mail className='w-4 h-4 text-gray-400' /> Email
                    <span className='text-xs font-normal text-gray-400 ml-1'>(cannot be changed)</span>
                  </label>
                  <input value={user?.email || ''} readOnly
                    className='w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl text-gray-500 cursor-not-allowed text-sm' />
                </div>

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
                        value={form.image}
                        onChange={(e) => {
                          const url = e.target.value
                          setForm(p => ({ ...p, image: url }))
                          setImagePreview(url || null)
                        }}
                        placeholder='https://example.com/photo.jpg'
                        className='w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all text-sm'
                      />
                    </div>
                    {/* Live preview thumbnail */}
                    {form.image ? (
                      <img
                        src={form.image}
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
                  <p className='text-xs text-gray-400 mt-1.5'>The URL will be saved directly and shown as your profile photo</p>
                </div>

                {/* Name */}
                <div>
                  <label className='flex items-center gap-2 text-sm font-bold text-gray-700 mb-1.5'>
                    <User className='w-4 h-4 text-emerald-600' /> Full Name
                  </label>
                  <input type='text' name='name' value={form.name} onChange={handleChange} required
                    placeholder='Your full name'
                    className='w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all text-sm' />
                </div>

                {/* Mobile */}
                <div>
                  <label className='flex items-center gap-2 text-sm font-bold text-gray-700 mb-1.5'>
                    <Phone className='w-4 h-4 text-emerald-600' /> Mobile
                    <span className='text-xs font-normal text-gray-400'>(10 digits)</span>
                  </label>
                  <input type='tel' name='mobile' value={form.mobile} onChange={handleChange}
                    placeholder='9876543210' maxLength={10}
                    className='w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all text-sm' />
                </div>

                {/* Address */}
                <div>
                  <label className='flex items-center gap-2 text-sm font-bold text-gray-700 mb-1.5'>
                    <MapPin className='w-4 h-4 text-emerald-600' /> Address
                  </label>
                  <textarea name='address' value={form.address} onChange={handleChange} rows={3}
                    placeholder='Your delivery address…'
                    className='w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all text-sm resize-none' />
                </div>

                {/* Read-only: Role */}
                <div>
                  <label className='flex items-center gap-2 text-sm font-bold text-gray-600 mb-1.5'>
                    <Shield className='w-4 h-4 text-gray-400' /> Account Role
                    <span className='text-xs font-normal text-gray-400 ml-1'>(cannot be changed)</span>
                  </label>
                  <input value={user?.role || 'USER'} readOnly
                    className='w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl text-gray-500 cursor-not-allowed text-sm' />
                </div>

                {/* Action buttons */}
                <div className='flex gap-3 pt-4 border-t border-gray-100'>
                  <button type='submit' disabled={loading}
                    className='flex-1 py-3 bg-gradient-to-r from-emerald-600 to-cyan-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2'>
                    {loading
                      ? <><span className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />Saving…</>
                      : <><Save className='w-4 h-4' /> Save Changes</>}
                  </button>
                  <button type='button' onClick={handleCancel}
                    className='px-6 py-3 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all'>
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* ── Quick nav cards ── */}
        {user?.role !== 'ADMIN' && user?.role !== 'ROLE_ADMIN' && (
          <div className='grid grid-cols-2 gap-4 mt-6'>
            <button onClick={() => navigate('/cart')}
              className='bg-white rounded-2xl shadow-md p-5 flex items-center gap-3 hover:shadow-xl hover:scale-[1.02] transition-all text-left'>
              <div className='w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center'>
                <MapPin className='w-5 h-5 text-emerald-600' />
              </div>
              <div>
                <p className='font-bold text-gray-800 text-sm'>My Cart</p>
                <p className='text-xs text-gray-500'>View your cart</p>
              </div>
            </button>
            <button onClick={() => navigate('/orders')}
              className='bg-white rounded-2xl shadow-md p-5 flex items-center gap-3 hover:shadow-xl hover:scale-[1.02] transition-all text-left'>
              <div className='w-10 h-10 bg-cyan-100 rounded-xl flex items-center justify-center'>
                <CheckCircle className='w-5 h-5 text-cyan-600' />
              </div>
              <div>
                <p className='font-bold text-gray-800 text-sm'>My Orders</p>
                <p className='text-xs text-gray-500'>Track your orders</p>
              </div>
            </button>
          </div>
        )}
      </div>
      </div>
    </>
  )
}

export default Update

