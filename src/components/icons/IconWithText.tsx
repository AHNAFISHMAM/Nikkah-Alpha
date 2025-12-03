import React from 'react'
import { cn } from '../../lib/utils'
import { Icon, type IconProps } from './Icon'
import type { LucideIcon } from 'lucide-react'

export interface IconWithTextProps {
  icon: LucideIcon
  children: React.ReactNode
  size?: IconProps['size']
  color?: IconProps['color']
  className?: string
  iconClassName?: string
  gap?: 'sm' | 'md' | 'lg'
  direction?: 'row' | 'column'
}

const gapMap = {
  sm: 'gap-1.5',
  md: 'gap-2',
  lg: 'gap-3',
}

export const IconWithText = React.memo<IconWithTextProps>(
  ({
    icon,
    children,
    size = 'md',
    color = 'default',
    className,
    iconClassName,
    gap = 'md',
    direction = 'row',
  }) => {
    return (
      <div
        className={cn(
          'inline-flex items-center',
          direction === 'column' ? 'flex-col' : 'flex-row',
          gapMap[gap],
          className
        )}
      >
        <Icon icon={icon} size={size} color={color} className={iconClassName} aria-hidden={true} />
        <span>{children}</span>
      </div>
    )
  }
)

IconWithText.displayName = 'IconWithText'

