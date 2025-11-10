import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'

export default function VerificationCodeInput({ length = 6, onComplete, disabled = false }) {
  const [codes, setCodes] = useState(Array(length).fill(''))
  const inputRefs = useRef([])

  useEffect(() => {
    // Focus first input on mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus()
    }
  }, [])

  const handleChange = (index, value) => {
    if (disabled) return
    
    // Only allow digits
    if (value && !/^\d$/.test(value)) return

    const newCodes = [...codes]
    newCodes[index] = value
    setCodes(newCodes)

    // Auto-focus next input
    if (value && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    }

    // Check if all codes are filled
    if (newCodes.every(code => code !== '')) {
      const completeCode = newCodes.join('')
      onComplete(completeCode)
    }
  }

  const handleKeyDown = (index, e) => {
    if (disabled) return

    // Handle backspace
    if (e.key === 'Backspace' && !codes[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }

    // Handle paste
    if (e.key === 'v' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      navigator.clipboard.readText().then(text => {
        const digits = text.replace(/\D/g, '').slice(0, length)
        const newCodes = Array(length).fill('')
        digits.split('').forEach((digit, i) => {
          if (i < length) newCodes[i] = digit
        })
        setCodes(newCodes)
        const completeCode = newCodes.join('')
        if (completeCode.length === length) {
          onComplete(completeCode)
        } else {
          inputRefs.current[digits.length < length ? digits.length : length - 1]?.focus()
        }
      })
    }
  }

  const handlePaste = (e) => {
    if (disabled) return
    e.preventDefault()
    const pastedText = e.clipboardData.getData('text')
    const digits = pastedText.replace(/\D/g, '').slice(0, length)
    const newCodes = Array(length).fill('')
    digits.split('').forEach((digit, i) => {
      if (i < length) newCodes[i] = digit
    })
    setCodes(newCodes)
    const completeCode = newCodes.join('')
    if (completeCode.length === length) {
      onComplete(completeCode)
    } else {
      inputRefs.current[digits.length < length ? digits.length : length - 1]?.focus()
    }
  }

  return (
    <div className="flex gap-3 justify-center">
      {codes.map((code, index) => (
        <motion.input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={code}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={index === 0 ? handlePaste : undefined}
          disabled={disabled}
          className="w-12 h-14 text-center text-2xl font-bold rounded-xl border-2 border-slate-200 bg-white text-[#1F2937] focus:border-[#5B7FFF] focus:ring-2 focus:ring-[#5B7FFF]/20 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          initial={{ scale: 1 }}
          whileFocus={{ scale: 1.05 }}
        />
      ))}
    </div>
  )
}

