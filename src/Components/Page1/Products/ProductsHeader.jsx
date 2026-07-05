import React from 'react'
import { Sparkles } from 'lucide-react'

const ProductsHeader = ({
  showAllProducts,
  aiMode,
  setAiMode,
  setCompareList,
  loading,
  displayedProductsCount,
  filteredProductsCount,
  currentPage,
  totalPages,
}) => {
  return (
    <>
      <div className='flex flex-col items-center justify-center mb-4 gap-4'>
        <h2 className='text-4xl font-bold text-gray-800 text-center'>
          {showAllProducts ? 'All' : 'Featured'}{' '}
          <span className='text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-cyan-500'>
            Products
          </span>
        </h2>
        <div className='flex items-center gap-3 bg-gray-50 px-5 py-2.5 rounded-full border border-gray-100 shadow-sm'>
          <span
            className={`text-sm font-bold flex items-center gap-1.5 transition-colors ${
              aiMode ? 'text-violet-600' : 'text-gray-400'
            }`}
          >
            <Sparkles className='w-4 h-4' /> Enable AI Shopping
          </span>
          <button
            onClick={() => {
              setAiMode(!aiMode)
              if (aiMode) setCompareList([])
            }}
            className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
              aiMode ? 'bg-gradient-to-r from-violet-500 to-purple-600 shadow-md' : 'bg-gray-300'
            }`}
          >
            <div
              className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform duration-300 ${
                aiMode ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>
      <p className='text-gray-600 text-center mb-6'>
        {loading
          ? 'Loading products...'
          : showAllProducts
          ? `Showing ${displayedProductsCount} of ${filteredProductsCount} products (Page ${currentPage} of ${totalPages})`
          : `Showing ${Math.min(8, filteredProductsCount)} of ${filteredProductsCount} products`}
      </p>
    </>
  )
}

export default ProductsHeader
