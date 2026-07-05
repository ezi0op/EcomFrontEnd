import React from 'react'
import { ShoppingBag, Minus, Plus, Zap, Sparkles, Scale } from 'lucide-react'

const ProductCard = ({
  product,
  index,
  quantities,
  incrementQuantity,
  decrementQuantity,
  aiMode,
  addingToCart,
  handleAddToCart,
  handleBuyNow,
  openAiModal,
  toggleCompare,
  compareList,
}) => {
  const isCompared = compareList.some((p) => p.id === product.id)

  return (
    <div
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
              e.target.onerror = null
              e.target.src =
                "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect width='200' height='200' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='system-ui, sans-serif' font-weight='600' font-size='20' fill='%239ca3af'%3EProduct%3C/text%3E%3C/svg%3E"
            }}
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
          <p className='text-xs text-white bg-emerald-500 inline-block px-2 py-0.5 rounded mb-2 capitalize font-semibold w-fit'>
            {product.category}
          </p>
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
              <span className='font-bold text-gray-800 text-xs w-6 text-center'>{quantities[product.id] || 1}</span>
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
                product.quantity === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-yellow-500 hover:bg-yellow-600 text-white hover:scale-105'
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
                isCompared ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Scale className='w-3 h-3' />
              {isCompared ? '✓ Added' : 'Compare'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductCard
