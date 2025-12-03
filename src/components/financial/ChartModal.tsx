import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { Button } from '../ui/Button'
import { useEffect, useRef, useState } from 'react'

export interface ChartModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description?: string
  children: React.ReactNode
}

/**
 * Fullscreen chart modal for mobile devices
 * Mobile-first design with swipe-to-close gesture support
 * Forces chart re-render after modal opens to fix ResponsiveContainer dimension issues
 */
export function ChartModal({ isOpen, onClose, title, description, children }: ChartModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const startY = useRef<number>(0)
  const currentY = useRef<number>(0)
  const [isMounted, setIsMounted] = useState(false)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      // Force chart re-render after modal is fully visible
      setIsMounted(false)
      const timer = setTimeout(() => {
        setIsMounted(true)
        // Trigger window resize to force ResponsiveContainer to recalculate
        window.dispatchEvent(new Event('resize'))
      }, 100)
      return () => {
        clearTimeout(timer)
        document.body.style.overflow = ''
        setIsMounted(false)
      }
    } else {
      setIsMounted(false)
    }
  }, [isOpen])

  // Update dimensions when modal opens
  useEffect(() => {
    if (!isOpen || !contentRef.current) return

    const updateDimensions = () => {
      if (contentRef.current) {
        const rect = contentRef.current.getBoundingClientRect()
        setDimensions({
          width: rect.width,
          height: rect.height,
        })
      }
    }

    // Initial measurement
    updateDimensions()

    // Update on resize
    window.addEventListener('resize', updateDimensions)
    const resizeObserver = new ResizeObserver(updateDimensions)
    if (contentRef.current) {
      resizeObserver.observe(contentRef.current)
    }

    return () => {
      window.removeEventListener('resize', updateDimensions)
      resizeObserver.disconnect()
    }
  }, [isOpen, isMounted])

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  // Swipe to close gesture (mobile)
  const handleTouchStart = (e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    currentY.current = e.touches[0].clientY
    const deltaY = currentY.current - startY.current

    // Only allow downward swipe
    if (deltaY > 0 && modalRef.current) {
      modalRef.current.style.transform = `translateY(${deltaY}px)`
      modalRef.current.style.opacity = `${1 - deltaY / 300}`
    }
  }

  const handleTouchEnd = () => {
    const deltaY = currentY.current - startY.current

    // Close if swiped down more than 100px
    if (deltaY > 100) {
      onClose()
    } else {
      // Reset position
      if (modalRef.current) {
        modalRef.current.style.transform = ''
        modalRef.current.style.opacity = ''
      }
    }

    startY.current = 0
    currentY.current = 0
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex flex-col bg-background"
        role="dialog"
        aria-modal="true"
        aria-labelledby="chart-modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border flex-shrink-0 safe-area-inset-top">
          <div className="flex-1 min-w-0">
            <h2
              id="chart-modal-title"
              className="text-lg sm:text-xl font-bold text-foreground truncate"
            >
              {title}
            </h2>
            {description && (
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">{description}</p>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="ml-4 flex-shrink-0 min-h-[44px] min-w-[44px]"
            aria-label="Close chart"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Swipe indicator (mobile only) */}
        <div className="block sm:hidden w-12 h-1 bg-muted rounded-full mx-auto mt-2 mb-2" />

        {/* Chart Content */}
        <div
          ref={modalRef}
          className="flex-1 overflow-y-auto p-4 sm:p-6 safe-area-inset-bottom min-h-0"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{ minHeight: '400px' }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            ref={contentRef}
            className="w-full min-h-full flex items-center justify-center"
            style={{
              width: dimensions.width > 0 ? `${dimensions.width}px` : '100%',
              minHeight: dimensions.height > 0 ? `${dimensions.height}px` : '500px',
            }}
          >
            {isMounted && dimensions.width > 0 ? (
              children
            ) : (
              <div className="flex items-center justify-center" style={{ minHeight: '500px' }}>
                <p className="text-sm text-muted-foreground">Loading chart...</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  )
}

