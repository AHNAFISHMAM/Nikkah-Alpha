import React from 'react'
import { cn } from '../../lib/utils'
import { Icon, type IconProps } from './Icon'
import type { LucideIcon } from 'lucide-react'

export interface IconButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  icon: LucideIcon
  size?: IconProps['size']
  color?: IconProps['color']
  variant?: 'ghost' | 'outline' | 'solid'
  'aria-label': string
  animated?: boolean
}

export const IconButton = React.memo<IconButtonProps>(
  ({
    icon,
    size = 'md',
    color = 'default',
    variant = 'ghost',
    className,
    animated = true,
    'aria-label': ariaLabel,
    ...props
  }) => {
    const variantStyles = {
      ghost: 'hover:bg-accent hover:text-accent-foreground',
      outline: 'border border-input hover:bg-accent',
      solid: 'bg-primary text-primary-foreground hover:bg-primary/90',
    }

    return (
      <button
        className={cn(
          'inline-flex items-center justify-center rounded-lg',
          'transition-colors duration-200',
          'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'touch-target min-h-[44px] min-w-[44px]',
          variantStyles[variant],
          className
        )}
        aria-label={ariaLabel}
        {...props}
      >
        <Icon icon={icon} size={size} color={color} animated={animated} aria-hidden={true} />
      </button>
    )
  }
)

IconButton.displayName = 'IconButton'

