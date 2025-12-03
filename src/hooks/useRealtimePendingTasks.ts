import { useEffect, useState, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { logError } from '../lib/error-handler'

/**
 * Hook to subscribe to real-time updates for pending tasks
 * Uses Supabase Realtime to invalidate React Query cache when checklist items are completed
 * Mobile-first: Pauses when app is backgrounded, resumes when visible
 */
export function useRealtimePendingTasks() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [isConnected, setIsConnected] = useState(false)
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Debounced invalidation to prevent rapid updates
  const debouncedInvalidate = () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }
    debounceTimerRef.current = setTimeout(() => {
      queryClient.invalidateQueries({ queryKey: ['pending-tasks'] })
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
        queryClient.invalidateQueries({ queryKey: ['pending-tasks'] })
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Subscribe to checklist progress changes
    const channel = supabase
      .channel('dashboard-pending-tasks')
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
          logError(new Error(`Pending tasks channel error: ${status}`), 'useRealtimePendingTasks')
        }
      })

    channelRef.current = channel

    // Cleanup function
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }

      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
      setIsConnected(false)
    }
  }, [user?.id, queryClient])

  return { isConnected }
}

