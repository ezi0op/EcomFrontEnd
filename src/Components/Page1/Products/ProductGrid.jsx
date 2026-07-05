import React from 'react'
import ProductCard from './ProductCard'

const ProductGrid = ({
  loading,
  filteredProducts,
  displayedProducts,
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
  showAllProducts,
  handleExploreClick,
}) => {
  if (loading) return null

  if (filteredProducts.length === 0) {
    return (
      <div className='text-center p-12 bg-gray-100 rounded-lg'>
        <p className='text-gray-700 text-lg'>No products found. Try adjusting your filters.</p>
      </div>
    )
  }

  return (
    <>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        {displayedProducts.map((product, index) => (
          <ProductCard
            key={product.id || index}
            product={product}
            index={index}
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
          />
        ))}
      </div>

      {/* Explore More Button - Show only when not showing all products */}
      {!showAllProducts && filteredProducts.length > 8 && (
        <div className='flex justify-center mt-12 mb-8'>
          <button
            onClick={handleExploreClick}
            className='px-12 py-4 bg-gradient-to-r from-emerald-600 to-cyan-500 text-white font-bold text-lg rounded-full shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 transform hover:-translate-y-1'
          >
            Explore More Products
          </button>
        </div>
      )}
    </>
  )
}

export default ProductGrid
