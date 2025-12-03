import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bell,
  ChevronDown,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Info,
  Wifi,
  Download,
  Copy,
  Save,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card'
import { useNotificationPreferences } from '../../hooks/useNotificationPreferences'
import { cn } from '../../lib/utils'
import type { NotificationPreferences } from '../../types/database'

const CATEGORY_CONFIG: Record<
  keyof NotificationPreferences['categories'],
  {
    label: string
    description: string
    icon: typeof CheckCircle
    color: string
  }
> = {
  success: {
    label: 'Success Messages',
    description: 'Celebratory messages and confirmations',
    icon: CheckCircle,
    color: 'text-green-600 dark:text-green-400',
  },
  error: {
    label: 'Error Messages',
    description: 'Important error notifications',
    icon: AlertCircle,
    color: 'text-red-600 dark:text-red-400',
  },
  reminders: {
    label: 'Gentle Reminders',
    description: 'Helpful nudges and reminders',
    icon: Bell,
    color: 'text-blue-600 dark:text-blue-400',
  },
  milestones: {
    label: 'Milestones',
    description: 'Progress celebrations and achievements',
    icon: Sparkles,
    color: 'text-purple-600 dark:text-purple-400',
  },
  auto_save: {
    label: 'Auto-Save',
    description: 'Auto-save status notifications',
    icon: Save,
    color: 'text-muted-foreground',
  },
  network: {
    label: 'Network Status',
    description: 'Online/offline status updates',
    icon: Wifi,
    color: 'text-muted-foreground',
  },
  export: {
    label: 'Export Operations',
    description: 'Data export confirmations',
    icon: Download,
    color: 'text-muted-foreground',
  },
  copy: {
    label: 'Copy to Clipboard',
    description: 'Copy confirmation messages',
    icon: Copy,
    color: 'text-muted-foreground',
  },
}

export function NotificationPreferencesCard() {
  const {
    preferences,
    isCategoryEnabled,
    toggleToasts,
    toggleCategory,
    isUpdating,
  } = useNotificationPreferences()
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <Card padding="none" className="overflow-hidden">
      <CardHeader className="border-b border-border px-6 py-5 sm:px-8 sm:py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center flex-shrink-0">
              <Bell className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg sm:text-xl">Notification Preferences</CardTitle>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                Control which notifications you receive
              </p>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 sm:p-8">
        <div className="space-y-6">
          {/* Global Toggle */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-card/30 hover:bg-card/50 transition-colors border border-border/50">
            <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
              <div className="h-10 w-10 rounded-xl bg-accent flex items-center justify-center flex-shrink-0">
                <Bell
                  className={cn(
                    'h-5 w-5',
                    preferences.toasts_enabled ? 'text-primary' : 'text-muted-foreground'
                  )}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground text-sm sm:text-base">
                  Toast Notifications
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                  {preferences.toasts_enabled
                    ? 'All toast notifications are enabled'
                    : 'All toast notifications are disabled'}
                </p>
              </div>
            </div>
            <div className="flex-shrink-0 ml-4">
              <NotificationToggle
                checked={preferences.toasts_enabled}
                onChange={toggleToasts}
                disabled={isUpdating}
                aria-label="Toggle toast notifications"
              />
            </div>
          </div>

          {/* Category Toggles - Collapsible */}
          <div className="space-y-3">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-accent/50 transition-colors touch-manipulation min-h-[44px]"
              aria-expanded={isExpanded}
              aria-label={isExpanded ? 'Collapse categories' : 'Expand categories'}
              disabled={!preferences.toasts_enabled}
            >
              <span className="text-sm font-medium text-foreground">
                Notification Categories
              </span>
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              </motion.div>
            </button>

            <AnimatePresence>
              {isExpanded && preferences.toasts_enabled && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="space-y-3 pt-2 border-t border-border">
                    {(
                      Object.keys(CATEGORY_CONFIG) as Array<
                        keyof NotificationPreferences['categories']
                      >
                    ).map((category) => {
                      const config = CATEGORY_CONFIG[category]
                      const Icon = config.icon
                      const enabled = isCategoryEnabled(category)

                      return (
                        <div
                          key={category}
                          className="flex items-center justify-between p-3 rounded-lg bg-card/30 hover:bg-card/50 transition-colors border border-border/30"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <Icon
                              className={cn('h-5 w-5 flex-shrink-0', config.color)}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground">
                                {config.label}
                              </p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {config.description}
                              </p>
                            </div>
                          </div>
                          <div className="flex-shrink-0 ml-4">
                            <NotificationToggle
                              checked={enabled}
                              onChange={() => toggleCategory(category)}
                              disabled={isUpdating}
                              aria-label={`Toggle ${config.label} notifications`}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {!preferences.toasts_enabled && (
              <p className="text-xs text-muted-foreground text-center py-2">
                Enable toast notifications above to customize categories
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Reusable Toggle Component
interface NotificationToggleProps {
  checked: boolean
  onChange: () => void
  disabled?: boolean
  'aria-label': string
}

function NotificationToggle({
  checked,
  onChange,
  disabled,
  'aria-label': ariaLabel,
}: NotificationToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={onChange}
      disabled={disabled}
      className={cn(
        // Base styles - consistent sizing with better mobile proportions
        'relative inline-flex h-6 w-11 items-center rounded-full',
        'transition-all duration-200 ease-in-out',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
        'touch-manipulation',
        // State-based colors
        checked
          ? 'bg-primary hover:bg-primary/90 active:bg-primary/80'
          : 'bg-muted hover:bg-muted/80 active:bg-muted/70',
        // Disabled state
        disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
        // Hover effect (only when not disabled)
        !disabled && 'hover:scale-105 active:scale-95'
      )}
    >
      <motion.span
        className={cn(
          'absolute inline-block rounded-full bg-white shadow-md',
          'ring-0 transition-shadow duration-200',
          // Consistent size for better proportions (16px)
          'h-4 w-4 left-0.5',
          // Shadow enhancement when checked
          checked && 'shadow-lg ring-2 ring-primary/20'
        )}
        animate={{
          x: checked ? 22 : 0, // 22px when checked (44px track - 16px thumb - 2px left - 4px right = 22px), 0px when unchecked (0.5 = 2px padding)
        }}
        transition={{
          type: 'spring',
          stiffness: 500,
          damping: 35,
          mass: 0.5,
        }}
        whileTap={!disabled ? { scale: 0.95 } : {}}
      />
    </button>
  )
}

