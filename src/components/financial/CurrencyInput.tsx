import { forwardRef, useState, useEffect } from 'react'
import { Input, type InputProps } from '../ui/Input'
import { formatCurrencyInput, parseCurrencyInput, validateAmount } from '../../lib/validation'
import { AlertCircle, DollarSign } from 'lucide-react'

export interface CurrencyInputProps extends Omit<InputProps, 'value' | 'onChange' | 'type'> {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  currency?: string
}

export const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ value, onChange, min = 0, max = 10000000, currency = 'USD', error, leftIcon, ...props }, ref) => {
    const [displayValue, setDisplayValue] = useState<string>('')
    const [localError, setLocalError] = useState<string>('')
    const [isFocused, setIsFocused] = useState(false)

    // Initialize display value - don't show "0" or "0.00" when value is 0
    useEffect(() => {
      if (!isFocused) {
        if (value === 0 || value === undefined || value === null) {
          setDisplayValue('')
        } else if (value !== undefined && value !== null) {
          setDisplayValue(formatCurrencyInput(value))
        }
      }
    }, [value, isFocused])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let inputValue = e.target.value

      // Prevent more than 2 decimal places while typing
      const decimalIndex = inputValue.indexOf('.')
      if (decimalIndex !== -1) {
        const decimalPart = inputValue.substring(decimalIndex + 1)
        if (decimalPart.length > 2) {
          // Truncate to 2 decimal places
          inputValue = inputValue.substring(0, decimalIndex + 3)
        }
      }

      setDisplayValue(inputValue)

      // Allow empty input while typing
      if (inputValue === '' || inputValue === '$') {
        setLocalError('')
        onChange(0)
        return
      }

      // Parse the input
      const parsed = parseCurrencyInput(inputValue)
      
      // Round to 2 decimal places for currency
      const rounded = Math.round(parsed * 100) / 100

      // Validate
      const validation = validateAmount(rounded, { min, max })
      if (!validation.isValid) {
        setLocalError(validation.error || '')
        onChange(rounded) // Still update value for controlled component
      } else {
        setLocalError('')
        onChange(rounded)
      }
    }

    const handleBlur = () => {
      setIsFocused(false)
      // Format on blur - show empty string for 0, formatted value for > 0
      if (value === 0 || value === undefined || value === null) {
        setDisplayValue('')
      } else if (value !== undefined && value !== null) {
        // Round to 2 decimals and format
        const rounded = Math.round(value * 100) / 100
        setDisplayValue(formatCurrencyInput(rounded))
        // Update the value if it was rounded
        if (rounded !== value) {
          onChange(rounded)
        }
      }
      // Clear error if value is valid
      if (value >= min && value <= max) {
        setLocalError('')
      }
    }

    const handleFocus = () => {
      setIsFocused(true)
      // Show empty string when value is 0, raw number when value > 0
      if (value === 0 || value === undefined || value === null) {
        setDisplayValue('')
      } else if (value > 0) {
        // Round to 2 decimals and show as string for editing
        const rounded = Math.round(value * 100) / 100
        // Remove trailing zeros for cleaner editing experience
        const formatted = rounded % 1 === 0 ? rounded.toString() : rounded.toFixed(2).replace(/\.?0+$/, '')
        setDisplayValue(formatted)
      }
    }

    // Combine local error with prop error
    const finalError = error || localError

    // Use DollarSign as default if no leftIcon provided
    const displayLeftIcon = leftIcon || <DollarSign className="h-5 w-5" />

    return (
      <Input
        ref={ref}
        type="text"
        inputMode="decimal"
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        error={finalError}
        placeholder="0.00"
        leftIcon={displayLeftIcon}
        rightIcon={finalError ? <AlertCircle className="h-4 w-4 text-error" /> : undefined}
        {...props}
      />
    )
  }
)

CurrencyInput.displayName = 'CurrencyInput'

