import { useMemo } from 'react'
import { useTheme } from '../contexts/ThemeContext'

export interface ThemeImageConfig {
  /** Image URL for light theme */
  light: string
  /** Image URL for dark theme */
  dark: string
}

export interface UseThemeImageReturn {
  /** Current image URL based on theme */
  imageUrl: string
  /** Whether current theme is light */
  isLight: boolean
}

/**
 * Custom hook for selecting image based on current theme
 * 
 * Follows MASTER_CUSTOM_HOOKS_PROMPT patterns:
 * - Single responsibility: theme-based image selection
 * - Performance: memoized image URL calculation
 * - Type safety: explicit return types
 * 
 * @param config - Image URLs for light and dark themes
 * @returns Current image URL and theme state
 * 
 * @example
 * ```tsx
 * const { imageUrl } = useThemeImage({
 *   light: '/images/bg-light.jpg',
 *   dark: '/images/bg-dark.jpg'
 * })
 * ```
 */
/**
 * Phase 4: TypeScript Patterns - Explicit return type for public API
 */
export function useThemeImage(config: ThemeImageConfig): UseThemeImageReturn {
  const { theme } = useTheme()
  
  // Phase 4: TypeScript Patterns - Type-safe theme check
  const isLight: boolean = theme === 'light'
  
  // Memoize image URL to prevent recalculation (MASTER_CUSTOM_HOOKS_PROMPT: memoize expensive computations)
  // Phase 4: TypeScript Patterns - Explicit return type for memoized value
  const imageUrl: string = useMemo((): string => {
    return isLight ? config.light : config.dark
  }, [isLight, config.light, config.dark])

  return {
    imageUrl,
    isLight,
  }
}

