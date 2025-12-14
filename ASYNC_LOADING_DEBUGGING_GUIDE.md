# 🔄 MASTER PROMPT: INFINITE LOADING STATE & ASYNC OPERATION DEBUGGING

## Production-Grade Debugging & Fix Workflow

---

## 📋 OVERVIEW

This prompt provides a systematic approach to diagnosing and fixing infinite loading states, hanging async operations, and unhandled promise rejections that cause UI to freeze or buttons to remain in loading state indefinitely.

**Applicable to:**
- Infinite loading spinners
- Buttons stuck in loading state
- Hanging API calls
- Unhandled promise rejections
- Race conditions in async operations
- Timeout issues
- Navigation blocking

---

## 🎯 CORE PRINCIPLES

### 1. **Defensive Programming**
- Always assume async operations can fail or hang
- Add timeouts to all network operations
- Use `finally` blocks to ensure cleanup
- Never trust external APIs to respond quickly

### 2. **User Experience First**
- Loading states should never block user indefinitely
- Provide fallback mechanisms
- Show clear error messages
- Allow users to retry or cancel operations

### 3. **Observability**
- Log all async operations
- Track operation durations
- Monitor for hanging operations
- Use error boundaries

---

## 🔍 PHASE 1: DIAGNOSIS & IDENTIFICATION

### Step 1.1: Identify the Symptom

```
1. What exactly is stuck in loading state?
   - Button? Spinner? Entire page?
   - Which specific action triggered it?

2. When does it happen?
   - Always? Intermittently? Specific conditions?
   - What user actions precede it?

3. What should happen instead?
   - Expected completion time?
   - Expected next action (navigation, success message, etc.)?

4. Browser console errors?
   - Check for unhandled promise rejections
   - Network request failures
   - JavaScript errors
```

### Step 1.2: Trace the Code Path

```
1. Find the component showing loading state
   - Search for isLoading state variable
   - Find where setIsLoading(true) is called
   - Find where setIsLoading(false) should be called

2. Identify all async operations in the flow
   - API calls (fetch, supabase, axios)
   - Database operations
   - File uploads
   - Navigation operations
   - State updates

3. Map the execution flow
   - What happens first, second, third?
   - Which operations are sequential vs parallel?
   - Where are error handlers?
```

### Step 1.3: Identify Potential Hanging Points

**Common Hanging Scenarios:**

| Scenario | Symptoms | Common Causes |
|----------|----------|---------------|
| **Network Timeout** | Request never completes | No timeout set, network issues |
| **RPC Function Missing** | RPC call hangs | Function doesn't exist in database |
| **Infinite Loop** | CPU usage high | Recursive calls, state updates |
| **Unhandled Promise** | Promise never resolves/rejects | Missing error handler |
| **Race Condition** | Intermittent hangs | Multiple async operations conflict |
| **Navigation Block** | Page doesn't navigate | Navigation called before state ready |

---

## 🛠️ PHASE 2: ROOT CAUSE ANALYSIS

### Step 2.1: Check Error Handling

```typescript
// ❌ BAD - No error handling, can hang forever
const handleComplete = async () => {
  setIsLoading(true)
  await someAsyncOperation() // If this hangs, loading never stops
  setIsLoading(false)
}

// ✅ GOOD - Proper error handling with finally
const handleComplete = async () => {
  setIsLoading(true)
  try {
    await someAsyncOperation()
  } catch (error) {
    logError(error)
    toast.error('Operation failed')
  } finally {
    setIsLoading(false) // Always executes
  }
}
```

### Step 2.2: Check for Missing Timeouts

```typescript
// ❌ BAD - No timeout, can hang indefinitely
const { data } = await supabase.rpc('some_function', { param: value })

// ✅ GOOD - Timeout protection
const { data } = await Promise.race([
  supabase.rpc('some_function', { param: value }),
  new Promise((_, reject) => 
    setTimeout(() => reject(new Error('Operation timeout')), 5000)
  )
])
```

### Step 2.3: Check for Unhandled Promise Rejections

```typescript
// ❌ BAD - Promise rejection not caught
someAsyncOperation().then(() => {
  setIsLoading(false)
})

// ✅ GOOD - Promise rejection handled
someAsyncOperation()
  .then(() => {
    setIsLoading(false)
  })
  .catch((error) => {
    logError(error)
    setIsLoading(false)
  })
```

