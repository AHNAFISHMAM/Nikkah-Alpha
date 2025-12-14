import { useEffect, useRef, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { usePartner } from './usePartner'
import { logDebug } from '../lib/logger'
import type { RealtimeChannel } from '@supabase/supabase-js'

/**
 * Hook to subscribe to real-time updates for partner's discussion answers
 * Uses Supabase Realtime to invalidate React Query cache when partner answers change
 * Mobile-first: Optimized for mobile performance
 */
export function useRealtimePartnerDiscussionAnswers() {
  const { user } = useAuth()
  const { data: partnerId } = usePartner()
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
        // Invalidate all discussion-related queries
        queryClient.invalidateQueries({ queryKey: ['discussions', user?.id] })
        queryClient.invalidateQueries({ queryKey: ['partner-discussion-answer'] })
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
    if (!user?.id || !partnerId || !supabase) return

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
      .channel(`partner-discussions-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_discussion_answers',
          filter: `user_id=eq.${partnerId}`, // Listen to partner's answers
        },
        (payload) => {
          if (!isMountedRef.current) return
          logDebug('[Realtime] Partner discussion answer change detected', payload.eventType, 'useRealtimePartnerDiscussionAnswers')
          debouncedInvalidate()
        }
      )
      .subscribe((status) => {
        if (!isMountedRef.current) return

        if (status === 'SUBSCRIBED') {
          logDebug(`[Realtime] Partner discussions channel subscribed for user ${user.id}`, undefined, 'useRealtimePartnerDiscussionAnswers')
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
          logDebug(`[Realtime] Partner discussions channel status: ${status} for user ${user.id}`, undefined, 'useRealtimePartnerDiscussionAnswers')
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
  }, [user?.id, partnerId, queryClient, debouncedInvalidate])
}

