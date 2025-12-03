/**
 * Icon System Exports
 * 
 * Usage:
 * ```tsx
 * import { Icon, IconButton, IconWithText } from '@/components/icons'
 * import { Home } from '@/components/icons/iconRegistry'
 * 
 * <Icon icon={Home} size="md" color="primary" />
 * <IconButton icon={Home} size="md" aria-label="Home" />
 * <IconWithText icon={Home}>Dashboard</IconWithText>
 * ```
 */

export { Icon } from './Icon'
export type { IconProps, IconSize } from './Icon'

export { IconButton } from './IconButton'
export type { IconButtonProps } from './IconButton'

export { IconWithText } from './IconWithText'
export type { IconWithTextProps } from './IconWithText'

export * from './iconRegistry'

