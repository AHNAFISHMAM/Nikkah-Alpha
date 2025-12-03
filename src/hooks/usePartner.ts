import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { logError } from '../lib/error-handler'

/**
 * Hook to check if the current user has a partner connected
 * @returns Partner ID if exists, null if no partner, undefined while loading
 */
export function usePartner() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['partner', user?.id],
    queryFn: async () => {
      if (!user?.id) return null
      if (!supabase) throw new Error('Supabase is not configured')

      const { data, error } = await supabase.rpc('get_partner_id', {
        current_user_id: user.id,
      })

      if (error) {
        logError(error, 'usePartner.getPartnerId')
        return null
      }

      return data // Returns partner ID or null
    },
    enabled: !!user?.id,
    staleTime: 0, // Always refetch when invalidated (for real-time updates)
    refetchOnWindowFocus: true, // Refetch when window regains focus
    retry: false, // Don't retry if no partner
  })
}

