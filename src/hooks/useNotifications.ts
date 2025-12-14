import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { logError } from '../lib/error-handler'

export interface Notification {
  id: string
  user_id: string
  type: string
  title: string
  message: string
  related_entity_type: string | null
  related_entity_id: string | null
  is_read: boolean
  created_at: string
}

/**
 * Hook to fetch user's notifications
 */
export function useNotifications() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: async () => {
      if (!user?.id) {
        return []
      }
      if (!supabase) throw new Error('Supabase is not configured')
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) {
        logError(error, 'useNotifications')
        throw error
      }

      // Sort to prioritize unread notifications first
      const sorted = (data || []).sort((a, b) => {
        // Unread notifications first
        if (a.is_read !== b.is_read) {
          return a.is_read ? 1 : -1
        }
        // Then by created_at (newest first)
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      })

      return sorted as Notification[]
    },
    enabled: !!user?.id,
    staleTime: 30000, // 30 seconds
  })
}

/**
 * Hook to get unread notification count
 */
export function useUnreadNotificationCount() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['notifications', 'unread-count', user?.id],
    queryFn: async () => {
      if (!user?.id) return 0
      if (!supabase) throw new Error('Supabase is not configured')

      const { count, error } = await supabase
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false)

      if (error) {
        logError(error, 'useUnreadNotificationCount')
        return 0
      }

      return count || 0
    },
    enabled: !!user?.id,
    staleTime: 10000, // 10 seconds
  })
}

/**
 * Hook to mark notification as read
 */
export function useMarkNotificationRead() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (notificationId: string) => {
      if (!user?.id) throw new Error('User not authenticated')
      if (!supabase) throw new Error('Supabase is not configured')

      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
        .eq('user_id', user.id)

      if (error) {
        logError(error, 'useMarkNotificationRead')
        throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}

/**
 * Hook to mark all notifications as read
 */
export function useMarkAllNotificationsRead() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('User not authenticated')
      if (!supabase) throw new Error('Supabase is not configured')

      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false)

      if (error) {
        logError(error, 'useMarkAllNotificationsRead')
        throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}

/**
 * Hook to delete a single notification
 */
export function useDeleteNotification() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (notificationId: string) => {
      if (!user?.id) throw new Error('User not authenticated')
      if (!supabase) throw new Error('Supabase is not configured')

      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)
        .eq('user_id', user.id)

      if (error) {
        logError(error, 'useDeleteNotification')
        throw error
      }
    },
    onMutate: async (notificationId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['notifications', user?.id] })
      await queryClient.cancelQueries({ queryKey: ['notifications', 'unread-count', user?.id] })

      // Snapshot previous value for potential rollback
      const previousNotifications = queryClient.getQueryData<Notification[]>(['notifications', user?.id])
      const previousUnreadCount = queryClient.getQueryData<number>(['notifications', 'unread-count', user?.id])

      // Optimistically update notifications list
      queryClient.setQueryData<Notification[]>(['notifications', user?.id], (old) => {
        const filtered = old?.filter(n => n.id !== notificationId) || []
        return filtered
      })

      // Optimistically update unread count if deleted notification was unread
      const deletedNotification = previousNotifications?.find(n => n.id === notificationId)
      if (deletedNotification && !deletedNotification.is_read) {
        queryClient.setQueryData<number>(['notifications', 'unread-count', user?.id], (old) => {
          return Math.max((old || 0) - 1, 0)
        })
      }

      return { previousNotifications, previousUnreadCount, deletedNotification }
    },
    onError: (err, notificationId, context) => {
      // Rollback on error
      if (context?.previousNotifications) {
        queryClient.setQueryData(['notifications', user?.id], context.previousNotifications)
      }
      if (context?.previousUnreadCount !== undefined) {
        queryClient.setQueryData(['notifications', 'unread-count', user?.id], context.previousUnreadCount)
      }
    },
    onSuccess: () => {
      // Invalidate to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] })
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count', user?.id] })
    },
  })
}

/**
 * Hook to delete all read notifications
 */
export function useDeleteAllReadNotifications() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('User not authenticated')
      if (!supabase) throw new Error('Supabase is not configured')

      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', user.id)
        .eq('is_read', true)

      if (error) {
        logError(error, 'useDeleteAllReadNotifications')
        throw error
      }
    },
    onMutate: async () => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['notifications', user?.id] })

      // Snapshot previous value
      const previousNotifications = queryClient.getQueryData<Notification[]>(['notifications', user?.id])

      // Optimistically update - keep only unread notifications
      queryClient.setQueryData<Notification[]>(['notifications', user?.id], (old) => {
        return old?.filter(n => !n.is_read) || []
      })

      return { previousNotifications }
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousNotifications) {
        queryClient.setQueryData(['notifications', user?.id], context.previousNotifications)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] })
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count', user?.id] })
    },
  })
}

/**
 * Hook to subscribe to real-time notifications
 * Uses Supabase Realtime (built-in, no external API)
 * Includes proper error handling and status tracking
 */
export function useRealtimeNotifications() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)
  const isMountedRef = useRef(true)

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
      .channel(`notifications-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (!isMountedRef.current) return
          
          // Log real-time update for debugging
          // Notification change detected
          
          // Invalidate queries when notification changes
          queryClient.invalidateQueries({ queryKey: ['notifications', user.id] })
          queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count', user.id] })
        }
      )
      .subscribe((status) => {
        if (!isMountedRef.current) return

        if (status === 'SUBSCRIBED') {
          // Channel subscribed successfully
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
          // Channel error or timeout - will attempt to resubscribe
          // Attempt to resubscribe after a delay if not explicitly closed
          if (status !== 'CLOSED' && isMountedRef.current) {
            setTimeout(() => {
              if (channelRef.current && isMountedRef.current) {
                channelRef.current.subscribe()
              }
            }, 3000)
          }
        }
      })

    channelRef.current = channel

    return () => {
      isMountedRef.current = false
      if (channelRef.current) {
        try {
          supabase.removeChannel(channelRef.current)
        } catch (error) {
          // Silently handle cleanup errors during unmount
        }
        channelRef.current = null
      }
    }
  }, [user?.id, queryClient])
}

