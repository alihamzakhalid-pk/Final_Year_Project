import { motion } from 'framer-motion'

/**
 * BotMe Logo Component
 * 
 * Variants:
 * - "memory" (default): Stacked chat bubbles showing conversation history/memories
 * - "warm": Friendly chat bubble with heart/memory element, warmer colors
 * - "typography": Typography-led design with subtle icon integration
 * 
 * Props:
 * - size: Icon size in pixels (default: 48)
 * - animated: Enable floating animation (default: false)
 * - showText: Show wordmark text (default: true)
 * - dark: Use dark mode colors (default: false)
 * - variant: Logo variant to use (default: "memory")
 * - textOnly: Show only wordmark without icon (default: false)
 */
export default function Logo({ 
  size = 48, 
  animated = false, 
  showText = true, 
  dark = false,
  variant = "memory",
  textOnly = false
}) {
  const logoVariants = animated ? {
    float: {
      y: [0, -10, 0],
      transition: {
        duration: 2,
        ease: 'easeInOut',
        repeat: Infinity,
      },
    },
  } : {}

  // Warm color palette for friendlier feel
  const warmColors = {
    primary: '#FF6B9D', // Warm pink
    secondary: '#FF8E53', // Warm orange
    accent: '#C77DFF', // Soft purple
  }

  // Memory variant: Stacked chat bubbles
  const MemoryIcon = () => (
    <svg
      width={size * 0.9}
      height={size * 0.9}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Back chat bubble (memory/history) - shifted left and up */}
      <path
        d="M10 14C10 8.477 14.477 4 20 4C25.523 4 30 8.477 30 14C30 17.314 28.314 20.314 25.5 22L28 26L22.5 24C20.5 24.5 18.5 25 20 25C14.477 25 10 20.523 10 14Z"
        fill={dark ? '#FF6B9D' : '#FF6B9D'}
        fillOpacity="0.25"
      />
      {/* Middle chat bubble - slightly shifted */}
      <path
        d="M14 18C14 12.477 18.477 8 24 8C29.523 8 34 12.477 34 18C34 21.314 32.314 24.314 29.5 26L32 30L26.5 28C24.5 28.5 22.5 29 24 29C18.477 29 14 24.523 14 18Z"
        fill={dark ? '#FF8E53' : '#FF8E53'}
        fillOpacity="0.4"
      />
      {/* Front chat bubble (current conversation) */}
      <path
        d="M18 22C18 16.477 22.477 12 28 12C33.523 12 38 16.477 38 22C38 25.314 36.314 28.314 33.5 30L36 34L30.5 32C28.5 32.5 26.5 33 28 33C22.477 33 18 28.523 18 22Z"
        fill={dark ? '#C77DFF' : '#C77DFF'}
      />
      {/* Memory sparkle/star inside front bubble */}
      <path
        d="M28 22L27.2 24L25 24.5L27.2 25L28 27L28.8 25L31 24.5L28.8 24L28 22Z"
        fill="white"
        fillOpacity="0.95"
      />
      <circle cx="28" cy="22" r="1.5" fill="white" fillOpacity="0.8" />
    </svg>
  )

  // Warm variant: Friendly chat bubble with heart
  const WarmIcon = () => (
    <svg
      width={size * 0.9}
      height={size * 0.9}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Main chat bubble */}
      <path
        d="M24 6C14.611 6 7 12.268 7 20C7 24.418 9.5 28.5 13 31.5L9 38L17.5 35C19.5 36 21.5 36.5 24 36.5C33.389 36.5 41 30.232 41 22.5C41 14.768 33.389 6 24 6Z"
        fill={dark ? '#FF6B9D' : '#FF6B9D'}
      />
      {/* Heart inside bubble */}
      <path
        d="M24 17.5C24 17.5 20.5 14 18 14C15.5 14 13.5 16 13.5 19C13.5 22 16.5 25 24 31.5C31.5 25 34.5 22 34.5 19C34.5 16 32.5 14 30 14C27.5 14 24 17.5 24 17.5Z"
        fill="white"
        fillOpacity="0.95"
      />
      {/* Subtle smile curve */}
      <path
        d="M18 23.5Q24 26.5 30 23.5"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.7"
      />
    </svg>
  )

  // Typography variant: Minimal icon with emphasis on wordmark
  const TypographyIcon = () => (
    <svg
      width={size * 0.7}
      height={size * 0.7}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Minimal chat bubble outline */}
      <path
        d="M16 5C10.477 5 6 9.477 6 15C6 18.314 7.686 21.314 10.5 23L8 27L13.5 25C15.5 25.5 16 26 16 26C21.523 26 26 21.523 26 15C26 9.477 21.523 5 16 5Z"
        stroke={dark ? '#FF6B9D' : '#FF6B9D'}
        strokeWidth="2"
        fill="none"
      />
      {/* Small memory dots */}
      <circle cx="13.5" cy="15" r="1.5" fill={dark ? '#FF8E53' : '#FF8E53'} />
      <circle cx="18.5" cy="15" r="1.5" fill={dark ? '#FF8E53' : '#FF8E53'} />
      <circle cx="16" cy="18" r="1" fill={dark ? '#C77DFF' : '#C77DFF'} />
    </svg>
  )

  const getIcon = () => {
    if (textOnly) return null
    
    switch (variant) {
      case "warm":
        return <WarmIcon />
      case "typography":
        return <TypographyIcon />
      case "memory":
      default:
        return <MemoryIcon />
    }
  }

  const getWordmarkStyle = () => {
    const baseStyle = {
      fontSize: size * 0.5,
      lineHeight: 1,
      fontWeight: 700,
      letterSpacing: '0.02em',
    }

    if (variant === "typography") {
      // Typography-led: Make wordmark more prominent
      return {
        ...baseStyle,
        fontSize: size * 0.6,
        letterSpacing: '0.05em',
      }
    }

    return baseStyle
  }

  const getWordmarkClasses = () => {
    if (dark) {
      return 'text-white'
    }

    switch (variant) {
      case "warm":
        return 'bg-gradient-to-r from-[#FF6B9D] to-[#FF8E53] bg-clip-text text-transparent'
      case "typography":
        return 'bg-gradient-to-r from-[#C77DFF] via-[#FF6B9D] to-[#FF8E53] bg-clip-text text-transparent'
      case "memory":
      default:
        return 'bg-gradient-to-r from-[#C77DFF] to-[#FF6B9D] bg-clip-text text-transparent'
    }
  }

  const getContainerClasses = () => {
    if (variant === "typography" && !textOnly) {
      return "flex items-center gap-3" // More spacing for typography variant
    }
    return "flex items-center gap-2"
  }

  return (
    <motion.div
      className={getContainerClasses()}
      variants={logoVariants}
      animate={animated ? 'float' : {}}
    >
      {/* Icon */}
      {!textOnly && (
        <div className="flex items-center justify-center">
          {getIcon()}
        </div>
      )}
      
      {/* Wordmark */}
      {showText && (
        <span
          className={`font-bold ${getWordmarkClasses()}`}
          style={getWordmarkStyle()}
        >
          BotMe
        </span>
      )}
    </motion.div>
  )
}
