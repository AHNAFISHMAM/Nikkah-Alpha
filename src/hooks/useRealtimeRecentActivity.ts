import { useEffect, useState, useRef, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { logDebug } from '../lib/logger'
import type { RealtimeChannel } from '@supabase/supabase-js'

/**
 * Hook to subscribe to real-time updates for recent activity
 * Uses Supabase Realtime to invalidate React Query cache when activity occurs
 * Mobile-first: Pauses when app is backgrounded, resumes when visible
 */
export function useRealtimeRecentActivity() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [isConnected, setIsConnected] = useState(false)
  const channelsRef = useRef<RealtimeChannel[]>([])
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const isMountedRef = useRef(true)

  // Debounced invalidation to prevent rapid updates
  const debouncedInvalidate = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }
    debounceTimerRef.current = setTimeout(() => {
      if (isMountedRef.current) {
        queryClient.invalidateQueries({ queryKey: ['recent-activity'] })
      }
    }, 500) // 500ms debounce for activity (slightly longer to batch multiple changes)
  }, [queryClient])

  useEffect(() => {
    if (!user?.id || !supabase) return

    isMountedRef.current = true

    // Handle visibility change (mobile optimization)
    // Note: We don't pause/resume here - the effect will handle reconnection
    // This is just for tracking visibility state
    const handleVisibilityChange = () => {
      // When app becomes visible, invalidate to refresh data
      if (!document.hidden) {
        queryClient.invalidateQueries({ queryKey: ['recent-activity'] })
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Helper to handle channel status changes gracefully
    const handleChannelStatus = (
      status: string,
      channelName: string,
      setConnected: (value: boolean) => void
    ) => {
      if (!isMountedRef.current) return // Don't update state if component unmounted

      if (status === 'SUBSCRIBED') {
        setConnected(true)
      } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
        setConnected(false)
        // Only log errors if component is still mounted and it's not a cleanup-related error
        // These are often expected (network issues, table not having realtime enabled, etc.)
        if (isMountedRef.current && status !== 'CLOSED') {
          // Silently handle - these are often expected scenarios
          // Realtime may not be enabled for all tables, or connection may drop temporarily
          logDebug(`[${channelName}] Channel status: ${status}`, undefined, 'useRealtimeRecentActivity')
        }
      }
    }

    // Channel 1: Checklist completions
    const checklistChannel = supabase
      .channel('activity-checklist')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_checklist_progress',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          debouncedInvalidate()
        }
      )
      .subscribe((status) => {
        handleChannelStatus(status, 'checklist', setIsConnected)
      })

    // Channel 2: Module/lesson completions
    const moduleChannel = supabase
      .channel('activity-module')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_module_progress',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          debouncedInvalidate()
        }
      )
      .subscribe((status) => {
        handleChannelStatus(status, 'module', setIsConnected)
      })

    // Channel 3: Discussion completions
    const discussionChannel = supabase
      .channel('activity-discussion')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_discussion_answers',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          debouncedInvalidate()
        }
      )
      .subscribe((status) => {
        handleChannelStatus(status, 'discussion', setIsConnected)
      })

    // Channel 4: Budget updates
    const budgetChannel = supabase
      .channel('activity-budget')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_financial_data',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          debouncedInvalidate()
        }
      )
      .subscribe((status) => {
        handleChannelStatus(status, 'budget', setIsConnected)
      })

    // Channel 5: Profile updates
    const profileChannel = supabase
      .channel('activity-profile')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`,
        },
        () => {
          debouncedInvalidate()
        }
      )
      .subscribe((status) => {
        handleChannelStatus(status, 'profile', setIsConnected)
      })

    channelsRef.current = [
      checklistChannel,
      moduleChannel,
      discussionChannel,
      budgetChannel,
      profileChannel,
    ]

    // Cleanup function
    return () => {
      isMountedRef.current = false
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }

      // Silently remove channels - errors during cleanup are expected
      channelsRef.current.forEach(channel => {
        try {
          supabase.removeChannel(channel)
        } catch (error) {
          // Silently handle cleanup errors
        }
      })
      channelsRef.current = []
      setIsConnected(false)
    }
  }, [user?.id, queryClient, debouncedInvalidate])

  return { isConnected }
}

