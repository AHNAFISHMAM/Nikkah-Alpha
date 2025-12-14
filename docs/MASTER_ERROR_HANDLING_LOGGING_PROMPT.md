# ⚠️ MASTER ERROR HANDLING & LOGGING PROMPT
## Production-Grade Error Management and User Feedback

---

## 📋 OVERVIEW

This master prompt provides a comprehensive approach to error handling, logging, and user feedback in production applications. It covers error boundaries, error transformation, logging strategies, and user-friendly error messages.

**Applicable to:**
- Error boundaries
- API error handling
- Form validation errors
- Network error handling
- User-friendly error messages
- Error logging and tracking

---

## 🎯 CORE PRINCIPLES

### 1. **User-Friendly Errors**
- **Transform Technical Errors**: Convert technical errors to user-friendly messages
- **Actionable Messages**: Provide clear next steps
- **Context-Aware**: Show relevant error information
- **No Information Leakage**: Don't expose sensitive information

### 2. **Error Logging**
- **Log with Context**: Include context in error logs
- **Development vs Production**: Different logging strategies
- **Error Tracking**: Integrate with error tracking services
- **Structured Logging**: Use structured log format

### 3. **Error Recovery**
- **Retry Logic**: Retry transient errors
- **Fallback UI**: Show fallback UI for errors
- **Graceful Degradation**: Degrade gracefully on errors

---

## 🔍 PHASE 1: ERROR HANDLING SETUP

### Step 1.1: Error Handler Utility
```typescript
// src/lib/error-handler.ts

export interface ErrorInfo {
  message: string
  code?: string
  status?: number
  userMessage: string
  retryable: boolean
}

const ERROR_MAP: Record<string, Omit<ErrorInfo, 'message' | 'code' | 'status'>> = {
  'Network request failed': {
    userMessage: 'Please check your internet connection and try again.',
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
  '500': {
    userMessage: 'Server error. Please try again later.',
    retryable: true,
  },
}

export function extractErrorInfo(error: unknown): ErrorInfo {
  if (error instanceof Error) {
    const message = error.message
    const code = (error as any).code || (error as any).statusCode

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

    return {
      message,
      code,
      userMessage: 'Something went wrong. Please try again.',
      retryable: true,
    }
  }

  return {
    message: 'Unknown error',
    userMessage: 'An unexpected error occurred. Please try again.',
    retryable: true,
  }
}

export function logError(error: unknown, context?: string): void {
  const errorInfo = extractErrorInfo(error)
  const contextPrefix = context ? `[${context}]` : '[Error]'

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

  if (import.meta.env.PROD) {
    // Send to error tracking service (e.g., Sentry)
    // Sentry.captureException(error, { tags: { context } })
  }
}

export function getUserFriendlyError(error: unknown): string {
  return extractErrorInfo(error).userMessage
}

export function isRetryableError(error: unknown): boolean {
  return extractErrorInfo(error).retryable
}
```

### Step 1.2: Error Boundary Component
```typescript
// src/components/common/ErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react'
import { logError } from '../../lib/error-handler'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logError(error, 'ErrorBoundary')
    // Log to error tracking service
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-4 text-center">
          <h2>Something went wrong</h2>
          <p>Please refresh the page or contact support if the problem persists.</p>
        </div>
      )
    }

    return this.props.children
  }
}
```

---

## 🛠️ PHASE 2: ERROR HANDLING PATTERNS

### Step 2.1: React Query Error Handling
```typescript
const { data, error, isLoading } = useQuery({
  queryKey: ['data'],
  queryFn: async () => {
    const { data, error } = await supabase.from('table').select('*')
    
    if (error) {
      logError(error, 'useData')
      throw error
    }
    
    return data
  },
  onError: (error) => {
    toast.error(getUserFriendlyError(error))
  },
})
```

### Step 2.2: Mutation Error Handling
```typescript
const mutation = useMutation({
  mutationFn: async (data) => {
    const { error } = await supabase.from('table').insert(data)
    if (error) {
      logError(error, 'mutation')
      throw error
    }
  },
  onError: (error) => {
    toast.error(getUserFriendlyError(error))
  },
})
```

### Step 2.3: Error Handling Checklist
- [ ] Errors logged with context
- [ ] User-friendly error messages
- [ ] Error boundaries implemented
- [ ] Retry logic for transient errors
- [ ] Fallback UI for errors
- [ ] No sensitive information exposed

---

## 🎯 SUCCESS CRITERIA

Error handling is complete when:

1. ✅ **Logging**: All errors logged with context
2. ✅ **User Messages**: User-friendly error messages
3. ✅ **Error Boundaries**: Error boundaries implemented
4. ✅ **Recovery**: Retry logic for transient errors
5. ✅ **Security**: No sensitive information exposed

---

## 🚨 COMMON PITFALLS

### ❌ Don't:
- Show technical error messages to users
- Ignore errors
- Expose sensitive information
- Skip error logging
- Forget error boundaries

### ✅ Do:
- Transform errors to user-friendly messages
- Log all errors with context
- Protect sensitive information
- Implement error boundaries
- Provide retry options

---

**This master prompt should be followed for ALL error handling work.**

