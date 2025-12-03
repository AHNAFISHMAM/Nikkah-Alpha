import { useEffect, useRef, useState, type ReactNode, type RefObject } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '../../lib/utils'

export interface PopoverProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  triggerRef?: RefObject<HTMLElement>
  align?: 'left' | 'right' | 'center'
  side?: 'top' | 'bottom'
  className?: string
  maxWidth?: 'sm' | 'md' | 'lg' | 'full'
  showBackdrop?: boolean
}

const maxWidthClasses = {
  sm: 'max-w-xs',
  md: 'max-w-sm',
  lg: 'max-w-md',
  full: 'max-w-full',
}

/**
 * Popover Component
 * 
 * A flexible popover/dropdown component with:
 * - Portal rendering for z-index management
 * - Click-outside detection
 * - Keyboard navigation (Escape to close)
 * - Responsive positioning
 * - Mobile-friendly backdrop
 * - Smooth animations
 */
export function Popover({
  isOpen,
  onClose,
  children,
  triggerRef,
  align = 'right',
  side = 'bottom',
  className,
  maxWidth = 'md',
  showBackdrop = false,
}: PopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 })

  // Calculate position based on trigger element
  useEffect(() => {
    if (!isOpen || !triggerRef?.current) return

    const updatePosition = () => {
      const trigger = triggerRef.current
      if (!trigger) return

      const rect = trigger.getBoundingClientRect()
      const scrollY = window.scrollY
      const scrollX = window.scrollX

      let top = 0
      let left = 0
      let width = 0

      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight
      // Use consistent mobile breakpoint (640px = Tailwind sm)
      const isMobile = viewportWidth < 640

      // CRITICAL FIX: Match popover width to trigger width when maxWidth is 'full'
      if (maxWidth === 'full') {
        // Use trigger's actual width to ensure perfect alignment
        width = rect.width
        
        // Align left edge with trigger's left edge exactly
        left = rect.left + scrollX
        
        // Mobile-specific: Ensure popover doesn't exceed viewport
        if (isMobile) {
          const maxAllowedWidth = viewportWidth - 32 // 16px padding each side
          if (width > maxAllowedWidth) {
            width = maxAllowedWidth
            // Recalculate left to maintain alignment with trigger's left edge
            // But ensure we don't go negative
            const triggerLeft = rect.left + scrollX
            left = Math.max(16, Math.min(triggerLeft, viewportWidth - width - 16))
          } else {
            // Ensure popover stays within viewport bounds
            if (left + width > viewportWidth - 16) {
              left = viewportWidth - width - 16
            }
            if (left < 16) {
              left = 16
            }
          }
        } else {
          // Desktop: Ensure popover stays within viewport
          if (left + width > viewportWidth - 16) {
            left = viewportWidth - width - 16
          }
          if (left < 16) {
            left = 16
          }
        }
      } else {
        // For other maxWidth values, use calculated width
        width = Math.min(320, viewportWidth - 32)
        
        // Horizontal alignment based on align prop
        if (align === 'right') {
          left = rect.right + scrollX - width // Align right edge
        } else if (align === 'left') {
          left = rect.left + scrollX // Align left edge
        } else {
          // Center
          left = rect.left + scrollX + (rect.width - width) / 2
        }
        
        // Ensure popover stays within viewport
        if (left + width > viewportWidth - 16) {
          left = viewportWidth - width - 16
        }
        if (left < 16) {
          left = 16
        }
      }

      // Vertical positioning - Increased gap for better visual separation
      if (side === 'bottom') {
        top = rect.bottom + scrollY + 12 // 12px gap (increased from 8px for better spacing)
      } else {
        top = rect.top + scrollY - 12 // 12px gap above (increased from 8px for consistency)
      }

      // Adjust vertical position if overflow (mobile)
      if (side === 'bottom' && rect.bottom + 400 > viewportHeight) {
        // Switch to top if not enough space below
        top = rect.top + scrollY - 12
      }

      // Mobile-specific vertical constraints
      if (isMobile && side === 'bottom') {
        const maxHeight = viewportHeight - rect.bottom - 16
        if (maxHeight < 200) {
          // If not enough space below, position above
          top = rect.top + scrollY - 12
        }
      }

      setPosition({ top, left, width })
    }

    updatePosition()

    // Update on scroll/resize
    window.addEventListener('scroll', updatePosition, true)
    window.addEventListener('resize', updatePosition)

    return () => {
      window.removeEventListener('scroll', updatePosition, true)
      window.removeEventListener('resize', updatePosition)
    }
  }, [isOpen, triggerRef, align, side])

  // Handle click outside
  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (event: Event) => {
      const target = event.target as Node
      
      if (
        popoverRef.current &&
        !popoverRef.current.contains(target) &&
        triggerRef?.current &&
        !triggerRef.current.contains(target)
      ) {
        onClose()
      }
    }

    // Use capture phase to catch clicks before they bubble
    document.addEventListener('mousedown', handleClickOutside, true)
    document.addEventListener('touchstart', handleClickOutside, true)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside, true)
      document.removeEventListener('touchstart', handleClickOutside, true)
    }
  }, [isOpen, onClose, triggerRef])

  // Handle Escape key
  useEffect(() => {
    if (!isOpen) return

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  // Prevent body scroll when backdrop is shown (mobile)
  useEffect(() => {
    if (isOpen && showBackdrop) {
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = ''
      }
    }
  }, [isOpen, showBackdrop])

  // CRITICAL FIX: Don't early return - let AnimatePresence handle exit animations
  // But ensure content only renders when isOpen is true with proper keys
  if (typeof document === 'undefined') return null

  return createPortal(
    <AnimatePresence mode="wait">
      {isOpen && (
        <>
          {/* Backdrop (mobile) */}
          {showBackdrop && (
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[var(--z-popover)]"
              onClick={onClose}
              aria-hidden="true"
            />
          )}

          {/* Popover Content - CRITICAL: fixed positioning ensures it doesn't render inline */}
          <motion.div
            key="popover-content"
            ref={popoverRef}
            initial={{ opacity: 0, scale: 0.95, y: side === 'bottom' ? -10 : 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: side === 'bottom' ? -10 : 10 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className={cn(
              'fixed z-[var(--z-popover)]', // CRITICAL: fixed positioning
              'bg-card border border-border rounded-xl shadow-lg',
              'p-4',
              'max-h-[min(400px,calc(100vh-100px))] overflow-y-auto',
              // Only apply maxWidth class when not 'full' (full uses calculated width)
              maxWidth !== 'full' && maxWidthClasses[maxWidth],
              className
            )}
            style={{
              top: `${position.top}px`,
              left: `${position.left}px`,
              width: `${position.width}px`, // Use calculated width (matches trigger when maxWidth='full')
              maxWidth: maxWidth === 'full' ? `${position.width}px` : undefined,
              // CRITICAL: Ensure it's never positioned relative/inline
              position: 'fixed',
            }}
            role="dialog"
            aria-modal="true"
          >
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  )
}

