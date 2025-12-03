import React, { memo, useEffect, useRef, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { cn } from '../../lib/utils'

export interface DialogProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description?: string
  children: React.ReactNode
  className?: string
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  showCloseButton?: boolean
  icon?: React.ReactNode
}

// Extract constants to prevent recreation
const MAX_WIDTH_CLASSES = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
} as const

const DIALOG_ANIMATION = {
  initial: { opacity: 0, scale: 0.95, y: 20 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.95, y: 20 },
  transition: { duration: 0.2 },
} as const

export const Dialog = memo(function Dialog({
  isOpen,
  onClose,
  title,
  description,
  children,
  className,
  maxWidth = 'md',
  showCloseButton = true,
  icon,
}: DialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const previousActiveElement = useRef<HTMLElement | null>(null)

  // Focus management: trap focus within dialog
  useEffect(() => {
    if (!isOpen) return

    // Store the previously focused element
    previousActiveElement.current = document.activeElement as HTMLElement

    // Focus the dialog when it opens
    const timer = setTimeout(() => {
      dialogRef.current?.focus()
    }, 100)

    // Handle focus trap
    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      const focusableElements = dialogRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ) as NodeListOf<HTMLElement>

      if (!focusableElements || focusableElements.length === 0) return

      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement.focus()
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement.focus()
        }
      }
    }

    document.addEventListener('keydown', handleTabKey)

    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden'

    return () => {
      clearTimeout(timer)
      document.removeEventListener('keydown', handleTabKey)
      document.body.style.overflow = ''
      
      // Restore focus to previous element when dialog closes
      if (previousActiveElement.current) {
        previousActiveElement.current.focus()
      }
    }
  }, [isOpen])

  // Memoize callback to prevent recreation
  const handleEscape = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
    }
  }, [onClose])

  // Handle ESC key to close
  useEffect(() => {
    if (!isOpen) return

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, handleEscape])

  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }, [onClose])

  // Memoize IDs to prevent recalculation
  const dialogId = useMemo(() => `dialog-${title.toLowerCase().replace(/\s+/g, '-')}`, [title])
  const titleId = useMemo(() => `${dialogId}-title`, [dialogId])
  const descriptionId = useMemo(() => description ? `${dialogId}-description` : undefined, [dialogId, description])

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/50 dark:bg-black/70 backdrop-blur-sm safe-area-inset-top safe-area-inset-bottom"
        onClick={handleBackdropClick}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
      >
        <motion.div
          ref={dialogRef}
          initial={DIALOG_ANIMATION.initial}
          animate={DIALOG_ANIMATION.animate}
          exit={DIALOG_ANIMATION.exit}
          transition={DIALOG_ANIMATION.transition}
          className={cn(
            'bg-card border border-border rounded-2xl w-full shadow-xl',
            'max-h-[90vh] overflow-hidden flex flex-col',
            MAX_WIDTH_CLASSES[maxWidth],
            className
          )}
          onClick={(e) => e.stopPropagation()}
          tabIndex={-1}
        >
          {/* Header */}
          <div className="flex items-start justify-between p-6 sm:p-8 border-b border-border flex-shrink-0">
            <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
              {icon && (
                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  {icon}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h2
                  id={titleId}
                  className="text-lg sm:text-xl font-semibold text-card-foreground leading-tight"
                >
                  {title}
                </h2>
                {description && (
                  <p
                    id={descriptionId}
                    className="text-sm text-muted-foreground mt-1"
                  >
                    {description}
                  </p>
                )}
              </div>
            </div>
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-accent rounded-lg transition-colors touch-manipulation text-muted-foreground hover:text-foreground -mr-2 flex-shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Close dialog"
                type="button"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 sm:p-8">
            {children}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
})

