import React, { useState } from 'react'
import { LayoutDashboard, Users, Package, ShoppingCart, Menu, X } from 'lucide-react'
import AdminOverview from './AdminOverview'
import AdminUsers from './AdminUsers'
import AdminProducts from './AdminProducts'
import AdminOrders from './AdminOrders'
import AdminCoupons from './AdminCoupons'
import { Ticket } from 'lucide-react'

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return <AdminOverview />
      case 'users': return <AdminUsers />
      case 'products': return <AdminProducts />
      case 'orders': return <AdminOrders />
      case 'coupons': return <AdminCoupons />
      default: return <AdminOverview />
    }
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'users', label: 'Customers', icon: Users },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
    { id: 'coupons', label: 'Coupons', icon: Ticket },
  ]

  return (
    <div className='flex min-h-[80vh] bg-stone-50'>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className='md:hidden fixed top-20 left-4 z-50 p-2 bg-emerald-600 text-white rounded-lg'
      >
        {sidebarOpen ? <X className='w-6 h-6' /> : <Menu className='w-6 h-6' />}
      </button>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className='fixed inset-0 z-30 bg-black/40 md:hidden'
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed md:static left-0 top-0 h-full w-64 bg-white border-r-2 border-emerald-100 flex flex-col pt-8 space-y-2 shadow-sm z-40 transition-transform duration-300 transform
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id)
              setSidebarOpen(false)
            }}
            className={`flex items-center gap-3 px-6 sm:px-8 py-3 sm:py-4 font-semibold text-xs sm:text-sm transition-all duration-300 border-l-4 ${activeTab === tab.id
                ? 'border-emerald-600 bg-emerald-50 text-emerald-700 shadow-inner'
                : 'border-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
          >
            <tab.icon className={`w-5 h-5 flex-shrink-0 ${activeTab === tab.id ? 'text-emerald-600' : 'text-gray-400'}`} />
            <span className='truncate'>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div className='flex-1 p-4 sm:p-6 md:p-8 bg-stone-50 overflow-y-auto w-full'>
        {renderContent()}
      </div>
    </div>
  )
}

export default AdminDashboard


