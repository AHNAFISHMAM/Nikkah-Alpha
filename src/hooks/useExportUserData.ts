import { useMutation } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { logError } from '../lib/error-handler'
import toast from 'react-hot-toast'

/**
 * Hook to export user data (GDPR Article 15 - Right of Access)
 * Downloads all user data as a JSON file
 */
export function useExportUserData() {
  const { user } = useAuth()

  return useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('User not authenticated')
      if (!supabase) throw new Error('Supabase is not configured')

      // Call RPC function to export data
      const { data, error } = await supabase.rpc('export_user_data', {
        p_user_id: user.id,
      })

      if (error) {
        logError(error, 'useExportUserData')
        throw error
      }

      if (!data) {
        throw new Error('No data returned from export')
      }

      // Format JSON with indentation for readability
      const jsonString = JSON.stringify(data, null, 2)
      const blob = new Blob([jsonString], { type: 'application/json' })
      const url = URL.createObjectURL(blob)

      // Create download link
      const link = document.createElement('a')
      link.href = url
      link.download = `nikahprep-data-export-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      return data
    },
    onSuccess: () => {
      toast.success('Data export downloaded successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to export data')
    },
  })
}

