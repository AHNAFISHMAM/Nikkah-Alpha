import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '../../lib/utils'
import { Label } from './Label'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, leftIcon, rightIcon, id, required, ...props }, ref) => {
    const inputId = id || props.name

    return (
      <div className="w-full">
        {label && (
          <Label htmlFor={inputId} required={required} className="mb-1.5">
            {label}
          </Label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10 pointer-events-none flex items-center justify-center">
              <span className="text-muted-foreground dark:text-muted-foreground flex items-center justify-center [&>svg]:flex-shrink-0 [&>svg]:w-auto [&>svg]:h-auto">
                {leftIcon}
              </span>
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              `
              w-full rounded-xl border bg-background text-foreground
              px-3 py-2.5 sm:px-4 sm:py-3 text-sm sm:text-base
              min-h-[44px] sm:min-h-[48px]
              transition-all duration-200
              placeholder:text-muted-foreground
              focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary
              disabled:bg-muted disabled:cursor-not-allowed
              dark:bg-background dark:text-foreground dark:placeholder:text-muted-foreground
              dark:focus:ring-ring dark:focus:border-primary
              dark:disabled:bg-muted
              `,
              leftIcon && 'pl-10 sm:pl-11',
              rightIcon && 'pr-10 sm:pr-11',
              error
                ? 'border-error focus:ring-error/50 focus:border-error dark:border-error dark:focus:ring-error/50 dark:focus:border-error'
                : 'border-input dark:border-input',
              className
            )}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={
              error 
                ? `${inputId}-error` 
                : hint 
                  ? `${inputId}-hint` 
                  : undefined
            }
            required={required}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center pointer-events-none">
              <div className="pointer-events-auto text-muted-foreground dark:text-muted-foreground flex items-center justify-center [&>svg]:flex-shrink-0 [&>svg]:w-auto [&>svg]:h-auto">
                {rightIcon}
              </div>
            </div>
          )}
        </div>
        {error && (
          <p 
            id={`${inputId}-error`}
            className="mt-1 text-xs sm:text-sm text-error" 
            role="alert"
            aria-live="polite"
          >
            {error}
          </p>
        )}
        {hint && !error && (
          <p 
            id={`${inputId}-hint`}
            className="mt-1 text-xs sm:text-sm text-muted-foreground"
          >
            {hint}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export { Input }
