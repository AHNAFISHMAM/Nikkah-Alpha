import { useEffect, useCallback, useRef } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { useProfile, useUpdateProfile } from './useProfile'
import { useDebounce } from './useDebounce'
import toast from 'react-hot-toast'
import { logError, logWarning } from '../lib/logger'

type ThemeMode = 'light' | 'dark' | 'system'

/**
 * Custom hook for managing theme mode (light/dark) with database synchronization
 * Features:
 * - Automatic sync from database on load
 * - Debounced database updates (optimistic UI)
 * - Error handling and recovery
 * - Respects system preferences when mode is 'system'
 * - Falls back to localStorage for unauthenticated users
 * 
 * Best Practices:
 * - Optimistic UI updates (immediate visual feedback)
 * - Debounced database writes (reduces API calls)
 * - Graceful fallback to localStorage
 * - Respects system preferences
 */
export function useThemeMode() {
  const { theme, setTheme, toggleTheme } = useTheme()
  const { data: profile } = useProfile()
  const updateProfile = useUpdateProfile()
  const isSyncingRef = useRef(false)
  const lastSyncedThemeRef = useRef<ThemeMode | null>(null)
  const isInitialMountRef = useRef(true)
  const userInitiatedChangeRef = useRef(false)

  // Get current theme mode from profile or default to 'light'
  const currentThemeMode: ThemeMode = profile?.theme_mode || 'light'

  // Debounce theme changes for database sync (500ms delay)
  const debouncedTheme = useDebounce(theme, 500)

  // Sync theme mode from database ONLY on initial profile load
  useEffect(() => {
    // Only sync from database on initial mount when profile first loads
    if (isInitialMountRef.current && profile?.theme_mode) {
      const dbThemeMode = profile.theme_mode as ThemeMode
      
      // Apply the theme mode from database
      if (dbThemeMode !== 'system') {
        if (dbThemeMode !== theme) {
          setTheme(dbThemeMode)
          lastSyncedThemeRef.current = dbThemeMode
        }
      } else {
        // If set to 'system', default to light mode
        if (theme !== 'light') {
          setTheme('light')
        }
        lastSyncedThemeRef.current = 'system'
      }
      
      isInitialMountRef.current = false
      return
    }

    // After initial mount, only sync from database if:
    // 1. Profile theme_mode changed (from external source, not user)
    // 2. We're not in the middle of a user-initiated change
    // 3. The profile theme_mode is different from what we just synced
    if (
      !isInitialMountRef.current &&
      !userInitiatedChangeRef.current &&
      profile?.theme_mode &&
      profile.theme_mode !== lastSyncedThemeRef.current
    ) {
      const dbThemeMode = profile.theme_mode as ThemeMode
      
      if (dbThemeMode !== 'system') {
        if (dbThemeMode !== theme) {
          setTheme(dbThemeMode)
          lastSyncedThemeRef.current = dbThemeMode
        }
      } else {
        // If set to 'system', default to light mode
        if (theme !== 'light') {
          setTheme('light')
        }
        lastSyncedThemeRef.current = 'system'
      }
    }
  }, [profile?.theme_mode, theme, setTheme])

  // Debounced database sync when theme changes (only for authenticated users)
  // This handles cases where theme changes from external sources (not user toggle)
  // User toggle is handled directly in handleToggleTheme for immediate feedback
  useEffect(() => {
    // Skip if:
    // - Already syncing
    // - No profile data (user not authenticated)
    // - Initial mount (handled by profile sync above)
    // - User preference is 'system' (don't sync actual theme changes, only system preference changes)
    if (
      isSyncingRef.current ||
      !profile ||
      !updateProfile ||
      isInitialMountRef.current
    ) {
      return
    }

    // If current mode is 'system', don't sync theme changes from this effect
    // (system preference changes are handled by system preference listener in ThemeContext)
    // User manual toggles are handled in handleToggleTheme
    if (currentThemeMode === 'system') {
      return
    }

    // Skip if theme matches database preference (already in sync)
    if (currentThemeMode === debouncedTheme) {
      lastSyncedThemeRef.current = debouncedTheme as ThemeMode
      userInitiatedChangeRef.current = false
      return
    }

    // Skip if this theme was already synced (prevents duplicate syncs)
    if (debouncedTheme === lastSyncedThemeRef.current) {
      return
    }

    // This handles external theme changes (not user-initiated toggle)
    // Mark as user-initiated to prevent database from reverting it
    userInitiatedChangeRef.current = true
    
    // Set lastSyncedThemeRef BEFORE mutation to prevent race condition
    const themeBeingSynced = debouncedTheme as ThemeMode
    lastSyncedThemeRef.current = themeBeingSynced

    // Sync to database
    isSyncingRef.current = true
    updateProfile
      .mutateAsync({ theme_mode: themeBeingSynced })
      .then(() => {
        // Profile cache will update via onSuccess callback in useProfile
        userInitiatedChangeRef.current = false
      })
      .catch((error) => {
        console.error('Failed to sync theme mode to database:', error)
        
        // Enhanced error tracking
        const errorInfo = {
          theme: debouncedTheme,
          timestamp: new Date().toISOString(),
          error: error instanceof Error ? error.message : String(error),
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
          url: typeof window !== 'undefined' ? window.location.href : 'unknown',
        }
        
        // Log to localStorage for debugging (keep last 10 errors)
        try {
          const errorLog = JSON.parse(localStorage.getItem('theme-mode-errors') || '[]')
          errorLog.push(errorInfo)
          const trimmedLog = errorLog.slice(-10)
          localStorage.setItem('theme-mode-errors', JSON.stringify(trimmedLog))
        } catch (storageError) {
          logWarning('Could not save error log to localStorage', 'useThemeMode')
        }
        
        // Theme is still updated in localStorage, so user preference is preserved
      })
      .finally(() => {
        isSyncingRef.current = false
      })
  }, [debouncedTheme, profile, updateProfile, currentThemeMode])

  /**
   * Toggle theme between light and dark
   * For authenticated users, syncs to database immediately (not debounced)
   * For unauthenticated users, saves to localStorage
   * 
   * Best Practice: When user manually toggles, change from 'system' to explicit preference
   * This ensures immediate feedback and prevents sync conflicts
   */
  const handleToggleTheme = useCallback(() => {
    // Mark as user-initiated change to prevent sync effect from interfering
    userInitiatedChangeRef.current = true

    // Calculate the new theme after toggle (before calling toggleTheme)
    const newTheme = theme === 'light' ? 'dark' : 'light'

    // Set lastSyncedThemeRef BEFORE updating to prevent debounced effect from running
    lastSyncedThemeRef.current = newTheme

    // Show toast IMMEDIATELY (optimistic feedback - best practice for instant UX)
    toast(
      newTheme === 'dark' ? '🌙 Switched to dark mode' : '☀️ Switched to light mode',
      {
        duration: 2000,
        icon: null,
        style: {
          backgroundColor: 'var(--toast-info-bg)',
          color: 'var(--toast-info-text)',
          border: '1.5px solid var(--toast-info-border)',
        },
        ariaProps: {
          role: 'alert',
          'aria-live': 'polite',
        },
      }
    )

    // Optimistic update - UI changes immediately
    toggleTheme()

    // For authenticated users, update database preference (silent sync in background)
    // This ensures the database is updated right away, not after debounce delay
    if (profile && updateProfile) {
      // Update database to explicit theme preference
      // If user was in 'system' mode, this changes them to explicit preference
      // If user already had explicit preference, this updates it to the toggled value
      updateProfile.mutate(
        { theme_mode: newTheme },
        {
          onSuccess: () => {
            // Reset flag after successful sync
            userInitiatedChangeRef.current = false
          },
          onError: () => {
            // On error, reset lastSyncedThemeRef so it can retry
            lastSyncedThemeRef.current = null
            userInitiatedChangeRef.current = false
            // Note: We don't show error toast here to avoid noise
            // The theme change still works locally, just didn't sync to database
          },
        }
      )
    } else {
      // For unauthenticated users, localStorage is handled by ThemeContext
      // Reset flag since there's no database sync needed
      userInitiatedChangeRef.current = false
    }
  }, [theme, toggleTheme, profile, updateProfile])

  /**
   * Set theme mode preference
   * @param mode - 'light', 'dark', or 'system'
   */
  const setThemeMode = useCallback(
    (mode: ThemeMode) => {
      if (!['light', 'dark', 'system'].includes(mode)) {
        logError(`Invalid theme mode: ${mode}`, undefined, 'useThemeMode')
        return
      }

      // Mark as user-initiated change
      userInitiatedChangeRef.current = true

      // If setting to 'system', default to light mode
      if (mode === 'system') {
        setTheme('light')
      } else {
        // Set explicit theme
        setTheme(mode)
      }

      // Sync to database if authenticated
      if (profile && updateProfile) {
        updateProfile.mutate({ theme_mode: mode })
      }
    },
    [setTheme, profile, updateProfile]
  )

  return {
    theme,
    themeMode: currentThemeMode,
    toggleTheme: handleToggleTheme,
    setThemeMode,
    isSyncing: isSyncingRef.current,
  }
}

