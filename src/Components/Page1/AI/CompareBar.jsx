import React from 'react'
import { Scale, X, Sparkles } from 'lucide-react'

const CompareBar = ({ compareList, compareModal, toggleCompare, fetchCompare, setCompareList }) => {
  if (compareList.length === 0 || compareModal) return null

  return (
    <div className='fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-white rounded-2xl shadow-2xl border-2 border-orange-200 px-6 py-3 flex items-center gap-4 animate-slide-in'>
      <Scale className='w-5 h-5 text-orange-500 flex-shrink-0' />
      <div className='flex items-center gap-2'>
        {compareList.map((p) => (
          <div
            key={p.id}
            className='flex items-center gap-2 bg-orange-50 border border-orange-200 px-3 py-1.5 rounded-xl'
          >
            <span className='text-sm font-semibold text-gray-800 max-w-24 truncate'>{p.name}</span>
            <button
              onClick={() => toggleCompare(p)}
              className='text-gray-400 hover:text-red-500 transition-colors'
            >
              <X className='w-3.5 h-3.5' />
            </button>
          </div>
        ))}
        {compareList.length === 1 && <span className='text-sm text-gray-400 italic'>Pick 1 more to compare…</span>}
      </div>
      {compareList.length === 2 && (
        <button
          onClick={fetchCompare}
          className='px-5 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold rounded-xl hover:scale-105 transition-all shadow-lg text-sm flex items-center gap-2'
        >
          <Sparkles className='w-4 h-4' /> Compare Now
        </button>
      )}
      <button
        onClick={() => setCompareList([])}
        className='text-gray-400 hover:text-gray-600 transition-colors ml-1'
      >
        <X className='w-4 h-4' />
      </button>
    </div>
  )
}

export default CompareBar
