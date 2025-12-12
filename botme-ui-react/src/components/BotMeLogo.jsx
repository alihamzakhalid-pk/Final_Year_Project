import { motion } from 'framer-motion'

/**
 * BotMe Logo Component - Ultra Modern Design
 * 
 * Sleek, contemporary logo representing AI conversations and memories:
 * - Modern geometric icon with conversation flow
 * - Elegant gradient typography
 * - Professional and memorable
 * 
 * @param {number} size - Icon size in pixels (default: 48)
 * @param {boolean} showText - Show wordmark text (default: true)
 * @param {boolean} dark - Use dark mode colors (default: false)
 * @param {boolean} animated - Enable floating animation (default: false)
 * @param {string} className - Additional CSS classes
 */
export default function BotMeLogo({ 
  size = 48, 
  showText = true, 
  dark = false,
  animated = false,
  className = ''
}) {
  // Modern color palette matching overall design
  const colors = {
    primary: '#5B7FFF',        // Blue
    secondary: '#7C3AED',      // Purple
    accent: '#0EA5E9',         // Cyan
    gradientStart: '#5B7FFF',
    gradientMid: '#6D5DFF',
    gradientEnd: '#7C3AED',
    text: dark ? '#F3F4F6' : '#1F2937',
  }

  const logoVariants = animated ? {
    float: {
      y: [0, -6, 0],
      transition: {
        duration: 3.5,
        ease: 'easeInOut',
        repeat: Infinity,
      },
    },
  } : {}

  // Modern chat bubble icon with gradient
  const LogoIcon = () => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="flex-shrink-0"
    >
      <defs>
        <linearGradient id={`botme-grad-main-${dark ? 'dark' : 'light'}`} x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={colors.gradientStart} />
          <stop offset="50%" stopColor={colors.gradientMid} />
          <stop offset="100%" stopColor={colors.gradientEnd} />
        </linearGradient>
        <filter id={`botme-shadow-${dark ? 'dark' : 'light'}`}>
          <feDropShadow dx="0" dy="2" stdDeviation="4" floodOpacity="0.15" />
        </filter>
      </defs>

      {/* Modern rounded square chat bubble */}
      <rect
        x="12"
        y="12"
        width="40"
        height="40"
        rx="12"
        fill={`url(#botme-grad-main-${dark ? 'dark' : 'light'})`}
        filter={`url(#botme-shadow-${dark ? 'dark' : 'light'})`}
      />
      
      {/* Inner highlight for depth */}
      <rect
        x="14"
        y="14"
        width="36"
        height="36"
        rx="10"
        fill="white"
        opacity="0.15"
      />
      
      {/* Modern message lines - clean and minimal */}
      <g fill="white" opacity={dark ? 0.95 : 1}>
        {/* Top line - full width */}
        <rect x="20" y="22" width="24" height="3" rx="1.5" />
        {/* Middle line - medium width */}
        <rect x="20" y="28" width="20" height="3" rx="1.5" />
        {/* Bottom line - short width */}
        <rect x="20" y="34" width="16" height="3" rx="1.5" />
        {/* Chat indicator dot */}
        <circle cx="48" cy="30" r="2.5" fill="white" opacity="0.8" />
      </g>
    </svg>
  )

  return (
    <motion.div
      className={`flex items-center gap-3 ${className}`}
      variants={logoVariants}
      animate={animated ? 'float' : {}}
    >
      {/* SVG Icon */}
      <LogoIcon />
      
      {/* Modern Wordmark with gradient */}
      {showText && (
        <div className="flex flex-col">
          <span
            className="font-black leading-none"
            style={{
              fontSize: `${size * 0.55}px`,
              letterSpacing: '-0.03em',
              background: `linear-gradient(135deg, ${colors.gradientStart}, ${colors.gradientMid}, ${colors.gradientEnd})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
              fontWeight: 800,
            }}
          >
            BotMe
          </span>
          {size >= 64 && (
            <span
              className="text-[10px] font-semibold tracking-widest mt-0.5 opacity-70"
              style={{
                color: colors.text,
                letterSpacing: '0.2em',
                fontFamily: 'system-ui, -apple-system, sans-serif',
              }}
            >
              AI COMPANION
            </span>
          )}
        </div>
      )}
    </motion.div>
  )
}
