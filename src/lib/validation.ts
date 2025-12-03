/**
 * Validation utilities for forms and user input
 */

/**
 * Validates email format
 * @param email - Email address to validate
 * @returns true if email is valid, false otherwise
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validates password strength
 * @param password - Password to validate
 * @returns Object with validation result and error messages
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
 * Allows letters, spaces, hyphens, and apostrophes
 * @param name - Name to validate
 * @param fieldName - Name of the field (for error messages)
 * @returns Error message if invalid, null if valid
 */
export function validateName(name: string, fieldName: string = 'name'): string | null {
  if (!name || name.trim().length === 0) {
    return fieldName === 'first_name' ? 'First name is required' : 
           fieldName === 'last_name' ? 'Last name is required' : 
           `${fieldName} is required`
  }

  const trimmed = name.trim()
  
  if (trimmed.length < 2) {
    return `${fieldName === 'first_name' ? 'First' : fieldName === 'last_name' ? 'Last' : 'Name'} must be at least 2 characters`
  }

  if (trimmed.length > 50) {
    return `${fieldName === 'first_name' ? 'First' : fieldName === 'last_name' ? 'Last' : 'Name'} must be 50 characters or less`
  }

  // Regex: allows letters, spaces, hyphens, apostrophes
  // Prevents: numbers, special chars, multiple consecutive spaces/hyphens/apostrophes
  const nameRegex = /^[A-Za-z]+(?:[\s'-][A-Za-z]+)*$/
  
  if (!nameRegex.test(trimmed)) {
    return 'Letters, spaces, hyphens, and apostrophes only. No numbers or special characters.'
  }

  return null
}

/**
 * Validates that two passwords match
 * @param password - First password
 * @param confirmPassword - Confirmation password
 * @returns Error message if passwords don't match, null if they match
 */
export function validatePasswordMatch(password: string, confirmPassword: string): string | null {
  if (password !== confirmPassword) {
    return 'Passwords do not match'
  }
  return null
}

/**
 * Calculates password strength with visual feedback
 * @param password - Password to analyze
 * @returns Object with strength level, score, and feedback
 */
export function getPasswordStrength(password: string): {
  strength: 'weak' | 'medium' | 'strong'
  score: number // 0-100
  feedback: string[]
} {
  if (!password) {
    return { strength: 'weak', score: 0, feedback: [] }
  }

  const feedback: string[] = []
  let score = 0

  // Length check (max 20 points)
  if (password.length >= 8) {
    score += 20
  } else {
    feedback.push('At least 8 characters')
  }

  // Uppercase check (20 points)
  if (/[A-Z]/.test(password)) {
    score += 20
  } else {
    feedback.push('One uppercase letter')
  }

  // Lowercase check (20 points)
  if (/[a-z]/.test(password)) {
    score += 20
  } else {
    feedback.push('One lowercase letter')
  }

  // Number check (20 points)
  if (/[0-9]/.test(password)) {
    score += 20
  } else {
    feedback.push('One number')
  }

  // Special character check (20 points - bonus)
  if (/[^A-Za-z0-9]/.test(password)) {
    score += 20
  }

  // Determine strength level
  let strength: 'weak' | 'medium' | 'strong'
  if (score < 60) {
    strength = 'weak'
  } else if (score < 80) {
    strength = 'medium'
  } else {
    strength = 'strong'
  }

  return { strength, score, feedback }
}

/**
 * Financial validation utilities
 * Best practices for form validation and data integrity
 */

export interface ValidationResult {
  isValid: boolean
  error?: string
}

/**
 * Validate a monetary amount
 */
export function validateAmount(
  value: number | string,
  options?: {
    min?: number
    max?: number
    required?: boolean
    fieldName?: string
  }
): ValidationResult {
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

/**
 * Validate that paid amount doesn't exceed total amount
 */
export function validatePaidAmount(
  paid: number | string,
  total: number | string,
  fieldName: string = 'Amount paid'
): ValidationResult {
  const paidNum = typeof paid === 'string' ? parseFloat(paid) : paid
  const totalNum = typeof total === 'string' ? parseFloat(total) : total

  if (isNaN(paidNum) || isNaN(totalNum)) {
    return { isValid: false, error: 'Invalid amounts' }
  }

  if (paidNum < 0) {
    return { isValid: false, error: `${fieldName} cannot be negative` }
  }

  if (paidNum > totalNum) {
    return {
      isValid: false,
      error: `${fieldName} ($${paidNum.toLocaleString()}) cannot exceed total amount ($${totalNum.toLocaleString()})`,
    }
  }

  return { isValid: true }
}

/**
 * Validate that spent amount doesn't exceed planned amount (warning, not error)
 */
export function validateSpentAmount(
  spent: number | string,
  planned: number | string
): ValidationResult {
  const spentNum = typeof spent === 'string' ? parseFloat(spent) : spent
  const plannedNum = typeof planned === 'string' ? parseFloat(planned) : planned

  if (isNaN(spentNum) || isNaN(plannedNum)) {
    return { isValid: false, error: 'Invalid amounts' }
  }

  if (spentNum < 0) {
    return { isValid: false, error: 'Spent amount cannot be negative' }
  }

  // Over budget is a warning, not an error (user might want to track it)
  if (spentNum > plannedNum) {
    return {
      isValid: true, // Still valid, just over budget
      error: `Over budget by $${(spentNum - plannedNum).toLocaleString()}`,
    }
  }

  return { isValid: true }
}

/**
 * Format number as currency string for display
 */
export function formatCurrencyInput(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === '') return ''
  const numValue = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(numValue)) return ''
  return numValue.toLocaleString('en-US', { maximumFractionDigits: 2 })
}

/**
 * Parse currency string to number
 */
export function parseCurrencyInput(value: string): number {
  // Remove currency symbols and commas
  const cleaned = value.replace(/[$,]/g, '').trim()
  const parsed = parseFloat(cleaned)
  return isNaN(parsed) ? 0 : parsed
}

