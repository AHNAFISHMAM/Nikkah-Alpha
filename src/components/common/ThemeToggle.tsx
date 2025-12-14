import { memo } from 'react'
import { Moon } from 'lucide-react'
import { FaCloud } from 'react-icons/fa'
import { cn } from '../../lib/utils'
import { useThemeMode } from '../../hooks/useThemeMode'
import { motion, AnimatePresence } from 'framer-motion'

interface ThemeToggleProps {
  /**
   * Variant: 'button' for standalone button, 'icon' for icon-only
   * @default 'button'
   */
  variant?: 'button' | 'icon'
  /**
   * Size: 'sm', 'md', or 'lg'
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg'
  /**
   * Show label text
   * @default false
   */
  showLabel?: boolean
  /**
   * Icon color: 'white', 'black', or 'default' (uses theme foreground)
   * @default 'default'
   */
  iconColor?: 'white' | 'black' | 'default'
  /**
   * Additional className
   */
  className?: string
}

/**
 * ThemeToggle Component
 * 
 * Best Practices:
 * - Accessible: Proper ARIA labels and keyboard support
 * - Smooth transitions: Animated icon changes
 * - Mobile-friendly: Touch targets meet 44px minimum
 * - Visual feedback: Clear indication of current theme
 * - Optimistic updates: Immediate UI response
 */
export const ThemeToggle = memo(function ThemeToggle({
  variant = 'button',
  size = 'md',
  showLabel = false,
  iconColor = 'default',
  className,
}: ThemeToggleProps) {
  const { theme, toggleTheme } = useThemeMode()

  const isDark = theme === 'dark'

  // Determine icon color based on prop
  const getIconColor = () => {
    if (iconColor === 'white') return 'white'
    if (iconColor === 'black') return 'black'
    return 'currentColor' // default - uses theme foreground
  }

  const iconColorValue = getIconColor()
  const iconColorClass = iconColor === 'default' ? 'text-foreground' : ''

  // Size configurations
  const sizeConfig = {
    sm: {
      icon: 'h-4 w-4',
      iconSize: 16,
      button: 'h-8 w-8',
      text: 'text-xs',
    },
    md: {
      icon: 'h-5 w-5',
      iconSize: 20,
      button: 'h-10 w-10',
      text: 'text-sm',
    },
    lg: {
      icon: 'h-6 w-6',
      iconSize: 24,
      button: 'h-12 w-12',
      text: 'text-base',
    },
  }

  const config = sizeConfig[size]

  // Icon-only variant (for mobile nav, compact spaces)
  if (variant === 'icon') {
    return (
      <button
        onClick={toggleTheme}
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        aria-pressed={isDark}
        className={cn(
          'relative flex items-center justify-center rounded-lg',
          'bg-transparent hover:bg-background/20',
          'text-foreground',
          'transition-all duration-200',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-islamic-gold',
          'touch-manipulation',
          config.button,
          className
        )}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <AnimatePresence mode="wait" initial={false}>
            {isDark ? (
              <motion.div
                key="moon"
                initial={{ opacity: 0, scale: 0.5, rotate: -90 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.5, rotate: 90 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className={cn('flex items-center justify-center', iconColorClass)}
              >
                <Moon 
                  className={cn(config.icon, iconColorClass || 'text-foreground')} 
                  style={iconColor !== 'default' ? { color: iconColorValue } : undefined} 
                  aria-hidden="true" 
                />
              </motion.div>
            ) : (
              <motion.div
                key="cloud"
                initial={{ opacity: 0, scale: 0.5, rotate: 90 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.5, rotate: -90 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className={cn('flex items-center justify-center', iconColorClass)}
              >
                <span style={{ color: iconColorValue, display: 'inline-flex' }}>
                  <FaCloud 
                    size={config.iconSize} 
                    color={iconColorValue} 
                    aria-hidden="true"
                    style={{
                      filter: 'drop-shadow(-0.5px -0.5px 0 rgba(0, 0, 0, 0.3)) drop-shadow(0.5px -0.5px 0 rgba(0, 0, 0, 0.3)) drop-shadow(-0.5px 0.5px 0 rgba(0, 0, 0, 0.3)) drop-shadow(0.5px 0.5px 0 rgba(0, 0, 0, 0.3)) drop-shadow(0 -0.5px 0 rgba(0, 0, 0, 0.3)) drop-shadow(0 0.5px 0 rgba(0, 0, 0, 0.3)) drop-shadow(-0.5px 0 0 rgba(0, 0, 0, 0.3)) drop-shadow(0.5px 0 0 rgba(0, 0, 0, 0.3))',
                    }}
                  />
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </button>
    )
  }

  // Button variant with optional label (for desktop nav, settings)
  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-pressed={isDark}
        className={cn(
          'relative flex items-center justify-center gap-2 rounded-lg px-3 py-2',
          'bg-transparent hover:bg-background/20',
          'text-foreground',
          'transition-all duration-200',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-islamic-gold',
          'touch-manipulation min-h-[44px] min-w-[44px]',
          className
        )}
    >
      <div className="flex items-center justify-center" style={{ width: config.iconSize, height: config.iconSize }}>
        <AnimatePresence mode="wait" initial={false}>
          {isDark ? (
            <motion.div
              key="moon"
              initial={{ opacity: 0, scale: 0.5, rotate: -90 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.5, rotate: 90 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className={cn('flex items-center justify-center', iconColorClass)}
              style={{ width: config.iconSize, height: config.iconSize }}
            >
              <Moon 
                className={cn(config.icon, iconColorClass || 'text-foreground')} 
                style={iconColor !== 'default' ? { color: iconColorValue } : undefined} 
                aria-hidden="true" 
              />
            </motion.div>
          ) : (
            <motion.div
              key="cloud"
              initial={{ opacity: 0, scale: 0.5, rotate: 90 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.5, rotate: -90 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className={cn('flex items-center justify-center', iconColorClass)}
              style={{ width: config.iconSize, height: config.iconSize }}
            >
              <span style={{ color: iconColorValue, display: 'inline-flex' }}>
                <FaCloud size={config.iconSize} color={iconColorValue} aria-hidden="true" />
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {showLabel && (
        <span className={cn(config.text, 'font-medium')}>
          {isDark ? 'Dark' : 'Light'}
        </span>
      )}
    </button>
  )
})

