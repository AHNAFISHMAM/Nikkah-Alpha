import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase, signIn, signUp, signOut } from '../lib/supabase'
import type { Profile, ProfileUpdate } from '../types/database'
import { logError } from '../lib/error-handler'
import { logWarning } from '../lib/logger'

interface AuthContextType {
  user: User | null
  session: Session | null
  profile: Profile | null
  isLoading: boolean
  isAuthenticated: boolean
  isAdmin: boolean // Computed: profile?.role === 'admin'
  login: (email: string, password: string) => Promise<{ error: Error | null }>
  register: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>
  logout: () => Promise<void>
  // Additional methods matching spec
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signUp: (email: string, password: string) => Promise<{ error: Error | null; user: User | null }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: Error | null }>
  // Password management
  updatePassword: (newPassword: string) => Promise<{ error: Error | null }>
  resetPassword: (email: string) => Promise<{ error: Error | null }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Fetch user profile from database - moved outside useCallback to avoid dependency issues
  const fetchProfileData = async (userId: string) => {
    if (!supabase) return null
    
    try {
      // Use maybeSingle() instead of single() to handle missing profiles gracefully
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      if (error) {
        // Log error for debugging, but return null (missing profile is not critical)
        logError(error, 'AuthContext.fetchProfileData')
        return null
      }

      // Add computed is_admin field for convenience
      const profileData = data as Profile | null
      if (profileData) {
        profileData.is_admin = profileData.role === 'admin'
      }
      return profileData
    } catch (error) {
      // Log error but return null (profile fetch is non-critical)
      logError(error, 'AuthContext.fetchProfileData')
      return null
    }
  }

  // Refresh profile data
  const refreshProfile = useCallback(async () => {
    if (user) {
      const profileData = await fetchProfileData(user.id)
      setProfile(profileData)
    }
  }, [user])

  // Check if Supabase is disabled (for development/testing)
  const isSupabaseDisabled = () => {
    return !supabase
  }

  // Create mock session for fallback
  const createMockSession = (): Session => {
    const mockUser: User = {
      id: 'mock-user-id',
      email: 'demo@example.com',
      created_at: new Date().toISOString(),
      app_metadata: {},
      user_metadata: {},
      aud: 'authenticated',
      confirmation_sent_at: undefined,
      recovery_sent_at: undefined,
      email_change_sent_at: undefined,
      new_email: undefined,
      invited_at: undefined,
      action_link: undefined,
      new_phone: undefined,
      phone: undefined,
      phone_confirmed_at: undefined,
      confirmed_at: new Date().toISOString(),
      is_anonymous: false,
      last_sign_in_at: new Date().toISOString(),
    }

    return {
      access_token: 'mock-access-token',
      token_type: 'bearer',
      expires_in: 3600,
      expires_at: Math.floor(Date.now() / 1000) + 3600,
      refresh_token: 'mock-refresh-token',
      user: mockUser,
    }
  }

  // Get cached session from localStorage
  const getCachedSession = (): Session | null => {
    if (typeof window === 'undefined') return null

    try {
      const cached = localStorage.getItem('sb-session-cache')
      if (!cached) return null

      const parsed = JSON.parse(cached)
      // Check expiration with 5 min buffer (300000 ms)
      if (parsed.expires_at * 1000 > Date.now() + 300000) {
        return parsed as Session
      }
      // Expired, remove it
      localStorage.removeItem('sb-session-cache')
      return null
    } catch {
      return null
    }
  }

  // Cache session to localStorage
  const cacheSession = (session: Session | null) => {
    if (typeof window === 'undefined') return
    if (session) {
      localStorage.setItem('sb-session-cache', JSON.stringify(session))
    } else {
      localStorage.removeItem('sb-session-cache')
    }
  }

  // Initialize auth state - only runs once on mount
  useEffect(() => {
    let mounted = true
    let subscription: { unsubscribe: () => void } | null = null

    const initializeAuth = async () => {
      // Check for cached session first for instant render
      const cachedSession = getCachedSession()
      if (cachedSession && mounted) {
        setSession(cachedSession)
        setUser(cachedSession.user)
        setIsLoading(false)
        // Fetch profile in background
        fetchProfileData(cachedSession.user.id)
          .then((profileData) => {
            if (mounted) {
              setProfile(profileData)
            }
          })
          .catch((error) => {
            // Log error but don't break the app (profile fetch is non-critical)
            logError(error, 'AuthContext.initAuth')
          })
        return
      }

      // Check if Supabase is disabled and use mock session (DEV ONLY)
      if (isSupabaseDisabled() && import.meta.env.DEV) {
        if (mounted) {
          const mockSession = createMockSession()
          setSession(mockSession)
          setUser(mockSession.user)
          setIsLoading(false)
          cacheSession(mockSession)
        }
        return
      }

      // In production with no Supabase, fail gracefully
      if (isSupabaseDisabled()) {
        // Log error but don't break the app
        if (mounted) {
          setIsLoading(false)
        }
        return
      }

      // Set loading to false if no cached session
      if (mounted) {
        setIsLoading(false)
      }

      // Initialize auth from Supabase
      if (!supabase) return

      try {
        const { data: { session }, error } = await supabase.auth.getSession()

        if (!mounted) return

        if (error) {
          // Error getting session - fail silently, user will need to login
          return
        }

        if (session?.user) {
          setSession(session)
          setUser(session.user)
          cacheSession(session)
          // Fetch profile in background
          fetchProfileData(session.user.id)
            .then((profileData) => {
              if (mounted) {
                setProfile(profileData)
              }
            })
            .catch((error) => {
              // Log error but don't break the app (profile fetch is non-critical)
              logError(error, 'AuthContext.initAuth')
            })
        }
      } catch (error) {
        // Error initializing auth - fail silently, user will need to login
      }

      // Listen for auth changes
      const { data } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (!mounted) return

          setSession(session)
          setUser(session?.user ?? null)
          cacheSession(session)

          if (session?.user) {
            const profileData = await fetchProfileData(session.user.id)
            if (mounted) {
              setProfile(profileData)
            }
          } else {
            if (mounted) {
              setProfile(null)
            }
          }

          if (event === 'SIGNED_OUT') {
            if (mounted) {
              setProfile(null)
              cacheSession(null)
            }
          }
        }
      )
      subscription = data.subscription
    }

    initializeAuth()

    return () => {
      mounted = false
      if (subscription) {
        subscription.unsubscribe()
      }
    }
  }, []) // Empty deps - only run once on mount

  // Login handler
  const login = useCallback(async (email: string, password: string) => {
    if (!supabase) {
      return { error: new Error('Supabase is not configured') }
    }

    const { data, error } = await signIn(email, password)
    if (error) {
      return { error: new Error(error.message) }
    }

    // Wait for session to be established
    // The onAuthStateChange listener will update the state, but we should verify
    if (data?.session) {
      setSession(data.session)
      setUser(data.session.user)
      cacheSession(data.session)
      
      // Fetch profile in background
      const profileData = await fetchProfileData(data.session.user.id)
      if (profileData) {
        setProfile(profileData)
      }
    } else {
      // If no session in response, wait a bit and check again
      await new Promise(resolve => setTimeout(resolve, 500))
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        setSession(session)
        setUser(session.user)
        cacheSession(session)
        const profileData = await fetchProfileData(session.user.id)
        if (profileData) {
          setProfile(profileData)
        }
      } else {
        return { error: new Error('Login successful but no session was created') }
      }
    }

    return { error: null }
  }, [])

  // Register handler
  const register = useCallback(async (email: string, password: string, fullName: string): Promise<{ error: Error | null; data?: { user: User | null; session: Session | null } }> => {
    if (!supabase) {
      return { error: new Error('Supabase is not configured') }
    }

    const { data, error } = await signUp(email, password, fullName)

    if (error) {
      return { error: new Error(error.message) }
    }

    // Create profile after signup
    if (data?.user) {
      // Validate email exists
      if (!data.user.email) {
        return { error: new Error('User email is required but not provided') }
      }

      // Split full name into first and last name if possible
      const nameParts = fullName.trim().split(' ')
      const first_name = nameParts[0] || null
      const last_name = nameParts.slice(1).join(' ') || null

      // Try to insert profile, but handle case where it already exists (409 Conflict)
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          email: data.user.email, // Required field - validated above
          full_name: fullName,
          first_name: first_name,
          last_name: last_name,
          role: 'user', // Default role for new users
        } as any)

      if (profileError) {
        // If profile already exists (409 Conflict), try to update it instead
        if (profileError.code === '23505' || profileError.message?.includes('409') || profileError.message?.includes('Conflict') || profileError.message?.includes('duplicate')) {
          // Profile already exists, try to update it
          const { error: updateError } = await supabase
            .from('profiles')
            .update({
              email: data.user.email,
              full_name: fullName,
              first_name: first_name,
              last_name: last_name,
            })
            .eq('id', data.user.id)

          if (updateError) {
            // Log but don't fail signup - profile can be created/updated later
            logWarning('Profile update failed after signup', 'AuthContext')
          }
        } else {
          // Other errors - log but don't fail signup
          logWarning('Profile creation failed after signup', 'AuthContext')
        }
      }
      
      // Set user state immediately after successful signup
      setUser(data.user)
      if (data.session) {
        setSession(data.session)
        cacheSession(data.session)
      }
      
      return { error: null, data: { user: data.user, session: data.session } }
    }

    return { error: null, data: { user: null, session: null } }
  }, [])

  // Logout handler
  const logout = useCallback(async () => {
    try {
      if (!isSupabaseDisabled()) {
        const { error } = await signOut()
        if (error) {
          // Log but continue with local state cleanup
        }
      }
    } catch (error) {
      // Log but continue with local state cleanup
    } finally {
      // Always clear local state
      setUser(null)
      setSession(null)
      setProfile(null)
      cacheSession(null)
    }
  }, [])

  // SignOut alias (matching spec)
  const signOutMethod = useCallback(async () => {
    await logout()
  }, [logout])

  // SignIn alias (matching spec)
  const signInMethod = useCallback(async (email: string, password: string) => {
    return await login(email, password)
  }, [login])

  // SignUp method (matching spec - returns user)
  const signUpMethod = useCallback(async (email: string, password: string) => {
    // For signUp without fullName, we'll use email as name
    const { error, data } = await register(email, password, email.split('@')[0])
    if (error) {
      return { error, user: null }
    }
    
    // Wait for auth state to update via onAuthStateChange listener
    // The listener will set the user state automatically
    // Return the user from the current state (will be set by the listener)
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // Get fresh user from state after auth state change
    return { error: null, user: user || data?.user || null }
  }, [register, user])

  // Update profile handler
  const updateProfile = useCallback(async (updates: Partial<Profile>) => {
    if (!user) {
      return { error: new Error('Not authenticated') }
    }

    if (!supabase) {
      return { error: new Error('Supabase is not configured') }
    }

    // Build update payload - filter out undefined values and id/created_at
    const updatePayload: ProfileUpdate = {}

    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined && key !== 'id' && key !== 'created_at') {
        (updatePayload as Record<string, unknown>)[key] = value
      }
    })

    updatePayload.updated_at = new Date().toISOString()

    const { error } = await supabase
      .from('profiles')
      .update(updatePayload as any)
      .eq('id', user.id)

    if (error) {
      return { error: new Error(error.message) }
    }

    await refreshProfile()
    return { error: null }
  }, [user, refreshProfile])

  // Update password handler
  const updatePassword = useCallback(async (newPassword: string) => {
    if (!supabase) {
      return { error: new Error('Supabase is not configured') }
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (error) {
      return { error: new Error(error.message) }
    }

    return { error: null }
  }, [])

  // Reset password handler (sends reset email)
  const resetPassword = useCallback(async (email: string) => {
    if (!supabase) {
      return { error: new Error('Supabase is not configured') }
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (error) {
      return { error: new Error(error.message) }
    }

    return { error: null }
  }, [])

  // Compute isAdmin from profile role
  const isAdmin = profile?.role === 'admin' || profile?.is_admin === true

  const value: AuthContextType = {
    user,
    session,
    profile,
    isLoading,
    isAuthenticated: !!user,
    isAdmin,
    login,
    register,
    logout,
    signIn: signInMethod,
    signUp: signUpMethod,
    signOut: signOutMethod,
    refreshProfile,
    updateProfile,
    updatePassword,
    resetPassword,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Export hook as const arrow function for Fast Refresh compatibility
// This ensures the hook reference is stable across HMR
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
