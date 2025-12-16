import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { logWarning } from '../lib/logger'

/**
 * Hook to cleanup expired invitations on app load
 * Runs automatically when user is authenticated
 * Database-only solution (no external APIs)
 */
export function useCleanupExpiredInvitations() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!user?.id || !supabase) return

    // Cleanup expired invitations on mount
    const cleanup = async () => {
      try {
        await supabase.rpc('cleanup_expired_invitations')
        // Invalidate queries to refresh invitation lists
        queryClient.invalidateQueries({ queryKey: ['partner-invitations'] })
      } catch (error) {
        // Silently fail - cleanup is not critical
        logWarning('Failed to cleanup expired invitations', 'useCleanupExpiredInvitations')
      }
    }

    cleanup()
  }, [user?.id, queryClient])
}

