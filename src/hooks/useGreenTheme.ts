import { useEffect, useCallback, useRef } from 'react'
import { useTheme, GREEN_THEME_META, type GreenTheme } from '../contexts/ThemeContext'
import { useProfile, useUpdateProfile } from './useProfile'
import { useDebounce } from './useDebounce'
import { logError, logWarning } from '../lib/logger'

/**
 * Custom hook for managing green theme with database synchronization
 * Features:
 * - Automatic sync from database on load
 * - Debounced database updates (optimistic UI)
 * - Error handling and recovery
 * - Theme validation
 */
export function useGreenTheme() {
  const { greenTheme, setGreenTheme } = useTheme()
  const { data: profile } = useProfile()
  const updateProfile = useUpdateProfile()
  const isSyncingRef = useRef(false)
  const lastSyncedThemeRef = useRef<GreenTheme | null>(null)
  const isInitialMountRef = useRef(true)
  const userInitiatedChangeRef = useRef(false)

  // Debounce theme changes for database sync (500ms delay)
  const debouncedGreenTheme = useDebounce(greenTheme, 500)

  // Sync theme from database ONLY on initial profile load (not on every change)
  useEffect(() => {
    // Only sync from database on initial mount when profile first loads
    if (isInitialMountRef.current && profile) {
      // If profile has a valid green_theme, use it
      if (profile.green_theme && Object.keys(GREEN_THEME_META).includes(profile.green_theme)) {
        if (profile.green_theme !== greenTheme) {
          setGreenTheme(profile.green_theme)
          lastSyncedThemeRef.current = profile.green_theme
        }
      } else {
        // If profile.green_theme is null/undefined/invalid, default to 'emerald' and sync to database
        const defaultTheme: GreenTheme = 'emerald'
        if (greenTheme !== defaultTheme) {
          setGreenTheme(defaultTheme)
        }
        lastSyncedThemeRef.current = defaultTheme
        
        // Sync default to database if user is authenticated
        if (updateProfile && !isSyncingRef.current) {
          isSyncingRef.current = true
          updateProfile
            .mutateAsync({ green_theme: defaultTheme })
            .catch((error) => {
              logError('Failed to set default green theme', error, 'useGreenTheme')
            })
            .finally(() => {
              isSyncingRef.current = false
            })
        }
      }
      isInitialMountRef.current = false
      return
    }

    // After initial mount, only sync from database if:
    // 1. Profile theme changed (from external source, not user)
    // 2. We're not in the middle of a user-initiated change
    // 3. The profile theme is different from what we just synced
    if (
      !isInitialMountRef.current &&
      !userInitiatedChangeRef.current &&
      profile?.green_theme &&
      profile.green_theme !== greenTheme &&
      profile.green_theme !== lastSyncedThemeRef.current
    ) {
      // Only sync if theme is valid
      if (Object.keys(GREEN_THEME_META).includes(profile.green_theme)) {
        setGreenTheme(profile.green_theme)
        lastSyncedThemeRef.current = profile.green_theme
      }
    }
  }, [profile?.green_theme, greenTheme, setGreenTheme])

  // Debounced database sync when theme changes
  useEffect(() => {
    // Skip if:
    // - Already syncing
    // - Theme matches last synced
    // - No profile data (user not authenticated)
    // - Initial mount (handled by profile sync above)
    if (
      isSyncingRef.current ||
      debouncedGreenTheme === lastSyncedThemeRef.current ||
      !profile ||
      !updateProfile
    ) {
      return
    }

    // Skip if theme matches database
    if (profile.green_theme === debouncedGreenTheme) {
      lastSyncedThemeRef.current = debouncedGreenTheme
      userInitiatedChangeRef.current = false // Reset flag when sync completes
      return
    }

    // Mark as user-initiated change to prevent database from reverting it
    userInitiatedChangeRef.current = true
    
    // Set lastSyncedThemeRef BEFORE mutation to prevent race condition
    // This ensures the sync effect won't revert our change when profile cache updates
    const themeBeingSynced = debouncedGreenTheme
    lastSyncedThemeRef.current = themeBeingSynced

    // Sync to database
    isSyncingRef.current = true
    updateProfile
      .mutateAsync({ green_theme: themeBeingSynced })
      .then(() => {
        // Profile cache will update via onSuccess callback in useProfile
        // The sync effect will see profile.green_theme === lastSyncedThemeRef.current
        // and won't revert. Reset flag after successful sync.
        userInitiatedChangeRef.current = false
      })
      .catch((error) => {
        logError('Failed to sync theme to database', error, 'useGreenTheme')
        
        // Enhanced error tracking
        const errorInfo = {
          theme: debouncedGreenTheme,
          timestamp: new Date().toISOString(),
          error: error instanceof Error ? error.message : String(error),
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
          url: typeof window !== 'undefined' ? window.location.href : 'unknown',
        }
        
        // Log to localStorage for debugging (keep last 10 errors)
        try {
          const errorLog = JSON.parse(localStorage.getItem('theme-errors') || '[]')
          errorLog.push(errorInfo)
          // Keep only last 10 errors to prevent storage bloat
          const trimmedLog = errorLog.slice(-10)
          localStorage.setItem('theme-errors', JSON.stringify(trimmedLog))
        } catch (storageError) {
          // Silently fail if localStorage is full or unavailable
          logWarning('Could not save error log to localStorage', 'useGreenTheme')
        }
        
        // Theme is still updated in localStorage, so user preference is preserved
        // On next login, it will sync from localStorage
      })
      .finally(() => {
        isSyncingRef.current = false
      })
  }, [debouncedGreenTheme, profile, updateProfile])

  /**
   * Change theme with optimistic UI update
   */
  const changeTheme = useCallback(
    (newTheme: GreenTheme) => {
      // Validate theme
      if (!Object.keys(GREEN_THEME_META).includes(newTheme)) {
        logError(`Invalid green theme: ${newTheme}`, undefined, 'useGreenTheme')
        return
      }

      // Mark as user-initiated change to prevent database sync from reverting it
      userInitiatedChangeRef.current = true

      // Optimistic update - UI changes immediately
      setGreenTheme(newTheme)
    },
    [setGreenTheme]
  )

  /**
   * Get theme metadata
   */
  const getThemeMeta = useCallback(
    (theme?: GreenTheme) => {
      return GREEN_THEME_META[theme || greenTheme]
    },
    [greenTheme]
  )

  return {
    greenTheme,
    changeTheme,
    getThemeMeta,
    isSyncing: isSyncingRef.current,
    allThemes: Object.keys(GREEN_THEME_META) as GreenTheme[],
  }
}

