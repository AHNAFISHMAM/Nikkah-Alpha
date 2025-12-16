import { useRef, useEffect, useState, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface ScrollableContainerProps {
  children: ReactNode
  className?: string
  /**
   * Show fade indicators at top/bottom when scrollable
   * @default true
   */
  showFadeIndicators?: boolean
  /**
   * Custom scrollbar styling
   * @default 'thin'
   */
  scrollbarStyle?: 'none' | 'thin' | 'auto'
}

/**
 * ScrollableContainer Component
 * 
 * Best Practices:
 * - Custom fade indicators instead of visible scrollbars
 * - Smooth scrolling behavior
 * - Touch-friendly on mobile
 * - Accessible keyboard navigation
 * - Visual feedback for scrollable content
 */
export function ScrollableContainer({
  children,
  className = '',
  showFadeIndicators = true,
  scrollbarStyle = 'thin',
}: ScrollableContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [showTopFade, setShowTopFade] = useState(false)
  const [showBottomFade, setShowBottomFade] = useState(false)

  const checkScrollPosition = () => {
    if (!containerRef.current) return

    const { scrollTop, scrollHeight, clientHeight } = containerRef.current
    const isScrollable = scrollHeight > clientHeight
    const isAtTop = scrollTop < 10
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10

    setShowTopFade(isScrollable && !isAtTop)
    setShowBottomFade(isScrollable && !isAtBottom)
  }

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Check initial state
    checkScrollPosition()

    // Check on scroll
    container.addEventListener('scroll', checkScrollPosition)
    
    // Check on resize
    const resizeObserver = new ResizeObserver(checkScrollPosition)
    resizeObserver.observe(container)

    return () => {
      container.removeEventListener('scroll', checkScrollPosition)
      resizeObserver.disconnect()
    }
  }, [children])

  const scrollbarClasses = {
    none: 'scrollbar-none',
    thin: 'scrollbar-thin scrollbar-thumb-border/50 scrollbar-track-transparent hover:scrollbar-thumb-border/80',
    auto: 'scrollbar-auto',
  }[scrollbarStyle]

  return (
    <div className={`relative ${className}`} style={{ minHeight: 0, display: 'flex', flexDirection: 'column' }}>
      {/* Top Fade Indicator */}
      <AnimatePresence>
        {showFadeIndicators && showTopFade && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-background to-transparent pointer-events-none z-10"
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Scrollable Content */}
      <div
        ref={containerRef}
        className={`overflow-y-auto overflow-x-hidden ${scrollbarClasses} scroll-smooth flex-1`}
        style={{
          // Custom scrollbar styling for webkit browsers
          scrollbarWidth: scrollbarStyle === 'none' ? 'none' : scrollbarStyle === 'thin' ? 'thin' : 'auto',
          // Ensure scrolling works on desktop (mouse wheel, trackpad)
          WebkitOverflowScrolling: 'touch',
          // Force scrollable area - critical for flex containers
          minHeight: 0,
        }}
      >
        {children}
      </div>

      {/* Bottom Fade Indicator */}
      <AnimatePresence>
        {showFadeIndicators && showBottomFade && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-background to-transparent pointer-events-none z-10"
            aria-hidden="true"
          />
        )}
      </AnimatePresence>
    </div>
  )
}

