# 🔐 MASTER AUTHENTICATION & SECURITY PROMPT
## Production-Grade Authentication, Authorization, and Security Implementation

---

## 📋 OVERVIEW

This master prompt provides a comprehensive approach to implementing authentication, authorization, and security best practices in production applications. It covers authentication flows, session management, password security, protected routes, and security hardening.

**Applicable to:**
- Authentication flows (login, signup, logout)
- Session management and persistence
- Password security and validation
- Email verification flows
- Password reset flows
- Protected routes and authorization
- Token refresh and expiration
- Security best practices

---

## 🎯 CORE PRINCIPLES

### 1. **Security First**
- **Never Trust Client**: All security checks must happen server-side
- **Principle of Least Privilege**: Users get minimum required permissions
- **Defense in Depth**: Multiple security layers (RLS + client-side validation)
- **Secure by Default**: Fail securely, don't expose sensitive information

### 2. **User Experience**
- **Seamless Authentication**: Smooth login/signup flows
- **Session Persistence**: Remember users across sessions
- **Clear Error Messages**: User-friendly error messages (without exposing security details)
- **Loading States**: Show loading indicators during auth operations

### 3. **Password Security**
- **Strong Validation**: Enforce password strength requirements
- **Secure Storage**: Passwords never stored in plain text (handled by Supabase)
- **Password Reset**: Secure password reset flow with email verification
- **Password Update**: Allow users to update passwords securely

---

## 🔍 PHASE 1: AUTHENTICATION SETUP

### Step 1.1: Supabase Client Configuration
```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/database'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce', // Recommended for security
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    storageKey: 'nikah-alpha-auth', // Unique storage key
  },
  global: {
    headers: {
      'x-application-name': 'NikahAlpha',
    },
  },
})
```

### Step 1.2: Authentication Context Setup
```typescript
// src/contexts/AuthContext.tsx
import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { Profile } from '../types/database'
import { logError } from '../lib/error-handler'

interface AuthContextType {
  user: User | null
  session: Session | null
  profile: Profile | null
  isLoading: boolean
  isAuthenticated: boolean
  isAdmin: boolean
  login: (email: string, password: string) => Promise<{ error: Error | null }>
  register: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>
  logout: () => Promise<void>
  refreshProfile: () => Promise<void>
  updatePassword: (newPassword: string) => Promise<{ error: Error | null }>
  resetPassword: (email: string) => Promise<{ error: Error | null }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Initialize auth state
  useEffect(() => {
    let mounted = true

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfileData(session.user.id)
      } else {
        setIsLoading(false)
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return
        setSession(session)
        setUser(session?.user ?? null)

        if (session?.user) {
          await fetchProfileData(session.user.id)
        } else {
          setProfile(null)
        }
        setIsLoading(false)
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  // Fetch profile data
  const fetchProfileData = async (userId: string) => {
    if (!supabase) return null

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()

    if (error) {
      logError(error, 'AuthContext.fetchProfileData')
      return null
    }

    return data as Profile | null
  }

  // Login handler
  const login = useCallback(async (email: string, password: string) => {
    if (!supabase) {
      return { error: new Error('Supabase is not configured') }
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return { error: new Error(error.message) }
    }

    if (data.session) {
      setSession(data.session)
      setUser(data.session.user)
      const profileData = await fetchProfileData(data.session.user.id)
      setProfile(profileData)
    }

    return { error: null }
  }, [])

  // Register handler
  const register = useCallback(async (email: string, password: string, fullName: string) => {
    if (!supabase) {
      return { error: new Error('Supabase is not configured') }
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

    if (error) {
      return { error: new Error(error.message) }
    }

    // Note: User may need to verify email before being able to sign in
    return { error: null }
  }, [])

  // Logout handler
  const logout = useCallback(async () => {
    if (!supabase) return

    await supabase.auth.signOut()
    setUser(null)
    setSession(null)
    setProfile(null)
  }, [])

  // Password update
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

  // Password reset
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

  // Refresh profile
  const refreshProfile = useCallback(async () => {
    if (user) {
      const profileData = await fetchProfileData(user.id)
      setProfile(profileData)
    }
  }, [user])

  const value: AuthContextType = {
    user,
    session,
    profile,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: profile?.role === 'admin',
    login,
    register,
    logout,
    refreshProfile,
    updatePassword,
    resetPassword,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
```

### Step 1.3: Authentication Checklist
- [ ] Supabase client configured with PKCE flow
- [ ] Auth context provides all necessary methods
- [ ] Session persistence enabled
- [ ] Auto token refresh enabled
- [ ] Auth state changes handled
- [ ] Profile data fetched on auth state change
- [ ] Error handling implemented

---

## 🛠️ PHASE 2: AUTHENTICATION FLOWS

