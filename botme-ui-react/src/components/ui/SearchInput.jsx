import { useState } from 'react'
import { Search, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function SearchInput({
  value,
  onChange,
  onClear,
  onClick,
  placeholder = 'Search...',
  className = '',
  autoFocus = false,
}) {
  const [isFocused, setIsFocused] = useState(false)

  const handleClear = () => {
    onChange?.({ target: { value: '' } })
    onClear?.()
  }

  return (
    <div
      className={`relative flex items-center ${className}`}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      onClick={onClick}
    >
      <Search
        className={`absolute left-3 h-5 w-5 transition-colors ${
          isFocused ? 'text-[#5B7FFF]' : 'text-[#6B7280]'
        }`}
      />
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoFocus={autoFocus}
        onClick={onClick}
        className="w-full rounded-full border border-slate-200 bg-[#F3F4F6] py-2.5 pl-10 pr-10 text-sm text-[#1F2937] placeholder:text-[#6B7280] focus:border-[#5B7FFF] focus:ring-2 focus:ring-[#5B7FFF]/20 focus:bg-white outline-none transition-all cursor-pointer"
      />
      <AnimatePresence>
        {value && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={handleClear}
            className="absolute right-3 rounded p-1 text-[#6B7280] hover:text-[#1F2937] transition-colors"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}

