import { motion } from 'framer-motion'

/**
 * BotMe Logo - AI Persona Chatbot
 * 
 * Design represents:
 * - Chat bubble with persona silhouette inside
 * - Memory/brain concept through connecting nodes
 * - Modern gradient styling
 * 
 * This component matches Logo.jsx for consistency
 */
export default function BotMeLogo({
  size = 48,
  showText = true,
  dark = false,
  animated = false,
  className = ''
}) {
  const colors = dark
    ? {
      gradientStart: '#8EA6FF',
      gradientMid: '#A386FF',
      gradientEnd: '#C07BFF',
      text: '#F8FAFF',
      iconHighlight: '#FFFFFF',
    }
    : {
      gradientStart: '#5B7FFF',
      gradientMid: '#7C3AED',
      gradientEnd: '#9333EA',
      text: '#0F172A',
      iconHighlight: '#FFFFFF',
    }

  const floatVariants = animated
    ? {
      float: {
        y: [0, -4, 0],
        transition: {
          duration: 2.5,
          ease: 'easeInOut',
          repeat: Infinity,
        },
      },
    }
    : {}

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
        <linearGradient
          id={`botme-grad-main-${dark ? 'dark' : 'light'}`}
          x1="8"
          y1="8"
          x2="56"
          y2="56"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor={colors.gradientStart} />
          <stop offset="50%" stopColor={colors.gradientMid} />
          <stop offset="100%" stopColor={colors.gradientEnd} />
        </linearGradient>
        <filter id={`botme-shadow-${dark ? 'dark' : 'light'}`} x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor={colors.gradientMid} floodOpacity="0.5" />
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor={colors.gradientStart} floodOpacity="0.3" />
        </filter>
      </defs>

      {/* Main rounded square with gradient */}
      <rect
        x="10"
        y="10"
        width="44"
        height="44"
        rx="14"
        fill={`url(#botme-grad-main-${dark ? 'dark' : 'light'})`}
        filter={`url(#botme-shadow-${dark ? 'dark' : 'light'})`}
      />

      {/* Inner glow effect */}
      <rect
        x="12"
        y="12"
        width="40"
        height="40"
        rx="12"
        fill="white"
        opacity="0.08"
      />

      {/* Persona silhouette - represents the AI mimicking a person */}
      <g fill={colors.iconHighlight}>
        {/* Head circle */}
        <circle cx="32" cy="22" r="6" opacity="0.95" />
        {/* Body arc */}
        <path
          d="M22 38 C22 30, 26 27, 32 27 C38 27, 42 30, 42 38"
          fill="none"
          stroke={colors.iconHighlight}
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.9"
        />
      </g>

      {/* Chat bubble indicator - bottom right */}
      <g transform="translate(40, 40)">
        <circle cx="6" cy="6" r="8" fill={colors.iconHighlight} opacity="0.95" />
        <circle cx="3" cy="6" r="1.5" fill={colors.gradientMid} />
        <circle cx="6" cy="6" r="1.5" fill={colors.gradientMid} />
        <circle cx="9" cy="6" r="1.5" fill={colors.gradientMid} />
      </g>

      {/* Memory nodes - connecting dots representing AI learning */}
      <g fill={colors.iconHighlight} opacity="0.6">
        <circle cx="16" cy="16" r="2" />
        <circle cx="48" cy="16" r="2" />
        <circle cx="16" cy="48" r="1.5" />
      </g>
    </svg>
  )

  return (
    <motion.div
      className={`flex items-center gap-2.5 ${className}`}
      variants={floatVariants}
      animate={animated ? 'float' : {}}
    >
      <LogoIcon />

      {showText && (
        <div className="flex flex-col">
          <span
            className="font-black leading-none tracking-tight"
            style={{
              fontSize: `${size * 0.55}px`,
              letterSpacing: '-0.02em',
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
          {size >= 48 && (
            <span
              className="font-medium uppercase"
              style={{
                fontSize: `${size * 0.16}px`,
                letterSpacing: '0.15em',
                color: dark ? 'rgba(255,255,255,0.6)' : 'rgba(15,23,42,0.5)',
                fontFamily: 'system-ui, -apple-system, sans-serif',
                marginTop: '2px',
              }}
            >
              AI Persona
            </span>
          )}
        </div>
      )}
    </motion.div>
  )
}

