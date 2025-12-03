import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { usePartner } from './usePartner'
import { logError } from '../lib/error-handler'

/**
 * Hook to fetch partner's discussion answer for a specific prompt
 * @param promptId - The ID of the discussion prompt
 * @returns Partner's answer data or null if no partner/no answer
 */
export function usePartnerDiscussionAnswers(promptId: string) {
  const { user } = useAuth()
  const { data: partnerId } = usePartner()

  return useQuery({
    queryKey: ['partner-discussion-answer', user?.id, promptId],
    queryFn: async () => {
      if (!user?.id) return null
      if (!partnerId) return null // No partner connected
      if (!supabase) throw new Error('Supabase is not configured')

      // Fetch partner's answer for this prompt
      const { data, error } = await supabase
        .from('user_discussion_answers')
        .select('*')
        .eq('user_id', partnerId)
        .eq('prompt_id', promptId)
        .maybeSingle()

      if (error) {
        // Handle 404 or schema cache errors gracefully
        const statusCode = (error as any)?.status || (error as any)?.code
        const errorMessage = error.message || String(error)
        
        if (statusCode === 404 || 
            statusCode === 'PGRST116' ||
            errorMessage.includes('schema cache') || 
            errorMessage.includes('Could not find the table') ||
            errorMessage.includes('Not Found')) {
          // Table doesn't exist or schema cache issue - return null (non-fatal)
          return null
        }
        
        logError(error, 'usePartnerDiscussionAnswers.fetchAnswer')
        return null
      }

      return data
    },
    enabled: !!user?.id && !!promptId && !!partnerId,
    staleTime: 30000, // 30 seconds
    retry: false, // Don't retry if no partner
  })
}

