/**
 * Mutation Deduplication Utility
 * Prevents duplicate mutations within a time window
 * Mobile-optimized with memory cleanup
 */

interface MutationRecord {
  timestamp: number
  operationType: string
}

class MutationDeduplicator {
  private mutations: Map<string, MutationRecord> = new Map()
  private cleanupInterval: NodeJS.Timeout | null = null

  constructor() {
    // Cleanup old entries every 10 seconds
    this.cleanupInterval = setInterval(() => {
      this.cleanup()
    }, 10000)
  }

  /**
   * Check if a mutation should be allowed
   * @param operationType - Type of operation (e.g., 'accept', 'send', 'cancel')
   * @param key - Unique key for this mutation (e.g., invitationId or email)
   * @param windowMs - Time window in milliseconds (default: 2000ms)
   * @returns true if mutation should proceed, false if duplicate
   */
  shouldAllow(operationType: string, key: string, windowMs: number = 2000): boolean {
    const fullKey = `${operationType}:${key}`
    const now = Date.now()
    const existing = this.mutations.get(fullKey)

    if (existing) {
      const timeSinceLastMutation = now - existing.timestamp
      if (timeSinceLastMutation < windowMs) {
        console.warn(`[MutationDeduplication] Blocked duplicate ${operationType} for ${key}`)
        return false
      }
    }

    // Record this mutation
    this.mutations.set(fullKey, {
      timestamp: now,
      operationType,
    })

    // Auto-cleanup after window expires
    setTimeout(() => {
      this.mutations.delete(fullKey)
    }, windowMs + 1000) // Add 1s buffer

    return true
  }

  /**
   * Manually clear a mutation record (useful after successful completion)
   */
  clear(operationType: string, key: string): void {
    const fullKey = `${operationType}:${key}`
    this.mutations.delete(fullKey)
  }

  /**
   * Clear all mutations for a specific operation type
   */
  clearAll(operationType: string): void {
    const keysToDelete: string[] = []
    this.mutations.forEach((_, key) => {
      if (key.startsWith(`${operationType}:`)) {
        keysToDelete.push(key)
      }
    })
    keysToDelete.forEach((key) => this.mutations.delete(key))
  }

  /**
   * Cleanup old entries (older than 10 seconds)
   */
  private cleanup(): void {
    const now = Date.now()
    const keysToDelete: string[] = []

    this.mutations.forEach((record, key) => {
      if (now - record.timestamp > 10000) {
        keysToDelete.push(key)
      }
    })

    keysToDelete.forEach((key) => this.mutations.delete(key))
  }

  /**
   * Destroy the deduplicator and cleanup
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }
    this.mutations.clear()
  }
}

// Singleton instance
let deduplicatorInstance: MutationDeduplicator | null = null

export function getMutationDeduplicator(): MutationDeduplicator {
  if (!deduplicatorInstance) {
    deduplicatorInstance = new MutationDeduplicator()
  }
  return deduplicatorInstance
}

/**
 * Hook-friendly wrapper for mutation deduplication
 */
export function useMutationDeduplication() {
  const deduplicator = getMutationDeduplicator()

  return {
    shouldAllow: (operationType: string, key: string, windowMs?: number) =>
      deduplicator.shouldAllow(operationType, key, windowMs),
    clear: (operationType: string, key: string) => deduplicator.clear(operationType, key),
    clearAll: (operationType: string) => deduplicator.clearAll(operationType),
  }
}

