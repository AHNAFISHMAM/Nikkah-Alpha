import { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { SEO } from '../../components/SEO'
import { PAGE_SEO } from '../../lib/seo'
import { User, Calendar, ArrowRight, ArrowLeft, Sparkles, MapPin, Heart, Mail } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../../contexts/AuthContext'
import { Card, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { CustomDropdown } from '../../components/ui/CustomDropdown'
import { Label } from '../../components/ui/Label'
import { Progress } from '../../components/ui/Progress'
import { calculateAge, debounce, cn } from '../../lib/utils'
import { validateName, validateEmail } from '../../lib/validation'
import { logError } from '../../lib/error-handler'
import { supabase } from '../../lib/supabase'
import { DatePicker } from '../../components/ui/DatePicker'

type Step = 'essential' | 'personal' | 'location' | 'relationship'

const stepConfig = {
  essential: { index: 0, icon: User, title: 'Essential Information', subtitle: "Let's start with your name" },
  personal: { index: 1, icon: Calendar, title: 'Personal Details', subtitle: 'Help us personalize your experience' },
  location: { index: 2, icon: MapPin, title: 'Location', subtitle: 'Optional - helps us provide relevant content' },
  relationship: { index: 3, icon: Heart, title: 'Relationship', subtitle: 'Tell us about your partner' },
}

const countries = [
  { value: 'US', label: 'United States' },
  { value: 'CA', label: 'Canada' },
  { value: 'GB', label: 'United Kingdom' },
  { value: 'AU', label: 'Australia' },
  { value: 'SA', label: 'Saudi Arabia' },
  { value: 'AE', label: 'United Arab Emirates' },
  { value: 'PK', label: 'Pakistan' },
  { value: 'BD', label: 'Bangladesh' },
  { value: 'IN', label: 'India' },
  { value: 'MY', label: 'Malaysia' },
  { value: 'ID', label: 'Indonesia' },
  { value: 'TR', label: 'Turkey' },
  { value: 'EG', label: 'Egypt' },
  { value: 'ZA', label: 'South Africa' },
  { value: 'NG', label: 'Nigeria' },
  { value: 'KE', label: 'Kenya' },
  { value: 'OTHER', label: 'Other' },
]

export function ProfileSetup() {
  const { user, profile, refreshProfile } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('essential')
  const [isLoading, setIsLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    first_name: profile?.first_name || '',
    last_name: profile?.last_name || '',
    date_of_birth: profile?.date_of_birth || '',
    gender: (profile?.gender as 'male' | 'female' | 'prefer_not_to_say') || '',
    marital_status: (profile?.marital_status as 'Single' | 'Engaged' | 'Researching') || '',
    country: profile?.country || '',
    city: profile?.city || '',
    partner_name: profile?.partner_name || '',
    wedding_date: profile?.wedding_date || '',
    partner_using_app: profile?.partner_using_app === null ? null : profile?.partner_using_app,
    partner_email: profile?.partner_email || '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  

  const currentStepIndex = stepConfig[step].index
  const totalSteps = 4
  const progress = ((currentStepIndex + 1) / totalSteps) * 100

  // Get max date (18 years ago)
  const getMaxDate = () => {
    const date = new Date()
    date.setFullYear(date.getFullYear() - 18)
    return date.toISOString().split('T')[0]
  }

  // Get min date (120 years ago)
  const getMinDate = () => {
    const date = new Date()
    date.setFullYear(date.getFullYear() - 120)
    return date.toISOString().split('T')[0]
  }

  // Calculate age from date of birth
  const calculatedAge = formData.date_of_birth ? calculateAge(formData.date_of_birth) : null

  // Field validation function
  const validateField = useCallback((fieldName: string, value: any): string | null => {
    switch (fieldName) {
      case 'first_name':
        return validateName(value, 'first_name')
      case 'last_name':
        if (value && value.trim()) {
          return validateName(value, 'last_name')
        }
        return null // Last name is optional
      case 'date_of_birth':
        if (!value) {
          return 'Date of birth is required'
        } else {
          const age = calculateAge(value)
          if (age < 18) {
            return 'You must be 18 years or older to use this platform'
          } else if (age > 120) {
            return 'Please enter a valid date of birth'
          }
        }
        return null
      case 'gender':
        if (!value) {
          return 'Gender is required'
        }
        return null
      case 'marital_status':
        if (!value) {
          return 'Marital status is required'
        }
        return null
      case 'city':
        if (formData.country && !value?.trim()) {
          return 'City is required when country is selected'
        }
        return null
      case 'partner_email':
        if (formData.partner_using_app === true) {
          if (!value?.trim()) {
            return 'Partner email is required'
          } else if (!validateEmail(value)) {
            return 'Please enter a valid email address'
          }
        }
        return null
      default:
        return null
    }
  }, [formData.country, formData.partner_using_app])

  // Debounced real-time validation (300ms delay)
  const debouncedValidate = useMemo(
    () => {
      const validate = (fieldName: string, value: any) => {
        if (!touched[fieldName]) return // Don't validate until touched
        
        const error = validateField(fieldName, value)
        setErrors(prev => {
          if (error) {
            return { ...prev, [fieldName]: error }
          } else {
            const newErrors = { ...prev }
            delete newErrors[fieldName]
            return newErrors
          }
        })
      }
      return debounce(validate as (...args: unknown[]) => unknown, 300) as (fieldName: string, value: any) => void
    },
    [touched, validateField]
  )

  // Real-time validation for text fields
  useEffect(() => {
    if (step === 'essential') {
      if (touched.first_name && formData.first_name) {
        debouncedValidate('first_name', formData.first_name)
      }
      if (touched.last_name && formData.last_name) {
        debouncedValidate('last_name', formData.last_name)
      }
    }
  }, [formData.first_name, formData.last_name, touched.first_name, touched.last_name, step, debouncedValidate])

  // Real-time validation for personal step fields
  useEffect(() => {
    if (step === 'personal') {
      if (touched.date_of_birth && formData.date_of_birth) {
        const error = validateField('date_of_birth', formData.date_of_birth)
        setErrors(prev => {
          if (error) {
            return { ...prev, date_of_birth: error }
          } else {
            const newErrors = { ...prev }
            delete newErrors.date_of_birth
            return newErrors
          }
        })
      }
      if (touched.gender && formData.gender) {
        setErrors(prev => {
          const newErrors = { ...prev }
          delete newErrors.gender
          return newErrors
        })
      }
      if (touched.marital_status && formData.marital_status) {
        setErrors(prev => {
          const newErrors = { ...prev }
          delete newErrors.marital_status
          return newErrors
        })
      }
    }
  }, [formData.date_of_birth, formData.gender, formData.marital_status, touched.date_of_birth, touched.gender, touched.marital_status, step, validateField])

  // Real-time validation for location step
  useEffect(() => {
    if (step === 'location') {
      if (touched.city && formData.city) {
        debouncedValidate('city', formData.city)
      }
    }
  }, [formData.city, formData.country, touched.city, step, debouncedValidate])

  // Real-time validation for relationship step
  useEffect(() => {
    if (step === 'relationship') {
      if (touched.partner_email && formData.partner_email) {
        debouncedValidate('partner_email', formData.partner_email)
      }
    }
  }, [formData.partner_email, formData.partner_using_app, touched.partner_email, step, debouncedValidate])

  // Validate current step
  const validateStep = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (step === 'essential') {
      const firstNameError = validateName(formData.first_name, 'first_name')
      if (firstNameError) newErrors.first_name = firstNameError
      
      // Last name is optional, but if provided, validate it
      if (formData.last_name && formData.last_name.trim()) {
        const lastNameError = validateName(formData.last_name, 'last_name')
        if (lastNameError) newErrors.last_name = lastNameError
      }
    }

    if (step === 'personal') {
      if (!formData.date_of_birth) {
        newErrors.date_of_birth = 'Date of birth is required'
      } else {
        const age = calculateAge(formData.date_of_birth)
        if (age < 18) {
          newErrors.date_of_birth = 'You must be 18 years or older to use this platform'
        } else if (age > 120) {
          newErrors.date_of_birth = 'Please enter a valid date of birth'
        }
      }

      if (!formData.gender) {
        newErrors.gender = 'Gender is required'
      }

      if (!formData.marital_status) {
        newErrors.marital_status = 'Marital status is required'
      }
    }

    if (step === 'location') {
      // If country is selected, city becomes required
      if (formData.country && !formData.city?.trim()) {
        newErrors.city = 'City is required when country is selected'
      }
    }

    if (step === 'relationship') {
      // If partner_using_app is true, email is required
      if (formData.partner_using_app === true) {
        if (!formData.partner_email?.trim()) {
          newErrors.partner_email = 'Partner email is required'
        } else if (!validateEmail(formData.partner_email)) {
          newErrors.partner_email = 'Please enter a valid email address'
        }
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (!validateStep()) {
      return
    }

    // Navigate through 4 steps
    if (step === 'essential') {
      setStep('personal')
    } else if (step === 'personal') {
      setStep('location')
    } else if (step === 'location') {
      setStep('relationship')
    } else {
      handleComplete()
    }
  }

  const handleBack = () => {
    if (step === 'personal') {
      setStep('essential')
    } else if (step === 'location') {
      setStep('personal')
    } else if (step === 'relationship') {
      setStep('location')
    }
  }

  const handleComplete = async () => {
    if (!validateStep()) {
      return
    }

    if (!user) {
      toast.error('You must be logged in to complete profile setup')
      navigate('/login')
      return
    }

    if (!user.email) {
      toast.error('User email is missing. Please log out and sign in again.')
      return
    }

    setIsLoading(true)

    try {
      // Calculate age if date_of_birth is provided
      const age = formData.date_of_birth ? calculateAge(formData.date_of_birth) : null

      // Build profile data
      const profileData = {
        id: user.id,
        email: user.email, // Required field - validated above
        first_name: formData.first_name.trim(),
        last_name: formData.last_name?.trim() || null,
        full_name: `${formData.first_name.trim()}${formData.last_name?.trim() ? ' ' + formData.last_name.trim() : ''}`.trim(),
        date_of_birth: formData.date_of_birth || null,
        age: age,
        gender: formData.gender || null,
        marital_status: formData.marital_status || null,
        country: formData.country || null,
        city: formData.city?.trim() || null,
        partner_name: formData.partner_name?.trim() || null,
        partner_using_app: formData.partner_using_app,
        partner_email: formData.partner_email?.trim() || null,
        wedding_date: formData.wedding_date || null,
        profile_visibility: 'public' as const,
      }

      if (!supabase) {
        toast.error('Database connection unavailable')
        setIsLoading(false)
        return
      }

      // Try update first (profile should exist from trigger), fallback to insert if needed
      let { error } = await supabase
        .from('profiles')
        // @ts-expect-error - Supabase type inference issue with Database types
        .update(profileData)
        .eq('id', user.id)

      // If update fails (profile doesn't exist), try insert
      if (error) {
        const { error: insertError } = await supabase
          .from('profiles')
          // @ts-expect-error - Supabase type inference issue with Database types
          .insert(profileData)
        
        if (insertError) {
          // If insert also fails with conflict, try upsert as last resort
          if (insertError.code === '23505' || insertError.message?.includes('409') || insertError.message?.includes('Conflict')) {
            const { error: upsertError } = await supabase
              .from('profiles')
              // @ts-expect-error - Supabase type inference issue with Database types
              .upsert(profileData, { onConflict: 'id', ignoreDuplicates: false })
            if (upsertError) {
              logError(upsertError, 'ProfileSetup.upsert')
              toast.error(upsertError.message || 'Failed to save profile')
              setIsLoading(false)
              return
            }
          } else {
            logError(insertError, 'ProfileSetup.insert')
            toast.error(insertError.message || 'Failed to save profile')
            setIsLoading(false)
            return
          }
        }
      }

      // Refresh profile in auth context before navigating
      if (refreshProfile) {
        await refreshProfile()
      }
      
      // Wait a bit for state to propagate
      await new Promise(resolve => setTimeout(resolve, 200))
      
      toast.success('Profile saved! Welcome to NikahPrep.')
      navigate('/dashboard', { replace: true })
    } catch (error) {
      logError(error, 'ProfileSetup')
      toast.error('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }))
    const value = formData[field as keyof typeof formData]
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

  return (
    <>
      <SEO
        title={PAGE_SEO.profileSetup.title}
        description={PAGE_SEO.profileSetup.description}
        path="/profile-setup"
        noIndex
      />

      <div className="min-h-screen-dynamic flex flex-col lg:flex-row bg-background">
        {/* Left side - Decorative (hidden on mobile, shown on desktop) */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-brand-gradient-vertical">
          {/* Background decoration - Removed blur decorations */}

          {/* Content */}
          <div className="relative z-10 flex flex-col justify-center px-10 xl:px-16 py-8">
            <Link to="/" className="flex items-center gap-2.5 mb-8 group">
              <img
                src="/logo.svg"
                alt="NikahPrep Logo - Crescent Moon and Heart"
                className="h-11 w-11 object-contain flex-shrink-0"
                width={44}
                height={44}
                loading="eager"
                decoding="async"
              />
              <span className="text-xl font-bold text-white drop-shadow-sm">NikahPrep</span>
            </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h1 className="text-3xl xl:text-4xl font-bold text-white leading-tight mb-4 drop-shadow-sm">
                Complete Your
                <br />
                <span className="text-secondary drop-shadow-sm">Profile</span>
              </h1>
              <p className="text-base text-white/95 max-w-sm leading-relaxed mb-6 drop-shadow-sm">
                Help us personalize your experience and connect you with the right resources.
              </p>

              {/* Progress indicator */}
              <div className="mb-6">
                <div className="flex items-center justify-between text-white text-sm mb-2.5 drop-shadow-sm">
                  <span>Step {currentStepIndex + 1} of {totalSteps}</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="w-full h-2 bg-white/25 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                    className="h-full bg-secondary rounded-full shadow-sm"
                  />
                </div>
              </div>

              {/* Step indicators */}
              <div className="space-y-3">
                {(['essential', 'personal', 'location', 'relationship'] as Step[]).map((s, idx) => {
                  const isActive = s === step
                  const isCompleted = stepConfig[s].index < currentStepIndex
                  const stepInfo = stepConfig[s]
                  const StepIcon = stepInfo.icon
                  
                  return (
                    <motion.div
                      key={s}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05, duration: 0.2 }}
                      className={`flex items-center gap-3.5 p-3.5 rounded-xl transition-all ${
                        isActive ? 'bg-white/25 backdrop-blur-sm shadow-md' : 'bg-white/10 hover:bg-white/15'
                      }`}
                    >
                      <div className={`h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        isActive || isCompleted ? 'bg-secondary shadow-sm' : 'bg-white/25'
                      }`}>
                        <StepIcon className={`h-5 w-5 ${
                          isActive || isCompleted ? 'text-primary' : 'text-white'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm font-semibold ${
                          isActive ? 'text-white drop-shadow-sm' : 'text-white/95 drop-shadow-sm'
                        }`}>
                          {stepInfo.title}
                        </p>
                        <p className="text-xs text-white/90 mt-0.5 drop-shadow-sm">{stepInfo.subtitle}</p>
                      </div>
                      {(isActive || isCompleted) && (
                        <div className="h-2 w-2 rounded-full bg-secondary flex-shrink-0 shadow-sm" />
                      )}
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>
          </div>
          </div>

        {/* Right side - Form (mobile-first: full width on mobile) */}
        <div className="w-full lg:w-1/2 flex flex-col h-full overflow-hidden">
          {/* Mobile header with Back button */}
          <div className="lg:hidden flex-shrink-0 px-3 pt-2 pb-1.5 safe-area-inset-top bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
            <div className="flex items-center justify-between">
              <button
                onClick={handleBack}
                disabled={step === 'essential'}
                className={cn(
                  "inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors",
                  step === 'essential' && "opacity-50 cursor-not-allowed"
                )}
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="text-xs">Back</span>
              </button>
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
          <div className="flex-1 overflow-y-auto px-3 py-3 sm:px-4 sm:py-4 lg:px-6 lg:py-6 safe-area-inset-bottom scroll-smooth">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-md mx-auto"
            >

            {/* Mobile progress bar */}
            <div className="lg:hidden mb-3">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span>Step {currentStepIndex + 1} of {totalSteps}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-1.5" />
            </div>

            <div className="mb-3">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                {stepConfig[step].title}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {stepConfig[step].subtitle}
              </p>
            </div>

          <Card className="shadow-none" style={{ boxShadow: 'none' }}>
            <CardContent className="p-4 sm:p-5">
              <AnimatePresence mode="wait">
                {/* Step 1: Essential Information (First Name + Last Name) */}
                {step === 'essential' && (
                  <motion.div
                    key="essential"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="space-y-3">
                      <div>
                        <Input
                          id="first_name"
                          label="First Name"
                          value={formData.first_name}
                          onChange={(e) => {
                            const value = e.target.value
                            setFormData({ ...formData, first_name: value })
                            // Clear error immediately if field becomes valid
                            if (value && validateName(value, 'first_name') === null && errors.first_name) {
                              setErrors(prev => {
                                const newErrors = { ...prev }
                                delete newErrors.first_name
                                return newErrors
                              })
                            }
                          }}
                          onBlur={() => handleBlur('first_name')}
                          placeholder="Enter your first name"
                          autoFocus
                          maxLength={50}
                          error={touched.first_name ? errors.first_name : undefined}
                          hint="This will be visible to other users. Letters, spaces, hyphens, and apostrophes only."
                          leftIcon={<User className="h-4 w-4" />}
                          aria-invalid={touched.first_name && !!errors.first_name}
                          aria-describedby={touched.first_name && errors.first_name ? 'first_name-error' : touched.first_name && !errors.first_name && formData.first_name ? 'first_name-success' : undefined}
                        />
                        <AnimatePresence>
                          {touched.first_name && errors.first_name && (
                            <motion.p
                              key="error"
                              initial={{ opacity: 0, y: -5 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -5 }}
                              transition={{ duration: 0.2 }}
                              id="first_name-error"
                              className="text-xs sm:text-sm text-error mt-1.5 px-1"
                              aria-live="polite"
                            >
                              {errors.first_name}
                            </motion.p>
                          )}
                          {touched.first_name && !errors.first_name && formData.first_name && (
                            <motion.p
                              key="success"
                              initial={{ opacity: 0, y: -5 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -5 }}
                              transition={{ duration: 0.2 }}
                              id="first_name-success"
                              className="text-xs sm:text-sm text-success font-medium mt-1.5 px-1"
                              aria-live="polite"
                            >
                              ✓ Valid name
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </div>

                      <div>
                        <Input
                          id="last_name"
                          label="Last Name (Optional)"
                          value={formData.last_name}
                          onChange={(e) => {
                            const value = e.target.value
                            setFormData({ ...formData, last_name: value })
                            // Clear error immediately if field becomes valid
                            if (value && value.trim() && validateName(value, 'last_name') === null && errors.last_name) {
                              setErrors(prev => {
                                const newErrors = { ...prev }
                                delete newErrors.last_name
                                return newErrors
                              })
                            }
                          }}
                          onBlur={() => handleBlur('last_name')}
                          placeholder="Enter your last name"
                          maxLength={50}
                          error={touched.last_name ? errors.last_name : undefined}
                          leftIcon={<User className="h-4 w-4" />}
                          aria-invalid={touched.last_name && !!errors.last_name}
                          aria-describedby={touched.last_name && errors.last_name ? 'last_name-error' : touched.last_name && !errors.last_name && formData.last_name ? 'last_name-success' : undefined}
                        />
                        <AnimatePresence>
                          {touched.last_name && errors.last_name && (
                            <motion.p
                              key="error"
                              initial={{ opacity: 0, y: -5 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -5 }}
                              transition={{ duration: 0.2 }}
                              id="last_name-error"
                              className="text-xs sm:text-sm text-error mt-1.5 px-1"
                              aria-live="polite"
                            >
                              {errors.last_name}
                            </motion.p>
                          )}
                          {touched.last_name && !errors.last_name && formData.last_name && (
                            <motion.p
                              key="success"
                              initial={{ opacity: 0, y: -5 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -5 }}
                              transition={{ duration: 0.2 }}
                              id="last_name-success"
                              className="text-xs sm:text-sm text-success font-medium mt-1.5 px-1"
                              aria-live="polite"
                            >
                              ✓ Valid name
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </div>

                      <div className="pt-4 mt-2">
                        <Button
                          onClick={handleNext}
                          className="w-full"
                          size="sm"
                          rightIcon={<ArrowRight className="h-4 w-4" />}
                          disabled={!formData.first_name.trim()}
                        >
                          Continue
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Personal Details */}
                {step === 'personal' && (
                  <motion.div
                    key="personal"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="space-y-4">
                      {/* Date of Birth */}
                      <div>
                        <Label htmlFor="date_of_birth" required className="text-sm font-medium mb-1.5">
                          Date of Birth
                        </Label>
                        <DatePicker
                          id="date_of_birth"
                          value={formData.date_of_birth}
                          onChange={(e) => {
                            const value = e.target.value
                            setFormData({ ...formData, date_of_birth: value })
                            handleBlur('date_of_birth')
                            // Clear error immediately if field becomes valid
                            if (value && validateField('date_of_birth', value) === null && errors.date_of_birth) {
                              setErrors(prev => {
                                const newErrors = { ...prev }
                                delete newErrors.date_of_birth
                                return newErrors
                              })
                            }
                          }}
                          onDateChange={(date) => {
                            setFormData({ ...formData, date_of_birth: date })
                            handleBlur('date_of_birth')
                            // Clear error immediately if field becomes valid
                            if (date && validateField('date_of_birth', date) === null && errors.date_of_birth) {
                              setErrors(prev => {
                                const newErrors = { ...prev }
                                delete newErrors.date_of_birth
                                return newErrors
                              })
                            }
                          }}
                          onBlur={() => handleBlur('date_of_birth')}
                          min={getMinDate()}
                          max={getMaxDate()}
                          placeholder="mm/dd/yyyy"
                          required
                          error={touched.date_of_birth ? !!errors.date_of_birth : undefined}
                          helperText={touched.date_of_birth && errors.date_of_birth ? errors.date_of_birth : undefined}
                          className="w-full"
                          aria-invalid={touched.date_of_birth && !!errors.date_of_birth}
                        />
                        <AnimatePresence mode="wait">
                          {calculatedAge !== null && !errors.date_of_birth && formData.date_of_birth ? (
                            <motion.p
                              key="success"
                              initial={{ opacity: 0, y: -5 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -5 }}
                              transition={{ duration: 0.2 }}
                              className="text-xs sm:text-sm text-primary font-medium mt-1.5 px-1"
                              aria-live="polite"
                            >
                              ✓ You are {calculatedAge} {calculatedAge === 1 ? 'year' : 'years'} old
                            </motion.p>
                          ) : !touched.date_of_birth && !formData.date_of_birth ? (
                            <motion.p
                              key="hint"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="text-xs sm:text-sm text-muted-foreground mt-1.5"
                            >
                              Tap to select your date of birth. You must be 18 years or older.
                            </motion.p>
                          ) : null}
                        </AnimatePresence>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-2 px-1 leading-relaxed">
                          We collect your date of birth to verify you meet the age requirement and to personalize your experience with age-appropriate content.
                        </p>
                      </div>

                      {/* Gender */}
                      <div>
                        <div className="mb-1.5">
                          <label
                            htmlFor="gender"
                            className="block text-sm font-medium text-foreground"
                          >
                            Gender
                            <span className="text-destructive ml-1">*</span>
                          </label>
                        </div>
                        <CustomDropdown
                          id="gender"
                          value={formData.gender}
                          onChange={(value) => {
                            const genderValue = value as 'male' | 'female' | 'prefer_not_to_say'
                            setFormData({ ...formData, gender: genderValue })
                            handleBlur('gender')
                            // Clear error immediately if field becomes valid
                            if (genderValue && validateField('gender', genderValue) === null && errors.gender) {
                              setErrors(prev => {
                                const newErrors = { ...prev }
                                delete newErrors.gender
                                return newErrors
                              })
                            }
                          }}
                          options={[
                            { value: 'male', label: 'Male' },
                            { value: 'female', label: 'Female' },
                            { value: 'prefer_not_to_say', label: 'Prefer not to say' }
                          ]}
                          placeholder="Select your gender"
                          className="w-full"
                        />
                        {touched.gender && errors.gender && (
                          <p className="text-xs text-error mt-1.5 px-1">{errors.gender}</p>
                        )}
                        {!touched.gender && !formData.gender && (
                          <p className="text-xs text-muted-foreground mt-1.5 px-1">
                            Tap to select your gender. This helps us personalize your experience.
                          </p>
                        )}
                        <AnimatePresence mode="wait">
                          {formData.gender && !errors.gender && touched.gender ? (
                            <motion.p
                              key="success"
                              initial={{ opacity: 0, y: -5 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -5 }}
                              transition={{ duration: 0.2 }}
                              className="text-xs sm:text-sm text-primary font-medium mt-1.5 px-1"
                              aria-live="polite"
                            >
                              ✓ Gender selected
                            </motion.p>
                          ) : null}
                        </AnimatePresence>
                      </div>

                      {/* Marital Status */}
                      <div>
                        <div className="mb-1.5">
                          <label
                            htmlFor="marital_status"
                            className="block text-sm font-medium text-foreground"
                          >
                            Marital Status
                            <span className="text-destructive ml-1">*</span>
                          </label>
                        </div>
                        <CustomDropdown
                          id="marital_status"
                          value={formData.marital_status}
                          onChange={(value) => {
                            const statusValue = value as 'Single' | 'Engaged' | 'Researching'
                            setFormData({ ...formData, marital_status: statusValue })
                            handleBlur('marital_status')
                            // Clear error immediately if field becomes valid
                            if (statusValue && validateField('marital_status', statusValue) === null && errors.marital_status) {
                              setErrors(prev => {
                                const newErrors = { ...prev }
                                delete newErrors.marital_status
                                return newErrors
                              })
                            }
                          }}
                          options={[
                            { value: 'Single', label: 'Single' },
                            { value: 'Engaged', label: 'Engaged' },
                            { value: 'Researching', label: 'Researching' }
                          ]}
                          placeholder="Select status..."
                          className="w-full"
                        />
                        {touched.marital_status && errors.marital_status && (
                          <p className="text-xs text-error mt-1.5 px-1">{errors.marital_status}</p>
                        )}
                        {!touched.marital_status && !formData.marital_status && (
                          <p className="text-xs text-muted-foreground mt-1.5 px-1">
                            Tap to select your current relationship status.
                          </p>
                        )}
                        <AnimatePresence mode="wait">
                          {formData.marital_status && !errors.marital_status && touched.marital_status ? (
                            <motion.p
                              key="success"
                              initial={{ opacity: 0, y: -5 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -5 }}
                              transition={{ duration: 0.2 }}
                              className="text-xs sm:text-sm text-primary font-medium mt-1.5 px-1"
                              aria-live="polite"
                            >
                              ✓ Status selected
                            </motion.p>
                          ) : null}
                        </AnimatePresence>
                      </div>

                      {/* Navigation Button */}
                      <div className="pt-4">
                        <Button
                          onClick={handleNext}
                          className="w-full"
                          size="sm"
                          rightIcon={<ArrowRight className="h-4 w-4" />}
                          disabled={
                            !!errors.date_of_birth ||
                            !!errors.gender ||
                            !!errors.marital_status ||
                            !formData.date_of_birth ||
                            !formData.gender ||
                            !formData.marital_status
                          }
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Location */}
                {step === 'location' && (
                  <motion.div
                    key="location"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="space-y-3">
                      <div>
                        <div className="mb-1.5">
                          <label
                            htmlFor="country"
                            className="block text-sm font-medium text-foreground"
                          >
                            Country (Optional)
                          </label>
                        </div>
                        <CustomDropdown
                          id="country"
                          value={formData.country}
                          onChange={(value) => {
                            setFormData({ ...formData, country: value, city: value ? formData.city : '' })
                            if (touched.country) {
                              validateStep()
                            }
                          }}
                          options={countries}
                          placeholder="Select your country"
                          className="w-full"
                        />
                        {touched.country && errors.country && (
                          <p className="text-xs text-error mt-1.5 px-1">{errors.country}</p>
                        )}
                      </div>

                      {formData.country && (
                        <AnimatePresence>
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Input
                              label="City (Required if country selected)"
                              value={formData.city}
                              onChange={(e) => {
                                setFormData({ ...formData, city: e.target.value })
                                if (touched.city) {
                                  validateStep()
                                }
                              }}
                              onBlur={() => handleBlur('city')}
                              placeholder="Enter your city"
                              error={undefined}
                              leftIcon={<MapPin className="h-4 w-4" />}
                            />
                            <AnimatePresence>
                              {touched.city && errors.city && (
                                <motion.p
                                  key="error"
                                  initial={{ opacity: 0, y: -5 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -5 }}
                                  transition={{ duration: 0.2 }}
                                  className="text-xs sm:text-sm text-error mt-1.5 px-1"
                                  aria-live="polite"
                                >
                                  {errors.city}
                                </motion.p>
                              )}
                            </AnimatePresence>
                          </motion.div>
                        </AnimatePresence>
                      )}

                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className="text-xs sm:text-sm text-muted-foreground mt-2 px-1 leading-relaxed"
                      >
                        Location information helps us provide relevant content, resources, and connect you with local marriage preparation services in your area.
                      </motion.p>

                    <div className="pt-4">
                      <Button
                        onClick={handleNext}
                        className="w-full"
                        size="sm"
                        rightIcon={<ArrowRight className="h-4 w-4" />}
                      >
                        Continue
                      </Button>
                    </div>
                    </div>
                  </motion.div>
                )}

                {/* Step 4: Relationship */}
                {step === 'relationship' && (
                  <motion.div
                    key="relationship"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="space-y-3">
                      <Input
                        label="Partner Name (Optional)"
                        value={formData.partner_name}
                        onChange={(e) => setFormData({ ...formData, partner_name: e.target.value })}
                        placeholder="Enter your partner's name"
                        leftIcon={<Heart className="h-4 w-4" />}
                      />

                        <Input
                        label="Wedding Date (Optional)"
                          type="date"
                          value={formData.wedding_date}
                          onChange={(e) => setFormData({ ...formData, wedding_date: e.target.value })}
                        min={new Date().toISOString().split('T')[0]}
                        leftIcon={<Calendar className="h-4 w-4" />}
                      />

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Is your partner using this app?
                        </label>
                        <div className="flex gap-3">
                          <Button
                            variant={formData.partner_using_app === true ? 'primary' : 'outline'}
                            onClick={() => {
                              setFormData({ ...formData, partner_using_app: true })
                              if (touched.partner_email) {
                                validateStep()
                              }
                            }}
                            className="flex-1"
                          >
                            Yes
                          </Button>
                          <Button
                            variant={formData.partner_using_app === false ? 'primary' : 'outline'}
                            onClick={() => {
                              setFormData({ ...formData, partner_using_app: false, partner_email: '' })
                              setErrors({ ...errors, partner_email: '' })
                            }}
                            className="flex-1"
                          >
                            No
                          </Button>
                        </div>
                      </div>

                      {formData.partner_using_app === true && (
                        <AnimatePresence>
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Input
                              label="Partner Email (Required)"
                              type="email"
                              value={formData.partner_email}
                              onChange={(e) => {
                                setFormData({ ...formData, partner_email: e.target.value })
                                if (touched.partner_email) {
                                  validateStep()
                                }
                              }}
                              onBlur={() => handleBlur('partner_email')}
                              placeholder="Enter your partner's email"
                              error={undefined}
                              leftIcon={<Mail className="h-4 w-4" />}
                            />
                            <AnimatePresence>
                              {touched.partner_email && errors.partner_email && (
                                <motion.p
                                  key="error"
                                  initial={{ opacity: 0, y: -5 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -5 }}
                                  transition={{ duration: 0.2 }}
                                  className="text-xs sm:text-sm text-error mt-1.5 px-1"
                                  aria-live="polite"
                                >
                                  {errors.partner_email}
                                </motion.p>
                              )}
                            </AnimatePresence>
                          </motion.div>
                        </AnimatePresence>
                      )}

                      <div className="pt-4">
                        <Button
                          onClick={handleComplete}
                          className="w-full"
                          size="sm"
                          isLoading={isLoading}
                          rightIcon={<Sparkles className="h-4 w-4" />}
                        >
                          Complete
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>

          {/* Helper text */}
          <p className="text-center text-xs text-muted-foreground mt-3">
            You can update this information later
          </p>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  )
}
