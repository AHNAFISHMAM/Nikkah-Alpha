import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { logError } from '../lib/error-handler'

export interface FavoriteResource {
  id: string
  title: string
  description: string | null
  url: string
  category: 'Books' | 'Scholarly' | 'Counseling' | 'Finance' | 'Duas' | 'Courses'
  is_featured: boolean
  order_index: number | null
  created_at: string
  updated_at: string
  favorited_at: string // When user favorited it
}

/**
 * Hook to fetch user's favorite resources
 * Returns preview items (limited to 4) and total count
 */
export function useFavoriteResources() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['favorite-resources', user?.id],
    queryFn: async (): Promise<{ preview: FavoriteResource[]; totalCount: number }> => {
      if (!user?.id) {
        return { preview: [], totalCount: 0 }
      }

      if (!supabase) {
        throw new Error('Supabase is not configured')
      }

      // Fetch user's favorite resource IDs with created_at (favorited_at)
      const { data: favorites, error: favoritesError } = await supabase
        .from('user_resource_favorites')
        .select('resource_id, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (favoritesError) {
        logError(favoritesError, 'useFavoriteResources.fetchFavorites')
        throw favoritesError
      }

      if (!favorites || favorites.length === 0) {
        return { preview: [], totalCount: 0 }
      }

      // Fetch full resource details for favorited resources
      const resourceIds = favorites.map((f) => f.resource_id)
      const { data: resources, error: resourcesError } = await supabase
        .from('resources')
        .select('*')
        .in('id', resourceIds)
        .order('order_index', { ascending: true, nullsFirst: false })
        .order('title', { ascending: true })

      if (resourcesError) {
        logError(resourcesError, 'useFavoriteResources.fetchResources')
        throw resourcesError
      }

      // Map resources with favorited_at timestamp
      const favoritesMap = new Map(
        favorites.map((f) => [f.resource_id, f.created_at])
      )

      const favoriteResources: FavoriteResource[] = (resources || [])
        .map((resource) => ({
          ...resource,
          favorited_at: favoritesMap.get(resource.id) || resource.created_at,
        }))
        .sort((a, b) => {
          // Sort by favorited_at (most recent first)
          return new Date(b.favorited_at).getTime() - new Date(a.favorited_at).getTime()
        })

      // Return preview (first 4) and total count
      return {
        preview: favoriteResources.slice(0, 4),
        totalCount: favoriteResources.length,
      }
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

