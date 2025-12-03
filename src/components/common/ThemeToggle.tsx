import { memo } from 'react'
import { Sun, Moon } from 'lucide-react'
import { cn } from '../../lib/utils'
import { useThemeMode } from '../../hooks/useThemeMode'
import { motion } from 'framer-motion'

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
  className,
}: ThemeToggleProps) {
  const { theme, toggleTheme } = useThemeMode()

  const isDark = theme === 'dark'

  // Size configurations
  const sizeConfig = {
    sm: {
      icon: 'h-4 w-4',
      button: 'h-8 w-8',
      text: 'text-xs',
    },
    md: {
      icon: 'h-5 w-5',
      button: 'h-10 w-10',
      text: 'text-sm',
    },
    lg: {
      icon: 'h-6 w-6',
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
          'bg-accent hover:bg-accent/80',
          'text-muted-foreground hover:text-foreground',
          'transition-all duration-200',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-islamic-gold',
          'touch-manipulation',
          config.button,
          className
        )}
      >
        <motion.div
          initial={false}
          animate={{ rotate: isDark ? 0 : 180, scale: 1 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="absolute inset-0 flex items-center justify-center"
        >
          {isDark ? (
            <Moon className={cn(config.icon, 'text-foreground')} aria-hidden="true" />
          ) : (
            <Sun className={cn(config.icon, 'text-foreground')} aria-hidden="true" />
          )}
        </motion.div>
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
        'relative flex items-center gap-2 rounded-lg px-3 py-2',
        'bg-accent hover:bg-accent/80',
        'text-muted-foreground hover:text-foreground',
        'transition-all duration-200',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-islamic-gold',
        'touch-manipulation min-h-[44px]',
        className
      )}
    >
      <motion.div
        initial={false}
        animate={{ rotate: isDark ? 0 : 180, scale: 1 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="flex items-center justify-center"
      >
        {isDark ? (
          <Moon className={cn(config.icon, 'text-foreground')} aria-hidden="true" />
        ) : (
          <Sun className={cn(config.icon, 'text-foreground')} aria-hidden="true" />
        )}
      </motion.div>
      {showLabel && (
        <span className={cn(config.text, 'font-medium')}>
          {isDark ? 'Dark' : 'Light'}
        </span>
      )}
    </button>
  )
})

