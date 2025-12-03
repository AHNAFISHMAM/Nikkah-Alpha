import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { logError } from '../lib/error-handler'
import { formatDistanceToNow } from 'date-fns'

export interface ActivityItem {
  id: string
  type: 'checklist' | 'module' | 'discussion' | 'budget' | 'profile'
  title: string
  description: string
  timestamp: Date
  link?: string
  icon?: string
}

export function useRecentActivity(userId: string | undefined) {
  return useQuery({
    queryKey: ['recent-activity', userId],
    queryFn: async (): Promise<ActivityItem[]> => {
      if (!userId) throw new Error('User ID required')
      if (!supabase) throw new Error('Supabase is not configured')

      try {
        const activities: ActivityItem[] = []

        // 1. Checklist completions
        try {
          const { data: checklistCompletions } = await supabase
            .from('user_checklist_progress')
            .select(`
              id,
              completed_at,
              checklist_items!inner(title)
            `)
            .eq('user_id', userId)
            .eq('is_completed', true)
            .not('completed_at', 'is', null)
            .order('completed_at', { ascending: false })
            .limit(5)

          if (checklistCompletions) {
            checklistCompletions.forEach((item: any) => {
              if (item.completed_at) {
                activities.push({
                  id: `checklist-${item.id}`,
                  type: 'checklist',
                  title: `Completed: ${item.checklist_items?.title || 'Task'}`,
                  description: 'Checklist item completed',
                  timestamp: new Date(item.completed_at),
                  link: '/checklist',
                })
              }
            })
          }
        } catch (err) {
          // Table might not exist, skip
        }

        // 2. Module/lesson completions
        try {
          const { data: moduleCompletions } = await supabase
            .from('user_module_progress')
            .select(`
              id,
              completed_at,
              module_id,
              lesson_id,
              modules(title),
              lessons(title)
            `)
            .eq('user_id', userId)
            .eq('is_completed', true)
            .not('completed_at', 'is', null)
            .order('completed_at', { ascending: false })
            .limit(5)

          if (moduleCompletions) {
            moduleCompletions.forEach((item: any) => {
              if (item.completed_at) {
                const moduleTitle = item.modules?.title || 'Module'
                const lessonTitle = item.lessons?.title || 'Lesson'
                activities.push({
                  id: `module-${item.id}`,
                  type: 'module',
                  title: `Finished: ${lessonTitle}`,
                  description: `From ${moduleTitle}`,
                  timestamp: new Date(item.completed_at),
                  link: '/modules',
                })
              }
            })
          }
        } catch (err) {
          // Table might not exist, skip
        }

        // 3. Discussion completions
        try {
          const { data: discussionCompletions } = await supabase
            .from('user_discussion_answers')
            .select(`
              id,
              updated_at,
              discussion_prompts!inner(title)
            `)
            .eq('user_id', userId)
            .eq('is_discussed', true)
            .order('updated_at', { ascending: false })
            .limit(5)

          if (discussionCompletions) {
            discussionCompletions.forEach((item: any) => {
              if (item.updated_at) {
                activities.push({
                  id: `discussion-${item.id}`,
                  type: 'discussion',
                  title: `Discussed: ${item.discussion_prompts?.title || 'Topic'}`,
                  description: 'Discussion completed',
                  timestamp: new Date(item.updated_at),
                  link: '/discussions',
                })
              }
            })
          }
        } catch (err) {
          // Table might not exist, skip
        }

        // 4. Budget updates
        try {
          const { data: budgetUpdates } = await supabase
            .from('user_financial_data')
            .select('id, updated_at, data')
            .eq('user_id', userId)
            .eq('data_type', 'budget')
            .order('updated_at', { ascending: false })
            .limit(3)

          if (budgetUpdates) {
            budgetUpdates.forEach((item: any) => {
              if (item.updated_at && item.data?.total) {
                activities.push({
                  id: `budget-${item.id}`,
                  type: 'budget',
                  title: `Updated budget to $${item.data.total.toLocaleString()}`,
                  description: 'Budget updated',
                  timestamp: new Date(item.updated_at),
                  link: '/financial',
                })
              }
            })
          }
        } catch (err) {
          // Table might not exist, skip
        }

        // 5. Profile updates (wedding date, partner connection)
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('id, updated_at, wedding_date, partner_name')
            .eq('id', userId)
            .maybeSingle()

          if (profile?.updated_at) {
            // Only include if updated recently (within last 7 days)
            const updatedAt = new Date(profile.updated_at)
            const daysSinceUpdate = (Date.now() - updatedAt.getTime()) / (1000 * 60 * 60 * 24)
            
            if (daysSinceUpdate < 7) {
              if (profile.wedding_date) {
                activities.push({
                  id: `profile-wedding-${profile.id}`,
                  type: 'profile',
                  title: 'Wedding date set',
                  description: `Wedding date: ${new Date(profile.wedding_date).toLocaleDateString()}`,
                  timestamp: updatedAt,
                  link: '/profile',
                })
              }
              
              if (profile.partner_name) {
                activities.push({
                  id: `profile-partner-${profile.id}`,
                  type: 'profile',
                  title: 'Partner connected',
                  description: `Connected with ${profile.partner_name}`,
                  timestamp: updatedAt,
                  link: '/profile',
                })
              }
            }
          }
        } catch (err) {
          // Skip if error
        }

        // Sort all activities by timestamp (newest first) and limit to 7
        return activities
          .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
          .slice(0, 7)
          .map(activity => ({
            ...activity,
            description: formatDistanceToNow(activity.timestamp, { addSuffix: true }),
          }))
      } catch (error) {
        logError(error, 'useRecentActivity')
        return []
      }
    },
    enabled: !!userId,
    staleTime: 60000, // 60 seconds
    gcTime: 300000, // 5 minutes cache
    retry: 1,
  })
}

