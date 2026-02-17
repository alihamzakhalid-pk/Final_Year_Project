import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Settings, User, LogOut, ChevronDown, Menu, X, Key } from 'lucide-react'
import ThemeToggle from './ThemeToggle'
import { useAuth } from '../hooks/useAuth'
import Avatar from './Avatar'
import Badge from './ui/Badge'
import SearchInput from './ui/SearchInput'
import Modal from './ui/Modal'
import Logo from './Logo'
import ApiKeyModal from './ApiKeyModal'
import UIButton from './ui/Button'

const navLinks = [
  { to: '/', label: 'Home', authOnly: false },
  { to: '/dashboard', label: 'Dashboard', authOnly: true },
  { to: '/about', label: 'About', authOnly: false },
  { to: '/help', label: 'Help', authOnly: false },
  { to: '/contact', label: 'Contact', authOnly: false },
]

export default function Navbar() {
  const { user, logout, refreshUser } = useAuth() || {}
  const [mobileOpen, setMobileOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false)
  const menuRef = useRef(null)
  const location = useLocation()
  const navigate = useNavigate()

  // Refresh user data when menu opens to show latest admin status
  const handleMenuOpen = async () => {
    setMenuOpen(true)
    if (refreshUser && user) {
      await refreshUser()
    }
  }


  useEffect(() => {
    setMobileOpen(false)
    setMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    const handleClick = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Keyboard shortcut for search (⌘K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault()
        setSearchOpen(true)
      }
      if (event.key === 'Escape') {
        setSearchOpen(false)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])


  return (
    <>
      <header className="sticky top-0 z-50 border-b border-[#E5E7EB] dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo + Home - Left */}
          <div className="flex items-center gap-6">
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              <Link
                to="/"
                className="flex items-center gap-2 rounded-lg px-3 py-1.5 transition-all hover:bg-[#E8F0FF] dark:hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5B7FFF]/50"
              >
                <Logo size={48} showText={true} />
              </Link>
            </motion.div>

            {/* Navigation Links */}
            <nav className="hidden items-center gap-6 md:flex" aria-label="Primary">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `relative text-sm font-medium tracking-tight transition-colors duration-200 focus:outline-none ${isActive
                    ? 'text-[#5B7FFF] after:absolute after:-bottom-2 after:left-0 after:h-0.5 after:w-full after:rounded-full after:bg-[#5B7FFF]'
                    : 'text-[#6B7280] dark:text-slate-300 hover:text-[#5B7FFF]'
                  }`
                }
                end
              >
                Home
              </NavLink>
              {navLinks
                .filter((link) => (!link.authOnly || Boolean(user)) && link.to !== '/')
                .map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    className={({ isActive }) =>
                      `relative text-sm font-medium tracking-tight text-[#6B7280] dark:text-slate-300 transition-colors duration-200 hover:text-[#5B7FFF] focus-visible:text-[#5B7FFF] focus:outline-none ${isActive
                        ? 'text-[#5B7FFF] after:absolute after:-bottom-2 after:left-0 after:h-0.5 after:w-full after:rounded-full after:bg-[#5B7FFF]'
                        : ''
                      }`
                    }
                  >
                    {link.label}
                  </NavLink>
                ))}
            </nav>
          </div>

          {/* Search Bar - Center */}
          {user && (
            <div className="hidden flex-1 items-center justify-center gap-4 px-8 lg:flex">
              {/* API Key Button */}
              <UIButton
                variant="outline"
                size="sm"
                onClick={() => setApiKeyModalOpen(true)}
                className="flex items-center gap-2 !rounded-full border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/30 px-4 py-2 font-bold text-slate-700 dark:text-slate-200 shadow-sm hover:shadow-md hover:border-[#5B7FFF] hover:text-[#5B7FFF] transition-all duration-300"
              >
                <Key className="h-3.5 w-3.5" />
                API Key
              </UIButton>

              <SearchInput
                value=""
                onChange={() => { }}
                placeholder="Search..."
                className="w-[300px]"
                onClick={() => setSearchOpen(true)}
              />
            </div>
          )}

          <div className="flex items-center gap-3">
            {user && (
              <>
                {/* Search Button - Mobile */}
                <UIButton
                  variant="outline"
                  size="md"
                  onClick={() => setSearchOpen(true)}
                  className="flex items-center gap-2 rounded-lg border-slate-200 dark:border-slate-700 px-3 py-1.5 text-[#6B7280] dark:text-slate-300 md:hidden"
                >
                  <Search className="h-4 w-4" />
                </UIButton>

                <div className="relative" ref={menuRef}>
                  <button
                    type="button"
                    className="group flex items-center gap-2 rounded-full border border-slate-200 dark:border-slate-700 bg-[#E8F0FF]/40 dark:bg-slate-800/50 pl-1 pr-3 py-1 text-sm font-semibold transition-all hover:bg-[#E8F0FF]/60 dark:hover:bg-slate-800 hover:border-[#5B7FFF]/40 dark:hover:border-[#5B7FFF]/40 hover:shadow-sm"
                    aria-expanded={menuOpen}
                    aria-haspopup="menu"
                    onClick={() => {
                      const newState = !menuOpen
                      setMenuOpen(newState)
                      if (newState && refreshUser && user) {
                        refreshUser()
                      }
                    }}
                  >
                    <Avatar name={user?.fullName || user?.username || 'User'} size={28} />
                    <span className="hidden max-w-[120px] truncate md:block text-[#374151] dark:text-slate-200">
                      {user?.fullName || user?.username || 'User'}
                    </span>
                    <ChevronDown className={`h-4 w-4 text-[#6B7280] dark:text-slate-400 transition-transform duration-300 ${menuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {menuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        role="menu"
                        aria-label="Profile"
                        className="absolute right-0 mt-3 w-56 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-2xl dark:border-slate-800 dark:bg-slate-900 overflow-hidden"
                      >
                        <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-800">
                          <p className="text-sm font-bold text-slate-900 dark:text-white">
                            {user?.fullName || 'User'}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
                        </div>
                        <div className="mt-1">
                          <button
                            type="button"
                            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                            onClick={() => {
                              navigate('/dashboard')
                              setMenuOpen(false)
                            }}
                            role="menuitem"
                          >
                            <User className="h-4 w-4" />
                            Dashboard
                          </button>
                          <button
                            type="button"
                            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                            onClick={() => {
                              navigate('/settings')
                              setMenuOpen(false)
                            }}
                            role="menuitem"
                          >
                            <Settings className="h-4 w-4" />
                            Settings
                          </button>
                          {user?.is_admin && (
                            <button
                              type="button"
                              className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-bold text-yellow-600 dark:text-yellow-400 transition hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
                              onClick={() => {
                                navigate('/admin')
                                setMenuOpen(false)
                              }}
                              role="menuitem"
                            >
                              <Settings className="h-4 w-4" />
                              Admin Panel
                            </button>
                          )}
                          <div className="my-1 border-t border-slate-100 dark:border-slate-800" />
                          <button
                            type="button"
                            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-bold text-error-600 transition hover:bg-error-50 dark:text-error-400 dark:hover:bg-error-900/20"
                            onClick={() => {
                              logout?.()
                              navigate('/login')
                              setMenuOpen(false)
                            }}
                            role="menuitem"
                          >
                            <LogOut className="h-4 w-4" />
                            Logout
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            )}

            {!user && (
              <div className="hidden items-center gap-2 md:flex">
                <UIButton
                  as={Link}
                  to="/login"
                  variant="ghost"
                  size="sm"
                  className="rounded-full font-semibold"
                >
                  Log in
                </UIButton>
                <UIButton
                  as={Link}
                  to="/signup"
                  variant="gradient"
                  size="sm"
                  className="rounded-full px-5 py-2 font-bold"
                >
                  Start for Free
                </UIButton>
              </div>
            )}

            <ThemeToggle />

            <UIButton
              variant="ghost"
              size="md"
              onClick={() => setMobileOpen((prev) => !prev)}
              className="rounded-full p-2 md:hidden"
              aria-label="Toggle navigation"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </UIButton>
          </div>
        </div>

        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden"
          >
            <nav className="space-y-1 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-4 text-sm" aria-label="Mobile">
              {navLinks
                .filter((link) => !link.authOnly || Boolean(user))
                .map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    className={({ isActive }) =>
                      `block rounded-lg px-3 py-2 font-medium tracking-tight transition ${isActive
                        ? 'bg-[#E8F0FF] dark:bg-slate-800 text-[#5B7FFF]'
                        : 'text-[#6B7280] dark:text-slate-300 hover:bg-[#E8F0FF] dark:hover:bg-slate-800 hover:text-[#5B7FFF]'
                      }`
                    }
                    end={link.to === '/'}
                  >
                    {link.label}
                  </NavLink>
                ))}

              {!user && (
                <div className="mt-4 flex gap-3">
                  <UIButton
                    as={Link}
                    to="/login"
                    variant="outline"
                    size="md"
                    className="flex-1 rounded-lg"
                  >
                    Login
                  </UIButton>
                  <UIButton
                    as={Link}
                    to="/signup"
                    variant="gradient"
                    size="md"
                    className="flex-1 rounded-full px-6 py-2 font-bold shadow-lg"
                  >
                    Start for Free
                  </UIButton>
                </div>
              )}
            </nav>
          </motion.div>
        )}
      </header>

      {/* API Key Modal */}
      <ApiKeyModal
        isOpen={apiKeyModalOpen}
        onClose={() => setApiKeyModalOpen(false)}
      />

      {/* Search Modal */}
      <Modal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        title="Search"
        size="lg"
      >
        <SearchInput
          value=""
          onChange={() => { }}
          placeholder="Search conversations, personas, messages..."
          autoFocus
          className="w-full"
        />
        <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
          Search functionality coming soon. Use ⌘K to open this dialog.
        </p>
      </Modal>
    </>
  )
}

