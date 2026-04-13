import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { ShoppingBag, Truck, Shield, Search, Plus, Minus, Zap, ChevronLeft, ChevronRight, Sparkles, Scale, X, MessageCircle, Loader } from 'lucide-react'

const Mid = ({ initialSearchKeyword = '', onShowAllProductsChange = () => {} }) => {
  const navigate = useNavigate()
  const productsRef = useRef(null)
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchKeyword, setSearchKeyword] = useState(initialSearchKeyword)
  const [priceFilter, setPriceFilter] = useState({ min: 0, max: 10000 })
  const [selectedCategory, setSelectedCategory] = useState('')
  const [quantities, setQuantities] = useState({})
  const [toast, setToast] = useState(null)
  const [showAllProducts, setShowAllProducts] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [featuredStartIndex, setFeaturedStartIndex] = useState(0)
  const [addingToCart, setAddingToCart]   = useState({})
  const itemsPerPage = 8

  // ── AI state ────────────────────────────────────────────────────────────────
  const [aiModal, setAiModal]           = useState(null)  // product object
  const [aiSummary, setAiSummary]       = useState('')
  const [aiSummaryLoading, setAiSummaryLoading] = useState(false)
  const [aiQuestion, setAiQuestion]     = useState('')
  const [aiAdvice, setAiAdvice]         = useState('')
  const [aiAdviceLoading, setAiAdviceLoading] = useState(false)
  const [aiMode, setAiMode]             = useState(false) // Toggle for AI features

  // ── Compare state ───────────────────────────────────────────────────────────
  const [compareList, setCompareList]   = useState([])    // max 2 products
  const [compareModal, setCompareModal] = useState(false)
  const [compareResult, setCompareResult] = useState('')
  const [compareLoading, setCompareLoading] = useState(false)

  const API_BASE_URL = 'https://e-commerceweb-back.onrender.com/products'

  const userId = localStorage.getItem('userId')
  const token = localStorage.getItem('token')

  // Notify parent when showAllProducts changes
  useEffect(() => {
    onShowAllProductsChange(showAllProducts)
  }, [showAllProducts, onShowAllProductsChange])

  // Toast notification auto-hide after 4 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null)
      }, 4000)
      return () => clearTimeout(timer)
    }
  }, [toast])

  // Show toast notification
  const showToast = (message, type = 'success') => {
    setToast({ message, type })
  }

  // Sync header search with Mid search
  useEffect(() => {
    if (initialSearchKeyword !== searchKeyword) {
      setSearchKeyword(initialSearchKeyword)
    }
  }, [initialSearchKeyword])

  // Fetch all products on component mount
  useEffect(() => {
    fetchProducts()
  }, [])

  // Filter products based on search, price AND category
  useEffect(() => {
    let filtered = products

    // Filter by category chip
    if (selectedCategory) {
      filtered = filtered.filter(p =>
        p.category?.toLowerCase() === selectedCategory.toLowerCase()
      )
    }

    // Filter by price
    filtered = filtered.filter(p => p.price >= priceFilter.min && p.price <= priceFilter.max)

    // Filter by search keyword
    if (searchKeyword) {
      filtered = filtered.filter(p =>
        p.name?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        p.category?.toLowerCase().includes(searchKeyword.toLowerCase())
      )
    }

    setFilteredProducts(filtered)
    setCurrentPage(1)  // reset to page 1 on any filter change
    setFeaturedStartIndex(0) // reset featured rotation
  }, [products, searchKeyword, priceFilter, selectedCategory])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}`)
      if (!response.ok) throw new Error('Failed to fetch products')
      const data = await response.json()
      setProducts(data.data || [])
      setError(null)
    } catch (err) {
      setError(err.message)
      console.error('Error fetching products:', err)
    } finally {
      setLoading(false)
    }
  }

  // ── Guest cart helpers (localStorage) ──────────────────────────────────
  const addToGuestCart = (product, quantity) => {
    const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]')
    const existing  = guestCart.find(i => i.productId === product.id)
    if (existing) {
      existing.quantity += quantity
      existing.total     = existing.price * existing.quantity
    } else {
      guestCart.push({
        id:          Date.now(),   // temp local id
        productId:   product.id,
        productName: product.name,
        price:       product.price,
        quantity,
        total:       product.price * quantity,
        productImage: product.image || '',
      })
    }
    localStorage.setItem('guestCart', JSON.stringify(guestCart))
  }

  // Helper to visually decrement stock on the page without refetching
  const decreaseLocalStock = (productId, amount) => {
    setProducts(prev => prev.map(p => 
      p.id === productId ? { ...p, quantity: Math.max(0, p.quantity - amount) } : p
    ))
  }

  const handleAddToCart = async (product) => {
    const quantity = quantities[product.id] || 1

    // Guest mode — no login needed, store locally
    if (!userId || !token) {
      addToGuestCart(product, quantity)
      decreaseLocalStock(product.id, quantity)
      setQuantities({ ...quantities, [product.id]: 1 })
      showToast(`${product.name} added to cart!`, 'success')
      return
    }

    // Logged in — sync with backend
    setAddingToCart(prev => ({ ...prev, [product.id]: true }))
    try {
      const response = await axios.post(
        'https://e-commerceweb-back.onrender.com/cart/add',
        { userId: parseInt(userId), productId: product.id, quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (response.data.success) {
        decreaseLocalStock(product.id, quantity)
        setQuantities({ ...quantities, [product.id]: 1 })
        showToast(`${product.name} added to cart!`, 'success')
      }
    } catch (err) {
      showToast('Failed to add to cart', 'error')
    } finally {
      setAddingToCart(prev => ({ ...prev, [product.id]: false }))
    }
  }

  // Buy Now — add to cart then open /cart (works for guests too)
  const handleBuyNow = async (product) => {
    const quantity = quantities[product.id] || 1

    // Guest mode — add to local cart and go to cart page
    if (!userId || !token) {
      addToGuestCart(product, quantity)
      decreaseLocalStock(product.id, quantity)
      navigate('/cart')
      return
    }

    // Logged in — sync with backend then go to cart
    setAddingToCart(prev => ({ ...prev, [product.id]: true }))
    try {
      const response = await axios.post(
        'https://e-commerceweb-back.onrender.com/cart/add',
        { userId: parseInt(userId), productId: product.id, quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (response.data.success) {
        decreaseLocalStock(product.id, quantity)
        navigate('/cart')
      }
    } catch (err) {
      showToast('Failed to add to cart', 'error')
    } finally {
      setAddingToCart(prev => ({ ...prev, [product.id]: false }))
    }
  }

  const handleExploreClick = () => {
    setShowAllProducts(true)
    setCurrentPage(1)
    setTimeout(() => {
      productsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 0)
  }

  const incrementQuantity = (productId, maxQty) => {
    const current = quantities[productId] || 1
    if (current < maxQty) {
      setQuantities({ ...quantities, [productId]: current + 1 })
    }
  }

  const decrementQuantity = (productId) => {
    const current = quantities[productId] || 1
    if (current > 1) {
      setQuantities({ ...quantities, [productId]: current - 1 })
    }
  }

  // ── AI helpers ──────────────────────────────────────────────────────────────
  const AI_BASE = 'https://e-commerceweb-back.onrender.com/ai'

  const openAiModal = async (product) => {
    setAiModal(product)
    setAiSummary('')
    setAiAdvice('')
    setAiQuestion('')
    setAiSummaryLoading(true)
    try {
      const res = await axios.get(`${AI_BASE}/summary/${product.id}`)
      setAiSummary(res.data.data ?? res.data)
    } catch {
      setAiSummary('Could not load AI summary. Please try again.')
    } finally {
      setAiSummaryLoading(false)
    }
  }

  const askAdvice = async () => {
    if (!aiQuestion.trim() || !aiModal) return
    setAiAdviceLoading(true)
    setAiAdvice('')
    try {
      const res = await axios.post(`${AI_BASE}/advice/${aiModal.id}`, { query: aiQuestion })
      setAiAdvice(res.data.data ?? res.data)
    } catch {
      setAiAdvice('Could not get advice. Please try again.')
    } finally {
      setAiAdviceLoading(false)
    }
  }

  const toggleCompare = (product) => {
    setCompareList(prev => {
      const exists = prev.find(p => p.id === product.id)
      if (exists) return prev.filter(p => p.id !== product.id)
      if (prev.length >= 2) {
        showToast('You can compare at most 2 products', 'error')
        return prev
      }
      return [...prev, product]
    })
  }

  const fetchCompare = async () => {
    if (compareList.length < 2) return
    setCompareModal(true)
    setCompareLoading(true)
    setCompareResult('')
    try {
      const id1 = compareList[0].id
      const id2 = compareList[1].id
      console.log('Comparing products:', id1, id2)
      const res = await axios.get(`${AI_BASE}/compare/${id1}/${id2}`)
      setCompareResult(res.data.data ?? res.data)
    } catch (err) {
      console.error('AI Compare Error:', err.response?.data || err.message)
      const errorMsg = err.response?.data?.message || err.message || 'Could not compare products. Please try again.'
      setCompareResult(`Error: ${errorMsg}`)
    } finally {
      setCompareLoading(false)
    }
  }

  // Format AI text (converts ** bold ** and bullet points)
  const formatAiText = (text) => {
    if (!text) return null
    return text.split('\n').map((line, i) => {
      const formatted = line
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/^[•\-\*]\s*/, '• ')
      return formatted.trim() ? (
        <p key={i} dangerouslySetInnerHTML={{ __html: formatted }}
          className={`text-sm text-gray-700 ${formatted.startsWith('•') ? 'ml-2' : ''} mb-1`} />
      ) : <div key={i} className='h-1' />
    })
  }

  // Rotate featured products every 60 seconds
  useEffect(() => {
    if (showAllProducts || filteredProducts.length <= itemsPerPage) return
    const interval = setInterval(() => {
      setFeaturedStartIndex(prev => {
        let next = prev + itemsPerPage
        if (next >= filteredProducts.length) next = 0
        return next
      })
    }, 60000)
    return () => clearInterval(interval)
  }, [showAllProducts, filteredProducts.length])

  // Pagination logic
  const productsToDisplay = showAllProducts 
    ? filteredProducts 
    : filteredProducts.slice(featuredStartIndex, featuredStartIndex + itemsPerPage)
  const totalPages = Math.ceil(productsToDisplay.length / itemsPerPage)
  const startIdx = (currentPage - 1) * itemsPerPage
  const endIdx = startIdx + itemsPerPage
  const displayedProducts = productsToDisplay.slice(startIdx, endIdx)

  return (
    <div className='w-full'>
      {/* Hero Section - Hidden when showing all products */}
      {!showAllProducts && (
      <div className='bg-gradient-to-r from-emerald-50 to-green-100 min-h-96 flex flex-col items-center justify-center px-8 py-16 relative overflow-hidden'>
        {/* Animated background elements */}
        <div className='absolute top-10 left-10 w-20 h-20 bg-cyan-400 rounded-full opacity-20 animate-bounce'></div>
        <div className='absolute bottom-10 right-10 w-32 h-32 bg-emerald-300 rounded-full opacity-20 animate-pulse'></div>

        {/* Content */}
        <div className='relative z-10 text-center mb-12 animate-fade-in'>
          <h1 className='text-5xl font-bold text-gray-800 mb-4'>
            Welcome to <span className='text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-cyan-500'>Shopping</span>
          </h1>
          <p className='text-xl text-gray-600 mb-8 max-w-2xl'>
            Discover amazing products with exclusive deals and fast delivery
          </p>
          
          {/* Explore Button */}
          <button onClick={handleExploreClick} className='px-8 py-4 bg-gradient-to-r from-emerald-600 to-cyan-500 text-white font-bold text-lg rounded-full shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 transform hover:-translate-y-1'>
            Explore Now
          </button>
        </div>

        {/* Feature Icons */}
        <div className='grid grid-cols-3 gap-8 relative z-10 mt-12'>
          <div className='flex flex-col items-center gap-3 p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105'>
            <Truck className='w-8 h-8 text-emerald-600' />
            <p className='font-semibold text-gray-700'>Fast Delivery</p>
          </div>
          <div className='flex flex-col items-center gap-3 p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105'>
            <Shield className='w-8 h-8 text-cyan-500' />
            <p className='font-semibold text-gray-700'>Secure Payment</p>
          </div>
          <div className='flex flex-col items-center gap-3 p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105'>
            <ShoppingBag className='w-8 h-8 text-emerald-600' />
            <p className='font-semibold text-gray-700'>Best Deals</p>
          </div>
        </div>
      </div>
      )}

      {/* Search and Filter Section - Show only when viewing all products */}
      {showAllProducts && (
      <div className='px-8 pt-8 pb-6 bg-white border-b-2 border-gray-100'>
        <div className='max-w-4xl mx-auto space-y-5'>

          {/* Search Bar */}
          <div className='flex items-center gap-3 bg-gray-100 rounded-full px-6 py-3 shadow-md'>
            <Search className='w-6 h-6 text-gray-500 flex-shrink-0' />
            <input
              type='text'
              placeholder='Search products by name or category...'
              value={searchKeyword}
              onChange={(e) => { setSearchKeyword(e.target.value); setSelectedCategory('') }}
              className='flex-1 bg-transparent outline-none text-gray-700 placeholder-gray-500'
            />
            {(searchKeyword || selectedCategory) && (
              <button onClick={() => { setSearchKeyword(''); setSelectedCategory('') }}
                className='text-gray-400 hover:text-red-500 transition-colors'>
                <X className='w-4 h-4' />
              </button>
            )}
          </div>

          {/* Category Chips */}
          {(() => {
            const cats = ['All', ...new Set(products.map(p => p.category).filter(Boolean))]
            return (
              <div className='flex flex-wrap gap-2'>
                {cats.map(cat => {
                  const isAll    = cat === 'All'
                  const isActive = isAll ? !selectedCategory : selectedCategory === cat
                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(isAll ? '' : cat)}
                      className={`px-4 py-1.5 rounded-full text-sm font-semibold border-2 transition-all hover:scale-105 capitalize ${
                        isActive
                          ? 'bg-emerald-600 border-emerald-600 text-white shadow-md'
                          : 'bg-white border-gray-200 text-gray-600 hover:border-emerald-400 hover:text-emerald-600'
                      }`}
                    >
                      {cat}
                    </button>
                  )
                })}
              </div>
            )
          })()}

          {/* Price Filter */}
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-semibold text-gray-700 mb-2'>Min Price: ₹{priceFilter.min}</label>
              <input type='range' min='0' max='10000' step='10' value={priceFilter.min}
                onChange={(e) => setPriceFilter({ ...priceFilter, min: Number(e.target.value) })}
                className='w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer' />
            </div>
            <div>
              <label className='block text-sm font-semibold text-gray-700 mb-2'>Max Price: ₹{priceFilter.max}</label>
              <input type='range' min='0' max='10000' step='10' value={priceFilter.max}
                onChange={(e) => setPriceFilter({ ...priceFilter, max: Number(e.target.value) })}
                className='w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer' />
            </div>
          </div>

          {/* Active filter summary */}
          {(selectedCategory || searchKeyword) && (
            <p className='text-sm text-gray-500'>
              Showing <span className='font-semibold text-emerald-700'>{filteredProducts.length}</span> result{filteredProducts.length !== 1 ? 's' : ''}
              {selectedCategory && <> in <span className='font-semibold capitalize text-emerald-700'>{selectedCategory}</span></>}
              {searchKeyword && <> matching "<span className='font-semibold text-emerald-700'>{searchKeyword}</span>"</>}
            </p>
          )}
        </div>
      </div>
      )}

      {/* Products Section */}
      <div ref={productsRef} className='px-8 py-16 bg-white'>
        <div className='flex flex-col items-center justify-center mb-4 gap-4'>
          <h2 className='text-4xl font-bold text-gray-800 text-center'>
            {showAllProducts ? 'All' : 'Featured'} <span className='text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-cyan-500'>Products</span>
          </h2>
          <div className='flex items-center gap-3 bg-gray-50 px-5 py-2.5 rounded-full border border-gray-100 shadow-sm'>
            <span className={`text-sm font-bold flex items-center gap-1.5 transition-colors ${aiMode ? 'text-violet-600' : 'text-gray-400'}`}>
              <Sparkles className='w-4 h-4' /> Enable AI Shopping
            </span>
            <button
              onClick={() => { setAiMode(!aiMode); if (aiMode) setCompareList([]) }}
              className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${aiMode ? 'bg-gradient-to-r from-violet-500 to-purple-600 shadow-md' : 'bg-gray-300'}`}
            >
              <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform duration-300 ${aiMode ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>
        </div>
        <p className='text-gray-600 text-center mb-6'>
          {loading ? 'Loading products...' : showAllProducts ? `Showing ${displayedProducts.length} of ${filteredProducts.length} products (Page ${currentPage} of ${totalPages})` : `Showing ${Math.min(8, filteredProducts.length)} of ${filteredProducts.length} products`}
        </p>

        {/* Error Message */}
        {error && (
          <div className='text-center mb-8 p-4 bg-red-100 text-red-700 rounded-lg'>
            Error: {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className='flex justify-center items-center min-h-64'>
            <div className='animate-spin'>
              <ShoppingBag className='w-12 h-12 text-emerald-600' />
            </div>
          </div>
        )}

        {/* Product Grid */}
        {!loading && filteredProducts.length > 0 ? (
          <>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
              {displayedProducts.map((product, index) => (
              <div
                key={product.id || index}
                className='bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 hover:scale-105 transform hover:-translate-y-1 animate-fade-in h-full flex flex-col'
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Product Image */}
                <div className='bg-white h-40 flex items-center justify-center overflow-hidden relative flex-shrink-0'>
                  {product.image ? (
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className='w-full h-full object-cover hover:scale-110 transition-transform duration-300'
                      onError={(e) => {
                        e.target.onerror = null; 
                        e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect width='200' height='200' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='system-ui, sans-serif' font-weight='600' font-size='20' fill='%239ca3af'%3EProduct%3C/text%3E%3C/svg%3E";
                      }}
                    />
                  ) : (
                    <div className='text-5xl'>ðŸ›ï¸</div>
                  )}
                  {product.quantity <= 5 && product.quantity > 0 && (
                    <div className='absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold'>
                      Low Stock
                    </div>
                  )}
                  {product.quantity === 0 && (
                    <div className='absolute inset-0 bg-gray-800 opacity-50 flex items-center justify-center'>
                      <span className='text-white font-bold text-lg'>Out of Stock</span>
                    </div>
                  )}
                </div>

                {/* Product Info - Growing container */}
                <div className='p-4 flex-grow flex flex-col'>
                  <h3 className='font-bold text-base text-gray-800 mb-1 line-clamp-2'>{product.name}</h3>
                  
                  {/* Category */}
                  {product.category && (
                    <p className='text-xs text-white bg-emerald-500 inline-block px-2 py-0.5 rounded mb-2 capitalize font-semibold w-fit'>{product.category}</p>
                  )}
                  
                  {/* Description */}
                  {product.description && (
                    <p className='text-xs text-gray-600 mb-2 line-clamp-2'>{product.description}</p>
                  )}
                  
                  {/* Stock Info */}
                  <p className={`text-xs font-semibold mb-auto ${product.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {product.quantity > 0 ? `${product.quantity} in stock` : 'Out of Stock'}
                  </p>
                </div>

                {/* Bottom Section - Fixed */}
                <div className='px-4 pb-4 flex-shrink-0 space-y-2 border-t border-green-200 pt-3'>
                  {/* Quantity and Price Row */}
                  <div className='flex items-center justify-between gap-2'>
                    {product.quantity > 0 && (
                      <div className='flex items-center bg-white rounded-lg p-0.5 shadow-sm'>
                        <button
                          onClick={() => decrementQuantity(product.id)}
                          className='text-emerald-600 hover:text-emerald-700 p-0.5 rounded transition-all'
                        >
                          <Minus className='w-3 h-3' />
                        </button>
                        <span className='font-bold text-gray-800 text-xs w-6 text-center'>
                          {quantities[product.id] || 1}
                        </span>
                        <button
                          onClick={() => incrementQuantity(product.id, product.quantity)}
                          className='text-emerald-600 hover:text-emerald-700 p-0.5 rounded transition-all'
                          disabled={quantities[product.id] >= product.quantity}
                        >
                          <Plus className='w-3 h-3' />
                        </button>
                      </div>
                    )}
                    <div className='text-lg font-bold text-emerald-600'>
                      ${(product.price * (quantities[product.id] || 1)).toFixed(2)}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {!aiMode ? (
                    <div className='flex gap-2 h-9 mt-1'>
                      <button
                        onClick={() => handleAddToCart(product)}
                        disabled={product.quantity === 0 || addingToCart[product.id]}
                        className={`flex-1 flex items-center justify-center gap-1 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg font-semibold text-sm ${
                          product.quantity === 0 || addingToCart[product.id]
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-cyan-500 hover:bg-cyan-600 text-white hover:scale-105'
                        }`}
                      >
                        <ShoppingBag className='w-4 h-4' />
                        <span>{addingToCart[product.id] ? 'Adding...' : 'Cart'}</span>
                      </button>
                      <button
                        onClick={() => handleBuyNow(product)}
                        disabled={product.quantity === 0}
                        className={`flex-1 flex items-center justify-center gap-1 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg font-semibold text-sm ${
                          product.quantity === 0
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-yellow-500 hover:bg-yellow-600 text-white hover:scale-105'
                        }`}
                      >
                        <Zap className='w-4 h-4' />
                        <span>Buy Now</span>
                      </button>
                    </div>
                  ) : (
                    <div className='flex gap-1.5 h-9 mt-1'>
                      <button
                        onClick={() => openAiModal(product)}
                        className='flex-1 flex items-center justify-center gap-1 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-lg text-xs font-bold hover:scale-105 transition-all shadow-sm'
                      >
                        <Sparkles className='w-3 h-3' /> AI Insight
                      </button>
                      <button
                        onClick={() => toggleCompare(product)}
                        className={`flex-1 flex items-center justify-center gap-1 rounded-lg text-xs font-bold hover:scale-105 transition-all shadow-sm ${
                          compareList.find(p => p.id === product.id)
                            ? 'bg-orange-500 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        <Scale className='w-3 h-3' />
                        {compareList.find(p => p.id === product.id) ? '✓ Added' : 'Compare'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            </div>

            {/* Explore More Button - Show only when not showing all products */}
            {!showAllProducts && filteredProducts.length > 8 && (
              <div className='flex justify-center mt-12 mb-8'>
                <button onClick={handleExploreClick} className='px-12 py-4 bg-gradient-to-r from-emerald-600 to-cyan-500 text-white font-bold text-lg rounded-full shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 transform hover:-translate-y-1'>
                  Explore More Products
                </button>
              </div>
            )}

            {/* Pagination Controls - Show only when showing all products */}
            {showAllProducts && totalPages > 1 && (
              <div className='flex items-center justify-center gap-4 mt-12 mb-8'>
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
                    currentPage === 1
                      ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                      : 'bg-emerald-600 text-white hover:bg-emerald-700 hover:scale-105'
                  }`}
                >
                  <ChevronLeft className='w-5 h-5' />
                  Previous
                </button>

                <div className='flex gap-2'>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-10 h-10 rounded-lg font-bold transition-all ${
                        currentPage === page
                          ? 'bg-cyan-500 text-white scale-110'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
                    currentPage === totalPages
                      ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                      : 'bg-emerald-600 text-white hover:bg-emerald-700 hover:scale-105'
                  }`}
                >
                  Next
                  <ChevronRight className='w-5 h-5' />
                </button>
              </div>
            )}
          </>
        ) : !loading && filteredProducts.length === 0 && (
          <div className='text-center p-12 bg-gray-100 rounded-lg'>
            <p className='text-gray-700 text-lg'>No products found. Try adjusting your filters.</p>
          </div>
        )}
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 px-6 py-4 rounded-xl shadow-2xl font-semibold text-white flex items-center gap-3 animate-slide-in z-40 ${
          toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        }`}>
          <span>{toast.message}</span>
        </div>
      )}

      {/* ── Compare floating bar (shown when 1–2 products selected) ── */}
      {compareList.length > 0 && !compareModal && (
        <div className='fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-white rounded-2xl shadow-2xl border-2 border-orange-200 px-6 py-3 flex items-center gap-4 animate-slide-in'>
          <Scale className='w-5 h-5 text-orange-500 flex-shrink-0' />
          <div className='flex items-center gap-2'>
            {compareList.map(p => (
              <div key={p.id} className='flex items-center gap-2 bg-orange-50 border border-orange-200 px-3 py-1.5 rounded-xl'>
                <span className='text-sm font-semibold text-gray-800 max-w-24 truncate'>{p.name}</span>
                <button onClick={() => toggleCompare(p)} className='text-gray-400 hover:text-red-500 transition-colors'>
                  <X className='w-3.5 h-3.5' />
                </button>
              </div>
            ))}
            {compareList.length === 1 && (
              <span className='text-sm text-gray-400 italic'>Pick 1 more to compare…</span>
            )}
          </div>
          {compareList.length === 2 && (
            <button onClick={fetchCompare}
              className='px-5 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold rounded-xl hover:scale-105 transition-all shadow-lg text-sm flex items-center gap-2'>
              <Sparkles className='w-4 h-4' /> Compare Now
            </button>
          )}
          <button onClick={() => setCompareList([])} className='text-gray-400 hover:text-gray-600 transition-colors ml-1'>
            <X className='w-4 h-4' />
          </button>
        </div>
      )}

      {/* ── AI Insight Modal ── */}
      {aiModal && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4'>
          <div className='bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden'>
            {/* Header */}
            <div className='bg-gradient-to-r from-violet-600 to-purple-600 p-5 flex items-start justify-between flex-shrink-0'>
              <div className='flex items-center gap-3 text-white'>
                <div className='w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center'>
                  <Sparkles className='w-5 h-5' />
                </div>
                <div>
                  <p className='text-xs font-semibold text-purple-200 uppercase tracking-wide'>AI Insight</p>
                  <h3 className='font-bold text-base leading-tight max-w-72 line-clamp-2'>{aiModal.name}</h3>
                </div>
              </div>
              <button onClick={() => setAiModal(null)} className='text-white/70 hover:text-white transition-colors mt-0.5'>
                <X className='w-5 h-5' />
              </button>
            </div>

            <div className='overflow-y-auto flex-1 p-5 space-y-5'>
              {/* Summary */}
              <div>
                <p className='text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-2'>
                  <Sparkles className='w-3.5 h-3.5 text-violet-500' /> Product Summary
                </p>
                {aiSummaryLoading ? (
                  <div className='flex items-center gap-3 text-violet-600 py-3'>
                    <Loader className='w-4 h-4 animate-spin' />
                    <span className='text-sm'>Generating AI summary…</span>
                  </div>
                ) : (
                  <div className='bg-violet-50 border border-violet-100 rounded-2xl p-4'>
                    {formatAiText(aiSummary)}
                  </div>
                )}
              </div>

              {/* Ask question */}
              <div>
                <p className='text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-2'>
                  <MessageCircle className='w-3.5 h-3.5 text-emerald-500' /> Ask AI About This Product
                </p>
                <div className='flex gap-2'>
                  <input
                    type='text' value={aiQuestion} onChange={e => setAiQuestion(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && askAdvice()}
                    placeholder='e.g. Is this good for gifting? Worth the price?'
                    className='flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-violet-500 transition-all'
                  />
                  <button onClick={askAdvice} disabled={aiAdviceLoading || !aiQuestion.trim()}
                    className='px-4 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-bold text-sm hover:scale-105 transition-all disabled:opacity-60'>
                    {aiAdviceLoading ? <Loader className='w-4 h-4 animate-spin' /> : 'Ask'}
                  </button>
                </div>
                {aiAdvice && (
                  <div className='mt-3 bg-emerald-50 border border-emerald-100 rounded-2xl p-4'>
                    {formatAiText(aiAdvice)}
                  </div>
                )}
              </div>

              {/* Quick actions */}
              <div className='flex gap-2 pt-1'>
                <button onClick={() => { handleAddToCart(aiModal); setAiModal(null) }}
                  className='flex-1 py-2.5 bg-cyan-500 text-white font-bold rounded-xl text-sm hover:scale-105 transition-all flex items-center justify-center gap-1'>
                  <ShoppingBag className='w-4 h-4' /> Add to Cart
                </button>
                <button onClick={() => { setAiModal(null); handleBuyNow(aiModal) }}
                  className='flex-1 py-2.5 bg-yellow-500 text-white font-bold rounded-xl text-sm hover:scale-105 transition-all flex items-center justify-center gap-1'>
                  <Zap className='w-4 h-4' /> Buy Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Compare Result Modal ── */}
      {compareModal && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4'>
          <div className='bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden'>
            <div className='bg-gradient-to-r from-orange-500 to-amber-500 p-5 flex items-center justify-between flex-shrink-0'>
              <div className='flex items-center gap-3 text-white'>
                <Scale className='w-6 h-6' />
                <div>
                  <p className='text-xs font-semibold text-orange-100 uppercase tracking-wide'>AI Comparison</p>
                  <h3 className='font-bold text-base'>{compareList[0]?.name} <span className='opacity-70'>vs</span> {compareList[1]?.name}</h3>
                </div>
              </div>
              <button onClick={() => { setCompareModal(false); setCompareResult('') }}
                className='text-white/70 hover:text-white transition-colors'>
                <X className='w-5 h-5' />
              </button>
            </div>

            {/* Product thumbnails */}
            <div className='grid grid-cols-2 border-b border-gray-100 flex-shrink-0'>
              {compareList.map(p => (
                <div key={p.id} className='flex items-center gap-3 p-4 border-r border-gray-100 last:border-0'>
                  {p.image && <img src={p.image} alt={p.name} className='w-12 h-12 rounded-xl object-cover flex-shrink-0' />}
                  <div>
                    <p className='font-bold text-sm text-gray-800 line-clamp-1'>{p.name}</p>
                    <p className='text-emerald-600 font-bold text-sm'>₹{p.price?.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className='overflow-y-auto flex-1 p-5'>
              {compareLoading ? (
                <div className='flex flex-col items-center justify-center py-12 text-orange-500 gap-3'>
                  <Loader className='w-8 h-8 animate-spin' />
                  <p className='text-sm font-semibold text-gray-600'>AI is comparing products…</p>
                </div>
              ) : (
                <div className='bg-orange-50 border border-orange-100 rounded-2xl p-4'>
                  {formatAiText(compareResult)}
                </div>
              )}
            </div>

            <div className='p-4 border-t border-gray-100 flex-shrink-0'>
              <button onClick={() => { setCompareModal(false); setCompareList([]); setCompareResult('') }}
                className='w-full py-2.5 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all text-sm'>
                Close & Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Animated styles */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-in {
          from { opacity: 0; transform: translateX(80px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .animate-fade-in  { animation: fade-in 0.8s ease-out forwards; }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  )
}

export default Mid


