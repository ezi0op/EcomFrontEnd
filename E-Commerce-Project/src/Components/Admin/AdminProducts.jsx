import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Trash2, Edit, Plus, Loader, Search, X, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'

const AdminProducts = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [toast, setToast] = useState(null)
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, productId: null })

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }
  
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    quantity: '',
    description: '',
    image: ''
  })

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await axios.get('https://e-commerce-project-backend-fq6y.onrender.com/admin/products', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.data.success) {
        setProducts(res.data.data || [])
      }
    } catch (err) {
      console.error('Failed to fetch products', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = (id) => {
    setConfirmModal({ isOpen: true, productId: id })
  }

  const handleDeleteConfirm = async () => {
    try {
      const token = localStorage.getItem('token')
      await axios.delete(`https://e-commerce-project-backend-fq6y.onrender.com/admin/product/${confirmModal.productId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setProducts(products.filter(p => p.id !== confirmModal.productId))
      showToast('Product deleted permanently', 'success')
      setConfirmModal({ isOpen: false, productId: null })
    } catch (err) {
      showToast('Failed to delete product', 'error')
      setConfirmModal({ isOpen: false, productId: null })
    }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      const payload = { ...formData, price: Number(formData.price), quantity: Number(formData.quantity) }
      
      if (editingProduct) {
        await axios.put(`https://e-commerce-project-backend-fq6y.onrender.com/admin/product/${editingProduct.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        })
      } else {
        await axios.post('https://e-commerce-project-backend-fq6y.onrender.com/admin/product', payload, {
          headers: { Authorization: `Bearer ${token}` }
        })
      }
      showToast(editingProduct ? 'Product successfully updated' : 'Product successfully created', 'success')
      setIsModalOpen(false)
      fetchProducts()
    } catch (err) {
      showToast('Failed to save product', 'error')
    }
  }

  const openModal = (product = null) => {
    if (product) {
      setEditingProduct(product)
      setFormData({
        name: product.name,
        category: product.category,
        price: product.price,
        quantity: product.quantity,
        description: product.description,
        image: product.image
      })
    } else {
      setEditingProduct(null)
      setFormData({ name: '', category: '', price: '', quantity: '', description: '', image: '' })
    }
    setIsModalOpen(true)
  }

  const filteredProducts = products.filter(p => 
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.category?.toLowerCase().includes(searchTerm.toLowerCase())
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
                <h3 className="text-lg font-bold text-gray-900">Delete Product?</h3>
                <p className="text-sm text-gray-500 mt-1">This action is permanent and cannot be undone.</p>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setConfirmModal({ isOpen: false, productId: null })} className="px-4 py-2 font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
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
          <h2 className='text-3xl font-bold text-gray-800'>Product Inventory</h2>
          <p className='text-gray-500 mt-1'>Manage your store catalog here.</p>
        </div>
        <div className='flex items-center gap-4'>
          <div className='flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm'>
            <Search className='w-5 h-5 text-gray-400' />
            <input 
              type='text' 
              placeholder='Search products...' 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='outline-none bg-transparent'
            />
          </div>
          <button 
            onClick={() => openModal()}
            className='flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors font-semibold shadow-sm'
          >
            <Plus className='w-5 h-5' /> Add Product
          </button>
        </div>
      </div>

      <div className='bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden'>
        <table className='w-full text-left border-collapse'>
          <thead>
            <tr className='bg-gray-50 border-b border-gray-200'>
              <th className='p-4 font-semibold text-gray-600 w-16'>Image</th>
              <th className='p-4 font-semibold text-gray-600'>Name</th>
              <th className='p-4 font-semibold text-gray-600'>Category</th>
              <th className='p-4 font-semibold text-gray-600'>Price</th>
              <th className='p-4 font-semibold text-gray-600'>Stock</th>
              <th className='p-4 font-semibold text-gray-600 text-right'>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map(product => (
              <tr key={product.id} className='border-b border-gray-100 hover:bg-gray-50 transition-colors'>
                <td className='p-4'>
                  <div className='w-12 h-12 rounded-lg overflow-hidden border border-gray-200 bg-white flex items-center justify-center'>
                    {product.image ? (
                      <img src={product.image} alt={product.name} className='w-full h-full object-cover' onError={(e) => {e.target.onerror = null; e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect width='100' height='100' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='12' fill='%239ca3af'%3ENo Img%3C/text%3E%3C/svg%3E";}} />
                    ) : (
                      <span className='text-xs text-gray-400'>N/A</span>
                    )}
                  </div>
                </td>
                <td className='p-4 font-semibold text-gray-800'>{product.name}</td>
                <td className='p-4 text-gray-600 capitalize'>{product.category}</td>
                <td className='p-4 font-bold text-emerald-600'>${product.price}</td>
                <td className='p-4'>
                  <span className={`px-2 py-1 rounded text-xs font-bold ${product.quantity > 5 ? 'bg-green-100 text-green-700' : product.quantity > 0 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                    {product.quantity} in stock
                  </span>
                </td>
                <td className='p-4 text-right space-x-2'>
                  <button 
                    onClick={() => openModal(product)}
                    className='p-2 rounded-lg text-blue-500 hover:bg-blue-50 transition-colors'
                    title='Edit Product'
                  >
                    <Edit className='w-5 h-5' />
                  </button>
                  <button 
                    onClick={() => handleDelete(product.id)}
                    className='p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors'
                    title='Delete Product'
                  >
                    <Trash2 className='w-5 h-5' />
                  </button>
                </td>
              </tr>
            ))}
            {filteredProducts.length === 0 && (
              <tr>
                <td colSpan='6' className='p-8 text-center text-gray-500'>No products found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className='fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in'>
          <div className='bg-white w-full max-w-2xl rounded-2xl shadow-2xl p-6'>
            <div className='flex justify-between items-center mb-6'>
              <h3 className='text-2xl font-bold text-gray-800'>{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
              <button onClick={() => setIsModalOpen(false)} className='text-gray-400 hover:text-red-500 transition-colors'><X className='w-6 h-6' /></button>
            </div>

            <form onSubmit={handleSave} className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-semibold text-gray-700 mb-1'>Product Name</label>
                  <input required type='text' value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none' />
                </div>
                <div>
                  <label className='block text-sm font-semibold text-gray-700 mb-1'>Category</label>
                  <input required type='text' value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none' />
                </div>
                <div>
                  <label className='block text-sm font-semibold text-gray-700 mb-1'>Price ($)</label>
                  <input required type='number' step='0.01' value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none' />
                </div>
                <div>
                  <label className='block text-sm font-semibold text-gray-700 mb-1'>Stock Quantity</label>
                  <input required type='number' value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none' />
                </div>
              </div>
              
              <div>
                <label className='block text-sm font-semibold text-gray-700 mb-1'>Image URL</label>
                <input type='url' value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none' placeholder='https://...' />
              </div>

              <div>
                <label className='block text-sm font-semibold text-gray-700 mb-1'>Description</label>
                <textarea required rows='3' value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none'></textarea>
              </div>

              <div className='flex justify-end gap-3 pt-4 border-t border-gray-100'>
                <button type='button' onClick={() => setIsModalOpen(false)} className='px-6 py-2 text-gray-600 font-semibold hover:bg-gray-100 rounded-lg transition-colors'>Cancel</button>
                <button type='submit' className='px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors'>
                  {editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminProducts
