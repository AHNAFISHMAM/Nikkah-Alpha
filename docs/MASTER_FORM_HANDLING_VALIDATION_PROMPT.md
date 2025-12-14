# 📝 MASTER FORM HANDLING & VALIDATION PROMPT
## Production-Grade Form Implementation with Real-time Validation

---

## 📋 OVERVIEW

This master prompt provides a comprehensive approach to building forms with real-time validation, error handling, accessibility, and integration with React Query mutations. It covers single-step forms, multi-step forms, field-level validation, and form state management.

**Applicable to:**
- Single-step forms (Login, Signup, Settings)
- Multi-step forms (Wizards, Profile Setup, Onboarding)
- Complex forms with conditional fields
- Forms with real-time validation
- Forms with file uploads
- Forms with nested data structures

---

## 🎯 CORE PRINCIPLES

### 1. **Validation Strategy**
- **Real-time Validation**: Validate fields as user types (with debouncing)
- **On-Blur Validation**: Validate when user leaves field
- **On-Submit Validation**: Final validation before submission
- **Field-Level Errors**: Show errors next to specific fields
- **Form-Level Errors**: Show general form errors

### 2. **User Experience**
- **Immediate Feedback**: Show validation errors as soon as possible
- **Clear Error Messages**: User-friendly, actionable error messages
- **Loading States**: Show loading indicators during submission
- **Success Feedback**: Confirm successful submission
- **Accessibility**: Full keyboard navigation and screen reader support

### 3. **State Management**
- **Controlled Components**: Use controlled inputs for form state
- **Touched State**: Track which fields have been interacted with
- **Error State**: Track validation errors per field
- **Form State**: Track overall form validity

### 4. **Integration**
- **React Query Mutations**: Integrate with mutations for data submission
- **Error Handling**: Transform API errors to user-friendly messages
- **Optimistic Updates**: Update UI optimistically when appropriate

---

## 🔍 PHASE 1: FORM DESIGN & PLANNING

### Step 1.1: Understand Requirements
```
1. Identify all form fields and their types
2. Determine validation rules for each field
3. Identify required vs optional fields
4. Plan conditional field logic
5. Determine submission flow
6. Plan error handling strategy
```

### Step 1.2: Validation Rules Planning
```
For each field, determine:
1. Required or optional?
2. Minimum/maximum length?
3. Format requirements (email, phone, etc.)?
4. Custom validation rules?
5. Dependent validation (field depends on another)?
6. Real-time vs on-blur vs on-submit validation?
```

### Step 1.3: Research Best Practices
**Research Sources:**
1. **WCAG Form Guidelines**
   - Accessible form patterns
   - Error announcement patterns
   - Label and input relationships
   - URL: https://www.w3.org/WAI/WCAG21/Understanding/

2. **React Hook Form Best Practices**
   - Form state management
   - Validation patterns
   - Performance optimization
   - URL: https://react-hook-form.com/

3. **Form Design Patterns**
   - Progressive disclosure
   - Inline validation
   - Error message placement
   - Mobile form patterns

---

## 🛠️ PHASE 2: VALIDATION UTILITIES

### Step 2.1: Validation Functions
```typescript
// src/lib/validation.ts

/**
 * Validates email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validates password strength
 */
export function validatePassword(password: string): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters')
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number')
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Validates name (first name, last name, etc.)
 */
export function validateName(name: string, fieldName: string = 'name'): string | null {
  if (!name || name.trim().length === 0) {
    return fieldName === 'first_name' ? 'First name is required' : 
           fieldName === 'last_name' ? 'Last name is required' : 
           `${fieldName} is required`
  }

  const trimmed = name.trim()
  
  if (trimmed.length < 2) {
    return `${fieldName === 'first_name' ? 'First' : 'Last'} must be at least 2 characters`
  }

  if (trimmed.length > 50) {
    return `${fieldName === 'first_name' ? 'First' : 'Last'} must be 50 characters or less`
  }

  const nameRegex = /^[A-Za-z]+(?:[\s'-][A-Za-z]+)*$/
  
  if (!nameRegex.test(trimmed)) {
    return 'Letters, spaces, hyphens, and apostrophes only. No numbers or special characters.'
  }

  return null
}

/**
 * Validates monetary amount
 */
export function validateAmount(
  value: number | string,
  options?: {
    min?: number
    max?: number
    required?: boolean
    fieldName?: string
  }
): { isValid: boolean; error?: string } {
  const { min = 0, max = 1000000000, required = false, fieldName = 'Amount' } = options || {}
  const numValue = typeof value === 'string' ? parseFloat(value) : value

  if (required && (numValue === undefined || numValue === null || isNaN(numValue))) {
    return { isValid: false, error: `${fieldName} is required` }
  }

  if (isNaN(numValue) || numValue < min) {
    return { isValid: false, error: `${fieldName} must be at least $${min.toLocaleString()}` }
  }

  if (numValue > max) {
    return { isValid: false, error: `${fieldName} cannot exceed $${max.toLocaleString()}` }
  }

  return { isValid: true }
}
```

### Step 2.2: Validation Checklist
- [ ] Validation functions are pure (no side effects)
- [ ] Return consistent error format
- [ ] Handle edge cases (null, undefined, empty strings)
- [ ] User-friendly error messages
- [ ] Type-safe validation functions

---

## 📝 PHASE 3: FORM IMPLEMENTATION

### Step 3.1: Single-Step Form Pattern
```typescript
import { useState, useEffect } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { validateEmail, validatePassword } from '../lib/validation'
import { useAuth } from '../contexts/AuthContext'

interface FormData {
  email: string
  password: string
}

interface FormErrors {
  email?: string
  password?: string
}

export function LoginForm() {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const { signIn } = useAuth()

  const loginMutation = useMutation({
    mutationFn: async (data: FormData) => {
      return signIn(data.email, data.password)
    },
    onSuccess: () => {
      // Handle success
    },
    onError: (error: Error) => {
      // Handle error
    },
  })

  // Validate field on change (debounced)
  const validateField = (fieldName: keyof FormData, value: string) => {
    let error: string | undefined

    if (fieldName === 'email') {
      if (!value) {
        error = 'Email is required'
      } else if (!validateEmail(value)) {
        error = 'Please enter a valid email address'
      }
    } else if (fieldName === 'password') {
      if (!value) {
        error = 'Password is required'
      } else {
        const validation = validatePassword(value)
        if (!validation.valid) {
          error = validation.errors[0]
        }
      }
    }

    setErrors(prev => ({
      ...prev,
      [fieldName]: error,
    }))

    return error
  }

  // Real-time validation with debouncing
  useEffect(() => {
    if (touched.email && formData.email) {
      const timer = setTimeout(() => {
        validateField('email', formData.email)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [formData.email, touched.email])

  const handleChange = (fieldName: keyof FormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value
    setFormData(prev => ({ ...prev, [fieldName]: value }))
    
    // Clear error when user starts typing
    if (errors[fieldName]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[fieldName]
        return newErrors
      })
    }
  }

  const handleBlur = (fieldName: keyof FormData) => () => {
    setTouched(prev => ({ ...prev, [fieldName]: true }))
    validateField(fieldName, formData[fieldName])
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}
    
    // Validate all fields
    Object.keys(formData).forEach(key => {
      const fieldName = key as keyof FormData
      const error = validateField(fieldName, formData[fieldName])
      if (error) {
        newErrors[fieldName] = error
      }
    })

    // Mark all fields as touched
    setTouched({
      email: true,
      password: true,
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    loginMutation.mutate(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Input
          type="email"
          label="Email"
          value={formData.email}
          onChange={handleChange('email')}
          onBlur={handleBlur('email')}
          error={touched.email ? errors.email : undefined}
          required
        />
      </div>

      <div>
        <Input
          type="password"
          label="Password"
          value={formData.password}
          onChange={handleChange('password')}
          onBlur={handleBlur('password')}
          error={touched.password ? errors.password : undefined}
          required
        />
      </div>

      <Button
        type="submit"
        isLoading={loginMutation.isPending}
        disabled={loginMutation.isPending}
      >
        Sign In
      </Button>
    </form>
  )
}
```

