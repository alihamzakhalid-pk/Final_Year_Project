import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'

export default function UIButton({
  as: Component = 'button',
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled,
  loading = false,
  className = '',
  type = 'button',
  ...props
}) {
  const base = 'relative inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60 overflow-hidden'
  
  const variants = {
    primary: 'bg-[#5B7FFF] text-white shadow-md hover:bg-[#4A6BFF] hover:shadow-lg focus-visible:ring-[#5B7FFF]/60 focus-visible:ring-offset-2',
    secondary: 'bg-[#A855F7] text-white shadow-md hover:bg-[#9333EA] hover:shadow-lg focus-visible:ring-[#A855F7]/60',
    outline: 'border-2 border-slate-200 text-[#1F2937] hover:border-[#5B7FFF] hover:text-[#5B7FFF] focus-visible:ring-[#5B7FFF]/40',
    ghost: 'text-[#1F2937] hover:bg-[#E8F0FF] focus-visible:ring-slate-500/40',
    danger: 'bg-error-600 text-white shadow-md hover:bg-error-700 hover:shadow-lg focus-visible:ring-error-500/60',
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  }

  const combined = `${base} ${variants[variant]} ${sizes[size]} ${className}`

  const handleClick = (e) => {
    if (!disabled && !loading && onClick) {
      onClick(e)
    }
  }

  if (Component === 'button') {
    const buttonProps = {
      onClick: handleClick,
      className: combined,
      disabled: disabled || loading,
      type,
      ...props,
    }
    return (
      <motion.button
        whileHover={disabled || loading ? {} : { scale: 1.02 }}
        whileTap={disabled || loading ? {} : { scale: 0.98 }}
        {...buttonProps}
      >
        {loading && (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        )}
        <span className={loading ? 'opacity-70' : ''}>{children}</span>
      </motion.button>
    )
  }

  const componentProps = {
    onClick: handleClick,
    className: combined,
    'aria-disabled': (disabled || loading) ? 'true' : undefined,
    ...props,
  }

  return (
    <motion.div
      whileHover={disabled || loading ? {} : { scale: 1.02 }}
      whileTap={disabled || loading ? {} : { scale: 0.98 }}
    >
      <Component {...componentProps}>
        {loading && (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        )}
        <span className={loading ? 'opacity-70' : ''}>{children}</span>
      </Component>
    </motion.div>
  )
}