### Step 2.4: Check for Early Returns Without Cleanup

```typescript
// ❌ BAD - Early return without resetting loading
const handleComplete = async () => {
  setIsLoading(true)
  if (!validate()) {
    return // Loading never reset!
  }
  // ... rest of code
}

// ✅ GOOD - Always reset in finally or before return
const handleComplete = async () => {
  setIsLoading(true)
  try {
    if (!validate()) {
      return
    }
    // ... rest of code
  } finally {
    setIsLoading(false) // Always executes
  }
}
```

---

## 🔧 PHASE 3: IMPLEMENTATION FIXES

### Step 3.1: Add Timeout Protection

**Pattern 1: Promise.race with Timeout**

```typescript
const operationWithTimeout = async <T>(
  operation: Promise<T>,
  timeoutMs: number = 5000,
  timeoutMessage: string = 'Operation timeout'
): Promise<T> => {
  return Promise.race([
    operation,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs)
    )
  ])
}

// Usage
try {
  const result = await operationWithTimeout(
    supabase.rpc('get_partner_id', { current_user_id: user.id }),
    5000,
    'Partner check timeout'
  )
} catch (error) {
  // Handle timeout or other errors
}
```

**Pattern 2: Wrapper Function**

```typescript
const withTimeout = <T>(
  promise: Promise<T>,
  ms: number,
  errorMessage: string = 'Operation timed out'
): Promise<T> => {
  const timeout = new Promise<T>((_, reject) =>
    setTimeout(() => reject(new Error(errorMessage)), ms)
  )
  return Promise.race([promise, timeout])
}
```

### Step 3.2: Ensure Loading State Always Resets

**Template for Async Functions:**

```typescript
const handleAsyncOperation = async () => {
  setIsLoading(true)
  
  try {
    // Validation (early returns should be before setIsLoading)
    if (!validate()) {
      return // Don't set loading if validation fails early
    }
    
    // Main async operations with timeouts
    const result1 = await withTimeout(operation1(), 5000)
    const result2 = await withTimeout(operation2(), 3000)
    
    // Success handling
    toast.success('Operation completed')
    navigate('/success')
    
  } catch (error) {
    // Error handling
    logError(error, 'handleAsyncOperation')
    
    if (error.message.includes('timeout')) {
      toast.error('Operation timed out. Please try again.')
    } else {
      toast.error(error.message || 'An unexpected error occurred')
    }
    
  } finally {
    // ALWAYS reset loading state
    setIsLoading(false)
  }
}
```

### Step 3.3: Add Error Handling for All Async Operations

```typescript
// For RPC calls
const { data, error } = await supabase.rpc('function_name', params)
if (error) {
  logError(error, 'RPC.function_name')
  // Handle error - don't let it hang
  throw error // Or return early with error state
}

// For database queries
const { data, error } = await supabase
  .from('table_name')
  .select('*')
  .eq('id', id)
  .maybeSingle()

if (error) {
  logError(error, 'Query.table_name')
  // Handle error appropriately
}
```

### Step 3.4: Add Retry Logic (Optional)

```typescript
const retryOperation = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation()
    } catch (error) {
      if (i === maxRetries - 1) throw error
      await new Promise(resolve => setTimeout(resolve, delayMs))
    }
  }
  throw new Error('Max retries exceeded')
}
```

---

## 🧪 PHASE 4: TESTING & VERIFICATION

### Step 4.1: Test Normal Flow

```
✅ Operation completes successfully
✅ Loading state shows during operation
✅ Loading state resets after completion
✅ Success message/action occurs
✅ No console errors
```

### Step 4.2: Test Error Scenarios

```
✅ Network failure - loading resets, error shown
✅ Timeout - loading resets, timeout message shown
✅ Validation failure - loading doesn't start or resets immediately
✅ API error - loading resets, error message shown
✅ Navigation failure - loading resets, error shown
```

### Step 4.3: Test Edge Cases

```
✅ Rapid clicks (prevent double submission)
✅ Component unmounts during operation
✅ Multiple operations in parallel
✅ Very slow network (timeout triggers)
✅ Missing RPC functions (error handled gracefully)
```

