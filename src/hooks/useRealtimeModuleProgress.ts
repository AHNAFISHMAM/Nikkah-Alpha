import { useEffect, useRef, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { logDebug } from '../lib/logger'
import type { RealtimeChannel } from '@supabase/supabase-js'

/**
 * Hook to subscribe to real-time updates for module progress
 * Uses Supabase Realtime to invalidate React Query cache when lesson completions change
 * Mobile-first: Optimized for mobile performance
 */
export function useRealtimeModuleProgress() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const isMountedRef = useRef(true)

  // Debounced invalidation to prevent rapid updates
  const debouncedInvalidate = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }
    debounceTimerRef.current = setTimeout(() => {
      if (isMountedRef.current) {
        queryClient.invalidateQueries({ queryKey: ['modules'] })
        queryClient.invalidateQueries({ queryKey: ['user-module-progress'] })
        queryClient.invalidateQueries({ queryKey: ['module'] }) // Invalidates all module queries including ['module', moduleId]
        queryClient.invalidateQueries({ queryKey: ['module-notes'] }) // Invalidates all module-notes queries including ['module-notes', moduleId, user?.id]
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

    const channelsRef: RealtimeChannel[] = []

    // Channel 1: user_module_progress (lesson completions)
    const progressChannel = supabase
      .channel(`module-progress-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_module_progress',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (!isMountedRef.current) return
          logDebug('[Realtime] Module progress change detected', payload.eventType, 'useRealtimeModuleProgress')
          debouncedInvalidate()
        }
      )
      .subscribe((status) => {
        if (!isMountedRef.current) return

        if (status === 'SUBSCRIBED') {
          logDebug(`[Realtime] Module progress channel subscribed for user ${user.id}`, undefined, 'useRealtimeModuleProgress')
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
          logDebug(`[Realtime] Module progress channel status: ${status} for user ${user.id}`, undefined, 'useRealtimeModuleProgress')
        }
      })

    // Channel 2: module_notes (module completion status and notes)
    const notesChannel = supabase
      .channel(`module-notes-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'module_notes',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (!isMountedRef.current) return
          logDebug('[Realtime] Module notes change detected', payload.eventType, 'useRealtimeModuleProgress')
          debouncedInvalidate()
        }
      )
      .subscribe((status) => {
        if (!isMountedRef.current) return

        if (status === 'SUBSCRIBED') {
          logDebug(`[Realtime] Module notes channel subscribed for user ${user.id}`, undefined, 'useRealtimeModuleProgress')
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
          logDebug(`[Realtime] Module notes channel status: ${status} for user ${user.id}`, undefined, 'useRealtimeModuleProgress')
        }
      })

    channelsRef.push(progressChannel, notesChannel)

    return () => {
      isMountedRef.current = false
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
      channelsRef.forEach(channel => {
        try {
          supabase.removeChannel(channel)
        } catch (error) {
          // Silently handle cleanup errors
        }
      })
    }
  }, [user?.id, queryClient, debouncedInvalidate])
}

