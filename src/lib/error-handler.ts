/**
 * Comprehensive error handling utilities with user-friendly messages
 */

export interface ErrorInfo {
  message: string
  code?: string
  status?: number
  userMessage: string
  retryable: boolean
}

/**
 * Map technical errors to user-friendly messages
 */
const ERROR_MAP: Record<string, Omit<ErrorInfo, 'message' | 'code' | 'status'>> = {
  'Network request failed': {
    userMessage: 'Please check your internet connection and try again.',
    retryable: true,
  },
  'Failed to fetch': {
    userMessage: 'Unable to connect to the server. Please check your connection.',
    retryable: true,
  },
  '401': {
    userMessage: 'Your session has expired. Please log in again.',
    retryable: false,
  },
  '403': {
    userMessage: "You don't have permission to perform this action.",
    retryable: false,
  },
  '404': {
    userMessage: 'The requested resource was not found.',
    retryable: false,
  },
  '409': {
    userMessage: 'This information already exists. Please refresh the page or try again.',
    retryable: true,
  },
  '500': {
    userMessage: 'Server error. Please try again later.',
    retryable: true,
  },
  '503': {
    userMessage: 'Service temporarily unavailable. Please try again later.',
    retryable: true,
  },
  'PGRST116': {
    userMessage: 'The requested item was not found.',
    retryable: false,
  },
  'PGRST301': {
    userMessage: 'You do not have permission to access this resource.',
    retryable: false,
  },
  '23505': {
    userMessage: 'This item already exists. Please use a different value.',
    retryable: false,
  },
  '23503': {
    userMessage: 'Cannot delete this item because it is being used elsewhere.',
    retryable: false,
  },
  'Failed to load image': {
    userMessage: 'Unable to load image. Please check your connection and try again.',
    retryable: true,
  },
  'Image loading timeout': {
    userMessage: 'Image is taking too long to load. Please check your connection and try again.',
    retryable: true,
  },
}

/**
 * Extract error information from various error types
 */
export function extractErrorInfo(error: unknown): ErrorInfo {
  // Handle Error objects
  if (error instanceof Error) {
    const message = error.message
    const code = (error as any).code || (error as any).statusCode

    // Check for specific error patterns
    for (const [key, info] of Object.entries(ERROR_MAP)) {
      if (message.includes(key) || code === key) {
        return {
          message,
          code,
          userMessage: info.userMessage,
          retryable: info.retryable,
        }
      }
    }

    // Check for HTTP status codes in message
    const statusMatch = message.match(/\b([45]\d{2})\b/)
    if (statusMatch) {
      const status = parseInt(statusMatch[1], 10)
      const statusInfo = ERROR_MAP[status.toString()]
      if (statusInfo) {
        return {
          message,
          code,
          status,
          userMessage: statusInfo.userMessage,
          retryable: statusInfo.retryable,
        }
      }
    }

    // Default error message
    return {
      message,
      code,
      userMessage: 'Something went wrong. Please try again.',
      retryable: true,
    }
  }

  // Handle Supabase errors
  if (error && typeof error === 'object' && 'message' in error) {
    const supabaseError = error as { message: string; code?: string; status?: number }
    return extractErrorInfo(new Error(supabaseError.message))
  }

  // Handle string errors
  if (typeof error === 'string') {
    return extractErrorInfo(new Error(error))
  }

  // Unknown error type
  return {
    message: 'Unknown error',
    userMessage: 'An unexpected error occurred. Please try again.',
    retryable: true,
  }
}

/**
 * Log error with context
 * Compatible with both error-handler and logger patterns
 */
export function logError(error: unknown, context?: string): void {
  const errorInfo = extractErrorInfo(error)
  const contextPrefix = context ? `[${context}]` : '[Error]'

  // Only log in development to avoid exposing errors in production
  if (import.meta.env.DEV) {
    console.error(`${contextPrefix}`, {
      message: errorInfo.message,
      code: errorInfo.code,
      status: errorInfo.status,
      userMessage: errorInfo.userMessage,
      retryable: errorInfo.retryable,
      error,
    })
  }

  // In production, send to error tracking service (e.g., Sentry, LogRocket)
  if (import.meta.env.PROD) {
    // Example: Sentry.captureException(error, { tags: { context } })
  }
}

/**
 * Get user-friendly error message
 */
export function getUserFriendlyError(error: unknown): string {
  return extractErrorInfo(error).userMessage
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error: unknown): boolean {
  return extractErrorInfo(error).retryable
}

