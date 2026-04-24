import React, { useState } from 'react'
import Header from './Header'
import Mid from './Mid'
import Footer from './Footer'
import AdminDashboard from '../Admin/AdminDashboard'

const Page1 = () => {
    const [headerSearch, setHeaderSearch] = useState('')
    const [showingAllProducts, setShowingAllProducts] = useState(false)
    const [adminView, setAdminView] = useState('dashboard') // 'dashboard' | 'store'

    const userRole = localStorage.getItem('userRole')
    const isAdmin = userRole === 'ROLE_ADMIN' || userRole === 'ADMIN'

    // If we're an admin but viewing the store, don't hide the search entirely. 
    // We only hide search if we're showing all products.
    const hideSearch = showingAllProducts || (isAdmin && adminView === 'dashboard')

    return (
        <div>
            <div className=''>
                <Header 
                    searchKeyword={headerSearch} 
                    setSearchKeyword={setHeaderSearch} 
                    hideSearch={hideSearch} 
                    adminView={adminView}
                    setAdminView={setAdminView}
                />
            </div>
            <div>
                {isAdmin && adminView === 'dashboard' ? (
                    <AdminDashboard />
                ) : (
                    <Mid
                        initialSearchKeyword={headerSearch}
                        onShowAllProductsChange={setShowingAllProducts}
                    />
                )}
            </div>
            <div>
                <Footer />
            </div>
        </div>
    )
}

export default Page1


