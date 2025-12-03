import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../contexts/AuthContext'
import { useProfile, useUpdateProfile } from './useProfile'
import { safeLocalStorage } from '../lib/client-only'
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
 * Hook for managing notification preferences
 * Features:
 * - Syncs with database for authenticated users
 * - Falls back to localStorage for unauthenticated users
 * - Optimistic UI updates
 * - Granular category control
 */
export function useNotificationPreferences() {
  const { user } = useAuth()
  const { data: profile } = useProfile()
  const updateProfile = useUpdateProfile()
  const queryClient = useQueryClient()

  // Get preferences from profile or localStorage
  const getPreferences = (): NotificationPreferences => {
    // Try profile first (authenticated users)
    if (profile?.notification_preferences) {
      try {
        const prefs = profile.notification_preferences as NotificationPreferences
        // Validate structure
        if (prefs && typeof prefs === 'object' && 'toasts_enabled' in prefs && 'categories' in prefs) {
          return prefs
        }
      } catch {
        // Invalid data, fall through to localStorage/default
      }
    }

    // Try localStorage (unauthenticated or fallback)
    if (safeLocalStorage) {
      try {
        const stored = safeLocalStorage.getItem(STORAGE_KEY)
        if (stored) {
          const prefs = JSON.parse(stored) as NotificationPreferences
          // Validate structure
          if (prefs && typeof prefs === 'object' && 'toasts_enabled' in prefs && 'categories' in prefs) {
            return prefs
          }
        }
      } catch {
        // Invalid data, fall through to default
      }
    }

    return DEFAULT_PREFERENCES
  }

  const preferences = getPreferences()

  // Update preferences mutation
  const updatePreferences = useMutation({
    mutationFn: async (newPreferences: NotificationPreferences) => {
      // Update localStorage immediately (optimistic)
      if (safeLocalStorage) {
        safeLocalStorage.setItem(STORAGE_KEY, JSON.stringify(newPreferences))
      }

      // Update database if authenticated
      if (user?.id && profile) {
        await updateProfile.mutateAsync({
          notification_preferences: newPreferences as any, // JSONB type
        })
      }

      return newPreferences
    },
    onSuccess: (data) => {
      // Update React Query cache
      if (user?.id && profile) {
        queryClient.setQueryData(['profile', user.id], {
          ...profile,
          notification_preferences: data,
        })
      }
    },
  })

  // Check if a specific category is enabled
  const isCategoryEnabled = (category: keyof NotificationPreferences['categories']): boolean => {
    if (!preferences.toasts_enabled) return false
    return preferences.categories[category] ?? true
  }

  // Toggle global toast notifications
  const toggleToasts = () => {
    updatePreferences.mutate({
      ...preferences,
      toasts_enabled: !preferences.toasts_enabled,
    })
  }

  // Toggle specific category
  const toggleCategory = (category: keyof NotificationPreferences['categories']) => {
    updatePreferences.mutate({
      ...preferences,
      categories: {
        ...preferences.categories,
        [category]: !preferences.categories[category],
      },
    })
  }

  return {
    preferences,
    isCategoryEnabled,
    toggleToasts,
    toggleCategory,
    updatePreferences: updatePreferences.mutate,
    isUpdating: updatePreferences.isPending,
  }
}

