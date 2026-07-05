import React from 'react'
import { Sparkles, X, Loader, MessageCircle, ShoppingBag, Zap } from 'lucide-react'

const AiInsightModal = ({
  product,
  onClose,
  aiSummary,
  aiSummaryLoading,
  aiQuestion,
  setAiQuestion,
  askAdvice,
  aiAdvice,
  aiAdviceLoading,
  formatAiText,
  handleAddToCart,
  handleBuyNow,
}) => {
  if (!product) return null

  return (
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
              <h3 className='font-bold text-base leading-tight max-w-72 line-clamp-2'>{product.name}</h3>
            </div>
          </div>
          <button onClick={onClose} className='text-white/70 hover:text-white transition-colors mt-0.5'>
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
                type='text'
                value={aiQuestion}
                onChange={(e) => setAiQuestion(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && askAdvice()}
                placeholder='e.g. Is this good for gifting? Worth the price?'
                className='flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-violet-500 transition-all'
              />
              <button
                onClick={askAdvice}
                disabled={aiAdviceLoading || !aiQuestion.trim()}
                className='px-4 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-bold text-sm hover:scale-105 transition-all disabled:opacity-60'
              >
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
            <button
              onClick={() => {
                handleAddToCart(product)
                onClose()
              }}
              className='flex-1 py-2.5 bg-cyan-500 text-white font-bold rounded-xl text-sm hover:scale-105 transition-all flex items-center justify-center gap-1'
            >
              <ShoppingBag className='w-4 h-4' /> Add to Cart
            </button>
            <button
              onClick={() => {
                onClose()
                handleBuyNow(product)
              }}
              className='flex-1 py-2.5 bg-yellow-500 text-white font-bold rounded-xl text-sm hover:scale-105 transition-all flex items-center justify-center gap-1'
            >
              <Zap className='w-4 h-4' /> Buy Now
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AiInsightModal
