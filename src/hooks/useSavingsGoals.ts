import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { logError } from '../lib/error-handler'
import type { Database } from '../types/database'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'
import confetti from 'canvas-confetti'

type SavingsGoals = Database['public']['Tables']['savings_goals']['Row']
type SavingsGoalsInsert = Database['public']['Tables']['savings_goals']['Insert']
type SavingsGoalsUpdate = Database['public']['Tables']['savings_goals']['Update']

export function useSavingsGoals() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['savings-goals', user?.id],
    queryFn: async (): Promise<SavingsGoals | null> => {
      if (!user?.id) return null
      if (!supabase) throw new Error('Supabase is not configured')

      const { data, error } = await supabase
        .from('savings_goals')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      if (error) {
        logError(error, 'useSavingsGoals')
        throw error
      }

      return data as SavingsGoals | null
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useUpdateSavingsGoals() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (updates: SavingsGoalsUpdate): Promise<SavingsGoals> => {
      if (!user?.id) throw new Error('User not authenticated')
      if (!supabase) throw new Error('Supabase is not configured')

      const { data, error } = await supabase
        .from('savings_goals')
        .upsert(
          {
            user_id: user.id,
            ...updates,
          } as SavingsGoalsInsert,
          {
            onConflict: 'user_id',
          }
        )
        .select()
        .single()

      if (error) {
        logError(error, 'useUpdateSavingsGoals')
        throw error
      }

      return data as SavingsGoals
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savings-goals'] })
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b'],
      })
      toast.success('Mashallah! Savings goals saved! 🎯')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to save savings goals')
    },
  })
}

