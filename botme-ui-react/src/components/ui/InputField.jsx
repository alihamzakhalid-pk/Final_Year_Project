import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { motion } from 'framer-motion'

export default function UIInputField({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  icon = null,
  error = '',
  maxLength,
  showCharCount = false,
  className = '',
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === 'password'
  const inputType = isPassword && showPassword ? 'text' : type
  const charCount = value?.length || 0

  return (
    <div className={`block text-left ${className}`}>
      {label && (
        <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
          {label}
          {props.required && <span className="ml-1 text-error-500">*</span>}
        </label>
      )}
      <div
        className={`
          flex items-center gap-3 rounded-lg border bg-white px-4 py-2.5 shadow-sm transition-all duration-200
          ${
            error
              ? 'border-error-500 focus-within:border-error-500 focus-within:ring-2 focus-within:ring-error-500/20'
              : 'border-slate-300 dark:border-slate-700 focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500/20'
          }
          dark:bg-slate-900
        `}
      >
        {icon && <span className="text-slate-400 dark:text-slate-500" aria-hidden="true">{icon}</span>}
        <input
          className="flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-slate-100 dark:placeholder:text-slate-500"
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          maxLength={maxLength}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        )}
      </div>
      <div className="mt-1 flex items-center justify-between">
        {error && (
          <motion.span
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs font-medium text-error-600 dark:text-error-400"
          >
            {error}
          </motion.span>
        )}
        {showCharCount && maxLength && (
          <span className={`ml-auto text-xs ${charCount > maxLength * 0.9 ? 'text-warning-600' : 'text-slate-500'}`}>
            {charCount}/{maxLength}
          </span>
        )}
      </div>
    </div>
  )
}

