/**
 * Client-only utilities
 * Ensures code only runs in the browser, not on server
 */

/**
 * Check if code is running in the browser (client-side)
 */
export const isClient = typeof window !== 'undefined'

/**
 * Check if code is running on the server
 */
export const isServer = typeof window === 'undefined'

/**
 * Execute a function only on the client side
 * @param fn Function to execute
 * @param fallback Fallback value if running on server
 */
export function clientOnly<T>(fn: () => T, fallback?: T): T | undefined {
  if (isClient) {
    return fn()
  }
  return fallback
}

/**
 * Guard to ensure code only runs on client
 * Throws error if called on server
 */
export function requireClient(): void {
  if (isServer) {
    throw new Error('This code can only run on the client side')
  }
}

/**
 * Safe access to window object
 */
export const safeWindow = isClient ? window : null

/**
 * Safe access to localStorage
 */
export const safeLocalStorage = isClient ? window.localStorage : null

/**
 * Safe access to sessionStorage
 */
export const safeSessionStorage = isClient ? window.sessionStorage : null

