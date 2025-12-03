// Theme presets for admin selection
export type ThemeKey = 'classic' | 'midnight' | 'soft'

export interface ThemePreset {
  key: ThemeKey
  name: string
  description: string
  className: string
  preview: {
    primary: string
    secondary: string
    background: string
  }
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    key: 'classic',
    name: 'Classic Green',
    description: 'Bright Islamic green with gold and purple accents.',
    className: 'theme-classic',
    preview: {
      primary: '#00FF87',
      secondary: '#FBD07C',
      background: '#FFF9F2',
    },
  },
  {
    key: 'midnight',
    name: 'Midnight Gold',
    description: 'Deep slate with striking gold highlights for a premium look.',
    className: 'theme-midnight',
    preview: {
      primary: '#1E293B',
      secondary: '#FACC15',
      background: '#F8FAFC',
    },
  },
  {
    key: 'soft',
    name: 'Soft Neutral',
    description: 'Muted teal and sand palette for a calm, minimal experience.',
    className: 'theme-soft',
    preview: {
      primary: '#14B8A6',
      secondary: '#FBBF24',
      background: '#F5F5F4',
    },
  },
]

export const DEFAULT_THEME: ThemeKey = 'classic'
