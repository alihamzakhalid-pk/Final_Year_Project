import { useMemo } from 'react'
import { motion } from 'framer-motion'

export default function PasswordStrength({ password = '' }) {
  const strength = useMemo(() => {
    if (!password) return { level: 0, label: '', color: '' }

    let score = 0
    if (password.length >= 8) score++
    if (password.length >= 12) score++
    if (/[a-z]/.test(password)) score++
    if (/[A-Z]/.test(password)) score++
    if (/[0-9]/.test(password)) score++
    if (/[^a-zA-Z0-9]/.test(password)) score++

    if (score <= 2) return { level: 1, label: 'Weak', color: 'error' }
    if (score <= 4) return { level: 2, label: 'Medium', color: 'warning' }
    return { level: 3, label: 'Strong', color: 'success' }
  }, [password])

  if (!password) return null

  const colors = {
    error: {
      bg: 'bg-error-600',
      text: 'text-error-600',
      label: 'Weak',
    },
    warning: {
      bg: 'bg-warning-600',
      text: 'text-warning-600',
      label: 'Medium',
    },
    success: {
      bg: 'bg-success-600',
      text: 'text-success-600',
      label: 'Strong',
    },
  }

  const color = colors[strength.color]

  return (
    <div className="mt-2">
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="text-slate-600 dark:text-slate-400">Password strength</span>
        <span className={`font-medium ${color.text}`}>{color.label}</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
        <motion.div
          className={`h-full ${color.bg}`}
          initial={{ width: 0 }}
          animate={{ width: `${(strength.level / 3) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </div>
  )
}

