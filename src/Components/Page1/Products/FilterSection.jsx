import React from 'react'
import { Search, X } from 'lucide-react'

const FilterSection = ({
  products,
  searchKeyword,
  setSearchKeyword,
  selectedCategory,
  setSelectedCategory,
  priceFilter,
  setPriceFilter,
  filteredProductsCount,
}) => {
  const cats = ['All', ...new Set(products.map((p) => p.category).filter(Boolean))]

  return (
    <div className='px-8 pt-8 pb-6 bg-white border-b-2 border-gray-100'>
      <div className='max-w-4xl mx-auto space-y-5'>
        {/* Search Bar */}
        <div className='flex items-center gap-3 bg-gray-100 rounded-full px-6 py-3 shadow-md'>
          <Search className='w-6 h-6 text-gray-500 flex-shrink-0' />
          <input
            type='text'
            placeholder='Search products by name or category...'
            value={searchKeyword}
            onChange={(e) => {
              setSearchKeyword(e.target.value)
              setSelectedCategory('')
            }}
            className='flex-1 bg-transparent outline-none text-gray-700 placeholder-gray-500'
          />
          {(searchKeyword || selectedCategory) && (
            <button
              onClick={() => {
                setSearchKeyword('')
                setSelectedCategory('')
              }}
              className='text-gray-400 hover:text-red-500 transition-colors'
            >
              <X className='w-4 h-4' />
            </button>
          )}
        </div>

        {/* Category Chips */}
        <div className='flex flex-wrap gap-2'>
          {cats.map((cat) => {
            const isAll = cat === 'All'
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

        {/* Price Filter */}
        <div className='grid grid-cols-2 gap-4'>
          <div>
            <label className='block text-sm font-semibold text-gray-700 mb-2'>Min Price: ₹{priceFilter.min}</label>
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
            <label className='block text-sm font-semibold text-gray-700 mb-2'>Max Price: ₹{priceFilter.max}</label>
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

        {/* Active filter summary */}
        {(selectedCategory || searchKeyword) && (
          <p className='text-sm text-gray-500'>
            Showing <span className='font-semibold text-emerald-700'>{filteredProductsCount}</span> result
            {filteredProductsCount !== 1 ? 's' : ''}
            {selectedCategory && (
              <>
                {' '}
                in <span className='font-semibold capitalize text-emerald-700'>{selectedCategory}</span>
              </>
            )}
            {searchKeyword && (
              <>
                {' '}
                matching "<span className='font-semibold text-emerald-700'>{searchKeyword}</span>"
              </>
            )}
          </p>
        )}
      </div>
    </div>
  )
}

export default FilterSection
