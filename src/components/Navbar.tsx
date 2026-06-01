import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { useAuth } from '@/hooks/useAuth'
import { useCart } from '@/hooks/useCart'
import { Search, ShoppingBag, User, Menu, X, Heart } from 'lucide-react'

function getOAuthUrl() {
  const kimiAuthUrl = import.meta.env.VITE_KIMI_AUTH_URL
  const appID = import.meta.env.VITE_APP_ID
  const redirectUri = `${window.location.origin}/api/oauth/callback`
  const state = btoa(redirectUri)

  const url = new URL(`${kimiAuthUrl}/api/oauth/authorize`)
  url.searchParams.set('client_id', appID)
  url.searchParams.set('redirect_uri', redirectUri)
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('scope', 'profile')
  url.searchParams.set('state', state)

  return url.toString()
}

const navLinks = [
  { label: 'SHOP', href: '/products' },
  { label: 'NEW', href: '/products?sort=newest' },
  { label: 'ABOUT', href: '/about' },
  { label: 'CONTACT', href: '/contact' },
]

export default function Navbar() {
  const [isCompact, setIsCompact] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const location = useLocation()
  const navigate = useNavigate()
  const { user, isAuthenticated, logout, isAdmin } = useAuth({ redirectPath: '/' })
  const { count } = useCart()

  useEffect(() => {
    const handleScroll = () => {
      setIsCompact(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
    setSearchOpen(false)
  }, [location.pathname])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchOpen(false)
      setSearchQuery('')
    }
  }

  const isHome = location.pathname === '/'
  const showTransparent = isHome && !isCompact && !mobileOpen && !searchOpen

  return (
    <>
      <header
        className="fixed top-0 left-0 w-full z-50 transition-all duration-300"
        style={{
          height: isCompact ? '56px' : '72px',
          backgroundColor: showTransparent ? 'transparent' : '#ffffff',
          borderBottom: showTransparent ? '1px solid rgba(255,255,255,0.2)' : '1px solid #000000',
        }}
      >
        <div className="h-full flex items-center justify-between px-4 sm:px-6 lg:px-10">
          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 -ml-2"
            style={{ color: showTransparent ? '#ffffff' : '#000000' }}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="text-[11px] font-medium tracking-[0.08em] transition-opacity duration-200 hover:opacity-40"
                style={{ color: showTransparent ? '#ffffff' : '#000000' }}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Brand */}
          <Link
            to="/"
            className="absolute left-1/2 -translate-x-1/2 text-[16px] font-semibold tracking-[0.22em]"
            style={{ color: showTransparent ? '#ffffff' : '#000000' }}
          >
            NOIR THREADS
          </Link>

          {/* Right actions */}
          <div className="flex items-center gap-1 sm:gap-3">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 transition-opacity hover:opacity-40"
              style={{ color: showTransparent ? '#ffffff' : '#000000' }}
            >
              <Search size={18} />
            </button>

            {isAuthenticated && (
              <Link
                to="/dashboard"
                className="hidden sm:block p-2 transition-opacity hover:opacity-40"
                style={{ color: showTransparent ? '#ffffff' : '#000000' }}
              >
                <Heart size={18} />
              </Link>
            )}

            {isAdmin && (
              <Link
                to="/admin"
                className="hidden sm:block p-2 text-[10px] font-medium tracking-[0.08em] transition-opacity hover:opacity-40"
                style={{ color: showTransparent ? '#ffffff' : '#000000' }}
              >
                ADMIN
              </Link>
            )}

            {isAuthenticated ? (
              <button
                onClick={logout}
                className="hidden sm:flex items-center gap-1 p-2 text-[10px] font-medium tracking-[0.08em] transition-opacity hover:opacity-40"
                style={{ color: showTransparent ? '#ffffff' : '#000000' }}
              >
                <User size={16} />
                <span className="max-w-[60px] truncate">{user?.name || 'Account'}</span>
              </button>
            ) : (
              <button
                onClick={() => { window.location.href = getOAuthUrl() }}
                className="hidden sm:flex items-center gap-1 p-2 text-[10px] font-medium tracking-[0.08em] transition-opacity hover:opacity-40"
                style={{ color: showTransparent ? '#ffffff' : '#000000' }}
              >
                <User size={16} />
                SIGN IN
              </button>
            )}

            <Link
              to="/cart"
              className="relative p-2 transition-opacity hover:opacity-40"
              style={{ color: showTransparent ? '#ffffff' : '#000000' }}
            >
              <ShoppingBag size={18} />
              {count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-black text-white text-[9px] font-medium flex items-center justify-center">
                  {count}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* Search overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-[60] bg-white animate-fade-in">
          <div className="h-[72px] flex items-center justify-between px-4 sm:px-6 lg:px-10 border-b border-black">
            <span className="text-[11px] font-medium tracking-[0.08em]">SEARCH</span>
            <button onClick={() => setSearchOpen(false)} className="p-2">
              <X size={20} />
            </button>
          </div>
          <form onSubmit={handleSearch} className="p-4 sm:p-6 lg:px-10">
            <input
              autoFocus
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full text-[32px] sm:text-[48px] font-light tracking-[-0.02em] border-b-2 border-black pb-4 outline-none placeholder:text-black/30"
            />
          </form>
        </div>
      )}

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] bg-white animate-fade-in lg:hidden">
          <div className="h-[72px] flex items-center justify-between px-4 border-b border-black">
            <span className="text-[11px] font-medium tracking-[0.08em]">MENU</span>
            <button onClick={() => setMobileOpen(false)} className="p-2">
              <X size={20} />
            </button>
          </div>
          <nav className="p-6 space-y-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="block text-[24px] font-light tracking-[-0.01em] hover:opacity-40 transition-opacity"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-6 border-t border-black space-y-4">
              {isAuthenticated ? (
                <>
                  <Link to="/dashboard" className="block text-[14px] tracking-[0.05em] hover:opacity-40 transition-opacity" onClick={() => setMobileOpen(false)}>
                    MY ACCOUNT
                  </Link>
                  {isAdmin && (
                    <Link to="/admin" className="block text-[14px] tracking-[0.05em] hover:opacity-40 transition-opacity" onClick={() => setMobileOpen(false)}>
                      ADMIN PANEL
                    </Link>
                  )}
                  <button onClick={logout} className="block text-[14px] tracking-[0.05em] hover:opacity-40 transition-opacity">
                    SIGN OUT
                  </button>
                </>
              ) : (
                <button onClick={() => { window.location.href = getOAuthUrl() }} className="block text-[14px] tracking-[0.05em]">
                  SIGN IN
                </button>
              )}
            </div>
          </nav>
        </div>
      )}
    </>
  )
}
