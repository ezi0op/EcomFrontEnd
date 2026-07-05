import React from 'react'
import { Scale, X, Loader } from 'lucide-react'

const CompareModal = ({
  compareModal,
  compareList,
  onClose,
  compareLoading,
  compareResult,
  setCompareList,
  formatAiText,
}) => {
  if (!compareModal) return null

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4'>
      <div className='bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden'>
        <div className='bg-gradient-to-r from-orange-50 to-amber-500 p-5 flex items-center justify-between flex-shrink-0'>
          <div className='flex items-center gap-3 text-white'>
            <Scale className='w-6 h-6' />
            <div>
              <p className='text-xs font-semibold text-orange-100 uppercase tracking-wide'>AI Comparison</p>
              <h3 className='font-bold text-base'>
                {compareList[0]?.name} <span className='opacity-70'>vs</span> {compareList[1]?.name}
              </h3>
            </div>
          </div>
          <button onClick={onClose} className='text-white/70 hover:text-white transition-colors'>
            <X className='w-5 h-5' />
          </button>
        </div>

        {/* Product thumbnails */}
        <div className='grid grid-cols-2 border-b border-gray-100 flex-shrink-0'>
          {compareList.map((p) => (
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
          <button
            onClick={() => {
              onClose()
              setCompareList([])
            }}
            className='w-full py-2.5 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all text-sm'
          >
            Close & Clear
          </button>
        </div>
      </div>
    </div>
  )
}

export default CompareModal
