/**
 * Application-wide configuration constants
 */

// React Query Configuration
export const QUERY_CONFIG = {
  STALE_TIME: 60000, // 1 minute - how long data is considered fresh
  GC_TIME: 300000, // 5 minutes - how long unused data stays in cache
  RETRY_COUNT: 1, // Number of retries on failure
  REFETCH_ON_WINDOW_FOCUS: false, // Don't refetch when window regains focus
  REFETCH_ON_MOUNT: false, // Don't refetch on component mount if data exists
} as const

// Validation Rules
export const VALIDATION = {
  MIN_NAME_LENGTH: 2,
  MAX_NAME_LENGTH: 50,
  MIN_PASSWORD_LENGTH: 8,
  MAX_PASSWORD_LENGTH: 128,
  MIN_AGE: 18,
  MAX_AGE: 120,
} as const

// Timeouts
export const TIMEOUTS = {
  REQUEST_TIMEOUT: 10000, // 10 seconds
  DEBOUNCE_DELAY: 300, // 300ms debounce for inputs
  TOAST_DURATION: 3000, // 3 seconds for toast notifications
} as const

// Responsive Breakpoints (matching Tailwind)
export const BREAKPOINTS = {
  SM: 640, // Small devices
  MD: 768, // Tablets
  LG: 1024, // Laptops
  XL: 1280, // Desktops
  '2XL': 1536, // Large desktops
} as const

// Touch/Click Target Sizes (for accessibility)
export const TOUCH_TARGETS = {
  MIN_SIZE: 48, // Minimum 48x48px for touch targets (WCAG AA)
  RECOMMENDED_SIZE: 56, // Recommended size for better UX
} as const

// Bundle Size Targets
export const BUNDLE_TARGETS = {
  INITIAL_KB_GZIP: 200, // Initial bundle target
  ROUTE_CHUNK_KB_GZIP: 100, // Route chunk target
  TOTAL_KB_GZIP: 500, // Total bundle target
} as const
