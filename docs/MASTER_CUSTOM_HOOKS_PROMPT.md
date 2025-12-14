# 🎣 MASTER CUSTOM HOOKS DEVELOPMENT PROMPT
## Production-Grade Reusable Hook Patterns

---

## 📋 OVERVIEW

This master prompt provides a comprehensive approach to building custom React hooks that are reusable, performant, type-safe, and follow React best practices. It covers hook composition, performance optimization, error handling, and integration patterns.

**Applicable to:**
- Data fetching hooks
- Real-time subscription hooks
- Form state hooks
- UI state hooks
- Utility hooks
- Composite hooks

---

## 🎯 CORE PRINCIPLES

### 1. **Single Responsibility**
- Each hook should do one thing well
- Compose hooks for complex functionality
- Keep hooks focused and reusable

### 2. **Performance Optimization**
- Memoize expensive computations
- Memoize callbacks with useCallback
- Use refs to avoid unnecessary re-renders
- Clean up effects properly

### 3. **Type Safety**
- Full TypeScript coverage
- Proper generic types
- Type-safe return values
- Type-safe parameters

### 4. **Error Handling**
- Handle errors gracefully
- Provide error states
- Log errors with context
- Return error information

---

## 🔍 PHASE 1: HOOK DESIGN

### Step 1.1: Identify Hook Purpose
```
1. What does the hook do?
2. What data/state does it manage?
3. What side effects does it handle?
4. What does it return?
5. What parameters does it need?
```

### Step 1.2: Plan Hook API
```
1. Input parameters (props)
2. Return values (state, functions, etc.)
3. Error states
4. Loading states
5. Cleanup requirements
```

---

## 🛠️ PHASE 2: HOOK IMPLEMENTATION

### Step 2.1: Basic Hook Pattern
```typescript
import { useState, useEffect, useCallback, useRef } from 'react'

/**
 * Custom hook for [purpose]
 * 
 * @param param1 - Description of param1
 * @param param2 - Description of param2
 * @returns Object with state and functions
 */
export function useCustomHook(param1: string, param2?: number) {
  // Refs
  const mountedRef = useRef(true)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // State
  const [data, setData] = useState<DataType | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  // Memoized callbacks
  const handleAction = useCallback(() => {
    // Handler logic
  }, [dependencies])

  // Effects
  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  useEffect(() => {
    // Effect logic
    return () => {
      // Cleanup
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [dependencies])

  return {
    data,
    isLoading,
    error,
    handleAction,
  }
}
```

### Step 2.2: Data Fetching Hook Pattern
```typescript
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { logError } from '../lib/error-handler'
import { useAuth } from '../contexts/AuthContext'

/**
 * Hook to fetch user profile
 * 
 * @returns Query result with profile data
 */
export function useProfile() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null
      if (!supabase) throw new Error('Supabase is not configured')

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()

      if (error) {
        logError(error, 'useProfile')
        throw error
      }

      return data
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  })
}
```

### Step 2.3: Real-time Hook Pattern
```typescript
import { useEffect, useRef, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import type { RealtimeChannel } from '@supabase/supabase-js'

/**
 * Hook to subscribe to real-time updates
 * 
 * @returns void (side effect only)
 */
export function useRealtimeUpdates() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const channelRef = useRef<RealtimeChannel | null>(null)
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const isMountedRef = useRef(true)

  // Debounced invalidation
  const debouncedInvalidate = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }
    debounceTimerRef.current = setTimeout(() => {
      if (isMountedRef.current) {
        queryClient.invalidateQueries({ queryKey: ['data', user?.id] })
      }
    }, 300)
  }, [queryClient, user?.id])

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  useEffect(() => {
    if (!user?.id || !supabase) return

    // Cleanup existing channel
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current)
      channelRef.current = null
    }

    const channel = supabase
      .channel(`updates-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'table_name',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (!isMountedRef.current) return
          debouncedInvalidate()
        }
      )
      .subscribe()

    channelRef.current = channel

    return () => {
      isMountedRef.current = false
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
    }
  }, [user?.id, queryClient, debouncedInvalidate])
}
```

### Step 2.4: Composite Hook Pattern
```typescript
/**
 * Composite hook that combines multiple hooks
 */
export function useProfileWithRealtime() {
  const profileQuery = useProfile()
  useRealtimeProfile() // Side effect hook

  return profileQuery
}
```

### Step 2.5: Hook Checklist
- [ ] Single responsibility
- [ ] TypeScript types defined
- [ ] JSDoc comments added
- [ ] Performance optimized (memoization)
- [ ] Error handling implemented
- [ ] Cleanup in effects
- [ ] Mounted ref to prevent updates after unmount
- [ ] Proper dependency arrays

---

## 🎯 SUCCESS CRITERIA

A custom hook is complete when:

1. ✅ **Functionality**: Hook works correctly
2. ✅ **Type Safety**: Full TypeScript coverage
3. ✅ **Performance**: Optimized with memoization
4. ✅ **Error Handling**: Errors handled gracefully
5. ✅ **Cleanup**: All effects cleaned up properly
6. ✅ **Documentation**: JSDoc comments added
7. ✅ **Reusability**: Hook is reusable across components

---

## 🚨 COMMON PITFALLS

### ❌ Don't:
- Forget cleanup in effects
- Skip memoization for expensive operations
- Ignore error handling
- Use stale closures
- Forget mounted ref for async operations
- Skip TypeScript types

### ✅ Do:
- Clean up all effects
- Memoize expensive computations
- Handle errors gracefully
- Use refs for latest values
- Check mounted state before updates
- Type everything

---

**This master prompt should be followed for ALL custom hook development work.**

