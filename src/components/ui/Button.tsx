export * from './Button'

import React, { forwardRef, memo, type ButtonHTMLAttributes, type ReactElement } from 'react'
import { cn } from '../../lib/utils'

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'size'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'destructive' | 'success' | 'warm' | 'link'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  asChild?: boolean
}

// Extract constants to prevent recreation
const BASE_STYLES = `
      inline-flex items-center justify-center gap-2
      font-medium rounded-xl
      transition-all duration-200
      focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring
      disabled:opacity-50 disabled:cursor-not-allowed
      touch-target
    `

const BUTTON_VARIANTS = {
      // Primary CTA - Brand gradient (green → aqua)
      primary: `
        gradient-brand text-white
        shadow-md hover:shadow-lg
        hover:-translate-y-0.5
        active:scale-[0.98]
        dark:shadow-lg dark:hover:shadow-xl
      `,
      // Success - Same as primary (brand gradient)
      success: `
        gradient-brand text-white
        shadow-md hover:shadow-lg
        hover:-translate-y-0.5
        active:scale-[0.98]
        dark:shadow-lg dark:hover:shadow-xl
      `,
      // Warm - Same as primary (brand gradient)
      warm: `
        gradient-brand text-white
        shadow-md hover:shadow-lg
        hover:-translate-y-0.5
        active:scale-[0.98]
        dark:shadow-lg dark:hover:shadow-xl
      `,
      // Secondary - Soft neutral
      secondary: `
        bg-secondary text-secondary-foreground
        shadow-sm hover:bg-secondary/80
        active:scale-[0.98]
        dark:bg-secondary dark:text-secondary-foreground dark:hover:bg-secondary/90
      `,
      // Outline - Border with hover fill
      outline: `
        border-2 border-input bg-background
        text-foreground
        hover:bg-accent hover:text-accent-foreground hover:border-primary/50
        active:scale-[0.98]
        dark:border-input dark:bg-background dark:text-foreground
        dark:hover:bg-accent dark:hover:text-accent-foreground dark:hover:border-primary/50
      `,
      // Ghost - Minimal, hover background
      ghost: `
        text-muted-foreground
        hover:bg-accent hover:text-accent-foreground
        active:scale-[0.98]
        dark:text-muted-foreground dark:hover:bg-accent dark:hover:text-accent-foreground
      `,
      // Danger/Destructive - Red
      danger: `
        bg-destructive text-destructive-foreground
        shadow-md hover:bg-destructive/90
        active:scale-[0.98]
        dark:bg-destructive dark:text-destructive-foreground dark:hover:bg-destructive/80
      `,
      destructive: `
        bg-destructive text-destructive-foreground
        shadow-md hover:bg-destructive/90
        active:scale-[0.98]
        dark:bg-destructive dark:text-destructive-foreground dark:hover:bg-destructive/80
      `,
      // Link - Text link style
      link: `
        text-brand underline-offset-4 hover:underline
        active:scale-[0.98]
        dark:text-brand
      `,
} as const

const BUTTON_SIZES = {
      sm: 'px-3 py-1.5 text-sm min-h-[36px]',
      md: 'px-4 py-2.5 text-base min-h-[44px]',
      lg: 'px-6 py-3 text-lg min-h-[52px]',
      xl: 'px-8 py-4 text-xl min-h-[56px]',
} as const

// Loading spinner SVG component - extracted to prevent recreation
const LoadingSpinnerSVG = memo(() => (
            <svg
              className="animate-spin h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
    aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
))
LoadingSpinnerSVG.displayName = 'LoadingSpinnerSVG'

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      children,
      asChild = false,
      ...props
    },
    ref
  ) => {
    const buttonClasses = cn(BASE_STYLES, BUTTON_VARIANTS[variant], BUTTON_SIZES[size], className)
    const buttonContent = (
      <>
        {isLoading ? (
          <>
            <LoadingSpinnerSVG />
            <span>Loading...</span>
          </>
        ) : (
          <>
            {leftIcon && (
              <span className="shrink-0 flex items-center justify-center [&>svg]:flex-shrink-0 [&>svg]:w-auto [&>svg]:h-auto">
                {leftIcon}
              </span>
            )}
            {children}
            {rightIcon && (
              <span className="shrink-0 flex items-center justify-center [&>svg]:flex-shrink-0 [&>svg]:w-auto [&>svg]:h-auto">
                {rightIcon}
              </span>
            )}
          </>
        )}
      </>
    )

    // Handle asChild prop for composition (e.g., with Link from react-router-dom)
    if (asChild && React.isValidElement(children)) {
      const child = children as ReactElement
      // Extract the child's original children to avoid nesting
      const childChildren = child.props.children
      // Build content without the child element itself
      const asChildContent = (
        <>
          {isLoading ? (
            <>
                <LoadingSpinnerSVG />
              <span>Loading...</span>
            </>
          ) : (
            <>
              {leftIcon && (
                <span className="shrink-0 flex items-center justify-center [&>svg]:flex-shrink-0 [&>svg]:w-auto [&>svg]:h-auto">
                  {leftIcon}
                </span>
              )}
              {childChildren}
              {rightIcon && (
                <span className="shrink-0 flex items-center justify-center [&>svg]:flex-shrink-0 [&>svg]:w-auto [&>svg]:h-auto">
                  {rightIcon}
                </span>
              )}
            </>
          )}
        </>
      )
      
      // Filter out button-specific props that shouldn't be on anchor tags
      const linkProps = { ...props }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (linkProps as any).disabled
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (linkProps as any).type
      
      return React.cloneElement(child, {
        ...linkProps,
        ...child.props,
        className: cn(buttonClasses, child.props.className),
        ref,
        children: asChildContent,
      })
    }

    return (
      <button
        ref={ref}
        className={buttonClasses}
        disabled={disabled || isLoading}
        {...props}
      >
        {buttonContent}
      </button>
    )
  }
)

Button.displayName = 'Button'

export { Button }
