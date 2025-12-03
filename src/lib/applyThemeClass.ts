import { ThemeKey, THEME_PRESETS, DEFAULT_THEME } from './themePresets'

const THEME_CLASS_PREFIX = 'theme-'
const STORAGE_KEY = 'nikah-alpha-brandTheme' // Unique storage key for this project

/**
 * Applies a theme class to the document root element.
 * Removes any existing theme-* classes and adds the new one.
 */
export function applyThemeClass(themeKey: ThemeKey): void {
  if (typeof document === 'undefined') return

  const root = document.documentElement

  // Remove existing theme-* classes
  root.classList.forEach((cls) => {
    if (cls.startsWith(THEME_CLASS_PREFIX)) {
      root.classList.remove(cls)
    }
  })

  // Add the class for the selected theme
  const preset = THEME_PRESETS.find((p) => p.key === themeKey)
  if (preset) {
    root.classList.add(preset.className)
  }

  // Persist in localStorage as fallback
  localStorage.setItem(STORAGE_KEY, themeKey)
}

/**
 * Gets the currently applied theme from localStorage.
 * Returns the default theme if none is set.
 */
export function getStoredTheme(): ThemeKey {
  if (typeof localStorage === 'undefined') return DEFAULT_THEME

  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored && THEME_PRESETS.some((p) => p.key === stored)) {
    return stored as ThemeKey
  }

  return DEFAULT_THEME
}

/**
 * Initializes the theme on app load.
 * First checks localStorage, applies immediately to avoid flash.
 */
export function initializeTheme(): void {
  const storedTheme = getStoredTheme()
  applyThemeClass(storedTheme)
}
