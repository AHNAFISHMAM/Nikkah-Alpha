import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../types/database'
import { isClient } from './client-only'
import { logWarning } from './logger'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Don't throw error - allow for mock session fallback
// Only enable Supabase on client side
export const isSupabaseEnabled = isClient && !!(supabaseUrl && supabaseAnonKey)

// Singleton pattern to prevent multiple Supabase client instances
// Use global scope to persist across HMR (Hot Module Reload)
declare global {
  // eslint-disable-next-line no-var
  var __supabaseClient__: SupabaseClient<Database> | null | undefined
}

function createSupabaseClient(): SupabaseClient<Database> | null {
  if (!isSupabaseEnabled) {
    return null
  }

  // Check if instance already exists in global scope (persists across HMR)
  if (typeof globalThis !== 'undefined' && globalThis.__supabaseClient__) {
    return globalThis.__supabaseClient__
  }

  if (typeof window !== 'undefined' && (window as any).__supabaseClient__) {
    return (window as any).__supabaseClient__
  }

  // Ensure we're on client side before creating client
  if (!isClient) {
    logWarning('Supabase client can only be created on the client side', 'supabase')
    return null
  }

  // Create new instance only if it doesn't exist
  const instance = createClient<Database>(supabaseUrl!, supabaseAnonKey!, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
      storage: isClient ? window.localStorage : undefined,
      storageKey: 'nikah-alpha-auth', // Unique storage key for this project
    },
    global: {
      headers: {
        'x-application-name': 'NikahAlpha', // Unique identifier for this project
      },
      fetch: (url, options = {}) => {
        // Add timeout to prevent hanging requests
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 10000) // 10s timeout

        return fetch(url, {
          ...options,
          signal: controller.signal,
        })
          .catch((error) => {
            // Suppress network errors for token refresh (happens automatically in background)
            const urlString = typeof url === 'string' ? url : url instanceof URL ? url.toString() : ''
            const isTokenRefresh = urlString.includes('/auth/v1/token') && urlString.includes('grant_type=refresh_token')
            
            // Check for network/DNS errors in various error properties
            const errorMessage = error?.message || error?.toString() || ''
            const isNetworkError = 
              error.name === 'TypeError' ||
              errorMessage.includes('ERR_NAME_NOT_RESOLVED') ||
              errorMessage.includes('Failed to fetch') ||
              errorMessage.includes('NetworkError') ||
              errorMessage.includes('network')
            
            if (error.name === 'AbortError') {
              // Timeout errors - only log if not a background token refresh
              if (!isTokenRefresh) {
                logWarning(`Request timeout: ${url}`, 'supabase')
              }
            } else if (isNetworkError) {
              // Network/DNS errors - only log if not a background token refresh
              if (!isTokenRefresh) {
                logWarning('Network error - check your internet connection', 'supabase')
              }
              // For token refresh failures, return a rejected promise that Supabase can handle gracefully
              if (isTokenRefresh) {
                return Promise.reject(new Error('NETWORK_ERROR'))
              }
            }
            throw error
          })
          .finally(() => clearTimeout(timeoutId))
      },
    },
    db: {
      schema: 'public',
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  })

  // Store in global scope to persist across HMR
  if (typeof globalThis !== 'undefined') {
    globalThis.__supabaseClient__ = instance
  }
  if (typeof window !== 'undefined') {
    (window as any).__supabaseClient__ = instance
  }

  return instance
}

// Export singleton instance (may be null if Supabase is disabled)
// This is evaluated once at module load time
export const supabase = createSupabaseClient()

// Auth helper functions
export const signUp = async (email: string, password: string, fullName: string) => {
  if (!supabase) {
    return { data: null, error: new Error('Supabase is not configured') }
  }
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  })

  // Handle case where email already exists
  if (error) {
    const errorMessage = error.message || ''
    // Check if error is about existing user
    const isExistingUserError = 
      errorMessage.toLowerCase().includes('already registered') ||
      errorMessage.toLowerCase().includes('already exists') ||
      errorMessage.toLowerCase().includes('user already registered') ||
      errorMessage.toLowerCase().includes('email address is already registered') ||
      errorMessage.toLowerCase().includes('email already registered')

    if (isExistingUserError) {
      // Check if it's a deleted user profile (anonymized)
      try {
        const profileResult = await supabase
          .from('profiles')
          .select('email')
          .eq('email', email)
          .maybeSingle()

        const profile = profileResult.data as { email: string } | null
        const profileError = profileResult.error

        // If profile exists with deleted pattern, the auth user wasn't properly deleted
        if (!profileError && profile?.email && typeof profile.email === 'string' && profile.email.startsWith('deleted_')) {
          return {
            data: null,
            error: new Error(
              'This email was previously used and deleted. Please wait a few minutes and try again, or contact support if the issue persists.'
            ),
          }
        }
      } catch (profileError) {
        // Profile check failed - log but continue with original error
        logWarning('Profile check failed during signup', 'supabase')
      }

      return {
        data: null,
        error: new Error(
          'An account with this email already exists. Please sign in instead or use a different email address.'
        ),
      }
    }

    // Return original error for other cases
    return { data, error }
  }

  return { data, error }
}

export const signIn = async (email: string, password: string) => {
  if (!supabase) {
    return { data: null, error: new Error('Supabase is not configured') }
  }
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  return { data, error }
}

export const signOut = async () => {
  try {
    if (!supabase) {
      return { error: null } // No-op if Supabase disabled
    }
    // Sign out and clear session
    const { error } = await supabase.auth.signOut({
      scope: 'global' // Sign out from all scopes
    })
    
    // Clear all auth-related storage (client-side only)
    if (isClient && window.localStorage) {
      // Clear the specific storage key
      window.localStorage.removeItem('nikah-alpha-auth')
      // Also clear any other potential auth storage
      const keysToRemove: string[] = []
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i)
        if (key && (key.includes('supabase') || key.includes('auth'))) {
          keysToRemove.push(key)
        }
      }
      keysToRemove.forEach(key => window.localStorage.removeItem(key))
    }
    
    return { error }
  } catch (error) {
    // Error during signOut - return error but don't log (non-critical)
    return { error: error as Error }
  }
}

export const getCurrentUser = async () => {
  if (!supabase) {
    return { user: null, error: new Error('Supabase is not configured') }
  }
  const { data: { user }, error } = await supabase.auth.getUser()
  return { user, error }
}

export const getCurrentSession = async () => {
  if (!supabase) {
    return { session: null, error: new Error('Supabase is not configured') }
  }
  const { data: { session }, error } = await supabase.auth.getSession()
  return { session, error }
}
