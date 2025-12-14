import { useState, useEffect, useRef, useCallback } from 'react'
import { logError, extractErrorInfo, getUserFriendlyError, isRetryableError } from '../lib/error-handler'

export interface UseImagePreloadOptions {
  /** Image URL to preload */
  src: string | null
  /** Whether to enable preloading (default: true) */
  enabled?: boolean
  /** Timeout in milliseconds (default: 10000) */
  timeout?: number
}

export interface UseImagePreloadReturn {
  /** Whether the image has loaded successfully */
  isLoaded: boolean
  /** Whether an error occurred during loading */
  hasError: boolean
  /** Whether the image is currently loading */
  isLoading: boolean
  /** User-friendly error message (if error occurred) */
  errorMessage: string | null
  /** Whether the error is retryable */
  isRetryable: boolean
  /** Manually retry loading the image */
  retry: () => void
}

/**
 * Custom hook for preloading images with error handling and retry logic
 * 
 * Follows MASTER_CUSTOM_HOOKS_PROMPT patterns:
 * - Single responsibility: handles image preloading only
 * - Performance: uses refs to avoid unnecessary re-renders
 * - Error handling: logs errors with context
 * - Type safety: full TypeScript coverage
 * 
 * @param options - Configuration options for image preloading
 * @returns Object with loading state and retry function
 * 
 * @example
 * ```tsx
 * const { isLoaded, hasError, retry } = useImagePreload({
 *   src: '/images/background.jpg',
 *   timeout: 5000
 * })
 * ```
 */
export function useImagePreload({
  src,
  enabled = true,
  timeout = 10000,
}: UseImagePreloadOptions): UseImagePreloadReturn {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isRetryable, setIsRetryable] = useState(false)
  
  // Refs for cleanup and mounted state (MASTER_CUSTOM_HOOKS_PROMPT: use refs to avoid unnecessary re-renders)
  const mountedRef = useRef(true)
  const imageRef = useRef<HTMLImageElement | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Memoized cleanup function (MASTER_CUSTOM_HOOKS_PROMPT: memoize callbacks)
  const cleanup = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    
    if (imageRef.current) {
      imageRef.current.onload = null
      imageRef.current.onerror = null
      imageRef.current = null
    }
  }, [])

  // Memoized image loading function (MASTER_CUSTOM_HOOKS_PROMPT: memoize callbacks)
  const loadImage = useCallback(() => {
    if (!src || !enabled || typeof document === 'undefined') {
      return
    }

    // Reset state
    setIsLoaded(false)
    setHasError(false)
    setIsLoading(true)
    cleanup()

    const img = new Image()
    imageRef.current = img

    // Phase 4: TypeScript Patterns - Explicit return type
    const handleLoad = (): void => {
      if (!mountedRef.current) return
      
      cleanup()
      setIsLoaded(true)
      setHasError(false)
      setIsLoading(false)
    }

    // Phase 4: TypeScript Patterns - Explicit parameter type
    const handleError = (error: Event | string): void => {
      if (!mountedRef.current) return
      
      cleanup()
      
      // Phase 2: Error Handling - Transform technical errors to user-friendly messages
      const technicalError = typeof error === 'string' 
        ? new Error(error)
        : new Error('Failed to load image')
      
      // Extract error info with user-friendly message (MASTER_ERROR_HANDLING_PROMPT)
      const errorInfo = extractErrorInfo(technicalError)
      const userFriendlyMsg = errorInfo.userMessage
      const canRetry = errorInfo.retryable
      
      // Log error with structured context (MASTER_ERROR_HANDLING_PROMPT: log with context)
      logError(technicalError, `useImagePreload`)
      
      // Set error state with user-friendly message
      setErrorMessage(userFriendlyMsg)
      setIsRetryable(canRetry)
      setHasError(true)
      setIsLoaded(false)
      setIsLoading(false)
    }

    // Set timeout
    timeoutRef.current = setTimeout(() => {
      if (!mountedRef.current) return
      handleError('Image loading timeout')
    }, timeout)

    img.onload = handleLoad
    img.onerror = handleError
    img.src = src
  }, [src, enabled, timeout, cleanup])

  // Memoized retry function (MASTER_CUSTOM_HOOKS_PROMPT: memoize callbacks)
  // Phase 2: Error Handling - Retry logic for transient errors
  const retry = useCallback(() => {
    if (!isRetryable) return
    
    // Reset error state before retry
    setErrorMessage(null)
    setHasError(false)
    setIsRetryable(false)
    loadImage()
  }, [loadImage, isRetryable])

  // Effect for loading image (MASTER_CUSTOM_HOOKS_PROMPT: clean up effects properly)
  useEffect(() => {
    mountedRef.current = true
    loadImage()

    return () => {
      mountedRef.current = false
      cleanup()
    }
  }, [loadImage, cleanup])

  return {
    isLoaded,
    hasError,
    isLoading,
    errorMessage,
    isRetryable,
    retry,
  }
}

