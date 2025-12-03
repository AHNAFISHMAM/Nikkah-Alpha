import { memo, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card'
import { cn } from '../../lib/utils'

// Extract constants to prevent recreation
const COLLAPSE_ANIMATION = {
  initial: { height: 0, opacity: 0 },
  animate: { height: 'auto', opacity: 1 },
  exit: { height: 0, opacity: 0 },
  transition: { duration: 0.3, ease: 'easeInOut' },
} as const

interface CollapsibleSectionProps {
  title: string
  subtitle?: string
  icon?: React.ReactNode
  defaultExpanded?: boolean
  children: React.ReactNode
  className?: string
  headerClassName?: string
}

export const CollapsibleSection = memo(function CollapsibleSection({
  title,
  subtitle,
  icon,
  defaultExpanded = false,
  children,
  className,
  headerClassName,
}: CollapsibleSectionProps) {
  // On mobile, start collapsed; on desktop, use defaultExpanded
  const [isExpanded, setIsExpanded] = useState(() => {
    if (typeof window !== 'undefined') {
      const isMobile = window.innerWidth < 640 // sm breakpoint (mobile-first)
      return isMobile ? false : defaultExpanded
    }
    return defaultExpanded
  })

  const toggle = useCallback(() => setIsExpanded(prev => !prev), [])

  return (
    <Card padding="none" className={cn('overflow-hidden', className)}>
      <CardHeader
        className={cn(
          'px-4 py-4 sm:px-6 sm:py-5 border-b border-border cursor-pointer touch-manipulation',
          headerClassName
        )}
        onClick={toggle}
        role="button"
        aria-expanded={isExpanded}
        aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${title} section`}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            toggle()
          }
        }}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            {icon && <div className="flex-shrink-0">{icon}</div>}
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base sm:text-lg">
                {title}
              </CardTitle>
              {subtitle && (
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          <div className="flex-shrink-0">
            {isExpanded ? (
              <ChevronUp className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
        </div>
      </CardHeader>
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={COLLAPSE_ANIMATION.initial}
            animate={COLLAPSE_ANIMATION.animate}
            exit={COLLAPSE_ANIMATION.exit}
            transition={COLLAPSE_ANIMATION.transition}
            style={{ overflow: 'hidden' }}
          >
            <CardContent className="p-4 sm:p-6">{children}</CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  )
})

