import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShoppingBag } from 'lucide-react'

import { api } from '../../config'
import HeroSection from './Products/HeroSection'
import FilterSection from './Products/FilterSection'
import ProductsHeader from './Products/ProductsHeader'
import ProductGrid from './Products/ProductGrid'
import Pagination from './Products/Pagination'
import CompareBar from './AI/CompareBar'
import CompareModal from './AI/CompareModal'
import AiInsightModal from './AI/AiInsightModal'
import ToastNotification from './Common/ToastNotification'

const Mid = ({ initialSearchKeyword = '', onShowAllProductsChange = () => { } }) => {
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
  const [addingToCart, setAddingToCart] = useState({})
  const itemsPerPage = 8

  // ── AI state ────────────────────────────────────────────────────────────────
  const [aiModal, setAiModal] = useState(null)  // product object
  const [aiSummary, setAiSummary] = useState('')
  const [aiSummaryLoading, setAiSummaryLoading] = useState(false)
  const [aiQuestion, setAiQuestion] = useState('')
  const [aiAdvice, setAiAdvice] = useState('')
  const [aiAdviceLoading, setAiAdviceLoading] = useState(false)
  const [aiMode, setAiMode] = useState(false) // Toggle for AI features

  // ── Compare state ───────────────────────────────────────────────────────────
  const [compareList, setCompareList] = useState([])    // max 2 products
  const [compareModal, setCompareModal] = useState(false)
  const [compareResult, setCompareResult] = useState('')
  const [compareLoading, setCompareLoading] = useState(false)

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
      const res = await api.get('/products')
      const data = res.data?.data || res.data
      setProducts(Array.isArray(data) ? data : [])
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
    const existing = guestCart.find(i => i.productId === product.id)
    if (existing) {
      existing.quantity += quantity
      existing.total = existing.price * existing.quantity
    } else {
      guestCart.push({
        id: Date.now(),   // temp local id
        productId: product.id,
        productName: product.name,
        price: product.price,
        quantity,
        total: product.price * quantity,
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
      const response = await api.post('/cart/add', {
        userId: parseInt(userId),
        productId: product.id,
        quantity
      })
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
      const response = await api.post('/cart/add', {
        userId: parseInt(userId),
        productId: product.id,
        quantity
      })
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
  const openAiModal = async (product) => {
    setAiModal(product)
    setAiSummary('')
    setAiAdvice('')
    setAiQuestion('')
    setAiSummaryLoading(true)
    try {
      const res = await api.get(`/ai/summary/${product.id}`)
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
      const res = await api.post(`/ai/advice/${aiModal.id}`, { query: aiQuestion })
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
      const res = await api.get(`/ai/compare/${id1}/${id2}`)
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
  }, [showAllProducts, filteredProducts.length, itemsPerPage])

  // Pagination logic
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)
  const startIdx = (currentPage - 1) * itemsPerPage
  const endIdx = startIdx + itemsPerPage
  const displayedProducts = showAllProducts 
    ? filteredProducts.slice(startIdx, endIdx)
    : filteredProducts.slice(featuredStartIndex, featuredStartIndex + itemsPerPage)

  return (
    <div className='w-full'>
      {/* Hero Section - Hidden when showing all products */}
      {!showAllProducts && (
        <HeroSection handleExploreClick={handleExploreClick} />
      )}

      {/* Search and Filter Section - Show only when viewing all products */}
      {showAllProducts && (
        <FilterSection
          products={products}
          searchKeyword={searchKeyword}
          setSearchKeyword={setSearchKeyword}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          priceFilter={priceFilter}
          setPriceFilter={setPriceFilter}
          filteredProductsCount={filteredProducts.length}
        />
      )}

      {/* Products Section */}
      <div ref={productsRef} className='px-8 py-16 bg-white'>
        <ProductsHeader
          showAllProducts={showAllProducts}
          aiMode={aiMode}
          setAiMode={setAiMode}
          setCompareList={setCompareList}
          loading={loading}
          displayedProductsCount={displayedProducts.length}
          filteredProductsCount={filteredProducts.length}
          currentPage={currentPage}
          totalPages={totalPages}
        />

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
        <ProductGrid
          loading={loading}
          filteredProducts={filteredProducts}
          displayedProducts={displayedProducts}
          quantities={quantities}
          incrementQuantity={incrementQuantity}
          decrementQuantity={decrementQuantity}
          aiMode={aiMode}
          addingToCart={addingToCart}
          handleAddToCart={handleAddToCart}
          handleBuyNow={handleBuyNow}
          openAiModal={openAiModal}
          toggleCompare={toggleCompare}
          compareList={compareList}
          showAllProducts={showAllProducts}
          handleExploreClick={handleExploreClick}
        />

        {/* Pagination Controls - Show only when showing all products */}
        <Pagination
          showAllProducts={showAllProducts}
          totalPages={totalPages}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
        />
      </div>

      {/* Toast Notification */}
      <ToastNotification toast={toast} />

      {/* Compare Floating Bar */}
      <CompareBar
        compareList={compareList}
        compareModal={compareModal}
        toggleCompare={toggleCompare}
        fetchCompare={fetchCompare}
        setCompareList={setCompareList}
      />

      {/* AI Insight Modal */}
      <AiInsightModal
        product={aiModal}
        onClose={() => setAiModal(null)}
        aiSummary={aiSummary}
        aiSummaryLoading={aiSummaryLoading}
        aiQuestion={aiQuestion}
        setAiQuestion={setAiQuestion}
        askAdvice={askAdvice}
        aiAdvice={aiAdvice}
        aiAdviceLoading={aiAdviceLoading}
        formatAiText={formatAiText}
        handleAddToCart={handleAddToCart}
        handleBuyNow={handleBuyNow}
      />

      {/* Compare Result Modal */}
      <CompareModal
        compareModal={compareModal}
        compareList={compareList}
        onClose={() => { setCompareModal(false); setCompareResult('') }}
        compareLoading={compareLoading}
        compareResult={compareResult}
        setCompareList={setCompareList}
        formatAiText={formatAiText}
      />

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
