import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, CheckCircle2, AlertCircle, Clock } from 'lucide-react'
import { Button } from '../ui/Button'
import type { SaveStatus } from '../../hooks/useAutoSaveNotes'

export interface SaveStatusIndicatorProps {
  status: SaveStatus
  lastSavedAt: Date | null
  hasUnsavedChanges: boolean
  onRetry?: () => void
  className?: string
}

/**
 * Mobile-first save status indicator component
 * Displays current save state with appropriate icons and colors
 * Minimum 44px touch target for mobile accessibility
 */
export function SaveStatusIndicator({
  status,
  lastSavedAt,
  hasUnsavedChanges,
  onRetry,
  className = '',
}: SaveStatusIndicatorProps) {
  // Format time ago (e.g., "2s ago", "1m ago")
  const formatTimeAgo = (date: Date | null): string => {
    if (!date) return ''
    
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
    
    if (seconds < 60) return `${seconds}s ago`
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    return `${Math.floor(seconds / 86400)}d ago`
  }

  // Don't show if idle and no unsaved changes
  if (status === 'idle' && !hasUnsavedChanges) {
    return null
  }

  const statusConfig = {
    idle: {
      icon: CheckCircle2,
      text: 'All changes saved',
      className: 'bg-muted/50 text-muted-foreground',
      iconClassName: 'text-muted-foreground',
    },
    saving: {
      icon: Loader2,
      text: 'Saving...',
      className: 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400',
      iconClassName: 'text-amber-600 dark:text-amber-500',
    },
    saved: {
      icon: CheckCircle2,
      text: 'Saved',
      className: 'bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400',
      iconClassName: 'text-green-600 dark:text-green-500',
    },
    error: {
      icon: AlertCircle,
      text: 'Failed to save',
      className: 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400',
      iconClassName: 'text-red-600 dark:text-red-500',
    },
  }

  const config = statusConfig[status]
  const Icon = config.icon
  const timeAgo = status === 'saved' && lastSavedAt ? formatTimeAgo(lastSavedAt) : ''

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={status}
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.2 }}
        className={`flex items-center justify-between gap-2 px-3 py-2.5 sm:py-2 rounded-lg text-sm min-h-[44px] sm:min-h-[36px] ${config.className} ${className}`}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Icon
            className={`h-4 w-4 sm:h-3.5 sm:w-3.5 flex-shrink-0 ${
              status === 'saving' ? 'animate-spin' : ''
            } ${config.iconClassName}`}
          />
          <span className="font-medium truncate">
            {config.text}
            {timeAgo && (
              <span className="ml-1.5 text-xs opacity-75 hidden sm:inline">
                {timeAgo}
              </span>
            )}
          </span>
        </div>

        {status === 'error' && onRetry && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRetry}
            className="h-8 px-3 text-xs flex-shrink-0 hover:bg-red-100 dark:hover:bg-red-950/50"
          >
            Retry
          </Button>
        )}

        {status === 'saved' && timeAgo && (
          <div className="flex items-center gap-1 text-xs opacity-75 sm:hidden">
            <Clock className="h-3 w-3" />
            <span>{timeAgo}</span>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}

