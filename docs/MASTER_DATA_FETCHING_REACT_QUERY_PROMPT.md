# 🔄 MASTER DATA FETCHING & REACT QUERY PROMPT
## Production-Grade Data Fetching, Caching, and State Management Workflow

---

## 📋 OVERVIEW

This master prompt provides a comprehensive, systematic approach to implementing data fetching with React Query (TanStack Query) in production applications. It covers query patterns, mutations, cache management, optimistic updates, error handling, and performance optimization.

**Applicable to:**
- Data fetching hooks (`useQuery`, `useInfiniteQuery`)
- Data mutation hooks (`useMutation`)
- Cache management and invalidation
- Optimistic updates
- Real-time cache synchronization
- Error handling and retry logic
- Performance optimization
- Type-safe query implementations

---

## 🎯 CORE PRINCIPLES

### 1. **Query Client Configuration**
- **Centralized Configuration**: Single `queryClient` instance with sensible defaults
- **Retry Logic**: Smart retry strategies (don't retry 4xx errors)
- **Stale Time**: Balance between freshness and performance
- **Cache Time**: Keep data in cache for reasonable duration
- **Network Mode**: Handle offline scenarios gracefully

### 2. **Query Key Management**
- **Hierarchical Keys**: Use arrays for hierarchical cache structure
- **Include Dependencies**: Include all variables that affect the query
- **Consistent Naming**: Use consistent naming conventions
- **Type Safety**: Use `as const` for query keys when possible

### 3. **Error Handling**
- **Always Handle Errors**: Never ignore errors
- **User-Friendly Messages**: Transform technical errors to user-friendly messages
- **Error Logging**: Log errors with context for debugging
- **Retry Strategy**: Retry transient errors, don't retry permanent failures

### 4. **Performance Optimization**
- **Selective Refetching**: Only refetch when necessary
- **Stale Time**: Use appropriate stale times to reduce unnecessary fetches
- **Cache Invalidation**: Invalidate related queries on mutations
- **Optimistic Updates**: Update UI immediately for better UX

---

## 🔍 PHASE 1: QUERY CLIENT SETUP

### Step 1.1: Query Client Configuration
```typescript
// src/lib/queryClient.ts
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes - data is fresh for 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes - keep in cache for 30 minutes
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors (client errors)
        if (error instanceof Error && error.message.includes('4')) {
          return false
        }
        return failureCount < 2 // Retry up to 2 times for other errors
      },
      refetchOnWindowFocus: false, // Don't refetch on window focus
      refetchOnReconnect: true, // Refetch when connection restored
      refetchOnMount: false, // Don't refetch on mount if data is fresh
      networkMode: 'online', // Only fetch when online
    },
    mutations: {
      retry: 1, // Retry mutations once
      networkMode: 'online',
    },
  },
})
```

### Step 1.2: Query Client Checklist
- [ ] Query client configured with sensible defaults
- [ ] Retry logic handles 4xx errors correctly
- [ ] Stale time set appropriately
- [ ] Cache time (gcTime) set appropriately
- [ ] Network mode configured
- [ ] Refetch strategies configured

---

## 📊 PHASE 2: QUERY IMPLEMENTATION

### Step 2.1: Basic Query Pattern
```typescript
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { logError } from '../lib/error-handler'
import { useAuth } from '../contexts/AuthContext'
import type { Database } from '../types/database'

type Profile = Database['public']['Tables']['profiles']['Row']

export function useProfile() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['profile', user?.id], // Include user ID in key
    queryFn: async (): Promise<Profile | null> => {
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

      return data as Profile | null
    },
    enabled: !!user?.id, // Only run query when user is available
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
```

### Step 2.2: Query with Joins
```typescript
export function useChecklist() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['checklist', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated')
      if (!supabase) throw new Error('Supabase is not configured')

      const { data, error } = await supabase
        .from('checklist_categories')
        .select(`
          *,
          checklist_items (
            *,
            user_checklist_progress (*)
          )
        `)
        .order('sort_order')

      if (error) {
        logError(error, 'Checklist.fetchChecklist')
        throw error
      }

      // Type-safe handling of nested relations
      return (data || []).map(cat => ({
        ...cat,
        checklist_items: Array.isArray(cat.checklist_items) 
          ? cat.checklist_items 
          : [],
      }))
    },
    enabled: !!user,
    staleTime: 60000, // 1 minute
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    gcTime: 300000, // 5 minutes cache
  })
}
```

### Step 2.3: Query with Pagination
```typescript
export function useResources(page: number = 0, pageSize: number = 20) {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['resources', user?.id, page, pageSize],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated')
      if (!supabase) throw new Error('Supabase is not configured')

      const { data, error, count } = await supabase
        .from('resources')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(page * pageSize, (page + 1) * pageSize - 1)

      if (error) {
        logError(error, 'Resources.fetchResources')
        throw error
      }

      return {
        data: data || [],
        count: count || 0,
        totalPages: Math.ceil((count || 0) / pageSize),
      }
    },
    enabled: !!user,
    staleTime: 0, // Always refetch
    gcTime: 300000, // 5 minutes cache
  })
}
```

### Step 2.4: Query Options Best Practices

#### ✅ DO:
- Include all dependencies in query key
- Use `enabled` to conditionally run queries
- Set appropriate `staleTime` based on data freshness needs
- Handle errors with `logError`
- Return null/empty array for missing data
- Use TypeScript types from Database schema

#### ❌ DON'T:
- Accept `user_id` as parameter (security risk)
- Ignore errors
- Use `staleTime: 0` for all queries (performance impact)
- Refetch on every mount (use `refetchOnMount: false`)
- Forget to handle null/undefined results

### Step 2.5: Query Checklist
- [ ] Query key includes all dependencies
- [ ] Error handling implemented
- [ ] TypeScript types used
- [ ] `enabled` option used when needed
- [ ] Appropriate `staleTime` set
- [ ] Appropriate `gcTime` set
- [ ] Retry logic configured
- [ ] User ID from auth context (not parameter)

---

## 🔄 PHASE 3: MUTATION IMPLEMENTATION

### Step 3.1: Basic Mutation Pattern
```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { logError } from '../lib/error-handler'
import { getUserFriendlyError } from '../lib/error-handler'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'
import type { Profile, ProfileUpdate } from '../types/database'

export function useUpdateProfile() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (updates: ProfileUpdate): Promise<Profile> => {
      if (!user?.id) throw new Error('User not authenticated')
      if (!supabase) throw new Error('Supabase is not configured')

      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single()

      if (error) {
        logError(error, 'useUpdateProfile')
        throw error
      }

      return data as Profile
    },
    onSuccess: (data) => {
      // Update React Query cache
      if (user?.id) {
        queryClient.setQueryData(['profile', user.id], data)
      }
      toast.success('Profile updated!')
    },
    onError: (error: Error) => {
      toast.error(getUserFriendlyError(error))
    },
  })
}
```

### Step 3.2: Mutation with Optimistic Updates
```typescript
export function useToggleFavorite() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ resourceId, isFavorite }: { resourceId: string; isFavorite: boolean }) => {
      if (!user?.id) throw new Error('User not authenticated')
      if (!supabase) throw new Error('Supabase is not configured')

      if (isFavorite) {
        // Remove favorite
        const { error } = await supabase
          .from('user_resource_favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('resource_id', resourceId)

        if (error) {
          logError(error, 'Resources.toggleFavorite')
          throw error
        }
      } else {
        // Add favorite
        const { error } = await supabase
          .from('user_resource_favorites')
          .insert({
            user_id: user.id,
            resource_id: resourceId,
          })

        if (error) {
          logError(error, 'Resources.toggleFavorite')
          throw error
        }
      }
    },
    onMutate: async ({ resourceId, isFavorite }) => {
      // Cancel outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: ['resources', user?.id] })

      // Snapshot previous value for rollback
      if (!user) return { previousResources: undefined }
      
      const previousResources = queryClient.getQueryData(['resources', user.id])

      // Optimistically update the UI
      queryClient.setQueryData(['resources', user.id], (old: any) => {
        if (!old) return old
        return old.map((resource: any) => {
          if (resource.id === resourceId) {
            return {
              ...resource,
              user_resource_favorites: isFavorite 
                ? []  // Remove favorite
                : [{ id: `temp-${Date.now()}`, user_id: user.id, resource_id: resourceId }]  // Add favorite
            }
          }
          return resource
        })
      })

      return { previousResources }
    },
    onError: (error, _variables, context) => {
      // Rollback optimistic update on error
      if (context?.previousResources && user?.id) {
        queryClient.setQueryData(['resources', user.id], context.previousResources)
      }
      logError(error, 'Resources.toggleFavorite')
      toast.error(`❌ ${getUserFriendlyError(error)}`)
    },
    onSuccess: (_, { isFavorite }) => {
      // Invalidate queries to refetch fresh data
      queryClient.invalidateQueries({ queryKey: ['resources', user?.id] })
      queryClient.invalidateQueries({ queryKey: ['favorite-resources', user?.id] })
      toast.success(isFavorite ? '⭐ Removed from favorites' : '⭐ Added to favorites')
    },
  })
}
```

### Step 3.3: When to Use Optimistic Updates

**Always Use Optimistic Updates For:**
- Toggle actions (favorite, like, complete)
- Quick actions (mark as read, delete)
- User-initiated changes (profile updates, settings)
- Actions with high success probability

**Example: Profile Update with Optimistic Update**
```typescript
export function useUpdateProfile() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (updates: ProfileUpdate): Promise<Profile> => {
      if (!user?.id) throw new Error('User not authenticated')
      if (!supabase) throw new Error('Supabase is not configured')

      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single()

      if (error) {
        logError(error, 'useUpdateProfile')
        throw error
      }

      return data as Profile
    },
    onMutate: async (updates) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['profile', user?.id] })

      // Snapshot previous value
      const previousProfile = queryClient.getQueryData(['profile', user?.id])

      // Optimistically update
      if (user?.id && previousProfile) {
        queryClient.setQueryData(['profile', user.id], (old: Profile) => ({
          ...old,
          ...updates,
        }))
      }

      return { previousProfile }
    },
    onError: (error, _variables, context) => {
      // Rollback on error
      if (context?.previousProfile && user?.id) {
        queryClient.setQueryData(['profile', user.id], context.previousProfile)
      }
      toast.error(getUserFriendlyError(error))
    },
    onSuccess: (data) => {
      // Update with server response
      if (user?.id) {
        queryClient.setQueryData(['profile', user.id], data)
      }
      toast.success('Profile updated!')
    },
  })
}
```

**Optimistic Update Checklist:**
- [ ] `onMutate` cancels outgoing queries
- [ ] `onMutate` snapshots previous state
- [ ] `onMutate` optimistically updates cache
- [ ] `onError` rolls back on failure
- [ ] `onSuccess` updates with server response
- [ ] Error handling with user-friendly messages

### Step 3.4: Mutation with Multiple Cache Updates
```typescript
export function useUpdateWeddingBudget() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (updates: WeddingBudgetUpdate): Promise<WeddingBudget> => {
      if (!user?.id) throw new Error('User not authenticated')
      if (!supabase) throw new Error('Supabase is not configured')

      const { data, error } = await supabase
        .from('wedding_budgets')
        .upsert(
          {
            user_id: user.id,
            ...updates,
          },
          {
            onConflict: 'user_id',
          }
        )
        .select()
        .single()

      if (error) {
        logError(error, 'useUpdateWeddingBudget')
        throw error
      }

      return data as WeddingBudget
    },
    onSuccess: () => {
      // Invalidate multiple related queries
      queryClient.invalidateQueries({ queryKey: ['wedding-budget', user?.id] })
      queryClient.invalidateQueries({ queryKey: ['progress-stats', user?.id] })
      toast.success('Wedding budget saved! 💒')
    },
    onError: (error: Error) => {
      toast.error(getUserFriendlyError(error))
    },
  })
}
```

### Step 3.5: Mutation Best Practices

#### ✅ DO:
- Update cache on success
- Use optimistic updates for better UX
- Invalidate related queries
- Handle errors gracefully
- Show user feedback (toast notifications)
- Rollback optimistic updates on error

#### ❌ DON'T:
- Ignore errors
- Forget to update cache
- Skip optimistic updates for instant feedback
- Invalidate too many queries (performance impact)
- Show technical error messages to users

### Step 3.6: Mutation Checklist
- [ ] Error handling implemented
- [ ] Cache updated on success
- [ ] Related queries invalidated
- [ ] Optimistic updates (if applicable)
- [ ] Rollback on error (if optimistic)
- [ ] User feedback (toast notifications)
- [ ] User ID from auth context (not parameter)

---

## 🔄 PHASE 4: CACHE MANAGEMENT

### Step 4.1: Cache Invalidation Patterns

#### Pattern 1: Invalidate Single Query
```typescript
queryClient.invalidateQueries({ queryKey: ['profile', user?.id] })
```

#### Pattern 2: Invalidate All Queries with Prefix
```typescript
queryClient.invalidateQueries({ queryKey: ['resources'] })
// Invalidates all queries starting with ['resources']
```

#### Pattern 3: Invalidate Multiple Related Queries
```typescript
// After updating budget, invalidate related stats
queryClient.invalidateQueries({ queryKey: ['budget', user?.id] })
queryClient.invalidateQueries({ queryKey: ['progress-stats', user?.id] })
```

#### Pattern 4: Update Cache Directly
```typescript
// Update cache without refetching
queryClient.setQueryData(['profile', user.id], (old) => ({
  ...old,
  first_name: newFirstName,
}))
```

### Step 4.2: Cache Invalidation Checklist
- [ ] Related queries invalidated on mutations
- [ ] Cache updated directly when appropriate
- [ ] Not invalidating too many queries (performance)
- [ ] Invalidation happens in `onSuccess` callback
- [ ] Real-time updates trigger invalidation

---

## ⚡ PHASE 5: PERFORMANCE OPTIMIZATION

### Step 5.1: Stale Time Strategy
```typescript
// Frequently changing data - short stale time
staleTime: 0, // Always refetch

// Moderately changing data - medium stale time
staleTime: 60000, // 1 minute

// Rarely changing data - long stale time
staleTime: 5 * 60 * 1000, // 5 minutes
```

### Step 5.2: Selective Refetching
```typescript
// Don't refetch on mount if data is fresh
refetchOnMount: false

// Don't refetch on window focus
refetchOnWindowFocus: false

// Refetch when connection restored
refetchOnReconnect: true
```

### Step 5.3: Query Key Optimization
```typescript
// ✅ CORRECT - Include all dependencies
queryKey: ['resources', user?.id, filter, sortBy]

// ❌ WRONG - Missing dependencies
queryKey: ['resources', user?.id]
```

### Step 5.4: Performance Checklist
- [ ] Appropriate stale times set
- [ ] Selective refetching configured
- [ ] Query keys include all dependencies
- [ ] Not refetching unnecessarily
- [ ] Cache invalidation optimized
- [ ] Optimistic updates used where appropriate

---

## 🔄 PHASE 6: REAL-TIME CACHE SYNCHRONIZATION

### Step 6.1: Real-time Invalidation Pattern
```typescript
import { useEffect, useRef, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import type { RealtimeChannel } from '@supabase/supabase-js'

export function useRealtimeChecklist() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const channelRef = useRef<RealtimeChannel | null>(null)
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const isMountedRef = useRef(true)

  // Debounced invalidation to prevent rapid updates
  const debouncedInvalidate = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }
    debounceTimerRef.current = setTimeout(() => {
      if (isMountedRef.current) {
        queryClient.invalidateQueries({ queryKey: ['checklist', user?.id] })
        queryClient.invalidateQueries({ queryKey: ['progress-stats', user?.id] })
      }
    }, 300) // 300ms debounce
  }, [queryClient, user?.id])

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  useEffect(() => {
    if (!user?.id || !supabase) return

    // Cleanup any existing channel
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current)
      channelRef.current = null
    }

    const channel = supabase
      .channel(`checklist-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_checklist_progress',
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

### Step 6.2: Real-time Checklist
- [ ] Channel cleanup on unmount
- [ ] Debounced invalidation (prevent rapid updates)
- [ ] Filter to user's data only
- [ ] Mounted ref to prevent updates after unmount
- [ ] Multiple related queries invalidated
- [ ] Error handling for connection issues

---

## 🎯 SUCCESS CRITERIA

A React Query implementation is complete when:

1. ✅ **Queries**: All queries properly typed and error handled
2. ✅ **Mutations**: Mutations update cache and invalidate related queries
3. ✅ **Optimistic Updates**: Used where appropriate for better UX
4. ✅ **Error Handling**: All errors handled with user-friendly messages
5. ✅ **Performance**: Appropriate stale times and selective refetching
6. ✅ **Real-time**: Real-time updates trigger cache invalidation
7. ✅ **Type Safety**: Full TypeScript coverage
8. ✅ **Security**: User ID from auth context, not parameters

---

## 🚨 COMMON PITFALLS

### ❌ Don't:
- Accept `user_id` as parameter (security risk)
- Ignore errors
- Refetch on every mount
- Invalidate too many queries
- Skip optimistic updates
- Forget to clean up real-time subscriptions
- Use `staleTime: 0` for all queries

### ✅ Do:
- Use user.id from auth context
- Handle all errors
- Use appropriate stale times
- Invalidate related queries only
- Use optimistic updates for instant feedback
- Clean up real-time subscriptions
- Debounce real-time invalidations

---

**This master prompt should be followed for ALL React Query data fetching work.**

