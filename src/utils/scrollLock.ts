/**
 * Scroll Lock Manager
 * 
 * Centralized utility to manage body scroll locking.
 * Prevents conflicts when multiple components try to lock/unlock scrolling.
 * Uses reference counting to handle multiple locks correctly.
 * 
 * @example
 * import { lockBodyScroll, unlockBodyScroll } from '@/utils/scrollLock'
 * 
 * useEffect(() => {
 *   lockBodyScroll()
 *   return () => unlockBodyScroll()
 * }, [])
 */

let lockCount = 0
let originalOverflow = ''

/**
 * Lock body scrolling
 * Increments lock count and sets overflow: hidden on body
 */
export function lockBodyScroll(): void {
  if (typeof document === 'undefined') return
  
  lockCount++
  
  if (lockCount === 1) {
    // Store original overflow value
    originalOverflow = document.body.style.overflow || ''
    document.body.style.overflow = 'hidden'
  }
}

/**
 * Unlock body scrolling
 * Decrements lock count and restores original overflow value when count reaches 0
 */
export function unlockBodyScroll(): void {
  if (typeof document === 'undefined') return
  
  lockCount = Math.max(0, lockCount - 1)
  
  if (lockCount === 0) {
    // Restore original overflow value
    document.body.style.overflow = originalOverflow
  }
}

/**
 * Force unlock body scrolling (emergency cleanup)
 * Resets lock count and restores original overflow
 */
export function forceUnlockBodyScroll(): void {
  if (typeof document === 'undefined') return
  
  lockCount = 0
  document.body.style.overflow = originalOverflow || ''
}

/**
 * Get current lock count (for debugging)
 */
export function getLockCount(): number {
  return lockCount
}

// Cleanup on page unload to prevent stuck scroll
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    forceUnlockBodyScroll()
  })
  
  // Also cleanup on visibility change (tab switch)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && lockCount > 0) {
      // Don't unlock, but ensure we can restore later
      originalOverflow = document.body.style.overflow || ''
    }
  })
}

