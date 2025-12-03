import React from 'react'
import { cn } from '../../lib/utils'
import { prefersReducedMotion } from '../../lib/utils'
import type { LucideIcon } from 'lucide-react'

export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'

export interface IconProps {
  icon: LucideIcon
  size?: IconSize
  className?: string
  color?: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'muted' | 'brand' | 'islamic-gold'
  animated?: boolean
  'aria-label'?: string
  'aria-hidden'?: boolean
}

const sizeMap: Record<IconSize, string> = {
  xs: 'h-3.5 w-3.5',
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
  xl: 'h-8 w-8',
  '2xl': 'h-10 w-10',
}

const colorMap: Record<NonNullable<IconProps['color']>, string> = {
  default: 'text-foreground',
  primary: 'text-primary',
  success: 'text-success',
  warning: 'text-warning',
  error: 'text-error',
  muted: 'text-muted-foreground',
  brand: 'text-brand',
  'islamic-gold': 'text-islamic-gold',
}

export const Icon = React.memo<IconProps>(
  ({
    icon: IconComponent,
    size = 'md',
    className,
    color = 'default',
    animated = false,
    'aria-label': ariaLabel,
    'aria-hidden': ariaHidden = !ariaLabel,
    ...props
  }) => {
    const shouldAnimate = animated && !prefersReducedMotion()

    return (
      <IconComponent
        className={cn(
          sizeMap[size],
          colorMap[color],
          shouldAnimate && 'transition-transform duration-200',
          className
        )}
        aria-label={ariaLabel}
        aria-hidden={ariaHidden}
        strokeWidth={2.5}
        {...props}
      />
    )
  }
)

Icon.displayName = 'Icon'

