import { motion } from 'framer-motion'

export default function Skeleton({ className = '', variant = 'default', lines = 1, width = 'full' }) {
  const baseClasses = 'animate-shimmer bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800 rounded'

  if (variant === 'text') {
    return (
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <motion.div
            key={i}
            className={`${baseClasses} h-4 ${width === 'full' ? 'w-full' : `w-${width}`} ${className}`}
            style={{
              backgroundSize: '200% 100%',
              animation: 'shimmer 2s linear infinite',
            }}
          />
        ))}
      </div>
    )
  }

  if (variant === 'avatar') {
    return (
      <motion.div
        className={`${baseClasses} rounded-full ${className}`}
        style={{
          backgroundSize: '200% 100%',
          animation: 'shimmer 2s linear infinite',
        }}
      />
    )
  }

  if (variant === 'card') {
    return (
      <motion.div
        className={`${baseClasses} ${className}`}
        style={{
          backgroundSize: '200% 100%',
          animation: 'shimmer 2s linear infinite',
        }}
      />
    )
  }

  return (
    <motion.div
      className={`${baseClasses} ${className}`}
      style={{
        backgroundSize: '200% 100%',
        animation: 'shimmer 2s linear infinite',
      }}
    />
  )
}

