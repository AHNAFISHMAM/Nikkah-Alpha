import { useState, useEffect, useMemo, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { SEO } from '../../components/SEO'
import { PAGE_SEO } from '../../lib/seo'
import { Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Alert } from '../../components/ui/Alert'
import { validateEmail, validatePassword, validatePasswordMatch, getPasswordStrength } from '../../lib/validation'
import { logError } from '../../lib/error-handler'
import { debounce } from '../../lib/utils'

export function Signup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string; confirmPassword?: string }>({})
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [touched, setTouched] = useState<{ email?: boolean; password?: boolean; confirmPassword?: boolean }>({})
  const [passwordStrength, setPasswordStrength] = useState<{ strength: 'weak' | 'medium' | 'strong'; score: number; feedback: string[] }>({
    strength: 'weak',
    score: 0,
    feedback: []
  })

  const { register, isAuthenticated, user } = useAuth()
  const navigate = useNavigate()

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      navigate('/profile-setup', { replace: true })
    }
  }, [isAuthenticated, user, navigate])

  // Calculate password strength in real-time (no debounce needed - instant feedback)
  useEffect(() => {
    if (password) {
      setPasswordStrength(getPasswordStrength(password))
    } else {
      setPasswordStrength({ strength: 'weak', score: 0, feedback: [] })
    }
  }, [password])

  // Field validation function
  const validateField = useCallback((field: 'email' | 'password' | 'confirmPassword', value: string): string | null => {
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
        } else {
          const validation = validatePassword(value)
          if (!validation.valid) {
            return validation.errors[0] // Show first error
          }
        }
        return null
      case 'confirmPassword':
        if (!value) {
          return 'Please confirm your password'
        } else {
          const matchError = validatePasswordMatch(password, value)
          if (matchError) {
            return matchError
          }
        }
        return null
      default:
        return null
    }
  }, [password])

  // Debounced real-time validation (300ms delay)
  const debouncedValidate = useMemo(
    () => {
      const validate = (field: 'email' | 'password' | 'confirmPassword', value: string) => {
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
      return debounce(validate as (...args: unknown[]) => unknown, 300) as (field: 'email' | 'password' | 'confirmPassword', value: string) => void
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

  // Real-time validation for confirm password (also watch password changes)
  useEffect(() => {
    if (touched.confirmPassword && confirmPassword) {
      debouncedValidate('confirmPassword', confirmPassword)
    }
  }, [confirmPassword, password, touched.confirmPassword, debouncedValidate])

  const handleBlur = (field: 'email' | 'password' | 'confirmPassword') => {
    setTouched(prev => ({ ...prev, [field]: true }))
    const value = field === 'email' ? email : field === 'password' ? password : confirmPassword
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
    const newErrors: { email?: string; password?: string; confirmPassword?: string } = {}

    // Mark all fields as touched
    setTouched({ email: true, password: true, confirmPassword: true })

    // Validate email
    if (!email) {
      newErrors.email = 'Email is required'
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    // Validate password
    if (!password) {
      newErrors.password = 'Password is required'
    } else {
      const validation = validatePassword(password)
      if (!validation.valid) {
        newErrors.password = validation.errors[0]
      }
    }

    // Validate confirm password
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else {
      const matchError = validatePasswordMatch(password, confirmPassword)
      if (matchError) {
        newErrors.confirmPassword = matchError
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const getErrorMessage = (error: Error): string => {
    const message = error.message.toLowerCase()
    
    if (message.includes('user already registered') || message.includes('already registered')) {
      return 'This email is already registered. Please sign in instead.'
    }
    if (message.includes('invalid email')) {
      return 'Please enter a valid email address'
    }
    if (message.includes('password') && message.includes('weak')) {
      return 'Password is too weak. Please use a stronger password.'
    }
    if (message.includes('network') || message.includes('fetch')) {
      return 'Network error. Please check your connection and try again.'
    }
    if (message.includes('not configured')) {
      return 'Authentication service is not configured. Please contact support.'
    }
    
    return 'Unable to create account. Please try again.'
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      // Focus first error field
      if (errors.email) {
        document.getElementById('email')?.focus()
      } else if (errors.password) {
        document.getElementById('password')?.focus()
      } else if (errors.confirmPassword) {
        document.getElementById('confirmPassword')?.focus()
      }
      return
    }

    setIsLoading(true)
    setErrorMessage(null)

    try {
      // Use email prefix as temporary fullName (will be updated in profile setup)
      const emailPrefix = email.split('@')[0] || 'User'
      const { error } = await register(email, password, emailPrefix)

      if (error) {
        const errorMsg = getErrorMessage(error)
        setErrorMessage(errorMsg)
        setIsLoading(false)
        return
      }

      // Success - show toast and redirect
      toast.success('Account created successfully! Welcome to NikahPrep 🎉', {
        duration: 4000,
        icon: '🎉',
      })

      // Redirect to profile setup after short delay
      setTimeout(() => {
        navigate('/profile-setup', { replace: true })
      }, 1500)
    } catch (err) {
      const errorMsg = err instanceof Error ? getErrorMessage(err) : 'An unexpected error occurred'
      setErrorMessage(errorMsg)
      logError(err, 'Signup.handleSubmit')
      setIsLoading(false)
    }
  }

  const getStrengthColor = () => {
    switch (passwordStrength.strength) {
      case 'weak':
        return 'text-error'
      case 'medium':
        return 'text-warning'
      case 'strong':
        return 'text-success'
      default:
        return 'text-muted-foreground'
    }
  }

  const getStrengthBgColor = () => {
    switch (passwordStrength.strength) {
      case 'weak':
        return 'bg-error'
      case 'medium':
        return 'bg-warning'
      case 'strong':
        return 'bg-success'
      default:
        return 'bg-muted'
    }
  }

  return (
    <>
      <SEO
        title={PAGE_SEO.signup.title}
        description={PAGE_SEO.signup.description}
        path="/signup"
      />

      <div className="h-screen-dynamic flex flex-col lg:flex-row bg-gradient-to-br from-primary/5 via-background via-60% to-islamic-purple/5 overflow-hidden">
        {/* Left side - Decorative */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-brand-gradient-vertical">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-20 left-20 w-48 h-48 sm:w-72 sm:w-72 md:w-80 md:h-80 bg-white/10 dark:bg-white/5 rounded-full blur-3xl" />
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
                Start Your
                <br />
                <span className="text-white/90">Blessed Journey</span>
              </h1>
              <p className="text-base text-white/80 max-w-md leading-relaxed">
                Create your account to access personalized marriage preparation tools, track your progress, and begin learning.
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

        {/* Right side - Form */}
        <div className="w-full lg:w-1/2 flex flex-col h-full overflow-hidden">
          {/* Mobile header */}
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
                  Create your account
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                  Start your marriage preparation journey today
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
                    >
                      <Alert variant="error" onClose={() => setErrorMessage(null)}>
                        <p className="text-xs sm:text-sm">{errorMessage}</p>
                      </Alert>
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
                  required
                  aria-invalid={touched.email && !!errors.email}
                  aria-describedby={touched.email && errors.email ? 'email-error' : touched.email && !errors.email && email ? 'email-success' : undefined}
                />
                {touched.email && !errors.email && email && (
                  <p id="email-success" className="text-xs sm:text-sm text-success font-medium mt-1.5 px-1" aria-live="polite">
                    ✓ Valid email address
                  </p>
                )}

                <div>
                  <Input
                    id="password"
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => {
                      const value = e.target.value
                      setPassword(value)
                      // Clear error immediately if field becomes valid
                      if (value) {
                        const validation = validatePassword(value)
                        if (validation.valid && errors.password) {
                          setErrors(prev => {
                            const newErrors = { ...prev }
                            delete newErrors.password
                            return newErrors
                          })
                        }
                      }
                      // Re-validate confirm password if it exists
                      if (confirmPassword && touched.confirmPassword) {
                        const matchError = validatePasswordMatch(value, confirmPassword)
                        setErrors(prev => {
                          if (matchError) {
                            return { ...prev, confirmPassword: matchError }
                          } else {
                            const newErrors = { ...prev }
                            delete newErrors.confirmPassword
                            return newErrors
                          }
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
                    autoComplete="new-password"
                    disabled={isLoading}
                    required
                  />

                  {/* Password Strength Indicator */}
                  {password && touched.password && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-2 space-y-2"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className={`font-medium ${getStrengthColor()}`}>
                          Password strength: <span className="capitalize">{passwordStrength.strength}</span>
                        </span>
                        <span className="text-muted-foreground">{passwordStrength.score}%</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${passwordStrength.score}%` }}
                          transition={{ duration: 0.3 }}
                          className={`h-full ${getStrengthBgColor()}`}
                        />
                      </div>
                      {passwordStrength.feedback.length > 0 && (
                        <ul className="text-xs text-muted-foreground space-y-1">
                          {passwordStrength.feedback.map((item, index) => (
                            <li key={index} className="flex items-center gap-1.5">
                              <span className="text-error">•</span>
                              {item}
                            </li>
                          ))}
                        </ul>
                      )}
                    </motion.div>
                  )}
                </div>

                <Input
                  id="confirmPassword"
                  label="Confirm password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => {
                    const value = e.target.value
                    setConfirmPassword(value)
                    // Clear error immediately if passwords match
                    if (value && password && value === password && errors.confirmPassword) {
                      setErrors(prev => {
                        const newErrors = { ...prev }
                        delete newErrors.confirmPassword
                        return newErrors
                      })
                    }
                  }}
                  onBlur={() => handleBlur('confirmPassword')}
                  error={touched.confirmPassword ? errors.confirmPassword : undefined}
                  leftIcon={<Lock className="h-4 w-4 sm:h-5 sm:w-5" />}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="focus:outline-none hover:text-foreground transition-colors"
                      tabIndex={-1}
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" />
                      ) : (
                        <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
                      )}
                    </button>
                  }
                  autoComplete="new-password"
                  disabled={isLoading}
                  required
                  aria-invalid={touched.confirmPassword && !!errors.confirmPassword}
                  aria-describedby={touched.confirmPassword && errors.confirmPassword ? 'confirmPassword-error' : touched.confirmPassword && !errors.confirmPassword && confirmPassword ? 'confirmPassword-success' : undefined}
                />
                {touched.confirmPassword && !errors.confirmPassword && confirmPassword && (
                  <p id="confirmPassword-success" className="text-xs sm:text-sm text-success font-medium mt-1.5 px-1" aria-live="polite">
                    ✓ Passwords match
                  </p>
                )}

                <Button
                  type="submit"
                  className="w-full shadow-lg shadow-primary/25"
                  size="sm"
                  isLoading={isLoading}
                  disabled={isLoading}
                >
                  Create Account
                </Button>
              </form>

              <div className="mt-4 sm:mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs sm:text-sm">
                    <span className="px-3 sm:px-4 bg-background text-muted-foreground">
                      Already have an account?
                    </span>
                  </div>
                </div>

                <Link to="/login" className="block mt-3 sm:mt-4">
                  <Button variant="outline" className="w-full" size="sm">
                    Sign in
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
