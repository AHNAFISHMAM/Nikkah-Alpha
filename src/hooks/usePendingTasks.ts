import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { logError } from '../lib/error-handler'

export interface PendingTask {
  id: string
  title: string
  is_required: boolean
  category_name: string
  category_id: string
}

export function usePendingTasks(userId: string | undefined) {
  return useQuery({
    queryKey: ['pending-tasks', userId],
    queryFn: async (): Promise<PendingTask[]> => {
      if (!userId) throw new Error('User ID required')
      if (!supabase) throw new Error('Supabase is not configured')

      try {
        // Get all checklist items with their categories
        const { data: allItems, error: allItemsError } = await supabase
          .from('checklist_items')
          .select(`
            id,
            title,
            is_required,
            category_id,
            sort_order,
            checklist_categories!inner(
              name,
              sort_order
            )
          `)
          .order('is_required', { ascending: false })
          .order('sort_order', { ascending: true })

        if (allItemsError) {
          logError(allItemsError, 'usePendingTasks.fetchItems')
          return []
        }

        // Get completed items for this user
        const { data: completedItems, error: completedError } = await supabase
          .from('user_checklist_progress')
          .select('item_id')
          .eq('user_id', userId)
          .eq('is_completed', true)

        if (completedError) {
          // If table doesn't exist or error, assume no items completed
          logError(completedError, 'usePendingTasks.fetchCompleted')
        }

        const completedIds = new Set(completedItems?.map(c => c.item_id) || [])

        // Filter out completed items, sort by category sort_order, then transform
        return (allItems || [])
          .filter((item: any) => !completedIds.has(item.id))
          .sort((a: any, b: any) => {
            // First sort by is_required (required items first)
            if (a.is_required !== b.is_required) {
              return b.is_required ? 1 : -1
            }
            // Then sort by category sort_order
            const categorySortA = a.checklist_categories?.sort_order ?? 999
            const categorySortB = b.checklist_categories?.sort_order ?? 999
            if (categorySortA !== categorySortB) {
              return categorySortA - categorySortB
            }
            // Finally sort by item sort_order
            return (a.sort_order ?? 0) - (b.sort_order ?? 0)
          })
          .slice(0, 5)
          .map((item: any) => ({
            id: item.id,
            title: item.title,
            is_required: item.is_required,
            category_name: item.checklist_categories?.name || 'Other',
            category_id: item.category_id,
          }))
      } catch (error) {
        logError(error, 'usePendingTasks')
        return []
      }
    },
    enabled: !!userId,
    staleTime: 60000, // 60 seconds
    gcTime: 300000, // 5 minutes cache
    retry: 1,
  })
}

