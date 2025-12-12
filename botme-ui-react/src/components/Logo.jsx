import { motion } from 'framer-motion'

export default function Logo({
  size = 48,
  animated = false,
  showText = true,
  dark = false,
  textOnly = false,
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
        gradientMid: '#6D5DFF',
        gradientEnd: '#7C3AED',
        text: '#0F172A',
        iconHighlight: '#FFFFFF',
      }

  const floatVariants = animated
    ? {
        float: {
          y: [0, -6, 0],
          transition: {
            duration: 3,
            ease: 'easeInOut',
            repeat: Infinity,
          },
        },
      }
    : {}

  const Icon = () => (
    <svg
      width={size * 0.9}
      height={size * 0.9}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="flex-shrink-0"
    >
      <defs>
        <linearGradient
          id={`botme-logo-gradient-${dark ? 'dark' : 'light'}`}
          x1="10"
          y1="10"
          x2="54"
          y2="52"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor={colors.gradientStart} />
          <stop offset="50%" stopColor={colors.gradientMid} />
          <stop offset="100%" stopColor={colors.gradientEnd} />
        </linearGradient>
        <filter id={`botme-logo-shadow-${dark ? 'dark' : 'light'}`} x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor={dark ? '#000000' : '#1F2A44'} floodOpacity="0.18" />
        </filter>
      </defs>

      <rect
        x="10"
        y="10"
        width="44"
        height="44"
        rx="14"
        fill={`url(#botme-logo-gradient-${dark ? 'dark' : 'light'})`}
        filter={`url(#botme-logo-shadow-${dark ? 'dark' : 'light'})`}
      />

      <rect
        x="14"
        y="14"
        width="36"
        height="36"
        rx="12"
        fill={colors.iconHighlight}
        opacity="0.1"
      />

      <g fill={colors.iconHighlight}>
        <rect x="22" y="24" width="20" height="3" rx="1.5" />
        <rect x="22" y="30" width="16" height="3" rx="1.5" />
        <rect x="22" y="36" width="12" height="3" rx="1.5" />
        <circle cx="44" cy="30.5" r="2.5" opacity="0.85" />
      </g>
    </svg>
  )

  return (
    <motion.div className="flex items-center gap-3" variants={floatVariants} animate={animated ? 'float' : undefined}>
      {!textOnly && <Icon />}

      {showText && (
        <div className="flex flex-col">
          <span
            className="font-black leading-none"
            style={{
              fontSize: size * 0.52,
              letterSpacing: '-0.03em',
              background: `linear-gradient(120deg, ${colors.gradientStart}, ${colors.gradientMid}, ${colors.gradientEnd})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              fontFamily:
                'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
            }}
          >
            BotMe
          </span>
          {size >= 56 && (
            <span
              className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.35em]"
              style={{
                color: colors.text,
                opacity: dark ? 0.7 : 0.55,
                fontFamily: 'Inter, system-ui, sans-serif',
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
