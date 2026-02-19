import { useEffect, useState, createContext, useContext, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'

const toastVariants = {
  success: {
    icon: CheckCircle,
    bg: 'bg-success-50 dark:bg-success-50/10',
    border: 'border-success-200 dark:border-success-500/30',
    text: 'text-success-700 dark:text-success-300',
    iconColor: 'text-success-600 dark:text-success-400',
  },
  error: {
    icon: AlertCircle,
    bg: 'bg-error-50 dark:bg-error-50/10',
    border: 'border-error-200 dark:border-error-500/30',
    text: 'text-error-700 dark:text-error-300',
    iconColor: 'text-error-600 dark:text-error-400',
  },
  warning: {
    icon: AlertTriangle,
    bg: 'bg-warning-50 dark:bg-warning-50/10',
    border: 'border-warning-200 dark:border-warning-500/30',
    text: 'text-warning-700 dark:text-warning-300',
    iconColor: 'text-warning-600 dark:text-warning-400',
  },
  info: {
    icon: Info,
    bg: 'bg-info-50 dark:bg-info-50/10',
    border: 'border-info-200 dark:border-info-500/30',
    text: 'text-info-700 dark:text-info-300',
    iconColor: 'text-info-600 dark:text-info-400',
  },
}

export default function Toast({ id, message, variant = 'info', duration = 2000, onClose }) {
  const [progress, setProgress] = useState(100)
  const variantStyles = toastVariants[variant] || toastVariants.info
  const Icon = variantStyles.icon

  useEffect(() => {
    if (duration > 0) {
      const interval = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev - (100 / (duration / 100))
          if (newProgress <= 0) {
            return 0
          }
          return newProgress
        })
      }, 100)

      // Set timeout to call onClose after duration
      const timeout = setTimeout(() => {
        onClose()
      }, duration)

      return () => {
        clearInterval(interval)
        clearTimeout(timeout)
      }
    }
  }, [duration, onClose])

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={`relative flex items-center gap-3 rounded-lg border ${variantStyles.border} ${variantStyles.bg} px-4 py-3 shadow-lg min-w-[280px] max-w-sm`}
    >
      <Icon className={`h-5 w-5 ${variantStyles.iconColor} flex-shrink-0`} />
      <p className={`text-sm font-medium ${variantStyles.text} flex-1 min-w-0`}>{message}</p>
      <button
        onClick={onClose}
        className={`flex-shrink-0 rounded-md p-1 ${variantStyles.text} hover:bg-black/5 dark:hover:bg-white/10 transition-colors`}
        aria-label="Close notification"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </motion.div>
  )
}

// Toast Container Component
export function ToastContainer({ toasts, removeToast }) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <Toast {...toast} onClose={() => removeToast(toast.id)} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  )
}

// Toast Hook/Context
const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, variant = 'info', duration = 2000) => {
    const id = Date.now() + Math.random()
    setToasts((prev) => [...prev, { id, message, variant, duration }])
    return id
  }, [])

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const showSuccess = useCallback((message, duration) => addToast(message, 'success', duration), [addToast])
  const showError = useCallback((message, duration) => addToast(message, 'error', duration), [addToast])
  const showWarning = useCallback((message, duration) => addToast(message, 'warning', duration), [addToast])
  const showInfo = useCallback((message, duration) => addToast(message, 'info', duration), [addToast])

  return (
    <ToastContext.Provider value={{ addToast, removeToast, showSuccess, showError, showWarning, showInfo }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}

