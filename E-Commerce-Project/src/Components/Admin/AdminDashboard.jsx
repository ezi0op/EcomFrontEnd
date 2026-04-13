import React, { useState } from 'react'
import { LayoutDashboard, Users, Package, ShoppingCart } from 'lucide-react'
import AdminOverview from './AdminOverview'
import AdminUsers from './AdminUsers'
import AdminProducts from './AdminProducts'
import AdminOrders from './AdminOrders'
import AdminCoupons from './AdminCoupons'
import { Ticket } from 'lucide-react'

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview')

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
      {/* Sidebar */}
      <div className='w-64 bg-white border-r-2 border-emerald-100 flex flex-col pt-8 space-y-2 shadow-sm z-10'>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-3 px-8 py-4 font-semibold text-sm transition-all duration-300 border-l-4 ${
              activeTab === tab.id
                ? 'border-emerald-600 bg-emerald-50 text-emerald-700 shadow-inner'
                : 'border-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-emerald-600' : 'text-gray-400'}`} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div className='flex-1 p-8 bg-stone-50 overflow-y-auto'>
        {renderContent()}
      </div>
    </div>
  )
}

export default AdminDashboard


