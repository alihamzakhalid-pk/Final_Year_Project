import { motion } from 'framer-motion'

export default function UILoader({ size = 8 }) {
  const dot = {
    width: size,
    height: size,
    borderRadius: '9999px',
    background: 'currentColor',
  }
  return (
    <div className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400">
      {[0, 1, 2].map(i => (
        <motion.span
          key={i}
          style={dot}
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut', delay: i * 0.15 }}
        />
      ))}
    </div>
  )
}

