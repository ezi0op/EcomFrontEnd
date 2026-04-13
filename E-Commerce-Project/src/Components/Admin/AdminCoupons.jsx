import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Ticket, Plus, Trash2, CheckCircle, XCircle, Lock, Unlock, RefreshCw, ArrowUpCircle } from 'lucide-react'

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [increaseModal, setIncreaseModal] = useState({ show: false, id: null, limit: '' })

  const [formData, setFormData] = useState({
    code: '',
    discount: '',
    minAmount: '',
    maxDiscount: '',
    type: 'PERCENTAGE', // or FIXED
    usageLimit: '',
    expiryDate: ''
  })

  useEffect(() => {
    fetchCoupons()
  }, [])

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  const fetchCoupons = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await axios.get('https://e-commerceweb-back.onrender.com/admin/coupons', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.data.success) {
        setCoupons(res.data.data || [])
      }
    } catch (err) {
      console.error('Failed to fetch coupons', err)
      showToast('Failed to load coupons', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleCreateCoupon = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Basic validation
    if (!formData.code || !formData.discount || !formData.minAmount || !formData.usageLimit || !formData.expiryDate) {
      showToast('Please fill all required fields', 'error')
      setIsSubmitting(false)
      return
    }

    try {
      const token = localStorage.getItem('token')
      const payload = {
        code: formData.code.toUpperCase(),
        discount: parseFloat(formData.discount),
        minAmount: parseFloat(formData.minAmount),
        maxDiscount: formData.type === 'PERCENTAGE' ? parseFloat(formData.maxDiscount || formData.discount) : null,
        type: formData.type,
        usageLimit: parseInt(formData.usageLimit),
        active: true,
        expiryDate: formData.expiryDate + 'T23:59:59' // Append time to make it LocalDateTime compatible if backend expects it, or LocalDate handles format YYYY-MM-DD
      }

      const res = await axios.post('https://e-commerceweb-back.onrender.com/admin/coupon', payload, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (res.data.success) {
        showToast('Coupon created successfully', 'success')
        setFormData({
          code: '', discount: '', minAmount: '', maxDiscount: '', type: 'PERCENTAGE', usageLimit: '', expiryDate: ''
        })
        fetchCoupons() // Refresh list
      }
    } catch (err) {
      console.error(err)
      showToast(err.response?.data?.message || 'Failed to create coupon', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggleStatus = async (id) => {
    try {
      const token = localStorage.getItem('token')
      const res = await axios.put(`https://e-commerceweb-back.onrender.com/admin/coupon/${id}/toggle`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.data.success) {
        showToast(res.data.message || 'Coupon status updated successfully', 'success')
        fetchCoupons()
      }
    } catch (err) {
      showToast('Failed to update coupon status', 'error')
    }
  }

  const handleIncreaseLimit = (id) => {
    setIncreaseModal({ show: true, id, limit: '' })
  }

  const submitIncreaseLimit = async () => {
    const amount = parseInt(increaseModal.limit)
    if (isNaN(amount) || amount <= 0) return

    try {
      const token = localStorage.getItem('token')
      const res = await axios.put(`https://e-commerceweb-back.onrender.com/admin/coupon/${increaseModal.id}/increase-limit/${amount}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.data.success) {
        showToast(`Coupon usage limit increased by ${amount}`, 'success')
        fetchCoupons()
        setIncreaseModal({ show: false, id: null, limit: '' })
      }
    } catch (err) {
      showToast('Failed to increase limit', 'error')
    }
  }

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('token')
      const res = await axios.delete(`https://e-commerceweb-back.onrender.com/admin/coupon/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.data.success) {
        showToast('Coupon deleted successfully', 'success')
        fetchCoupons()
      }
    } catch (err) {
      showToast('Failed to delete coupon', 'error')
    }
  }

  return (
    <div className='animate-fade-in relative'>
      {/* Floating Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-[9999] flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl text-white font-semibold text-sm transition-all
          ${toast.type === 'success' ? 'bg-gradient-to-r from-emerald-500 to-emerald-600' : 'bg-gradient-to-r from-red-500 to-red-600'}`}>
          {toast.type === 'success' ? <CheckCircle className='w-5 h-5' /> : <XCircle className='w-5 h-5' />}
          {toast.msg}
          <button onClick={() => setToast(null)} className='ml-2 opacity-70 hover:opacity-100 transition-opacity'>✕</button>
        </div>
      )}

      {/* Custom Increase Limit Modal */}
      {increaseModal.show && (
        <div className='fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 shadow-2xl'>
          <div className='bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 transform scale-100 transition-transform'>
            <h3 className='text-lg font-bold text-gray-800 mb-2'>Increase Usage Limit</h3>
            <p className='text-sm text-gray-500 mb-5'>How many more users should be able to use this coupon?</p>
            <input 
              type='number' 
              min='1'
              value={increaseModal.limit} 
              onChange={e => setIncreaseModal(p => ({ ...p, limit: e.target.value }))}
              placeholder='e.g. 50' 
              className='w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none mb-6 font-bold text-blue-700'
            />
            <div className='flex justify-end gap-3'>
              <button 
                onClick={() => setIncreaseModal({ show: false, id: null, limit: '' })} 
                className='px-5 py-2.5 text-gray-600 font-semibold hover:bg-gray-100 rounded-xl transition-colors'>
                Cancel
              </button>
              <button 
                onClick={submitIncreaseLimit} 
                disabled={!increaseModal.limit || parseInt(increaseModal.limit) <= 0}
                className='px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100'>
                Increase Limit
              </button>
            </div>
          </div>
        </div>
      )}

      <div className='flex justify-between items-end mb-6'>
        <div>
          <h2 className='text-3xl font-bold text-gray-800 tracking-tight'>Coupon Management</h2>
          <p className='text-gray-500 mt-1'>Create and manage discount codes for your customers.</p>
        </div>
        <button onClick={fetchCoupons} className='flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 shadow-sm rounded-lg hover:bg-gray-50 text-gray-600 font-semibold transition-all'>
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8'>
        {/* Create Coupon Form */}
        <div className='bg-white rounded-2xl shadow-sm border border-emerald-100 p-6 lg:col-span-1 border-t-4 border-t-emerald-500 h-fit'>
          <div className='flex items-center gap-3 mb-5'>
            <div className='w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center'>
              <Ticket className='w-5 h-5 text-emerald-600' />
            </div>
            <h3 className='text-lg font-bold text-gray-800'>New Promo Code</h3>
          </div>

          <form onSubmit={handleCreateCoupon} className='space-y-4'>
            <div>
              <label className='block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1'>Coupon Code *</label>
              <input type='text' name='code' value={formData.code} onChange={handleInputChange} required placeholder='e.g. SUMMER20' className='w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none uppercase font-bold text-emerald-700' />
            </div>

            <div className='grid grid-cols-2 gap-3'>
              <div>
                <label className='block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1'>Type *</label>
                <select name='type' value={formData.type} onChange={handleInputChange} className='w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none'>
                  <option value='PERCENTAGE'>% Percentage</option>
                  <option value='FIXED'>$ Fixed Amount</option>
                </select>
              </div>
              <div>
                <label className='block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1'>Discount *</label>
                <input type='number' name='discount' value={formData.discount} onChange={handleInputChange} required min='1' step='0.01' placeholder={formData.type === 'PERCENTAGE' ? '%' : '$'} className='w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none' />
              </div>
            </div>

            {formData.type === 'PERCENTAGE' && (
              <div>
                <label className='block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1'>Max Discount ($) <span className='text-gray-400 font-normal lowercase'>(optional)</span></label>
                <input type='number' name='maxDiscount' value={formData.maxDiscount} onChange={handleInputChange} min='1' step='0.01' placeholder='No limit' className='w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none' />
              </div>
            )}

            <div>
              <label className='block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1'>Min Cart Amount ($) *</label>
              <input type='number' name='minAmount' value={formData.minAmount} onChange={handleInputChange} required min='0' step='0.01' placeholder='0.00' className='w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none' />
            </div>

            <div className='grid grid-cols-2 gap-3'>
              <div>
                <label className='block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1'>Usage Limit *</label>
                <input type='number' name='usageLimit' value={formData.usageLimit} onChange={handleInputChange} required min='1' placeholder='100' className='w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none' />
              </div>
              <div>
                <label className='block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1'>Expiry Date *</label>
                <input type='date' name='expiryDate' value={formData.expiryDate} onChange={handleInputChange} required min={new Date().toISOString().split('T')[0]} className='w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none' />
              </div>
            </div>

            <button type='submit' disabled={isSubmitting} className='w-full py-3 mt-2 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2'>
              {isSubmitting ? <span className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin' /> : <Plus className='w-5 h-5' />}
              {isSubmitting ? 'Creating...' : 'Create Coupon'}
            </button>
          </form>
        </div>

        {/* Existing Coupons Table */}
        <div className='bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden lg:col-span-2 flex flex-col'>
          <div className='overflow-x-auto flex-1'>
            <table className='w-full text-left border-collapse'>
              <thead>
                <tr className='bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500 font-bold'>
                  <th className='p-4'>Code</th>
                  <th className='p-4'>Discount</th>
                  <th className='p-4 hidden md:table-cell'>Min Amount</th>
                  <th className='p-4'>Usage</th>
                  <th className='p-4'>Status</th>
                  <th className='p-4 text-right'>Actions</th>
                </tr>
              </thead>
              <tbody className='text-sm'>
                {loading ? (
                  <tr><td colSpan="6" className='p-8 text-center text-gray-500'>Loading coupons...</td></tr>
                ) : coupons.length === 0 ? (
                  <tr><td colSpan="6" className='p-8 text-center text-gray-500'>No coupons created yet.</td></tr>
                ) : (
                  coupons.map(coupon => {
                    const isExpired = new Date(coupon.expiryDate) < new Date()
                    const isActive = coupon.active && !isExpired && coupon.usedCount < coupon.usageLimit

                    return (
                      <tr key={coupon.id} className='border-b border-gray-100 hover:bg-gray-50 transition-colors'>
                        <td className='p-4'>
                          <span className='font-extrabold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100 tracking-wider'>
                            {coupon.code}
                          </span>
                        </td>
                        <td className='p-4 font-bold text-gray-700'>
                          {coupon.type === 'PERCENTAGE' ? `${coupon.discount}% max $${coupon.maxDiscount}` : `$${coupon.discount}`}
                        </td>
                        <td className='p-4 font-medium text-gray-500 hidden md:table-cell'>
                          ${coupon.minAmount}
                        </td>
                        <td className='p-4'>
                          <div className='font-semibold text-gray-700'>{coupon.usedCount} / {coupon.usageLimit}</div>
                          <div className='w-full bg-gray-200 rounded-full h-1.5 mt-1'>
                            <div className='bg-emerald-500 h-1.5 rounded-full' style={{ width: `${Math.min((coupon.usedCount / coupon.usageLimit) * 100, 100)}%` }}></div>
                          </div>
                        </td>
                        <td className='p-4'>
                          {!coupon.active ? (
                            <span className='px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600'>Disabled</span>
                          ) : isExpired ? (
                            <span className='px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700'>Expired</span>
                          ) : coupon.usedCount >= coupon.usageLimit ? (
                            <span className='px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700'>Used Up</span>
                          ) : (
                            <span className='px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 mx-auto flex w-fit items-center gap-1'><span className='w-1.5 h-1.5 bg-emerald-500 rounded-full'></span> Active</span>
                          )}
                        </td>
                        <td className='p-4 text-right space-x-2 whitespace-nowrap'>
                          <button onClick={() => handleIncreaseLimit(coupon.id)} title="Increase Usage Limit" className='p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors'>
                            <ArrowUpCircle className='w-5 h-5' />
                          </button>
                          <button onClick={() => handleToggleStatus(coupon.id)} title={coupon.active ? "Block Coupon" : "Unblock Coupon"} 
                            className={`p-2 rounded-lg transition-colors ${coupon.active ? 'text-amber-500 hover:bg-amber-50' : 'text-emerald-500 hover:bg-emerald-50'}`}>
                            {coupon.active ? <Lock className='w-5 h-5' /> : <Unlock className='w-5 h-5' />}
                          </button>
                          <button onClick={() => handleDelete(coupon.id)} title="Delete Coupon" className='p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors'>
                            <Trash2 className='w-5 h-5' />
                          </button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminCoupons


