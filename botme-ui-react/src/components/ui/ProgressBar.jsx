import { motion } from 'framer-motion'

export default function ProgressBar({ value = 0, max = 100, showLabel = true, className = '', color = 'primary' }) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)
  const colorClasses = {
    primary: 'bg-primary-600',
    success: 'bg-success-600',
    error: 'bg-error-600',
    warning: 'bg-warning-600',
    info: 'bg-info-600',
  }

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="mb-2 flex items-center justify-between text-xs">
          <span className="font-medium text-slate-700 dark:text-slate-300">Progress</span>
          <span className="text-slate-500 dark:text-slate-400">{Math.round(percentage)}%</span>
        </div>
      )}
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
        <motion.div
          className={`h-full ${colorClasses[color] || colorClasses.primary}`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}

