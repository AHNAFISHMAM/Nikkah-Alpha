import { useEffect, useState, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { logError } from '../lib/error-handler'

/**
 * Hook to subscribe to real-time updates for progress stats
 * Uses Supabase Realtime to invalidate React Query cache when data changes
 * Mobile-first: Pauses when app is backgrounded, resumes when visible
 */
export function useRealtimeProgressStats() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [isConnected, setIsConnected] = useState(false)
  const channelsRef = useRef<ReturnType<typeof supabase.channel>[]>([])
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Debounced invalidation to prevent rapid updates
  const debouncedInvalidate = () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }
    debounceTimerRef.current = setTimeout(() => {
      queryClient.invalidateQueries({ queryKey: ['progress-stats'] })
    }, 300) // 300ms debounce
  }

  useEffect(() => {
    if (!user?.id || !supabase) return

    // Handle visibility change (mobile optimization)
    // Note: We don't pause/resume here - the effect will handle reconnection
    // This is just for tracking visibility state
    const handleVisibilityChange = () => {
      // When app becomes visible, invalidate to refresh data
      if (!document.hidden) {
        queryClient.invalidateQueries({ queryKey: ['progress-stats'] })
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Channel 1: Checklist progress changes
    const checklistChannel = supabase
      .channel('dashboard-checklist-progress')
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
        if (status === 'SUBSCRIBED') {
          setIsConnected(true)
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          setIsConnected(false)
          logError(new Error(`Checklist channel error: ${status}`), 'useRealtimeProgressStats.checklist')
        }
      })

    // Channel 2: Module progress changes
    const moduleChannel = supabase
      .channel('dashboard-module-progress')
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
        if (status === 'SUBSCRIBED') {
          setIsConnected(true)
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          setIsConnected(false)
          logError(new Error(`Module channel error: ${status}`), 'useRealtimeProgressStats.module')
        }
      })

    // Channel 3: Discussion answers changes
    const discussionChannel = supabase
      .channel('dashboard-discussion-answers')
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
        if (status === 'SUBSCRIBED') {
          setIsConnected(true)
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          setIsConnected(false)
          logError(new Error(`Discussion channel error: ${status}`), 'useRealtimeProgressStats.discussion')
        }
      })

    // Channel 4: Financial data changes
    const financialChannel = supabase
      .channel('dashboard-financial-data')
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
        if (status === 'SUBSCRIBED') {
          setIsConnected(true)
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          setIsConnected(false)
          logError(new Error(`Financial channel error: ${status}`), 'useRealtimeProgressStats.financial')
        }
      })

    // Channel 5: Profile changes (wedding date, partner)
    const profileChannel = supabase
      .channel('dashboard-profile')
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
        if (status === 'SUBSCRIBED') {
          setIsConnected(true)
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          setIsConnected(false)
          logError(new Error(`Profile channel error: ${status}`), 'useRealtimeProgressStats.profile')
        }
      })

    channelsRef.current = [
      checklistChannel,
      moduleChannel,
      discussionChannel,
      financialChannel,
      profileChannel,
    ]

    // Cleanup function
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }

      channelsRef.current.forEach(channel => {
        supabase.removeChannel(channel)
      })
      channelsRef.current = []
      setIsConnected(false)
    }
  }, [user?.id, queryClient])

  return { isConnected }
}

