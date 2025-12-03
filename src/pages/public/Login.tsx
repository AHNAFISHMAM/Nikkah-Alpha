import { useState, useEffect, useMemo, useCallback } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { SEO } from '../../components/SEO'
import { PAGE_SEO } from '../../lib/seo'
import { Mail, Lock, Eye, EyeOff, ArrowLeft, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { logError } from '../../lib/error-handler'
import { validateEmail } from '../../lib/validation'
import { debounce } from '../../lib/utils'

export function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
  const [touched, setTouched] = useState<{ email?: boolean; password?: boolean }>({})
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [shouldNavigate, setShouldNavigate] = useState(false)

  const { login, isAuthenticated, user, profile, isLoading: authLoading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const from = (location.state as { from?: Location })?.from?.pathname || '/dashboard'

  // Check if profile is incomplete (null profile or missing essential fields)
  const isProfileIncomplete = !profile || !profile.first_name || !profile.date_of_birth || !profile.gender || !profile.marital_status

  // Navigate when authentication is confirmed and profile is loaded (or confirmed missing)
  useEffect(() => {
    if (shouldNavigate && isAuthenticated && user && !authLoading) {
      // Wait a bit for profile to load, then check
      const timer = setTimeout(() => {
        setIsLoading(false)
        
        // Check profile completion status
        if (isProfileIncomplete) {
          // Profile incomplete - redirect to profile setup with appropriate message
          toast('Please complete your profile to continue', {
            icon: '📝',
            duration: 4000,
          })
          navigate('/profile-setup', { replace: true })
        } else {
          // Profile complete - normal welcome
          toast.success('Welcome back!')
          navigate(from, { replace: true })
        }
        setShouldNavigate(false)
      }, 800) // Wait for profile to load
      return () => clearTimeout(timer)
    }
  }, [shouldNavigate, isAuthenticated, user, profile, authLoading, isProfileIncomplete, navigate, from])

  // Timeout fallback - if auth doesn't update within 3 seconds, stop loading
  useEffect(() => {
    if (shouldNavigate && isLoading) {
      const timeout = setTimeout(() => {
        if (isAuthenticated && user && !authLoading) {
          setIsLoading(false)
          
          // Check profile completion status
          if (isProfileIncomplete) {
            toast('Please complete your profile to continue', {
              icon: '📝',
              duration: 4000,
            })
            navigate('/profile-setup', { replace: true })
          } else {
            toast.success('Welcome back!')
            navigate(from, { replace: true })
          }
          setShouldNavigate(false)
        } else {
          setIsLoading(false)
          setShouldNavigate(false)
          setErrorMessage('Login successful but authentication state did not update. Please refresh the page.')
        }
      }, 3000)
      return () => clearTimeout(timeout)
    }
  }, [shouldNavigate, isLoading, isAuthenticated, user, profile, authLoading, isProfileIncomplete, navigate, from])

  // Field validation function
  const validateField = useCallback((field: 'email' | 'password', value: string): string | null => {
    switch (field) {
      case 'email':
        if (!value) {
          return 'Email is required'
        } else if (!validateEmail(value)) {
          return 'Please enter a valid email address'
        }
        return null
      case 'password':
        if (!value) {
          return 'Password is required'
        }
        return null
      default:
        return null
    }
  }, [])

  // Debounced real-time validation (300ms delay)
  const debouncedValidate = useMemo(
    () => {
      const validate = (field: 'email' | 'password', value: string) => {
        if (!touched[field]) return // Don't validate until touched
        
        const error = validateField(field, value)
        setErrors(prev => {
          if (error) {
            return { ...prev, [field]: error }
          } else {
            const newErrors = { ...prev }
            delete newErrors[field]
            return newErrors
          }
        })
      }
      return debounce(validate as (...args: unknown[]) => unknown, 300) as (field: 'email' | 'password', value: string) => void
    },
    [touched, validateField]
  )

  // Real-time validation for email
  useEffect(() => {
    if (touched.email && email) {
      debouncedValidate('email', email)
    }
  }, [email, touched.email, debouncedValidate])

  // Real-time validation for password
  useEffect(() => {
    if (touched.password && password) {
      debouncedValidate('password', password)
    }
  }, [password, touched.password, debouncedValidate])

  const handleBlur = (field: 'email' | 'password') => {
    setTouched(prev => ({ ...prev, [field]: true }))
    const value = field === 'email' ? email : password
    const error = validateField(field, value)
    setErrors(prev => {
      if (error) {
        return { ...prev, [field]: error }
      } else {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      }
    })
  }

  const validateForm = () => {
    // Mark all fields as touched
    setTouched({ email: true, password: true })

    const newErrors: { email?: string; password?: string } = {}

    const emailError = validateField('email', email)
    if (emailError) newErrors.email = emailError

    const passwordError = validateField('password', password)
    if (passwordError) newErrors.password = passwordError

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)
    setErrorMessage(null)

    try {
      const { error } = await login(email, password)

      if (error) {
        // Show more specific error messages
        let errorMsg = error.message || 'Failed to login'
        
        // Handle common Supabase auth errors
        if (error.message.includes('Invalid login credentials')) {
          errorMsg = 'Invalid email or password. Please check your credentials and try again.'
        } else if (error.message.includes('Email not confirmed')) {
          errorMsg = 'Please verify your email address before signing in.'
        } else if (error.message.includes('Too many requests')) {
          errorMsg = 'Too many login attempts. Please wait a moment and try again.'
        } else if (error.message.includes('not configured')) {
          errorMsg = 'Authentication service is not configured. Please contact support.'
        }
        
        setErrorMessage(errorMsg)
        setIsLoading(false)
        return
      }

      // Trigger navigation via useEffect when auth state updates
      // This ensures React has time to update the auth context
      setShouldNavigate(true)
      
      // Keep loading state until navigation happens
      // The useEffect will handle the actual navigation
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred'
      setErrorMessage(errorMessage)
      logError(err, 'Login.handleSubmit')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <SEO
        title={PAGE_SEO.login.title}
        description={PAGE_SEO.login.description}
        path="/login"
      />

      <div className="h-screen-dynamic flex flex-col lg:flex-row bg-gradient-to-br from-primary/5 via-background via-60% to-islamic-purple/5 overflow-hidden">
        {/* Left side - Decorative */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-brand-gradient-vertical">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-20 left-20 w-48 h-48 sm:w-72 sm:h-72 md:w-80 md:h-80 bg-white/10 dark:bg-white/5 rounded-full blur-3xl" />
            <div className="absolute bottom-20 right-20 w-64 h-64 sm:w-96 sm:h-96 md:w-[400px] md:h-[400px] bg-black/10 dark:bg-black/20 rounded-full blur-3xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 sm:w-96 sm:h-96 md:w-[450px] md:h-[450px] lg:w-[500px] lg:h-[500px] bg-white/10 dark:bg-white/5 rounded-full blur-3xl" />
          </div>

          <div className="relative z-10 flex flex-col justify-center px-8 xl:px-12 py-8">
            <Link to="/" className="flex items-center gap-2.5 mb-8 group">
              <img
                src="/logo.svg"
                alt="NikahPrep Logo - Crescent Moon and Heart"
                className="h-10 w-10 object-contain flex-shrink-0"
                width={40}
                height={40}
                loading="eager"
                decoding="async"
              />
              <span className="text-xl font-bold text-white">NikahPrep</span>
            </Link>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-3xl xl:text-4xl font-bold text-white leading-tight mb-4">
                Continue Your
                <br />
                <span className="text-white/90">Blessed Journey</span>
              </h1>
              <p className="text-base text-white/80 max-w-md leading-relaxed">
                Welcome back! Sign in to access your personalized marriage
                preparation tools, track your progress, and continue learning.
              </p>
            </motion.div>

            <div className="absolute bottom-8 left-8 xl:left-12">
              <div className="flex items-center gap-3 text-white/60 text-xs">
                <div className="flex -space-x-2">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="w-7 h-7 rounded-full bg-white/20 border-2 border-white/30"
                    />
                  ))}
                </div>
                <span>Join 10,000+ couples</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Form - Compact mobile layout */}
        <div className="w-full lg:w-1/2 flex flex-col h-full overflow-hidden">
          {/* Mobile header - Fixed at top */}
          <div className="lg:hidden flex-shrink-0 px-3 pt-2 pb-1.5 safe-area-inset-top bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
            <div className="flex items-center justify-between">
              <Link to="/" className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground dark:text-muted-foreground dark:hover:text-foreground transition-colors">
                <ArrowLeft className="h-4 w-4" />
                <span className="text-xs">Back</span>
              </Link>
              <Link to="/" className="inline-flex items-center gap-1.5">
                <img
                  src="/logo.svg"
                  alt="NikahPrep Logo - Crescent Moon and Heart"
                  className="h-7 w-7 object-contain flex-shrink-0"
                  width={28}
                  height={28}
                  loading="eager"
                  decoding="async"
                />
                <span className="text-sm font-bold text-foreground">NikahPrep</span>
              </Link>
              <div className="w-12" />
            </div>
          </div>

          {/* Scrollable form content */}
          <div className="flex-1 overflow-y-auto px-3 py-3 sm:px-6 sm:py-4 lg:px-8 lg:py-6 safe-area-inset-bottom scroll-smooth scrollbar-thin">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="w-full max-w-md mx-auto"
            >
              {/* Desktop header */}
              <div className="hidden lg:block mb-3">
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-3 group"
                >
                  <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                  <span className="text-sm">Back to home</span>
                </Link>
              </div>

              <div className="mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground">
                  Welcome back
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                  Sign in to continue your journey
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                <AnimatePresence>
                  {errorMessage && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="p-3 sm:p-4 bg-error/10 border border-error/30 rounded-xl flex items-start gap-2 sm:gap-3"
                    >
                      <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-error flex-shrink-0 mt-0.5" />
                      <p className="text-xs sm:text-sm text-error flex-1">{errorMessage}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <Input
                  id="email"
                  label="Email address"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => {
                    const value = e.target.value
                    setEmail(value)
                    // Clear error immediately if field becomes valid
                    if (value && validateEmail(value) && errors.email) {
                      setErrors(prev => {
                        const newErrors = { ...prev }
                        delete newErrors.email
                        return newErrors
                      })
                    }
                  }}
                  onBlur={() => handleBlur('email')}
                  error={touched.email ? errors.email : undefined}
                  leftIcon={<Mail className="h-4 w-4 sm:h-5 sm:w-5" />}
                  autoComplete="email"
                  disabled={isLoading}
                  aria-invalid={touched.email && !!errors.email}
                  aria-describedby={touched.email && errors.email ? 'email-error' : touched.email && !errors.email && email ? 'email-success' : undefined}
                />
                {touched.email && !errors.email && email && (
                  <p id="email-success" className="text-xs sm:text-sm text-success font-medium mt-1.5 px-1" aria-live="polite">
                    ✓ Valid email address
                  </p>
                )}

                <Input
                  id="password"
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    const value = e.target.value
                    setPassword(value)
                    // Clear error immediately if field becomes valid
                    if (value && errors.password) {
                      setErrors(prev => {
                        const newErrors = { ...prev }
                        delete newErrors.password
                        return newErrors
                      })
                    }
                  }}
                  onBlur={() => handleBlur('password')}
                  error={touched.password ? errors.password : undefined}
                  leftIcon={<Lock className="h-4 w-4 sm:h-5 sm:w-5" />}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="focus:outline-none hover:text-foreground transition-colors"
                      tabIndex={-1}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" />
                      ) : (
                        <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
                      )}
                    </button>
                  }
                  autoComplete="current-password"
                  disabled={isLoading}
                  aria-invalid={touched.password && !!errors.password}
                  aria-describedby={touched.password && errors.password ? 'password-error' : touched.password && !errors.password && password ? 'password-success' : undefined}
                />
                {touched.password && !errors.password && password && (
                  <p id="password-success" className="text-xs sm:text-sm text-success font-medium mt-1.5 px-1" aria-live="polite">
                    ✓ Password entered
                  </p>
                )}

                <Button
                  type="submit"
                  className="w-full shadow-lg shadow-primary/25"
                  size="sm"
                  isLoading={isLoading}
                  disabled={isLoading}
                >
                  Sign In
                </Button>
              </form>

              <div className="mt-4 sm:mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs sm:text-sm">
                    <span className="px-3 sm:px-4 bg-background text-muted-foreground">
                      New to NikahPrep?
                    </span>
                  </div>
                </div>

                <Link to="/signup" className="block mt-3 sm:mt-4">
                  <Button variant="outline" className="w-full" size="sm">
                    Create an account
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  )
}
