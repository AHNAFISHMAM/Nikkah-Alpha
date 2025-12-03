import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { differenceInDays } from 'date-fns'
import { logError } from '../lib/error-handler'

interface ProgressStats {
  // Checklist
  checklistCompleted: number
  checklistTotal: number
  checklistPercent: number

  // Modules
  modulesCompleted: number
  modulesTotal: number

  // Discussions
  discussionsCompleted: number
  discussionsTotal: number

  // Wedding
  daysUntilWedding: number | null
  weddingDate: Date | null

  // Financial
  hasBudget: boolean
  budgetAmount: number | null
}

export function useProgressStats(userId: string | undefined) {
  return useQuery({
    queryKey: ['progress-stats', userId],
    queryFn: async (): Promise<ProgressStats> => {
      if (!userId) throw new Error('User ID required')
      if (!supabase) throw new Error('Supabase is not configured')

      try {
        // Try to use optimized view first, fallback to direct queries if view doesn't exist
        let statsResult: { data: any; error: any } | null = null
        let useView = true
        
        try {
          const viewResult = await supabase
            .from('user_stats_summary')
            .select('*')
            .eq('user_id', userId)
            .maybeSingle()
          
          // Check if view exists (404/PGRST116 means view doesn't exist)
          // Also check for common error patterns indicating missing view/table
          if (viewResult.error) {
            const errorCode = viewResult.error.code
            const errorMessage = viewResult.error.message || ''
            const isViewMissing = 
              errorCode === 'PGRST116' || 
              errorMessage.includes('does not exist') ||
              errorMessage.includes('relation') && errorMessage.includes('does not exist')
            
            if (isViewMissing) {
              useView = false
            } else {
              // Other error, still use the result (might be no data)
              statsResult = viewResult
            }
          } else {
            statsResult = viewResult
          }
        } catch (viewError: any) {
          // View doesn't exist or other error, fallback to direct queries
          useView = false
        }

        // Fallback: Query tables directly if view doesn't exist
        if (!useView || !statsResult || statsResult.error) {
          const [
            checklistResult,
            checklistProgressResult,
            modulesCountResult,
            discussionsCountResult,
            discussionsProgressResult,
            profileResult
          ] = await Promise.all([
            supabase.from('checklist_items').select('id', { count: 'exact', head: true }),
            supabase.from('user_checklist_progress').select('item_id').eq('user_id', userId).eq('is_completed', true),
            supabase.from('modules').select('id', { count: 'exact', head: true }),
            supabase.from('discussion_prompts').select('id', { count: 'exact', head: true }),
            supabase.from('user_discussion_answers').select('prompt_id').eq('user_id', userId).eq('is_discussed', true),
            supabase.from('profiles').select('wedding_date').eq('id', userId).maybeSingle()
          ])

          statsResult = {
            data: {
              checklist_total: checklistResult.count || 0,
              checklist_completed: checklistProgressResult.data?.length || 0,
              modules_total: modulesCountResult.count || 0,
              discussions_total: discussionsCountResult.count || 0,
              discussions_completed: discussionsProgressResult.data?.length || 0,
              wedding_date: (profileResult.data as { wedding_date?: string | null } | null)?.wedding_date || null
            },
            error: null
          }
        }

        // Get modules with lessons and budget data
        const [
          modulesData,
          budgetResult
        ] = await Promise.all([
          // Query 2: Get modules with lessons for completion calculation
          supabase
            .from('modules')
            .select(`
              id,
              lessons!inner(id),
              user_module_progress(module_id, lesson_id, is_completed)
            `),
          // Query 3: Get wedding budget data
          supabase
            .from('wedding_budgets')
            .select('*')
            .eq('user_id', userId)
            .maybeSingle()
        ])

        // Use view data for basic stats
        const stats = statsResult.data || {
          checklist_total: 0,
          checklist_completed: 0,
          modules_total: 0,
          discussions_total: 0,
          discussions_completed: 0,
          wedding_date: null
        }

        const checklistTotal = stats.checklist_total || 0
        const checklistCompleted = stats.checklist_completed || 0
        const checklistPercent = checklistTotal > 0
          ? Math.round((checklistCompleted / checklistTotal) * 100)
          : 0

        // Calculate modules completed from nested data
        type ModuleWithLessons = {
          id: string
          lessons?: { id: string }[] | null
          user_module_progress?: { module_id: string; lesson_id: string | null; is_completed: boolean }[] | null
        }
        const modules = (modulesData.data as ModuleWithLessons[]) || []
        const modulesTotal = modules.length
        const modulesCompleted = modules.filter(module => {
          const totalLessons = Array.isArray(module.lessons) ? module.lessons.length : 0
          if (totalLessons === 0) return false

          const completedLessons = Array.isArray(module.user_module_progress)
            ? module.user_module_progress.filter(p => p.module_id === module.id && p.is_completed).length
            : 0

          return completedLessons >= totalLessons
        }).length

        const discussionsTotal = stats.discussions_total || 0
        const discussionsCompleted = stats.discussions_completed || 0

        // Wedding date calculation
        const weddingDate = stats.wedding_date ? new Date(stats.wedding_date) : null
        const daysUntilWedding = weddingDate
          ? differenceInDays(weddingDate, new Date())
          : null

        // Budget data - calculate total from wedding_budgets table
        type WeddingBudgetRow = {
          venue_planned?: number
          catering_planned?: number
          photography_planned?: number
          clothing_planned?: number
          decor_planned?: number
          invitations_planned?: number
          other_planned?: number
        } | null
        const weddingBudget = budgetResult.data as WeddingBudgetRow
        const hasBudget = !!weddingBudget
        // Calculate total budget from all planned amounts
        const budgetAmount = weddingBudget
          ? (Number(weddingBudget.venue_planned || 0) +
             Number(weddingBudget.catering_planned || 0) +
             Number(weddingBudget.photography_planned || 0) +
             Number(weddingBudget.clothing_planned || 0) +
             Number(weddingBudget.decor_planned || 0) +
             Number(weddingBudget.invitations_planned || 0) +
             Number(weddingBudget.other_planned || 0))
          : null

        return {
          checklistCompleted,
          checklistTotal,
          checklistPercent,
          modulesCompleted,
          modulesTotal,
          discussionsCompleted,
          discussionsTotal,
          daysUntilWedding,
          weddingDate,
          hasBudget,
          budgetAmount
        }
      } catch (error) {
        logError(error, 'useProgressStats')
        // Return default values on error to prevent infinite loading
        return {
          checklistCompleted: 0,
          checklistTotal: 0,
          checklistPercent: 0,
          modulesCompleted: 0,
          modulesTotal: 0,
          discussionsCompleted: 0,
          discussionsTotal: 0,
          daysUntilWedding: null,
          weddingDate: null,
          hasBudget: false,
          budgetAmount: null
        }
      }
    },
    enabled: !!userId,
    staleTime: 60000, // 60 seconds - increased to reduce refetches
    gcTime: 300000, // 5 minutes cache
    retry: 1, // Only retry once on failure
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchOnMount: false, // Don't refetch on mount if data exists
  })
}
