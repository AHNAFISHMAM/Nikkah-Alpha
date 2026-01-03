/**
 * Environment Configuration
 * Centralized environment variables and configuration management
 */

export const ENV = {
  MODE: import.meta.env.MODE,
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  isStaging: import.meta.env.MODE === 'staging',
} as const

export const SUPABASE_CONFIG = {
  url: import.meta.env.VITE_SUPABASE_URL,
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
} as const

export const SITE_CONFIG = {
  url: import.meta.env.VITE_SITE_URL || 'http://localhost:5173',
  name: 'Nikkah Alpha',
  description: 'Comprehensive Islamic marriage preparation platform',
} as const

export const API_CONFIG = {
  timeout: ENV.isProduction ? 30000 : 60000, // 30s prod, 60s dev
  retries: ENV.isProduction ? 3 : 1,
} as const

export const CACHE_CONFIG = {
  // React Query stale time (how long data is considered fresh)
  staleTime: ENV.isProduction ? 60000 : 30000, // 1min prod, 30s dev
  // Cache time (how long unused data stays in cache)
  cacheTime: ENV.isProduction ? 300000 : 60000, // 5min prod, 1min dev
} as const

export const FEATURE_FLAGS = {
  enableAnalytics: ENV.isProduction,
  enableErrorTracking: ENV.isProduction,
  enablePerformanceMonitoring: ENV.isProduction,
  enableDebugMode: ENV.isDevelopment,
  enableDevTools: ENV.isDevelopment,
} as const

export const RATE_LIMITS = {
  // API rate limiting
  apiRequestsPerMinute: ENV.isProduction ? 60 : 300,
  // Form submission
  formsPerMinute: 10,
} as const

/**
 * Validate required environment variables
 * Throws error if critical variables are missing
 */
export function validateEnvironment(): void {
  const required = {
    VITE_SUPABASE_URL: SUPABASE_CONFIG.url,
    VITE_SUPABASE_ANON_KEY: SUPABASE_CONFIG.anonKey,
  }

  const missing: string[] = []

  for (const [key, value] of Object.entries(required)) {
    if (!value) {
      missing.push(key)
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables:\n${missing.join('\n')}\n\n` +
        `Please check your .env file and ensure all required variables are set.`
    )
  }

  // Validate URL format
  try {
    new URL(SUPABASE_CONFIG.url!)
  } catch {
    throw new Error(`Invalid VITE_SUPABASE_URL: ${SUPABASE_CONFIG.url}`)
  }
}

// Run validation on module load
if (ENV.isProduction) {
  validateEnvironment()
}
