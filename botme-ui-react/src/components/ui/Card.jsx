import { motion } from 'framer-motion'

export default function UICard({ children, className = '', hover = false, onClick }) {
  const baseClasses = 'rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm transition-all'
  const hoverClasses = hover || onClick ? 'hover:-translate-y-1 hover:shadow-md hover:border-[#5B7FFF]/30 dark:hover:border-[#5B7FFF]/50 cursor-pointer' : ''

  const Component = onClick ? motion.div : 'div'
  const props = onClick
    ? {
        onClick,
        whileHover: { y: -4, transition: { duration: 0.2 } },
        whileTap: { y: 0 },
      }
    : {}

  return (
    <Component className={`${baseClasses} ${hoverClasses} ${className}`} {...props}>
      {children}
    </Component>
  )
}

