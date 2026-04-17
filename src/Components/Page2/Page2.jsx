import React, { useState, useEffect } from 'react'
import { ShoppingBag, Search, Plus, Minus, Zap } from 'lucide-react'
import Header from './Header'
import Footer from './Footer'

const Page2 = () => {
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [priceFilter, setPriceFilter] = useState({ min: 0, max: 10000 })
  const [quantities, setQuantities] = useState({})
  const [toast, setToast] = useState(null)

  const API_BASE_URL = 'http://13.53.206.121:8080/products'

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

  // Fetch all products on component mount
  useEffect(() => {
    fetchProducts()
  }, [])

  // Filter products based on search and price
  useEffect(() => {
    let filtered = products
    
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
  }, [products, searchKeyword, priceFilter])

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

  const handleAddToCart = (product) => {
    const quantity = quantities[product.id] || 1
    showToast(`${product.name} added to cart!`, 'success')
    console.log('Added to cart:', product, 'Quantity:', quantity)
  }

  const handleBuyNow = (product) => {
    const quantity = quantities[product.id] || 1
    showToast(`Checkout: ${quantity}x ${product.name}`, 'info')
    console.log('Buy now:', product, 'Quantity:', quantity)
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

  return (
    <div className='w-full'>
      <Header />
      
      {/* All Products Section */}
      <div className='px-8 py-16 bg-white'>
        <h2 className='text-4xl font-bold text-gray-800 text-center mb-4'>
          All <span className='text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-cyan-500'>Products</span>
        </h2>
        <p className='text-gray-600 text-center mb-8'>
          {loading ? 'Loading products...' : `Showing ${filteredProducts.length} products`}
        </p>

        {/* Search and Filter Section */}
        <div className='max-w-4xl mx-auto mb-12'>
          {/* Search Bar */}
          <div className='flex items-center gap-3 mb-6 bg-gray-100 rounded-full px-6 py-3 shadow-md'>
            <Search className='w-6 h-6 text-gray-500' />
            <input
              type='text'
              placeholder='Search products by name or category...'
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className='flex-1 bg-transparent outline-none text-gray-700 placeholder-gray-500'
            />
          </div>

          {/* Price Filter */}
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-semibold text-gray-700 mb-2'>Min Price: ${priceFilter.min}</label>
              <input
                type='range'
                min='0'
                max='10000'
                step='10'
                value={priceFilter.min}
                onChange={(e) => setPriceFilter({ ...priceFilter, min: Number(e.target.value) })}
                className='w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer'
              />
            </div>
            <div>
              <label className='block text-sm font-semibold text-gray-700 mb-2'>Max Price: ${priceFilter.max}</label>
              <input
                type='range'
                min='0'
                max='10000'
                step='10'
                value={priceFilter.max}
                onChange={(e) => setPriceFilter({ ...priceFilter, max: Number(e.target.value) })}
                className='w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer'
              />
            </div>
          </div>
        </div>

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

        {/* Product Grid - Show All Products */}
        {!loading && filteredProducts.length > 0 ? (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
            {filteredProducts.map((product, index) => (
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
                      onError={(e) => {e.target.src = 'https://via.placeholder.com/200?text=Product'}}
                    />
                  ) : (
                    <div className='text-5xl'>🛍️</div>
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

                  {/* Action Buttons - Fixed height */}
                  <div className='flex gap-2 h-9'>
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={product.quantity === 0}
                      className={`flex-1 flex items-center justify-center gap-1 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg font-semibold text-sm ${
                        product.quantity === 0
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-cyan-500 hover:bg-cyan-600 text-white hover:scale-105'
                      }`}
                    >
                      <ShoppingBag className='w-4 h-4' />
                      <span>Cart</span>
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
                </div>
              </div>
            ))}
          </div>
        ) : !loading && filteredProducts.length === 0 && (
          <div className='text-center p-12 bg-gray-100 rounded-lg'>
            <p className='text-gray-700 text-lg'>No products found. Try adjusting your filters.</p>
          </div>
        )}
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 px-6 py-4 rounded-lg shadow-2xl font-semibold text-white flex items-center gap-3 animate-slide-in ${
          toast.type === 'success' ? 'bg-green-500' : 'bg-blue-500'
        }`}>
          {toast.type === 'success' ? (
            <div className='flex items-center justify-center w-6 h-6 bg-white bg-opacity-30 rounded-full'>
              ✓
            </div>
          ) : (
            <div className='flex items-center justify-center w-6 h-6 bg-white bg-opacity-30 rounded-full'>
              ℹ
            </div>
          )}
          <span>{toast.message}</span>
        </div>
      )}

      <Footer />

      {/* Animated styles */}
      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateX(400px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
        }
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

export default Page2

