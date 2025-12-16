import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { logError } from '../lib/error-handler'
import { logWarning } from '../lib/logger'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

/**
 * Hook to delete user data (GDPR Article 17 - Right to be Forgotten)
 * Anonymizes all personal data while preserving audit trail
 * 
 * Note: Auth account deletion requires Supabase Admin API call
 */
export function useDeleteUserData() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('User not authenticated')
      if (!supabase) throw new Error('Supabase is not configured')

      // Call RPC function to delete/anonymize data
      const { data, error } = await (supabase.rpc as any)('delete_user_data', {
        p_user_id: user.id,
      }) as { data: { success: boolean; error?: string } | null; error: Error | null }

      if (error) {
        logError(error, 'useDeleteUserData')
        throw error
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Failed to delete user data')
      }

      // PERMANENT FIX: Always try to delete from auth.users via Edge Function
      // This ensures emails can be reused even if database function fails
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      if (supabaseUrl) {
        try {
          const response = await fetch(`${supabaseUrl}/functions/v1/delete-auth-user`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            },
            body: JSON.stringify({ userId: user.id }),
          })

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            // If database deletion already succeeded, this is just a backup
            if (!data.auth_deleted) {
              logError('Failed to delete auth user via Edge Function (email may not be reusable)', errorData, 'useDeleteUserData')
            }
          }
        } catch (err) {
          // If database deletion already succeeded, this is just a backup
          if (!data.auth_deleted) {
            logError('Edge function not available, auth user may still exist', err, 'useDeleteUserData')
          }
        }
      } else if (!data.auth_deleted) {
        // If no Supabase URL and database deletion failed, warn user
        logError('Could not delete auth user. Email may not be reusable.', null, 'useDeleteUserData')
      }

      // Sign out user after data deletion
      await supabase.auth.signOut()

      return data
    },
    onSuccess: () => {
      // Invalidate all queries
      queryClient.clear()
      
      // Show success message
      toast.success('Your account and data have been deleted successfully', {
        duration: 5000,
      })
      
      // Redirect to home page after a short delay
      setTimeout(() => {
        navigate('/')
        // Reload page to clear all state
        window.location.reload()
      }, 2000)
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete account')
    },
  })
}

