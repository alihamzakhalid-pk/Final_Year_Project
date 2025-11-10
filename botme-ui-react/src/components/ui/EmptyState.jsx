import { motion } from 'framer-motion'
import UIButton from './Button'

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}
    >
      {Icon && (
        <div className="mb-4 rounded-full bg-slate-100 dark:bg-slate-800 p-6">
          <Icon className="h-12 w-12 text-slate-400 dark:text-slate-500" />
        </div>
      )}
      <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>
      {description && (
        <p className="mb-6 max-w-sm text-sm text-slate-500 dark:text-slate-400">{description}</p>
      )}
      {actionLabel && onAction && (
        <UIButton onClick={onAction} variant="primary">
          {actionLabel}
        </UIButton>
      )}
    </motion.div>
  )
}

