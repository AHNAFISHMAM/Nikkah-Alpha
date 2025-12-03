import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { logError } from '../lib/error-handler'
import type { Database } from '../types/database'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'
import confetti from 'canvas-confetti'

type WeddingBudget = Database['public']['Tables']['wedding_budgets']['Row']
type WeddingBudgetInsert = Database['public']['Tables']['wedding_budgets']['Insert']
type WeddingBudgetUpdate = Database['public']['Tables']['wedding_budgets']['Update']

export function useWeddingBudget() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['wedding-budget', user?.id],
    queryFn: async (): Promise<WeddingBudget | null> => {
      if (!user?.id) return null
      if (!supabase) throw new Error('Supabase is not configured')

      const { data, error } = await supabase
        .from('wedding_budgets')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      if (error) {
        logError(error, 'useWeddingBudget')
        throw error
      }

      return data as WeddingBudget | null
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useUpdateWeddingBudget() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (updates: WeddingBudgetUpdate): Promise<WeddingBudget> => {
      if (!user?.id) throw new Error('User not authenticated')
      if (!supabase) throw new Error('Supabase is not configured')

      const { data, error } = await supabase
        .from('wedding_budgets')
        .upsert(
          {
            user_id: user.id,
            ...updates,
          } as WeddingBudgetInsert,
          {
            onConflict: 'user_id',
          }
        )
        .select()
        .single()

      if (error) {
        logError(error, 'useUpdateWeddingBudget')
        throw error
      }

      return data as WeddingBudget
    },
    onSuccess: () => {
      // Invalidate both wedding-budget and progress-stats queries for real-time updates
      queryClient.invalidateQueries({ queryKey: ['wedding-budget'] })
      queryClient.invalidateQueries({ queryKey: ['progress-stats'] })
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b'],
      })
      toast.success('Mashallah! Wedding budget saved! 💒')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to save wedding budget')
    },
  })
}