### Step 2.1: Login Flow
```typescript
// src/pages/public/Login.tsx
import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { validateEmail } from '../../lib/validation'
import { useNavigate, useLocation } from 'react-router-dom'
import toast from 'react-hot-toast'

export function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate
    const newErrors: { email?: string; password?: string } = {}
    if (!email) {
      newErrors.email = 'Email is required'
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email address'
    }
    if (!password) {
      newErrors.password = 'Password is required'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setIsLoading(true)
    setErrors({})

    const { error } = await login(email, password)

    if (error) {
      // Transform error message to user-friendly
      let errorMessage = 'Failed to login'
      if (error.message.includes('Invalid login credentials')) {
        errorMessage = 'Invalid email or password. Please check your credentials.'
      } else if (error.message.includes('Email not confirmed')) {
        errorMessage = 'Please verify your email address before signing in.'
      } else if (error.message.includes('Too many requests')) {
        errorMessage = 'Too many login attempts. Please wait a moment and try again.'
      }
      setErrors({ password: errorMessage })
      setIsLoading(false)
      return
    }

    // Redirect to intended page or dashboard
    const from = (location.state as any)?.from?.pathname || '/dashboard'
    navigate(from, { replace: true })
    toast.success('Welcome back!')
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  )
}
```

### Step 2.2: Signup Flow
```typescript
// src/pages/public/Signup.tsx
import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { validateEmail, validatePassword, validateName } from '../../lib/validation'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

export function Signup() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate
    const newErrors: Record<string, string> = {}
    
    const emailError = validateEmail(email)
    if (emailError) newErrors.email = emailError

    const passwordError = validatePassword(password)
    if (passwordError) newErrors.password = passwordError

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    const nameError = validateName(fullName)
    if (nameError) newErrors.fullName = nameError

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setIsLoading(true)
    setErrors({})

    const { error } = await register(email, password, fullName)

    if (error) {
      let errorMessage = 'Failed to create account'
      if (error.message.includes('already registered')) {
        errorMessage = 'An account with this email already exists. Please login instead.'
      } else if (error.message.includes('password')) {
        errorMessage = 'Password does not meet requirements.'
      }
      toast.error(errorMessage)
      setIsLoading(false)
      return
    }

    toast.success('Account created! Please check your email to verify your account.')
    navigate('/login')
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  )
}
```

### Step 2.3: Password Reset Flow
```typescript
// src/pages/public/ForgotPassword.tsx
import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { validateEmail } from '../../lib/validation'
import toast from 'react-hot-toast'

export function ForgotPassword() {
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSent, setIsSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const emailError = validateEmail(email)
    if (emailError) {
      toast.error(emailError)
      return
    }

    setIsLoading(true)

    const { error } = await resetPassword(email)

    if (error) {
      toast.error('Failed to send reset email. Please try again.')
      setIsLoading(false)
      return
    }

    setIsSent(true)
    toast.success('Password reset email sent! Check your inbox.')
  }

  if (isSent) {
    return (
      <div>
        <h2>Check your email</h2>
        <p>We've sent a password reset link to {email}</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  )
}
```

### Step 2.4: Authentication Flow Checklist
- [ ] Login flow implemented with error handling
- [ ] Signup flow implemented with validation
- [ ] Password reset flow implemented
- [ ] Email verification handled
- [ ] User-friendly error messages
- [ ] Loading states shown
- [ ] Redirects handled correctly

---

## 🔒 PHASE 3: PROTECTED ROUTES & AUTHORIZATION

### Step 3.1: Protected Route Component
```typescript
// src/components/auth/ProtectedRoute.tsx
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { PageLoader } from '../common/PageLoader'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireProfile?: boolean
  requireAdmin?: boolean
}

export function ProtectedRoute({ 
  children, 
  requireProfile = false,
  requireAdmin = false 
}: ProtectedRouteProps) {
  const { user, isLoading, profile, isAdmin } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return <PageLoader />
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/dashboard" replace />
  }

  if (requireProfile && !profile) {
    return <Navigate to="/profile-setup" replace />
  }

  return <>{children}</>
}
```

### Step 3.2: Route Configuration
```typescript
// src/App.tsx
import { Routes, Route } from 'react-router-dom'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { Login } from './pages/public/Login'
import { Signup } from './pages/public/Signup'
import { Dashboard } from './pages/protected/Dashboard'
import { ProfileSetup } from './pages/protected/ProfileSetup'
import { AdminPanel } from './pages/manage/AdminPanel'

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      
      {/* Protected routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      
      {/* Protected route requiring profile */}
      <Route
        path="/profile-setup"
        element={
          <ProtectedRoute requireProfile={false}>
            <ProfileSetup />
          </ProtectedRoute>
        }
      />
      
      {/* Admin-only route */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute requireAdmin={true}>
            <AdminPanel />
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}
```

### Step 3.3: Authorization Checklist
- [ ] Protected routes implemented
- [ ] Admin-only routes protected
- [ ] Profile requirement checks
- [ ] Redirects handled correctly
- [ ] Loading states shown
- [ ] Unauthorized access prevented

---

