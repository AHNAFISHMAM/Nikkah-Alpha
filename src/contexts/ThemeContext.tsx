import { createContext, useContext, useEffect, useState, useMemo, useCallback, useRef, type ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import { applyThemeClass, getStoredTheme } from '../lib/applyThemeClass'
import type { ThemeKey } from '../lib/themePresets'
import { logError } from '../lib/logger'

type Theme = 'light' | 'dark'

// MANDATORY: Export this type
export type GreenTheme = 'emerald' | 'forest' | 'mint' | 'sage' | 'jade'

// MANDATORY: Array of valid themes
const GREEN_THEMES: GreenTheme[] = ['emerald', 'forest', 'mint', 'sage', 'jade']

// Theme metadata for better UX
export const GREEN_THEME_META: Record<GreenTheme, { label: string; color: string; description: string; useCase: string }> = {
  emerald: { 
    label: 'Emerald', 
    color: '#10b981', 
    description: 'Vibrant, bright green',
    useCase: 'Best for daytime use and high-energy content. Great for focus and productivity.'
  },
  forest: { 
    label: 'Forest', 
    color: '#059669', 
    description: 'Deep, rich green',
    useCase: 'Ideal for reading and extended sessions. Reduces eye strain with calming tones.'
  },
  mint: { 
    label: 'Mint', 
    color: '#00FF87', 
    description: 'Soft, light green',
    useCase: 'Perfect for creative work and inspiration. Fresh and modern aesthetic.'
  },
  sage: { 
    label: 'Sage', 
    color: '#6b9280', 
    description: 'Muted, earthy green',
    useCase: 'Excellent for relaxation and meditation. Natural, grounded feeling.'
  },
  jade: { 
    label: 'Jade', 
    color: '#14b8a6', 
    description: 'Cool, blue-tinted green',
    useCase: 'Great for evening use and calm activities. Balanced and soothing.'
  },
}

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
  brandTheme: ThemeKey
  greenTheme: GreenTheme
  setGreenTheme: (greenTheme: GreenTheme) => void
  isSystemPreference: boolean
  prefersReducedMotion: boolean
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

interface ThemeProviderProps {
  children: ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  // Detect system preferences
  const [isSystemPreference, setIsSystemPreference] = useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const isInitialMount = useRef(true)

  // Initialize theme - always default to light mode (force override saved dark)
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'light'
    
    // Force light mode - override any saved dark preference
    const savedTheme = localStorage.getItem('nikah-alpha-theme') as Theme | null
    if (savedTheme === 'dark') {
      // Override dark preference and set to light
      localStorage.setItem('nikah-alpha-theme', 'light')
      return 'light'
    }
    
    // Return saved light preference or default to light
    return savedTheme === 'light' ? 'light' : 'light'
  })
  
  const [brandTheme, setBrandTheme] = useState<ThemeKey>(getStoredTheme())
  
  // Initialize greenTheme from localStorage or default to 'emerald'
  const [greenTheme, setGreenThemeState] = useState<GreenTheme>(() => {
    if (typeof window === 'undefined') return 'emerald'
    const saved = localStorage.getItem('greenTheme') as GreenTheme
    return saved && GREEN_THEMES.includes(saved) ? saved : 'emerald'
  })

  // Detect reduced motion preference
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)
    
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches)
    }
    
    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    }
    // Fallback for older browsers
    mediaQuery.addListener(handleChange)
    return () => mediaQuery.removeListener(handleChange)
  }, [])

  // System theme listener removed - app always defaults to light mode

  // Apply themes using data attributes for better performance (avoids class list manipulation)
  const applyThemes = useCallback((lightDark: Theme, green: GreenTheme) => {
    if (typeof window === 'undefined') return
    
    const root = window.document.documentElement
    
    // Use data attributes instead of classes for better performance
    root.setAttribute('data-theme', lightDark)
    root.setAttribute('data-green-theme', green)
    
    // Also maintain class-based approach for backward compatibility
    root.classList.remove('light', 'dark')
    root.classList.add(lightDark)
    
    GREEN_THEMES.forEach(gt => root.classList.remove(`green-${gt}`))
    root.classList.add(`green-${green}`)
  }, [])

  // Apply saved theme on initial mount and fetch brand theme from database
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    // Force light mode on initial mount - override any saved dark preference
    if (theme === 'dark') {
      setTheme('light')
      localStorage.setItem('nikah-alpha-theme', 'light')
    }
    
    // Apply themes immediately to prevent flash (always light on first load)
    applyThemes('light', greenTheme)

    // Apply stored brand theme immediately to avoid flash
    const storedTheme = getStoredTheme()
    applyThemeClass(storedTheme)

    // Mark initial mount as complete
    isInitialMount.current = false

    // Then fetch from database and apply if different
    const fetchBrandTheme = async () => {
      if (!supabase) {
        return // Skip if Supabase is disabled
      }
      
      try {
        const { data } = await supabase
          .from('app_settings')
          .select('value')
          .eq('key', 'theme')
          .maybeSingle()

        if (data && data.value && typeof data.value === 'object' && 'themeKey' in data.value) {
          const dbTheme = (data.value as { themeKey: ThemeKey }).themeKey
          if (dbTheme !== storedTheme) {
            setBrandTheme(dbTheme)
            applyThemeClass(dbTheme)
          }
        }
      } catch (error) {
        // Silently fail - use localStorage fallback
      }
    }

    fetchBrandTheme()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run once on mount

  // Update theme when state changes
  useEffect(() => {
    if (isInitialMount.current) return // Skip on initial mount (handled above)
    
    applyThemes(theme, greenTheme)
    localStorage.setItem('nikah-alpha-theme', theme)
    setIsSystemPreference(false) // User manually set theme
  }, [theme, greenTheme, applyThemes])

  // MANDATORY: Update green theme when state changes
  useEffect(() => {
    if (isInitialMount.current) return // Skip on initial mount
    
    applyThemes(theme, greenTheme)
    localStorage.setItem('greenTheme', greenTheme)
  }, [greenTheme, theme, applyThemes])

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const newTheme = prev === 'light' ? 'dark' : 'light'
      setIsSystemPreference(false) // User manually toggled
      return newTheme
    })
  }, [])

  const setGreenTheme = useCallback((newGreenTheme: GreenTheme) => {
    if (!GREEN_THEMES.includes(newGreenTheme)) {
      logError(`Invalid green theme: ${newGreenTheme}. Valid themes: ${GREEN_THEMES.join(', ')}`, undefined, 'ThemeContext')
      return
    }
    setGreenThemeState(newGreenTheme)
  }, [])

  const value = useMemo(() => ({
    theme,
    setTheme,
    toggleTheme,
    brandTheme,
    greenTheme,
    setGreenTheme,
    isSystemPreference,
    prefersReducedMotion,
  }), [theme, brandTheme, greenTheme, setGreenTheme, toggleTheme, isSystemPreference, prefersReducedMotion])

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

// Export hook as const arrow function for Fast Refresh compatibility
// This ensures the hook reference is stable across HMR
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
