import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

/**
 * Hook to subscribe to real-time updates for partner connection status
 * Uses Supabase Realtime to invalidate React Query cache when couple status changes
 * Mobile-first: Optimized for mobile performance
 */
export function useRealtimePartnerConnection() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const isMountedRef = useRef(true)

  // Debounced invalidation to prevent rapid updates
  const debouncedInvalidate = () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }
    debounceTimerRef.current = setTimeout(() => {
      queryClient.invalidateQueries({ queryKey: ['partner', user?.id] })
      queryClient.invalidateQueries({ queryKey: ['partner-profile'] })
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] }) // Profile may have partner_id
    }, 300) // 300ms debounce
  }

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

    // Listen to couples table where user is user1 or user2
    const channel = supabase
      .channel(`partner-connection-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'couples',
          // Note: Supabase Realtime filters don't support OR conditions
          // We'll listen to all changes and filter in the callback
        },
        (payload) => {
          if (!isMountedRef.current) return
          
          // Check if this couple record is relevant to the current user
          const newData = payload.new as any
          const oldData = payload.old as any
          const couple = newData || oldData
          
          if (couple && (
            couple.user1_id === user.id || 
            couple.user2_id === user.id
          )) {
            console.log('[Realtime] Partner connection change detected:', payload.eventType)
            debouncedInvalidate()
          }
        }
      )
      .subscribe((status) => {
        if (!isMountedRef.current) return

        if (status === 'SUBSCRIBED') {
          console.log(`[Realtime] Partner connection channel subscribed for user ${user.id}`)
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
          console.debug(`[Realtime] Partner connection channel status: ${status} for user ${user.id}`)
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
  }, [user?.id, queryClient])
}

