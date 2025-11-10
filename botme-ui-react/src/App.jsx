import { Route, Routes, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import Chat from './pages/Chat'
import About from './pages/About'
import Help from './pages/Help'
import Contact from './pages/Contact'
import Privacy from './pages/Privacy'
import Terms from './pages/Terms'
import Login from './pages/Login'
import Signup from './pages/Signup'
import ProtectedRoute from './components/ProtectedRoute'
import { AuthProvider } from './hooks/useAuth'
import useThemePreference from './hooks/useThemePreference'
import SelectPerson from './pages/SelectPerson'
import Settings from './pages/Settings'
import PersonalityAnalysis from './pages/PersonalityAnalysis'
import { ToastProvider } from './components/ui/Toast'

export default function App() {
  const { mode } = useThemePreference()
  const location = useLocation()

  return (
    <div className={mode === 'dark' ? 'dark' : ''}>
      <ToastProvider>
        <AuthProvider>
          <div className="min-h-screen flex flex-col bg-[#F8FAFC] transition-colors duration-300">
          <Navbar />
          <AnimatePresence mode="wait">
            <motion.main
              key={location.pathname}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="flex-1"
            >
              <Routes location={location}>
                    <Route path="/" element={<Landing />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/help" element={<Help />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/privacy" element={<Privacy />} />
                    <Route path="/terms" element={<Terms />} />
                    <Route
                      path="/dashboard"
                      element={(
                        <ProtectedRoute>
                          <Dashboard />
                        </ProtectedRoute>
                      )}
                    />
                    <Route
                      path="/select/:chatId"
                      element={(
                        <ProtectedRoute>
                          <SelectPerson />
                        </ProtectedRoute>
                      )}
                    />
                    <Route
                      path="/chat/:chatId"
                      element={(
                        <ProtectedRoute>
                          <Chat />
                        </ProtectedRoute>
                      )}
                    />
                    <Route
                      path="/settings"
                      element={(
                        <ProtectedRoute>
                          <Settings />
                        </ProtectedRoute>
                      )}
                    />
                    <Route
                      path="/personality/:chatId?"
                      element={(
                        <ProtectedRoute>
                          <PersonalityAnalysis />
                        </ProtectedRoute>
                      )}
                    />
                    <Route path="/chat" element={<Navigate to="/dashboard" replace />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </motion.main>
          </AnimatePresence>
          <Footer />
        </div>
        </AuthProvider>
      </ToastProvider>
    </div>
  )
}

