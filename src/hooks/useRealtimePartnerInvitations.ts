import { useEffect, useRef, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { logDebug } from '../lib/logger'
import type { RealtimeChannel } from '@supabase/supabase-js'

/**
 * Hook to subscribe to real-time updates for partner invitations
 * Uses Supabase Realtime to invalidate React Query cache when invitation status changes
 * Mobile-first: Optimized for mobile performance
 */
export function useRealtimePartnerInvitations() {
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
        queryClient.invalidateQueries({ queryKey: ['partner-invitations', 'sent', user?.id] })
        queryClient.invalidateQueries({ queryKey: ['partner-invitations', 'received', user?.id] })
        queryClient.invalidateQueries({ queryKey: ['partner', user?.id] }) // Partner connection status
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

    // Listen to invitations where user is inviter OR invitee
    const channel = supabase
      .channel(`partner-invitations-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'partner_invitations',
          // Note: Supabase Realtime filters don't support OR conditions
          // We'll listen to all changes and filter in the callback
        },
        (payload) => {
          if (!isMountedRef.current) return
          
          // Check if this invitation is relevant to the current user
          const newData = payload.new as any
          const oldData = payload.old as any
          const invitation = newData || oldData
          
          if (invitation && (
            invitation.inviter_id === user.id || 
            invitation.invitee_email === user.email
          )) {
            logDebug('[Realtime] Partner invitation change detected', payload.eventType, 'useRealtimePartnerInvitations')
            debouncedInvalidate()
          }
        }
      )
      .subscribe((status) => {
        if (!isMountedRef.current) return

        if (status === 'SUBSCRIBED') {
          logDebug(`[Realtime] Partner invitations channel subscribed for user ${user.id}`, undefined, 'useRealtimePartnerInvitations')
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
          logDebug(`[Realtime] Partner invitations channel status: ${status} for user ${user.id}`, undefined, 'useRealtimePartnerInvitations')
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
  }, [user?.id, user?.email, queryClient, debouncedInvalidate])
}

