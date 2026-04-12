import { Search, ShoppingBag, X, LogOut, User, ShoppingCart, Lock } from 'lucide-react'
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const Header = ({ searchKeyword = '', setSearchKeyword = () => {}, hideSearch = false, adminView, setAdminView }) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [evicted, setEvicted] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('token')
    const role = localStorage.getItem('userRole')
    const userId = localStorage.getItem('userId')
    setIsLoggedIn(!!token)
    setIsAdmin(role === 'ROLE_ADMIN' || role === 'ADMIN')

    // Security check: ensure user is still active in the database
    if (token && userId) {
      axios.get(`https://e-commerce-project-backend-fq6y.onrender.com/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => {
        if (res.data?.data && res.data.data.active === false) {
          console.warn('User is blocked/inactive. Force evicting session.')
          localStorage.clear()
          setEvicted(true)
        }
      }).catch(err => {
        if (err.response?.status === 401 || err.response?.status === 403) {
          localStorage.clear()
          setEvicted(true)
        }
      })
    }
  }, [])

  const handleLoginClick = () => navigate('/login')
  const handleRegisterClick = () => navigate('/register')

  const handleProfileClick = () => {
    navigate('/profile/update')
    setShowUserMenu(false)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userId')
    localStorage.removeItem('userRole')
    localStorage.removeItem('userName')
    setIsLoggedIn(false)
    setShowUserMenu(false)
    window.location.href = '/'
  }

  const handleSearchChange = (e) => setSearchKeyword(e.target.value)
  const handleClearSearch = () => setSearchKeyword('')
  const handleSearchClose = () => setIsSearchOpen(false)
  const handleCartClick = () => navigate('/cart')

  const handleOrdersClick = () => {
    setShowUserMenu(false)
    setTimeout(() => navigate('/orders'), 100)
  }

  return (
    <>
      {/* ── Account Suspended Modal ── */}
      {evicted && (
        <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <Lock className="w-10 h-10 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Account Suspended</h2>
            <p className="text-sm text-gray-500 mb-6 px-2">
              Your access has been revoked by an administrator. You have been logged out of your session.
            </p>
            <button
              onClick={() => { window.location.href = '/' }}
              className="w-full py-3 bg-gradient-to-r from-red-600 to-red-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all"
            >
              Return to Store
            </button>
          </div>
        </div>
      )}

      {/* ── Main Header Bar ── */}
      <header className='bg-white border-b-2 border-emerald-100/50 sticky top-0 z-40 backdrop-blur-md bg-white/80'>
        <div className='flex items-center justify-between px-8 py-4 h-20'>

          {/* Logo */}
          <div className='flex-shrink-0 cursor-pointer' onClick={() => { window.location.href = '/' }}>
            <div className='w-14 h-14 rounded-full bg-stone-300 shadow-lg border-4 border-cyan-400 flex items-center justify-center hover:shadow-2xl hover:scale-105 transition-all duration-300 p-1'>
              <img src="/shopping-logo.png" alt="Shopping Logo" className='w-full h-full object-cover rounded-full' />
            </div>
          </div>

          {/* Search bar (expanded) */}
          <div className='flex-1 mx-12'>
            {!hideSearch && isSearchOpen ? (
              <div className='flex items-center gap-3 bg-white rounded-full px-6 py-3 shadow-lg border-2 border-emerald-500'>
                <Search className='w-5 h-5 text-gray-500' />
                <input
                  type='text'
                  placeholder='Search products...'
                  value={searchKeyword}
                  onChange={handleSearchChange}
                  autoFocus
                  className='flex-1 bg-transparent outline-none text-gray-700 placeholder-gray-400'
                />
                {searchKeyword && (
                  <button onClick={handleClearSearch} className='text-gray-500 hover:text-red-500 transition-colors'>
                    <X className='w-5 h-5' />
                  </button>
                )}
                <button onClick={handleSearchClose} className='text-gray-500 hover:text-gray-700 transition-colors'>
                  <X className='w-5 h-5' />
                </button>
              </div>
            ) : (
              <div className='flex-1' />
            )}
          </div>

          {/* Right side controls */}
          <div className='flex items-center gap-4'>

            {/* Admin Dashboard / Storefront toggle */}
            {isAdmin && adminView && setAdminView && (
              <div className='flex bg-emerald-50 p-1 rounded-xl border border-emerald-200 shadow-inner'>
                <button
                  onClick={() => setAdminView('dashboard')}
                  className={`px-3 py-1.5 rounded-lg text-xs uppercase tracking-wide font-extrabold transition-all duration-200 ${adminView === 'dashboard' ? 'bg-white text-emerald-700 shadow-sm' : 'text-emerald-500/70 hover:text-emerald-700'}`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => setAdminView('store')}
                  className={`px-3 py-1.5 rounded-lg text-xs uppercase tracking-wide font-extrabold transition-all duration-200 ${adminView === 'store' ? 'bg-white text-emerald-700 shadow-sm' : 'text-emerald-500/70 hover:text-emerald-700'}`}
                >
                  Storefront
                </button>
              </div>
            )}

            {/* Search icon */}
            {!hideSearch && !isSearchOpen && (
              <button
                onClick={() => setIsSearchOpen(true)}
                className='text-gray-700 hover:text-emerald-600 hover:scale-110 transition-all duration-300'
                title='Search'
              >
                <Search strokeWidth={2.5} className='w-6 h-6' />
              </button>
            )}

            {/* Account menu */}
            {isLoggedIn ? (
              <div className='relative'>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className='flex items-center gap-2 text-gray-700 font-bold text-base hover:text-emerald-600 transition-colors px-3 py-2 rounded-lg hover:bg-emerald-50'
                >
                  <User className='w-6 h-6' />
                  <span>Account</span>
                </button>

                {showUserMenu && (
                  <div className='absolute right-0 top-full mt-2 bg-white rounded-xl shadow-2xl border-2 border-emerald-200 py-2 z-50 min-w-56 overflow-hidden'>
                    <button
                      onClick={handleProfileClick}
                      className='w-full px-5 py-3 text-left text-gray-800 hover:bg-emerald-50 flex items-center gap-3 transition-all font-semibold border-b border-gray-100'
                    >
                      <User className='w-5 h-5 text-emerald-600' />
                      <span>My Profile</span>
                    </button>
                    {!isAdmin && (
                      <button
                        onClick={handleOrdersClick}
                        className='w-full px-5 py-3 text-left text-gray-800 hover:bg-emerald-50 flex items-center gap-3 transition-all font-semibold border-b border-gray-100'
                      >
                        <ShoppingCart className='w-5 h-5 text-cyan-500' />
                        <span>My Orders</span>
                      </button>
                    )}
                    <button
                      onClick={handleLogout}
                      className='w-full px-5 py-3 text-left text-red-600 hover:bg-red-50 flex items-center gap-3 transition-all font-semibold'
                    >
                      <LogOut className='w-5 h-5' />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className='flex items-center gap-3'>
                <button onClick={handleLoginClick} className='text-gray-700 font-bold hover:text-emerald-600 transition-colors'>
                  Login
                </button>
                <span className='text-gray-400'>/</span>
                <button onClick={handleRegisterClick} className='text-gray-700 font-bold hover:text-emerald-600 transition-colors'>
                  Sign Up
                </button>
              </div>
            )}

            {/* Cart icon — hidden for admins */}
            {!isAdmin && (
              <ShoppingBag
                strokeWidth={2.5}
                className='text-gray-700 w-6 h-6 cursor-pointer hover:text-emerald-600 hover:scale-110 transition-all duration-300'
                onClick={handleCartClick}
                title='View Cart'
              />
            )}
          </div>
        </div>

        <style>{`
          @keyframes slide-in {
            from { opacity: 0; transform: scaleX(0.8); }
            to   { opacity: 1; transform: scaleX(1); }
          }
          .animate-slide-in { animation: slide-in 0.2s ease-out; }
        `}</style>
      </header>
    </>
  )
}

export default Header
