import toast, { Toast } from 'react-hot-toast'
import { safeLocalStorage } from './client-only'
import type { NotificationPreferences } from '../types/database'

const DEFAULT_PREFERENCES: NotificationPreferences = {
  toasts_enabled: true,
  categories: {
    success: true,
    error: true,
    reminders: true,
    milestones: true,
    auto_save: false,
    network: true,
    export: true,
    copy: false,
  },
}

const STORAGE_KEY = 'nikah-alpha-notification-preferences'

/**
 * Get current notification preferences from localStorage
 * Falls back to defaults if not found or invalid
 */
function getPreferences(): NotificationPreferences {
  if (typeof window === 'undefined') return DEFAULT_PREFERENCES
  
  const stored = safeLocalStorage?.getItem(STORAGE_KEY)
  if (stored) {
    try {
      const prefs = JSON.parse(stored) as NotificationPreferences
      // Validate structure
      if (prefs && typeof prefs === 'object' && 'toasts_enabled' in prefs && 'categories' in prefs) {
        return prefs
      }
    } catch {
      // Invalid data, return defaults
    }
  }
  return DEFAULT_PREFERENCES
}

/**
 * Check if a toast category should be shown
 */
function shouldShowToast(category: keyof NotificationPreferences['categories']): boolean {
  const preferences = getPreferences()
  if (!preferences.toasts_enabled) return false
  return preferences.categories[category] ?? true
}

/**
 * Toast wrapper with preference checking
 * Use this instead of direct toast calls to respect user preferences
 */
export const toastWithPreferences = {
  success: (message: string, options?: Parameters<typeof toast.success>[1]) => {
    if (shouldShowToast('success')) {
      return toast.success(message, options)
    }
    return '' as Toast
  },
  error: (message: string, options?: Parameters<typeof toast.error>[1]) => {
    if (shouldShowToast('error')) {
      return toast.error(message, options)
    }
    return '' as Toast
  },
  loading: (message: string, options?: Parameters<typeof toast.loading>[1]) => {
    if (shouldShowToast('reminders')) {
      return toast.loading(message, options)
    }
    return '' as Toast
  },
  reminder: (message: string, options?: Parameters<typeof toast>[1]) => {
    if (shouldShowToast('reminders')) {
      return toast(message, options)
    }
    return '' as Toast
  },
  milestone: (message: string, options?: Parameters<typeof toast.success>[1]) => {
    if (shouldShowToast('milestones')) {
      return toast.success(message, options)
    }
    return '' as Toast
  },
  autoSave: (message: string, options?: Parameters<typeof toast.success>[1]) => {
    if (shouldShowToast('auto_save')) {
      return toast.success(message, options)
    }
    return '' as Toast
  },
  network: (message: string, options?: Parameters<typeof toast>[1]) => {
    if (shouldShowToast('network')) {
      return toast(message, options)
    }
    return '' as Toast
  },
  export: (message: string, options?: Parameters<typeof toast.success>[1]) => {
    if (shouldShowToast('export')) {
      return toast.success(message, options)
    }
    return '' as Toast
  },
  copy: (message: string, options?: Parameters<typeof toast.success>[1]) => {
    if (shouldShowToast('copy')) {
      return toast.success(message, options)
    }
    return '' as Toast
  },
}

// Re-export toast for cases where preferences don't apply (e.g., critical errors)
export { toast }

