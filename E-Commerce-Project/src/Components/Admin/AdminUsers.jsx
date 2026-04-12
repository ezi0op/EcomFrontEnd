import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Trash2, Shield, ShieldOff, Loader, Search, CheckCircle, XCircle, AlertTriangle, X } from 'lucide-react'

const AdminUsers = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [toast, setToast] = useState(null)
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, userId: null })

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await axios.get('https://e-commerce-project-backend-fq6y.onrender.com/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.data.success) {
        setUsers(res.data.data || [])
      }
    } catch (err) {
      console.error('Failed to fetch users', err)
    } finally {
      setLoading(false)
    }
  }

  const toggleStatus = async (userId, currentStatus) => {
    try {
      const token = localStorage.getItem('token')
      await axios.put(`https://e-commerce-project-backend-fq6y.onrender.com/admin/user/status/${userId}`, 
        { active: !currentStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      // Optimistically update
      setUsers(users.map(u => u.id === userId ? { ...u, active: !currentStatus } : u))
      showToast(currentStatus ? 'User successfully blocked' : 'User successfully activated', 'success')
    } catch (err) {
      showToast('Failed to update user status', 'error')
    }
  }

  const deleteUser = (userId) => {
    setConfirmModal({ isOpen: true, userId })
  }

  const handleDeleteConfirm = async () => {
    try {
      const token = localStorage.getItem('token')
      await axios.delete(`https://e-commerce-project-backend-fq6y.onrender.com/admin/user/${confirmModal.userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setUsers(users.filter(u => u.id !== confirmModal.userId))
      showToast('User deleted permanently', 'success')
      setConfirmModal({ isOpen: false, userId: null })
    } catch (err) {
      showToast('Failed to delete user', 'error')
      setConfirmModal({ isOpen: false, userId: null })
    }
  }

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
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
          <button onClick={() => setToast(null)} className='ml-2 opacity-70 hover:opacity-100 transition-opacity'><X className='w-4 h-4' /></button>
        </div>
      )}

      {/* ── Confirmation Modal ── */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl transform transition-all scale-100 opacity-100">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Delete User?</h3>
                <p className="text-sm text-gray-500 mt-1">This action is permanent and cannot be undone.</p>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setConfirmModal({ isOpen: false, userId: null })} className="px-4 py-2 font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                Cancel
              </button>
              <button onClick={handleDeleteConfirm} className="px-4 py-2 font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors shadow-md">
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}

      <div className='flex justify-between items-end mb-6'>
        <div>
          <h2 className='text-3xl font-bold text-gray-800'>Customer Management</h2>
          <p className='text-gray-500 mt-1'>View and manage all registered users.</p>
        </div>
        <div className='flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm'>
          <Search className='w-5 h-5 text-gray-400' />
          <input 
            type='text' 
            placeholder='Search users...' 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='outline-none bg-transparent'
          />
        </div>
      </div>

      <div className='bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden'>
        <table className='w-full text-left border-collapse'>
          <thead>
            <tr className='bg-gray-50 border-b border-gray-200'>
              <th className='p-4 font-semibold text-gray-600'>Name</th>
              <th className='p-4 font-semibold text-gray-600'>Email</th>
              <th className='p-4 font-semibold text-gray-600'>Role</th>
              <th className='p-4 font-semibold text-gray-600 text-center'>Status</th>
              <th className='p-4 font-semibold text-gray-600 text-right'>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user.id} className='border-b border-gray-100 hover:bg-gray-50 transition-colors'>
                <td className='p-4'>
                  <div className='flex items-center gap-3'>
                    <img src={user.image || 'https://via.placeholder.com/40'} alt={user.name} className='w-10 h-10 rounded-full object-cover border border-gray-200' />
                    <span className='font-semibold text-gray-800'>{user.name}</span>
                  </div>
                </td>
                <td className='p-4 text-gray-600'>{user.email}</td>
                <td className='p-4 text-gray-600'>
                  <span className={`px-2 py-1 rounded text-xs font-bold ${user.role === 'ROLE_ADMIN' || user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>
                    {user.role}
                  </span>
                </td>
                <td className='p-4 text-center'>
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${user.active ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                    {user.active ? 'Active' : 'Blocked'}
                  </span>
                </td>
                <td className='p-4 text-right space-x-2'>
                  {!(user.role === 'ROLE_ADMIN' || user.role === 'ADMIN') ? (
                    <>
                      <button 
                        onClick={() => toggleStatus(user.id, user.active)}
                        title={user.active ? 'Block User' : 'Activate User'}
                        className={`p-2 rounded-lg transition-colors ${user.active ? 'text-amber-500 hover:bg-amber-50' : 'text-emerald-500 hover:bg-emerald-50'}`}
                      >
                        {user.active ? <ShieldOff className='w-5 h-5' /> : <Shield className='w-5 h-5' />}
                      </button>
                      <button 
                        onClick={() => deleteUser(user.id)}
                        className='p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors'
                        title='Delete User'
                      >
                        <Trash2 className='w-5 h-5' />
                      </button>
                    </>
                  ) : (
                    <div className='flex justify-end'>
                      <span className='text-purple-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 bg-purple-50 px-3 py-1.5 rounded-lg'>
                        <Shield className='w-4 h-4' /> Protected
                      </span>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan='5' className='p-8 text-center text-gray-500'>No users found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default AdminUsers