### Step 3.2: Multi-Step Form Pattern
```typescript
import { useState, useEffect, useMemo, useCallback } from 'react'
import { useMutation } from '@tanstack/react-query'
import { validateName, validateEmail } from '../lib/validation'

type Step = 'essential' | 'personal' | 'location' | 'relationship'

interface FormData {
  // Essential step
  first_name: string
  last_name: string
  
  // Personal step
  date_of_birth: string
  gender: 'male' | 'female' | 'prefer_not_to_say' | ''
  marital_status: 'Single' | 'Engaged' | 'Researching' | ''
  
  // Location step
  country: string
  city: string
  
  // Relationship step
  partner_email: string
  partner_using_app: boolean | null
}

export function ProfileSetupForm() {
  const [step, setStep] = useState<Step>('essential')
  const [formData, setFormData] = useState<FormData>({
    first_name: '',
    last_name: '',
    date_of_birth: '',
    gender: '',
    marital_status: '',
    country: '',
    city: '',
    partner_email: '',
    partner_using_app: null,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  // Validate single field
  const validateField = useCallback((fieldName: keyof FormData, value: any): string | null => {
    if (fieldName === 'first_name') {
      return validateName(value, 'first_name')
    }
    if (fieldName === 'last_name' && value) {
      return validateName(value, 'last_name')
    }
    if (fieldName === 'partner_email' && formData.partner_using_app === true) {
      if (!value) return 'Partner email is required'
      if (!validateEmail(value)) return 'Please enter a valid email address'
    }
    // ... other validations
    return null
  }, [formData.partner_using_app])

  // Debounced validation for text fields
  const debouncedValidate = useMemo(() => {
    const validate = (fieldName: string, value: any) => {
      if (touched[fieldName]) {
        const error = validateField(fieldName as keyof FormData, value)
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
    }
    return debounce(validate, 300)
  }, [touched, validateField])

  // Real-time validation for current step
  useEffect(() => {
    if (step === 'essential') {
      if (touched.first_name && formData.first_name) {
        debouncedValidate('first_name', formData.first_name)
      }
      if (touched.last_name && formData.last_name) {
        debouncedValidate('last_name', formData.last_name)
      }
    }
    // ... other steps
  }, [formData, touched, step, debouncedValidate])

  // Validate current step
  const validateStep = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (step === 'essential') {
      const firstNameError = validateName(formData.first_name, 'first_name')
      if (firstNameError) newErrors.first_name = firstNameError
      
      if (formData.last_name && formData.last_name.trim()) {
        const lastNameError = validateName(formData.last_name, 'last_name')
        if (lastNameError) newErrors.last_name = lastNameError
      }
    }

    if (step === 'personal') {
      if (!formData.date_of_birth) {
        newErrors.date_of_birth = 'Date of birth is required'
      }
      if (!formData.gender) {
        newErrors.gender = 'Gender is required'
      }
      if (!formData.marital_status) {
        newErrors.marital_status = 'Marital status is required'
      }
    }

    // ... other steps

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (!validateStep()) {
      return
    }
    // Move to next step
  }

  const handlePrevious = () => {
    // Move to previous step
  }

  const handleSubmit = async () => {
    if (!validateStep()) {
      return
    }
    // Submit form
  }

  return (
    <form>
      {/* Step content */}
    </form>
  )
}
```

### Step 3.3: Form Implementation Checklist
- [ ] Form state managed with useState
- [ ] Error state tracked per field
- [ ] Touched state tracked per field
- [ ] Real-time validation with debouncing
- [ ] On-blur validation
- [ ] On-submit validation
- [ ] Error messages displayed next to fields
- [ ] Loading state during submission
- [ ] Success/error feedback
- [ ] Accessibility (labels, ARIA attributes)

---

## 🔄 PHASE 4: INTEGRATION WITH REACT QUERY

### Step 4.1: Form with Mutation
```typescript
export function useUpdateProfileForm() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const updateMutation = useUpdateProfile()

  const [formData, setFormData] = useState<ProfileUpdate>({})
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    updateMutation.mutate(formData, {
      onSuccess: () => {
        // Form reset or navigation
      },
      onError: (error) => {
        // Handle API errors
        const apiErrors = extractApiErrors(error)
        setErrors(apiErrors)
      },
    })
  }

  return {
    formData,
    setFormData,
    errors,
    handleSubmit,
    isLoading: updateMutation.isPending,
  }
}
```

### Step 4.2: Integration Checklist
- [ ] Mutation integrated with form submission
- [ ] Loading state from mutation
- [ ] Error handling from mutation
- [ ] Success handling (toast, navigation, etc.)
- [ ] Form reset on success (if needed)
- [ ] API errors mapped to form errors

---

## 🎯 SUCCESS CRITERIA

A form implementation is complete when:

1. ✅ **Validation**: All fields validated correctly
2. ✅ **Real-time**: Real-time validation with debouncing
3. ✅ **Error Handling**: Errors displayed clearly
4. ✅ **Accessibility**: Full keyboard and screen reader support
5. ✅ **Integration**: Integrated with React Query mutations
6. ✅ **UX**: Loading states and success feedback
7. ✅ **Type Safety**: Full TypeScript coverage

---

## 🚨 COMMON PITFALLS

### ❌ Don't:
- Validate on every keystroke (use debouncing)
- Show errors before user interacts with field
- Ignore API errors
- Skip accessibility features
- Forget loading states
- Skip form validation on submit

### ✅ Do:
- Debounce real-time validation
- Show errors only after field is touched
- Handle API errors gracefully
- Include ARIA attributes
- Show loading states
- Validate entire form on submit

---

**This master prompt should be followed for ALL form handling and validation work.**

