import { useState } from 'react'
import { Paperclip, Mic, Send, Smile } from 'lucide-react'
import { motion } from 'framer-motion'
import Tooltip from './ui/Tooltip'

export default function MessageInput({ onSend, disabled }) {
  const [value, setValue] = useState('')
  const maxLength = 2000

  const handleSend = () => {
    const trimmed = value.trim()
    if (!trimmed || disabled) return
    onSend?.(trimmed)
    setValue('')
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    handleSend()
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="w-full bg-white border-t border-[#E5E7EB]">
      <form
        onSubmit={handleSubmit}
        className="flex items-end gap-3 px-6 py-4"
      >
        {/* Left Icons */}
        <div className="flex items-center gap-1">
          <Tooltip content="Attach file">
            <button
              type="button"
              className="flex-shrink-0 rounded-lg p-2.5 text-[#6B7280] transition-all duration-200 hover:bg-[#F3F4F6] hover:text-[#5B7FFF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B7FFF]/50"
              aria-label="Attach file"
              disabled={disabled}
            >
              <Paperclip className="h-5 w-5" />
            </button>
          </Tooltip>
        </div>

        {/* Input Field */}
        <div className="flex-1 relative">
          <textarea
            value={value}
            onChange={(e) => {
              if (e.target.value.length <= maxLength) {
                setValue(e.target.value)
                // Auto-grow
                e.target.style.height = 'auto'
                e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`
              }
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            className="w-full resize-none rounded-full border-0 bg-[#F3F4F6] px-4 py-3 text-sm text-[#1F2937] outline-none placeholder:text-[#6B7280] focus:ring-2 focus:ring-[#5B7FFF]/20 transition-all duration-200"
            rows={1}
            style={{ minHeight: '40px', maxHeight: '120px', lineHeight: '1.5' }}
            disabled={disabled}
            aria-label="Message input"
          />
          {value.length > 0 && (
            <p className="absolute -bottom-5 left-4 text-xs text-[#9CA3AF]">
              Shift+Enter for new line
            </p>
          )}
        </div>

        {/* Right Icons */}
        <div className="flex items-center gap-1">
          <Tooltip content="Emoji picker">
            <button
              type="button"
              className="flex-shrink-0 rounded-lg p-2.5 text-[#6B7280] transition-all duration-200 hover:bg-[#F3F4F6] hover:text-[#5B7FFF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B7FFF]/50"
              aria-label="Emoji picker"
              disabled={disabled}
            >
              <Smile className="h-5 w-5" />
            </button>
          </Tooltip>

          <Tooltip content="Voice message">
            <button
              type="button"
              className="flex-shrink-0 rounded-lg p-2.5 text-[#6B7280] transition-all duration-200 hover:bg-[#F3F4F6] hover:text-[#5B7FFF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B7FFF]/50"
              aria-label="Voice input"
              disabled={disabled}
            >
              <Mic className="h-5 w-5" />
            </button>
          </Tooltip>

          <motion.button
            type="submit"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex-shrink-0 inline-flex items-center justify-center h-10 w-10 rounded-full bg-[#5B7FFF] text-white shadow-sm transition-all duration-200 hover:bg-[#4A6AD9] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B7FFF]/60 disabled:opacity-40 disabled:cursor-not-allowed disabled:bg-[#9CA3AF] disabled:hover:scale-100"
            aria-label="Send message"
            disabled={disabled || !value.trim()}
          >
            <Send className="h-4 w-4" />
          </motion.button>
        </div>
      </form>
    </div>
  )
}