### Step 4.4: Browser DevTools Testing

```
1. Open Network tab
   - Throttle to "Slow 3G"
   - Test timeout behavior

2. Open Console
   - Check for unhandled promise rejections
   - Verify error logging

3. React DevTools
   - Monitor state changes
   - Verify isLoading resets

4. Performance tab
   - Check for memory leaks
   - Verify operations complete
```

---

## 📝 PHASE 5: PREVENTION PATTERNS

### Pattern 1: Loading State Hook

```typescript
const useAsyncOperation = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const execute = async <T>(
    operation: () => Promise<T>,
    options: {
      timeoutMs?: number
      onSuccess?: (result: T) => void
      onError?: (error: Error) => void
    } = {}
  ): Promise<T | null> => {
    setIsLoading(true)
    setError(null)

    try {
      const result = options.timeoutMs
        ? await withTimeout(operation(), options.timeoutMs)
        : await operation()

      options.onSuccess?.(result)
      return result
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err))
      setError(error)
      options.onError?.(error)
      return null
    } finally {
      setIsLoading(false)
    }
  }

  return { execute, isLoading, error }
}
```

### Pattern 2: AbortController for Cancellation

```typescript
const useCancellableOperation = () => {
  const abortControllerRef = useRef<AbortController | null>(null)

  const execute = async (operation: (signal: AbortSignal) => Promise<void>) => {
    // Cancel previous operation
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController()

    try {
      await operation(abortControllerRef.current.signal)
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Operation cancelled')
        return
      }
      throw error
    }
  }

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      abortControllerRef.current?.abort()
    }
  }, [])

  return { execute }
}
```

---

## 🚨 COMMON PITFALLS CHECKLIST

### ❌ Don't:
- Set loading state without a `finally` block
- Make async calls without error handling
- Trust external APIs to respond quickly
- Forget to handle promise rejections
- Use async operations without timeouts
- Return early without resetting loading state
- Nest try-catch blocks unnecessarily
- Ignore console errors/warnings

### ✅ Do:
- Always use `finally` to reset loading state
- Add timeouts to all network operations
- Handle all possible error scenarios
- Log errors for debugging
- Provide user feedback on errors
- Test with slow network conditions
- Use abort controllers for cancellable operations
- Monitor operation durations

---

## 🎯 QUICK REFERENCE: FIX TEMPLATE

```typescript
const handleOperation = async () => {
  // Early validation (before setting loading)
  if (!validate()) {
    return
  }

  setIsLoading(true)

  try {
    // Operation 1 with timeout
    const result1 = await Promise.race([
      operation1(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Operation 1 timeout')), 5000)
      )
    ])

    // Operation 2 with timeout
    const result2 = await Promise.race([
      operation2(result1),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Operation 2 timeout')), 3000)
      )
    ])

    // Success
    toast.success('Operation completed')
    navigate('/success')

  } catch (error) {
    // Error handling
    logError(error, 'handleOperation')
    
    if (error.message.includes('timeout')) {
      toast.error('Operation timed out. Please try again.')
    } else {
      toast.error(error.message || 'An unexpected error occurred')
    }

  } finally {
    // ALWAYS reset loading
    setIsLoading(false)
  }
}
```

---

## 📊 DEBUGGING WORKFLOW

1. **Identify** → What's stuck? Where?
2. **Trace** → Follow the code path
3. **Isolate** → Find the hanging operation
4. **Fix** → Add timeout/error handling
5. **Test** → Verify all scenarios
6. **Monitor** → Check logs and performance

---

## 🔗 RELATED ISSUES

- Unhandled Promise Rejections
- Memory Leaks from Unmounted Components
- Race Conditions in State Updates
- Network Request Failures
- Database Connection Timeouts
- Navigation Blocking

---

## 📚 ADDITIONAL RESOURCES

### React-Specific Patterns
- React Error Boundaries for async errors
- useEffect cleanup for async operations
- useCallback/useMemo for preventing unnecessary re-renders

### Supabase-Specific
- RPC function error handling
- Realtime subscription cleanup
- Storage upload timeout handling

### Testing
- Mock slow network responses
- Test timeout scenarios
- Verify loading state resets in all cases

---

Use this prompt to systematically diagnose and fix infinite loading states and hanging async operations.

