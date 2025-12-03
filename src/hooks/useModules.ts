import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'
import type { Module } from '../types/database'

export interface ModuleWithProgress extends Module {
  completedLessons: number
  totalLessons: number
  isCompleted: boolean
}

/**
 * Fetch all published modules
 */
export function useModules() {
  return useQuery({
    queryKey: ['modules'],
    queryFn: async () => {
      if (!supabase) {
        throw new Error('Supabase is not configured')
      }
      
      // Fetch all modules (PostgREST may not recognize order_index in schema cache)
      const { data, error } = await supabase
        .from('modules')
        .select('*')
      
      if (error) throw error
      
      // Sort client-side by order_index (more reliable than server-side ordering)
      const sorted = (data as Module[]).sort((a, b) => {
        const aIndex = (a as any).order_index ?? 999
        const bIndex = (b as any).order_index ?? 999
        return aIndex - bIndex
      })
      
      return sorted
    },
  })
}

/**
 * Fetch a single module by ID
 */
export function useModule(moduleId: string | undefined) {
  return useQuery({
    queryKey: ['module', moduleId],
    queryFn: async () => {
      if (!supabase || !moduleId) {
        throw new Error('Supabase is not configured or module ID is missing')
      }
      const { data, error } = await supabase
        .from('modules')
        .select('*')
        .eq('id', moduleId)
        .single()

      if (error) throw error
      return data as Module
    },
    enabled: !!moduleId,
  })
}

/**
 * Fetch modules with progress calculation
 */
export function useModulesWithProgress() {
  const { user } = useAuth()

  const { data: modulesData } = useModules()

  // Fetch lessons for each module
  const { data: lessonsData } = useQuery({
    queryKey: ['lessons'],
    queryFn: async () => {
      if (!supabase) {
        throw new Error('Supabase is not configured')
      }
      // @ts-ignore - Supabase types may need regeneration
      const { data, error } = await supabase
        .from('lessons')
        .select('id, module_id')
        .order('sort_order')

      if (error) throw error
      return data
    },
    enabled: !!modulesData,
  })

  // Fetch user progress
  const { data: progressData } = useQuery({
    queryKey: ['user-module-progress', user?.id],
    queryFn: async () => {
      if (!supabase || !user) {
        return []
      }
      // @ts-ignore - Supabase types may need regeneration
      const { data, error } = await supabase
        .from('user_module_progress')
        .select('module_id, lesson_id, is_completed')
        .eq('user_id', user.id)

      if (error) throw error
      return data || []
    },
    enabled: !!user && !!modulesData,
  })

  // Calculate progress for each module
  const modulesWithProgress: ModuleWithProgress[] =
    modulesData && lessonsData && progressData
      ? modulesData.map((module) => {
          const moduleLessons = (lessonsData as any[]).filter(
            (lesson: any) => lesson.module_id === module.id
          )
          const totalLessons = moduleLessons.length
          const completedProgress = (progressData as any[]).filter(
            (p: any) => p.module_id === module.id && p.is_completed
          )
          const completedLessons = completedProgress.length
          const isCompleted = totalLessons > 0 && completedLessons === totalLessons

          return {
            ...module,
            completedLessons,
            totalLessons,
            isCompleted,
          }
        })
      : []

  return {
    data: modulesWithProgress,
    isLoading: !modulesData || !lessonsData || (!!user && !progressData),
    isError: false, // Could be enhanced to check for errors
  }
}

/**
 * Fetch module notes for a specific module
 */
export function useModuleNotes(moduleId: string | undefined) {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['module-notes', moduleId, user?.id],
    queryFn: async () => {
      if (!supabase || !user || !moduleId) {
        return null
      }
      // @ts-ignore - Supabase types may need regeneration
      const { data, error } = await supabase
        .from('module_notes')
        .select('*')
        .eq('user_id', user.id)
        .eq('module_id', moduleId)
        .maybeSingle()

      if (error) throw error
      return data
    },
    enabled: !!user && !!moduleId,
  })
}

/**
 * Mutation to save module notes
 */
export function useSaveModuleNotes() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async ({
      moduleId,
      notes,
    }: {
      moduleId: string
      notes: string
    }) => {
      if (!supabase || !user) {
        throw new Error('Supabase is not configured or user is not authenticated')
      }

      const { data, error } = await (supabase
        .from('module_notes') as any)
        .upsert(
          {
            user_id: user.id,
            module_id: moduleId,
            notes,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: 'user_id,module_id',
          }
        )
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['module-notes', variables.moduleId] })
      toast.success('Notes saved successfully')
    },
    onError: () => {
      toast.error('Failed to save notes')
    },
  })
}

/**
 * Mutation to mark module as complete
 */
export function useCompleteModule() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async ({ moduleId }: { moduleId: string }) => {
      if (!supabase || !user) {
        throw new Error('Supabase is not configured or user is not authenticated')
      }

      const { data, error } = await (supabase
        .from('module_notes') as any)
        .upsert(
          {
            user_id: user.id,
            module_id: moduleId,
            is_completed: true,
            completed_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: 'user_id,module_id',
          }
        )
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['module-notes', variables.moduleId] })
      queryClient.invalidateQueries({ queryKey: ['user-module-progress'] })
      queryClient.invalidateQueries({ queryKey: ['modules'] })
      toast.success('Module marked as complete! 🎉')
    },
    onError: () => {
      toast.error('Failed to mark module as complete')
    },
  })
}

