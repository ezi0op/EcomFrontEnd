import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const Pagination = ({ showAllProducts, totalPages, currentPage, setCurrentPage }) => {
  if (!showAllProducts || totalPages <= 1) return null

  return (
    <div className='flex items-center justify-center gap-4 mt-12 mb-8'>
      <button
        onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
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
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => setCurrentPage(page)}
            className={`w-10 h-10 rounded-lg font-bold transition-all ${
              currentPage === page ? 'bg-cyan-500 text-white scale-110' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {page}
          </button>
        ))}
      </div>

      <button
        onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
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
  )
}

export default Pagination