## 🔐 PHASE 4: PASSWORD SECURITY

### Step 4.1: Password Validation
```typescript
// src/lib/validation.ts
export function validatePassword(password: string): string | null {
  if (!password) {
    return 'Password is required'
  }

  if (password.length < 8) {
    return 'Password must be at least 8 characters long'
  }

  if (!/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter'
  }

  if (!/[a-z]/.test(password)) {
    return 'Password must contain at least one lowercase letter'
  }

  if (!/[0-9]/.test(password)) {
    return 'Password must contain at least one number'
  }

  return null
}

export function getPasswordStrength(password: string): {
  strength: 'weak' | 'medium' | 'strong'
  score: number
  feedback: string[]
} {
  let score = 0
  const feedback: string[] = []

  if (password.length >= 8) score += 1
  else feedback.push('Use at least 8 characters')

  if (/[A-Z]/.test(password)) score += 1
  else feedback.push('Add uppercase letters')

  if (/[a-z]/.test(password)) score += 1
  else feedback.push('Add lowercase letters')

  if (/[0-9]/.test(password)) score += 1
  else feedback.push('Add numbers')

  if (/[^A-Za-z0-9]/.test(password)) score += 1
  else feedback.push('Add special characters')

  if (password.length >= 12) score += 1

  let strength: 'weak' | 'medium' | 'strong'
  if (score <= 2) strength = 'weak'
  else if (score <= 4) strength = 'medium'
  else strength = 'strong'

  return { strength, score, feedback }
}
```

### Step 4.2: Password Update Flow
```typescript
// src/pages/protected/Settings.tsx
import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { validatePassword } from '../../lib/validation'
import toast from 'react-hot-toast'

export function Settings() {
  const { updatePassword } = useAuth()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()

    const passwordError = validatePassword(newPassword)
    if (passwordError) {
      toast.error(passwordError)
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    setIsLoading(true)

    const { error } = await updatePassword(newPassword)

    if (error) {
      toast.error('Failed to update password. Please try again.')
      setIsLoading(false)
      return
    }

    toast.success('Password updated successfully!')
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setIsLoading(false)
  }

  return (
    <form onSubmit={handleUpdatePassword}>
      {/* Form fields */}
    </form>
  )
}
```

### Step 4.3: Password Security Checklist
- [ ] Password validation implemented
- [ ] Password strength indicator (optional)
- [ ] Password update flow implemented
- [ ] Password reset flow implemented
- [ ] Passwords never logged or exposed
- [ ] Password requirements enforced

---

## 🛡️ PHASE 5: SECURITY BEST PRACTICES

### Step 5.1: Security Headers
```typescript
// src/index.html (or server configuration)
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';">
<meta http-equiv="X-Content-Type-Options" content="nosniff">
<meta http-equiv="X-Frame-Options" content="DENY">
<meta http-equiv="X-XSS-Protection" content="1; mode=block">
```

### Step 5.2: Input Sanitization
```typescript
// src/lib/sanitize.ts
import DOMPurify from 'dompurify'

export function sanitizeHtml(html: string): string {
  if (typeof window === 'undefined') {
    return html
  }
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: ['href', 'target'],
  })
}

export function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, '')
}
```

### Step 5.3: Session Security
```typescript
// Ensure secure session handling
// - Use HTTPS in production
// - Set secure cookies (handled by Supabase)
// - Implement session timeout (optional)
// - Clear sensitive data on logout
```

### Step 5.4: Security Checklist
- [ ] HTTPS enforced in production
- [ ] Security headers configured
- [ ] Input sanitization implemented
- [ ] XSS prevention (DOMPurify)
- [ ] CSRF protection (handled by Supabase)
- [ ] Sensitive data not exposed in errors
- [ ] Session security configured
- [ ] Rate limiting considered (Supabase handles)

---

## 🎯 SUCCESS CRITERIA

Authentication implementation is complete when:

1. ✅ **Login Flow**: Users can login securely
2. ✅ **Signup Flow**: Users can create accounts with validation
3. ✅ **Session Management**: Sessions persist across page reloads
4. ✅ **Protected Routes**: Unauthorized access prevented
5. ✅ **Password Security**: Strong passwords enforced
6. ✅ **Password Reset**: Secure password reset flow
7. ✅ **Error Handling**: User-friendly error messages
8. ✅ **Security**: All security best practices implemented

---

## 🚨 COMMON PITFALLS

### ❌ Don't:
- Store passwords in plain text
- Expose sensitive information in error messages
- Trust client-side validation alone
- Skip password strength validation
- Forget to handle session expiration
- Expose user IDs or tokens in URLs
- Skip email verification

### ✅ Do:
- Use Supabase Auth (handles password hashing)
- Transform errors to user-friendly messages
- Validate on both client and server
- Enforce strong password requirements
- Handle session refresh automatically
- Use secure session storage
- Verify emails before full access

---

**This master prompt should be followed for ALL authentication and security work.**

