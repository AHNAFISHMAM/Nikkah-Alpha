# 🔴 MASTER REAL-TIME SUBSCRIPTIONS PROMPT
## Production-Grade Real-time Data Synchronization

---

## 📋 OVERVIEW

This master prompt provides a comprehensive approach to implementing real-time subscriptions with Supabase Realtime, including channel management, cache invalidation, performance optimization, and error handling.

**Applicable to:**
- Real-time data synchronization
- Live updates for collaborative features
- Real-time notifications
- Cache invalidation patterns
- Multi-channel subscriptions

---

## 🎯 CORE PRINCIPLES

### 1. **Channel Management**
- **Single Channel per Hook**: One channel per hook instance
- **Proper Cleanup**: Always clean up channels on unmount
- **Reconnection Handling**: Handle connection errors gracefully
- **Debounced Updates**: Debounce cache invalidations to prevent rapid updates

### 2. **Performance Optimization**
- **Debounced Invalidation**: Prevent rapid cache invalidations
- **Mounted Checks**: Prevent updates after component unmounts
- **Selective Filtering**: Filter events to user's data only
- **Pause on Background**: Pause subscriptions when app is backgrounded

### 3. **Error Handling**
- **Connection Errors**: Handle connection failures gracefully
- **Silent Failures**: Don't show errors for background reconnections
- **Retry Logic**: Implement retry logic for failed connections

---

## 🔍 PHASE 1: REAL-TIME SETUP

### Step 1.1: Enable Realtime on Table
```sql
-- Enable realtime for table
ALTER PUBLICATION supabase_realtime ADD TABLE public.table_name;

-- Set replica identity (required for UPDATE/DELETE events)
ALTER TABLE public.table_name REPLICA IDENTITY FULL;
```

### Step 1.2: Realtime Checklist
- [ ] Realtime enabled on table
- [ ] Replica identity set to FULL
- [ ] Table has proper indexes
- [ ] RLS policies allow realtime access

---

## 🛠️ PHASE 2: HOOK IMPLEMENTATION

### Step 2.1: Basic Real-time Hook Pattern
```typescript
import { useEffect, useRef, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { logDebug } from '../lib/logger'
import type { RealtimeChannel } from '@supabase/supabase-js'

/**
 * Hook to subscribe to real-time updates for [resource]
 * 
 * @returns void (side effect only)
 */
export function useRealtimeResource() {
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
        queryClient.invalidateQueries({ queryKey: ['resource', user?.id] })
        queryClient.invalidateQueries({ queryKey: ['related-resource', user?.id] })
      }
    }, 300) // 300ms debounce
  }, [queryClient, user?.id])

  // Track mounted state
  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  // Set up real-time subscription
  useEffect(() => {
    if (!user?.id || !supabase) return

    // Cleanup any existing channel
    if (channelRef.current) {
      try {
        supabase.removeChannel(channelRef.current)
      } catch (error) {
        // Silently handle cleanup errors
      }
      channelRef.current = null
    }

    const channel = supabase
      .channel(`resource-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*', // INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'table_name',
          filter: `user_id=eq.${user.id}`, // Filter to user's data
        },
        (payload) => {
          if (!isMountedRef.current) return
          logDebug('[Realtime] Resource change detected', payload.eventType, 'useRealtimeResource')
          debouncedInvalidate()
        }
      )
      .subscribe((status) => {
        if (!isMountedRef.current) return

        if (status === 'SUBSCRIBED') {
          logDebug(`[Realtime] Resource channel subscribed for user ${user.id}`, undefined, 'useRealtimeResource')
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
          logDebug(`[Realtime] Resource channel status: ${status} for user ${user.id}`, undefined, 'useRealtimeResource')
        }
      })

    channelRef.current = channel

    return () => {
      isMountedRef.current = false
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
      if (channelRef.current) {
        try {
          supabase.removeChannel(channelRef.current)
        } catch (error) {
          // Silently handle cleanup errors
        }
        channelRef.current = null
      }
    }
  }, [user?.id, queryClient, debouncedInvalidate])
}
```

### Step 2.2: Real-time Hook Checklist
- [ ] Channel cleanup on unmount
- [ ] Debounced invalidation
- [ ] Mounted ref to prevent updates after unmount
- [ ] Filter to user's data only
- [ ] Error handling for connection issues
- [ ] Multiple related queries invalidated
- [ ] Debug logging (development only)

---

## 🎯 SUCCESS CRITERIA

A real-time hook is complete when:

1. ✅ **Subscription**: Channel subscribed correctly
2. ✅ **Cleanup**: Channel cleaned up on unmount
3. ✅ **Performance**: Debounced invalidations
4. ✅ **Error Handling**: Connection errors handled
5. ✅ **Filtering**: Events filtered to user's data
6. ✅ **Cache**: Related queries invalidated

---

## 🚨 COMMON PITFALLS

### ❌ Don't:
- Forget to clean up channels
- Skip debouncing
- Update after unmount
- Subscribe to all data (security risk)
- Ignore connection errors

### ✅ Do:
- Always clean up channels
- Debounce invalidations
- Check mounted state
- Filter to user's data
- Handle errors gracefully

---

**This master prompt should be followed for ALL real-time subscription work.**

