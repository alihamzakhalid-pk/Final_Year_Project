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
  // Modern gradient color palette
  const colors = {
    primary: dark ? '#8B7FFF' : '#6C63FF',        // Soft purple
    secondary: dark ? '#60A5FA' : '#3B82F6',      // Blue
    accent: dark ? '#A78BFA' : '#8B5CF6',         // Purple accent
    gradientStart: dark ? '#8B7FFF' : '#6C63FF',
    gradientEnd: dark ? '#60A5FA' : '#3B82F6',
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

  // Ultra modern icon - represents conversation threads and AI connection
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
          <stop offset="50%" stopColor={colors.gradientEnd} />
          <stop offset="100%" stopColor={colors.gradientStart} />
        </linearGradient>
        <linearGradient id={`botme-grad-accent-${dark ? 'dark' : 'light'}`} x1="16" y1="16" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={colors.accent} stopOpacity="0.8" />
          <stop offset="100%" stopColor={colors.secondary} stopOpacity="0.6" />
        </linearGradient>
      </defs>

      {/* Main conversation bubble - modern rounded shape */}
      <path
        d="M32 12C20.954 12 12 20.954 12 32C12 43.046 20.954 52 32 52C43.046 52 52 43.046 52 32C52 20.954 43.046 12 32 12Z"
        fill={`url(#botme-grad-main-${dark ? 'dark' : 'light'})`}
        opacity={dark ? 0.95 : 1}
      />
      
      {/* Inner glow effect */}
      <circle
        cx="32"
        cy="32"
        r="18"
        fill="none"
        stroke="white"
        strokeWidth="1.5"
        opacity={dark ? 0.25 : 0.2}
      />
      
      {/* Conversation threads - modern flowing lines */}
      <path
        d="M20 24C20 24 24 28 28 28C32 28 36 24 36 24"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
        opacity={dark ? 0.9 : 0.85}
      />
      
      <path
        d="M20 32C20 32 24 36 28 36C32 36 36 32 36 32"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
        opacity={dark ? 0.9 : 0.85}
      />
      
      {/* AI connection point - central dot */}
      <circle cx="32" cy="30" r="3.5" fill="white" opacity={dark ? 0.95 : 1} />
      
      {/* Memory/Data points - representing stored conversations */}
      <circle cx="24" cy="26" r="2" fill="white" opacity={dark ? 0.7 : 0.6} />
      <circle cx="40" cy="26" r="2" fill="white" opacity={dark ? 0.7 : 0.6} />
      <circle cx="24" cy="34" r="2" fill="white" opacity={dark ? 0.7 : 0.6} />
      <circle cx="40" cy="34" r="2" fill="white" opacity={dark ? 0.7 : 0.6} />
      
      {/* Subtle accent ring */}
      <circle
        cx="32"
        cy="32"
        r="22"
        fill="none"
        stroke={`url(#botme-grad-accent-${dark ? 'dark' : 'light'})`}
        strokeWidth="1"
        opacity={dark ? 0.3 : 0.25}
      />
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
              background: `linear-gradient(135deg, ${colors.gradientStart}, ${colors.gradientEnd})`,
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
