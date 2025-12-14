import { useEffect, useRef, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { logDebug } from '../lib/logger'
import type { RealtimeChannel } from '@supabase/supabase-js'

/**
 * Hook to subscribe to real-time updates for checklist progress
 * Uses Supabase Realtime to invalidate React Query cache when checklist items are completed
 * Mobile-first: Optimized for mobile performance
 */
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
        queryClient.invalidateQueries({ queryKey: ['pending-tasks', user?.id] })
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
      try {
        supabase.removeChannel(channelRef.current)
      } catch (error) {
        // Silently handle cleanup errors
      }
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
          logDebug('[Realtime] Checklist progress change detected', payload.eventType, 'useRealtimeChecklist')
          debouncedInvalidate()
        }
      )
      .subscribe((status) => {
        if (!isMountedRef.current) return

        if (status === 'SUBSCRIBED') {
          logDebug(`[Realtime] Checklist channel subscribed for user ${user.id}`, undefined, 'useRealtimeChecklist')
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
          logDebug(`[Realtime] Checklist channel status: ${status} for user ${user.id}`, undefined, 'useRealtimeChecklist')
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

