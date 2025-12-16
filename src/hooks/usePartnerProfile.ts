import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { usePartner } from './usePartner'
import { logError } from '../lib/error-handler'
import { logWarning, logDebug } from '../lib/logger'
import type { Profile } from '../types/database'

/**
 * Hook to fetch partner's profile information
 * @returns Partner profile data including email, name, etc.
 */
export function usePartnerProfile() {
  const { data: partnerId, isLoading: partnerLoading } = usePartner()

  return useQuery({
    queryKey: ['partner-profile', partnerId],
    queryFn: async (): Promise<Profile | null> => {
      if (!partnerId || !supabase) return null

      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name, first_name, last_name, avatar_url')
        .eq('id', partnerId)
        .maybeSingle()

      if (error) {
        logError('Error fetching partner profile', error, 'usePartnerProfile')
        return null
      }

      if (!data) {
        logWarning(`No partner profile found for partnerId: ${partnerId}`, 'usePartnerProfile')
        return null
      }

      return data as Profile | null
    },
    enabled: !!partnerId && !partnerLoading,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  })
}

