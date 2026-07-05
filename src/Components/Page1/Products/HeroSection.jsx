import React from 'react'
import { Truck, Shield, ShoppingBag } from 'lucide-react'

const HeroSection = ({ handleExploreClick }) => {
  return (
    <div className='bg-gradient-to-r from-emerald-50 to-green-100 min-h-96 flex flex-col items-center justify-center px-8 py-16 relative overflow-hidden'>
      {/* Animated background elements */}
      <div className='absolute top-10 left-10 w-20 h-20 bg-cyan-400 rounded-full opacity-20 animate-bounce'></div>
      <div className='absolute bottom-10 right-10 w-32 h-32 bg-emerald-300 rounded-full opacity-20 animate-pulse'></div>

      {/* Content */}
      <div className='relative z-10 text-center mb-12 animate-fade-in'>
        <h1 className='text-5xl font-bold text-gray-800 mb-4'>
          Welcome to <span className='text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-cyan-500'>Shopping</span>
        </h1>
        <p className='text-xl text-gray-600 mb-8 max-w-2xl'>
          Discover amazing products with exclusive deals and fast delivery
        </p>

        {/* Explore Button */}
        <button
          onClick={handleExploreClick}
          className='px-8 py-4 bg-gradient-to-r from-emerald-600 to-cyan-500 text-white font-bold text-lg rounded-full shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 transform hover:-translate-y-1'
        >
          Explore Now
        </button>
      </div>

      {/* Feature Icons */}
      <div className='grid grid-cols-3 gap-8 relative z-10 mt-12'>
        <div className='flex flex-col items-center gap-3 p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105'>
          <Truck className='w-8 h-8 text-emerald-600' />
          <p className='font-semibold text-gray-700'>Fast Delivery</p>
        </div>
        <div className='flex flex-col items-center gap-3 p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105'>
          <Shield className='w-8 h-8 text-cyan-500' />
          <p className='font-semibold text-gray-700'>Secure Payment</p>
        </div>
        <div className='flex flex-col items-center gap-3 p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105'>
          <ShoppingBag className='w-8 h-8 text-emerald-600' />
          <p className='font-semibold text-gray-700'>Best Deals</p>
        </div>
      </div>
    </div>
  )
}

export default HeroSection
