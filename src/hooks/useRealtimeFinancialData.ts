import { useEffect, useRef, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import type { RealtimeChannel } from '@supabase/supabase-js'

/**
 * Hook to subscribe to real-time updates for financial data
 * Uses Supabase Realtime to invalidate React Query cache when financial data changes
 * Covers: budgets, mahr, wedding_budgets, savings_goals
 * Mobile-first: Optimized for mobile performance
 */
export function useRealtimeFinancialData() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
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
        queryClient.invalidateQueries({ queryKey: ['budget', user?.id] })
        queryClient.invalidateQueries({ queryKey: ['mahr', user?.id] })
        queryClient.invalidateQueries({ queryKey: ['wedding-budget', user?.id] })
        queryClient.invalidateQueries({ queryKey: ['savings-goals', user?.id] })
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

    // Cleanup any existing channels
    channelsRef.current.forEach(channel => {
      try {
        supabase.removeChannel(channel)
      } catch (error) {
        // Silently handle cleanup errors
      }
    })
    channelsRef.current = []

    // Channel 1: Budgets
    const budgetsChannel = supabase
      .channel(`financial-budgets-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'budgets',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          if (!isMountedRef.current) return
          debouncedInvalidate()
        }
      )
      .subscribe()

    // Channel 2: Mahr
    const mahrChannel = supabase
      .channel(`financial-mahr-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'mahr',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          if (!isMountedRef.current) return
          debouncedInvalidate()
        }
      )
      .subscribe()

    // Channel 3: Wedding Budgets
    const weddingBudgetChannel = supabase
      .channel(`financial-wedding-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'wedding_budgets',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          if (!isMountedRef.current) return
          debouncedInvalidate()
        }
      )
      .subscribe()

    // Channel 4: Savings Goals
    const savingsChannel = supabase
      .channel(`financial-savings-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'savings_goals',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          if (!isMountedRef.current) return
          debouncedInvalidate()
        }
      )
      .subscribe()

    channelsRef.current = [
      budgetsChannel,
      mahrChannel,
      weddingBudgetChannel,
      savingsChannel,
    ]

    return () => {
      isMountedRef.current = false
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
      channelsRef.current.forEach(channel => {
        try {
          supabase.removeChannel(channel)
        } catch (error) {
          // Silently handle cleanup errors
        }
      })
      channelsRef.current = []
    }
  }, [user?.id, queryClient, debouncedInvalidate])
}

