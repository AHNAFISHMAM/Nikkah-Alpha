import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { logError } from '../lib/error-handler'
import toast from 'react-hot-toast'

/**
 * Hook to disconnect from partner
 * Uses soft delete to preserve history
 */
export function useDisconnectPartner() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('User not authenticated')
      if (!supabase) throw new Error('Supabase is not configured')

      const { data, error } = await supabase.rpc('disconnect_partner', {
        p_user_id: user.id,
      })

      if (error) {
        logError(error, 'useDisconnectPartner')
        throw error
      }

      if (!data) {
        throw new Error('No active partner connection found')
      }

      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partner'] })
      queryClient.invalidateQueries({ queryKey: ['partner-invitations'] })
      queryClient.invalidateQueries({ queryKey: ['discussions'] })
      toast.success('Partner disconnected successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to disconnect partner')
    },
  })
}

