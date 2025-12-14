import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { logError } from '../lib/error-handler'
import type { Profile, ProfileUpdate } from '../types/database'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

export function useProfile() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async (): Promise<Profile | null> => {
      if (!user?.id) return null
      if (!supabase) throw new Error('Supabase is not configured')

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()

      if (error) {
        logError(error, 'useProfile')
        throw error
      }

      return data as Profile | null
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useUpdateProfile() {
  const { user, refreshProfile } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (updates: ProfileUpdate): Promise<Profile> => {
      if (!user?.id) throw new Error('User not authenticated')
      if (!supabase) throw new Error('Supabase is not configured')

      const { data, error } = await supabase
        .from('profiles')
        .update(updates as any)
        .eq('id', user.id)
        .select()
        .single()

      if (error) {
        logError(error, 'useUpdateProfile')
        throw error
      }

      return data as Profile
    },
    onSuccess: (data, variables) => {
      // Update React Query cache
      if (user?.id) {
        queryClient.setQueryData(['profile', user.id] as const, data)
      }
      // Refresh auth context profile
      refreshProfile?.()
      
      // Only show toast for actual profile field updates, not theme preferences
      // Theme updates (theme_mode, green_theme) are handled silently or by their own hooks
      const updateKeys = Object.keys(variables).filter(
        key => variables[key as keyof typeof variables] !== undefined && variables[key as keyof typeof variables] !== null
      )
      
      // Check if this is a theme-only update (only theme_mode and/or green_theme)
      const hasThemeMode = 'theme_mode' in variables && variables.theme_mode !== undefined
      const hasGreenTheme = 'green_theme' in variables && variables.green_theme !== undefined
      const hasOtherFields = updateKeys.some(key => key !== 'theme_mode' && key !== 'green_theme')
      
      // Show toast if there are other fields, or if no theme fields at all
      if (hasOtherFields || (!hasThemeMode && !hasGreenTheme)) {
        toast.success('Profile updated!')
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update profile')
    },
  })
}

