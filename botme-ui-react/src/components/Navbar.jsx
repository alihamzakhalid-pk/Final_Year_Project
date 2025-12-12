import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, Search, Settings, User, LogOut, ChevronDown, Menu, X } from 'lucide-react'
import ThemeToggle from './ThemeToggle'
import { useAuth } from '../hooks/useAuth'
import Avatar from './Avatar'
import Badge from './ui/Badge'
import SearchInput from './ui/SearchInput'
import Modal from './ui/Modal'
import Logo from './Logo'

const navLinks = [
  { to: '/', label: 'Home', authOnly: false },
  { to: '/dashboard', label: 'Dashboard', authOnly: true },
  { to: '/about', label: 'About', authOnly: false },
  { to: '/help', label: 'Help', authOnly: false },
  { to: '/contact', label: 'Contact', authOnly: false },
]

export default function Navbar() {
  const { user, logout } = useAuth() || {}
  const [mobileOpen, setMobileOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const menuRef = useRef(null)
  const notificationRef = useRef(null)
  const location = useLocation()
  const navigate = useNavigate()
  const notificationCount = 3 // Mock notification count

  useEffect(() => {
    setMobileOpen(false)
    setMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    const handleClick = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false)
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setNotificationsOpen(false)
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
                  `relative text-sm font-medium tracking-tight transition-colors duration-200 focus:outline-none ${
                    isActive
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
                      `relative text-sm font-medium tracking-tight text-[#6B7280] dark:text-slate-300 transition-colors duration-200 hover:text-[#5B7FFF] focus-visible:text-[#5B7FFF] focus:outline-none ${
                        isActive
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
        <div className="hidden flex-1 items-center justify-center px-8 lg:flex">
          <SearchInput
            value=""
            onChange={() => {}}
            placeholder="Search..."
            className="w-[400px]"
            onClick={() => setSearchOpen(true)}
          />
        </div>
      )}

        <div className="flex items-center gap-3">
          {user && (
            <>
              {/* Search Button - Mobile */}
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className="flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-sm text-[#6B7280] dark:text-slate-300 transition-all hover:border-primary-300 hover:text-primary md:hidden"
              >
                <Search className="h-4 w-4" />
              </button>

              {/* Notifications */}
              <div ref={notificationRef} className="relative">
                <button
                  type="button"
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="relative rounded-lg p-2 text-[#6B7280] dark:text-slate-300 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-primary focus:visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                  aria-label="Notifications"
                >
                  <Bell className="h-5 w-5" />
                  {notificationCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#5B7FFF] text-xs font-bold text-white">
                      {notificationCount > 9 ? '9+' : notificationCount}
                    </span>
                  )}
                </button>
                {notificationsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute right-0 mt-2 w-80 rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900"
                  >
                    <div className="border-b border-slate-200 px-4 py-3 dark:border-slate-800">
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Notifications</h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto p-2">
                      <div className="rounded-lg p-3 text-sm text-slate-500 dark:text-slate-400">
                        No new notifications
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </>
          )}

          {!user ? (
            <div className="hidden items-center gap-2 md:flex">
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm font-medium text-[#1F2937] dark:text-slate-200 transition hover:border-[#5B7FFF] hover:text-[#5B7FFF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B7FFF]/50"
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => navigate('/signup')}
                className="rounded-xl bg-[#5B7FFF] px-6 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-[#4A6AD9] hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B7FFF]/60"
              >
                Try Free
              </button>
            </div>
          ) : (
            <div ref={menuRef} className="relative">
              <button
                type="button"
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium text-[#1F2937] dark:text-slate-200 transition hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                aria-expanded={menuOpen}
                aria-haspopup="menu"
                onClick={() => setMenuOpen((prev) => !prev)}
              >
                <Avatar name={user?.fullName || user?.username || 'User'} size={32} />
                <span className="hidden max-w-[120px] truncate text-sm font-medium md:block text-[#1F2937] dark:text-slate-200">
                  {user?.fullName || user?.username || 'User'}
                </span>
                <ChevronDown className="h-4 w-4 text-[#6B7280] dark:text-slate-400" />
              </button>
              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    role="menu"
                    aria-label="Profile"
                    className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900"
                  >
                    <div className="border-b border-slate-200 px-4 py-3 dark:border-slate-800">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        {user?.fullName || 'User'}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{user?.email}</p>
                    </div>
                    <div className="p-1">
                      <button
                        type="button"
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
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
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                        onClick={() => {
                          navigate('/settings')
                          setMenuOpen(false)
                        }}
                        role="menuitem"
                      >
                        <Settings className="h-4 w-4" />
                        Settings
                      </button>
                      <div className="my-1 border-t border-slate-200 dark:border-slate-800" />
                      <button
                        type="button"
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-error-600 transition hover:bg-error-50 dark:text-error-400 dark:hover:bg-error-900/20"
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
          )}

          <ThemeToggle />

          <button
            type="button"
            className="inline-flex items-center justify-center rounded-lg border border-transparent p-2 text-[#6B7280] dark:text-slate-300 transition hover:text-[#5B7FFF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B7FFF]/50 md:hidden"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label="Toggle navigation"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
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
                    `block rounded-lg px-3 py-2 font-medium tracking-tight transition ${
                      isActive
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
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-center font-semibold text-slate-700 hover:border-primary/40 hover:text-primary-600 dark:border-slate-700 dark:text-slate-200"
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/signup')}
                  className="flex-1 rounded-lg bg-primary-600 px-3 py-2 text-center font-semibold text-white"
                >
                  Sign Up
                </button>
              </div>
            )}
          </nav>
        </motion.div>
      )}
    </header>

    {/* Search Modal */}
    <Modal
      isOpen={searchOpen}
      onClose={() => setSearchOpen(false)}
      title="Search"
      size="lg"
    >
      <SearchInput
        value=""
        onChange={() => {}}
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

