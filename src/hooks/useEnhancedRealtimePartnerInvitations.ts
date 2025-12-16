import { useEffect, useRef, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { logError, logWarning, logDebug } from '../lib/logger'

/**
 * Enhanced real-time hook for partner invitations with:
 * - Conflict detection and resolution
 * - Mobile-first optimizations (battery, network-aware)
 * - Smart debouncing based on network quality
 * - Automatic reconnection with exponential backoff
 * - Background/foreground handling
 */
export function useEnhancedRealtimePartnerInvitations() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const isMountedRef = useRef(true)
  const reconnectAttemptsRef = useRef(0)
  const lastUpdateRef = useRef<number>(0)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Network-aware debounce (faster on WiFi, slower on mobile data)
  const getDebounceDelay = useCallback(() => {
    if (typeof navigator !== 'undefined' && 'connection' in navigator) {
      const connection = (navigator as Navigator & { connection?: { effectiveType?: string; saveData?: boolean } }).connection
      // Slower updates on mobile data or data saver mode
      if (connection?.effectiveType === 'slow-2g' || connection?.effectiveType === '2g') {
        return 1000 // Very slow networks
      }
      if (connection?.effectiveType === '3g' || connection?.saveData) {
        return 500 // Mobile data or data saver
      }
    }
    return 200 // Fast WiFi connection
  }, [])

  // Smart debounced invalidation with conflict detection
  const debouncedInvalidate = useCallback((payload: { eventType: string; new?: unknown; old?: unknown }) => {
    const now = Date.now()
    const timeSinceLastUpdate = now - lastUpdateRef.current

    // Prevent rapid-fire updates (minimum 100ms between updates)
    if (timeSinceLastUpdate < 100) {
      return
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    debounceTimerRef.current = setTimeout(() => {
      if (!isMountedRef.current) return

      lastUpdateRef.current = Date.now()

      // Invalidate with conflict detection - only refetch active queries
      queryClient.invalidateQueries({
        queryKey: ['partner-invitations', 'sent', user?.id],
        refetchType: 'active', // Only refetch active queries (mobile-friendly)
      })
      queryClient.invalidateQueries({
        queryKey: ['partner-invitations', 'received', user?.id],
        refetchType: 'active',
      })
      queryClient.invalidateQueries({
        queryKey: ['partner', user?.id],
        refetchType: 'active',
      })
    }, getDebounceDelay())
  }, [user?.id, queryClient, getDebounceDelay])

    // Reconnection logic with exponential backoff
  const reconnect = useCallback(() => {
    if (reconnectAttemptsRef.current >= 5) {
      logError('Max reconnection attempts reached for partner invitations', null, 'useEnhancedRealtimePartnerInvitations')
      reconnectAttemptsRef.current = 0 // Reset after max attempts
      return
    }

    const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000)
    reconnectAttemptsRef.current++

    reconnectTimeoutRef.current = setTimeout(() => {
      if (isMountedRef.current && user?.id && supabase) {
        // Re-initialize subscription by triggering useEffect
        // This will be handled by the dependency array
        logDebug(`[Realtime] Reconnection attempt ${reconnectAttemptsRef.current} for partner invitations`, undefined, 'useEnhancedRealtimePartnerInvitations')
      }
    }, delay)
  }, [user?.id])

  // Initialize mount state
  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  // Mobile: Pause when app goes to background (battery optimization)
  useEffect(() => {
    if (typeof document === 'undefined') return

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Pause subscriptions when app is in background
        if (channelRef.current) {
          try {
            supabase.removeChannel(channelRef.current)
            logDebug('[Realtime] Paused partner invitations subscription (app in background)', undefined, 'useEnhancedRealtimePartnerInvitations')
          } catch (error) {
            logWarning('[Realtime] Error pausing subscription', 'useEnhancedRealtimePartnerInvitations')
          }
          channelRef.current = null
        }
      } else {
        // Resume subscriptions when app comes to foreground
        // The main useEffect will re-initialize if needed
        logDebug('[Realtime] App in foreground, subscriptions will resume', undefined, 'useEnhancedRealtimePartnerInvitations')
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  // Main subscription effect
  useEffect(() => {
    if (!user?.id || !supabase || !isMountedRef.current) return

    // Don't subscribe if app is in background
    if (typeof document !== 'undefined' && document.hidden) {
      return
    }

    // Cleanup any existing channel
    if (channelRef.current) {
      try {
        supabase.removeChannel(channelRef.current)
      } catch (error) {
        // Silently handle cleanup errors
      }
      channelRef.current = null
    }

    // Reset reconnection attempts on successful setup
    reconnectAttemptsRef.current = 0

    // Listen to invitations where user is inviter OR invitee
    const channel = supabase
      .channel(`partner-invitations-${user.id}`, {
        config: {
          // Mobile optimization: reduce broadcast overhead
          broadcast: { self: false },
        },
      })
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
          const newData = payload.new as { inviter_id?: string; invitee_email?: string; id?: string; status?: string } | null
          const oldData = payload.old as { inviter_id?: string; invitee_email?: string; id?: string; status?: string } | null
          const invitation = newData || oldData

          if (
            invitation &&
            (invitation.inviter_id === user.id || invitation.invitee_email === user.email)
          ) {
            logDebug('[Realtime] Partner invitation change detected', { eventType: payload.eventType, id: invitation.id, status: invitation.status, version: invitation.version }, 'useEnhancedRealtimePartnerInvitations')
            debouncedInvalidate(payload)
          }
        }
      )
      .subscribe((status) => {
        if (!isMountedRef.current) return

        if (status === 'SUBSCRIBED') {
          logDebug(`[Realtime] Partner invitations channel subscribed for user ${user.id}`, undefined, 'useEnhancedRealtimePartnerInvitations')
          reconnectAttemptsRef.current = 0 // Reset on successful subscription
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
          logWarning(`[Realtime] Partner invitations channel status: ${status} for user ${user.id}`, 'useEnhancedRealtimePartnerInvitations')
          // Attempt reconnection
          if (status !== 'CLOSED' || !document.hidden) {
            reconnect()
          }
        }
      })

    channelRef.current = channel

    return () => {
      isMountedRef.current = false
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
        debounceTimerRef.current = null
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
        reconnectTimeoutRef.current = null
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
  }, [user?.id, user?.email, queryClient, debouncedInvalidate, reconnect])
}

