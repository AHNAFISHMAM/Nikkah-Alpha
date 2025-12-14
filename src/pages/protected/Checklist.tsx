import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SEO } from '../../components/SEO'
import { PAGE_SEO } from '../../lib/seo'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  CheckCircle,
  Circle,
  ChevronDown,
  ChevronUp,
  Loader2,
  Target,
  Sparkles,
  Info,
  Plus,
  StickyNote,
  MessageCircle,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { logError, getUserFriendlyError } from '../../lib/error-handler'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Progress } from '../../components/ui/Progress'
import { cn } from '../../lib/utils'
import type { ChecklistCategory, ChecklistItem, UserChecklistProgress } from '../../types/database'
import { CustomItemDialog } from '../../components/checklist/CustomItemDialog'
import { ChecklistItemNotesModal } from '../../components/checklist/ChecklistItemNotesModal'
import { PrintableChecklist } from '../../components/checklist/PrintableChecklist'
import { useRealtimeChecklist } from '../../hooks/useRealtimeChecklist'
import confetti from 'canvas-confetti'
import { SkeletonCard, SkeletonList } from '../../components/common/Skeleton'

interface CategoryWithItems extends ChecklistCategory {
  checklist_items: (ChecklistItem & {
    user_checklist_progress: UserChecklistProgress[]
  })[]
}

// Extract constants to prevent recreation
const CONTAINER_VARIANTS = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
} as const

const ITEM_VARIANTS = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
} as const

export function Checklist() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [showCustomDialog, setShowCustomDialog] = useState(false)
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)
  const [notesModal, setNotesModal] = useState<{ itemId: string; itemTitle: string; notes: string | null } | null>(null)

  // Real-time updates for checklist progress
  useRealtimeChecklist()

  const { data: categories, isLoading, isError, error } = useQuery({
    queryKey: ['checklist', user?.id],
    queryFn: async () => {
      if (!user) {
        throw new Error('User not authenticated')
      }

      if (!supabase) {
        throw new Error('Supabase is not configured')
      }

      const { data, error } = await supabase
        .from('checklist_categories')
        .select(`
          *,
          checklist_items (
            *,
            user_checklist_progress (*)
          )
        `)
        .order('sort_order')

      if (error) {
        logError(error, 'Checklist.fetchChecklist')
        throw error
      }
      
      // Type-safe handling of nested relations
      type CategoryResult = {
        id: string
        name: string
        description: string | null
        icon: string | null
        sort_order: number
        created_at: string
        checklist_items?: Array<{
          id: string
          category_id: string
          title: string
          description: string | null
          is_required: boolean
          sort_order: number
          created_at: string
          user_checklist_progress?: Array<{ is_completed: boolean; notes: string | null; discuss_with_partner: boolean }> | null
        }> | null
      }
      
      return (data as CategoryResult[]).map(cat => ({
        ...cat,
        checklist_items: (Array.isArray(cat.checklist_items) ? cat.checklist_items : []).map(item => ({
          ...item,
          user_checklist_progress: Array.isArray(item.user_checklist_progress) ? item.user_checklist_progress : [],
        })),
      })) as CategoryWithItems[]
    },
    enabled: !!user,
    staleTime: 60000,
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    gcTime: 300000, // 5 minutes cache
    // Add timeout to prevent infinite loading
    meta: {
      errorMessage: 'Failed to load checklist. Please try again.',
    },
  })

  const toggleMutation = useMutation({
    mutationFn: async ({ itemId, isCompleted }: { itemId: string; isCompleted: boolean }) => {
      if (!user) throw new Error('Not authenticated')
      if (!supabase) throw new Error('Supabase is not configured')

      // Get existing progress to preserve notes and discuss flag
      const { data: existing } = await supabase
        .from('user_checklist_progress')
        .select('notes, discuss_with_partner')
        .eq('user_id', user.id)
        .eq('item_id', itemId)
        .maybeSingle()

      if (isCompleted) {
        const { error } = await supabase
          .from('user_checklist_progress')
          .delete()
          .eq('user_id', user.id)
          .eq('item_id', itemId)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('user_checklist_progress')
          .upsert({
            user_id: user.id,
            item_id: itemId,
            is_completed: true,
            completed_at: new Date().toISOString(),
            notes: existing?.notes || null,
            discuss_with_partner: existing?.discuss_with_partner || false,
          } as any, {
            onConflict: 'user_id,item_id',
          })

        if (error) throw error
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['checklist'] })
      queryClient.invalidateQueries({ queryKey: ['progress-stats'] })
      
      // Show confetti and success message when completing an item
      if (!variables.isCompleted) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b'],
        })
        toast.success('Mashallah! Task completed! ✨')
      } else {
        toast.success('✅ Item updated')
      }
    },
    onError: (error) => {
      logError(error, 'Checklist.toggleItem')
      toast.error(`❌ ${getUserFriendlyError(error)}`)
    },
  })

  const toggleDiscussMutation = useMutation({
    mutationFn: async ({ itemId, discussWithPartner }: { itemId: string; discussWithPartner: boolean }) => {
      if (!user) throw new Error('Not authenticated')
      if (!supabase) throw new Error('Supabase is not configured')

      // Get existing progress to preserve notes and completion status
      const { data: existing } = await supabase
        .from('user_checklist_progress')
        .select('is_completed, notes, completed_at')
        .eq('user_id', user.id)
        .eq('item_id', itemId)
        .maybeSingle()

      const { error } = await supabase
        .from('user_checklist_progress')
        .upsert({
          user_id: user.id,
          item_id: itemId,
          discuss_with_partner: discussWithPartner,
          is_completed: existing?.is_completed || false,
          notes: existing?.notes || null,
          completed_at: existing?.completed_at || null,
        } as any, {
          onConflict: 'user_id,item_id',
        })

      if (error) throw error
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['checklist'] })
      toast.success(variables.discussWithPartner ? 'Marked for discussion' : 'Removed from discussion')
    },
    onError: (error) => {
      logError(error, 'Checklist.toggleDiscuss')
      toast.error('Failed to update discussion flag')
    },
  })

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev)
      if (next.has(categoryId)) {
        next.delete(categoryId)
      } else {
        next.add(categoryId)
      }
      return next
    })
  }

  // Use safe defaults while loading - memoized
  const displayCategories = useMemo(() => categories || [], [categories])
  
  // Memoize progress calculation to prevent unnecessary recalculations
  const progress = useMemo(() => {
    let completed = 0
    let total = 0

    displayCategories.forEach((category) => {
      const items = Array.isArray(category.checklist_items) ? category.checklist_items : []
      items.forEach((item) => {
        total++
        const progress = Array.isArray(item.user_checklist_progress) ? item.user_checklist_progress : []
        if (progress.some((p) => p.is_completed)) {
          completed++
        }
      })
    })

    return {
      completed,
      total,
      percent: total > 0 ? Math.round((completed / total) * 100) : 0,
    }
  }, [displayCategories])

  // Memoize Sets and Maps for O(1) lookup - prevents recreation
  const { completedSet, progressMap } = useMemo(() => {
  const completedSet = new Set<string>()
  const progressMap = new Map<string, { notes: string | null; discussWithPartner: boolean }>()
  
  displayCategories.forEach((category) => {
    const items = Array.isArray(category.checklist_items) ? category.checklist_items : []
    items.forEach((item) => {
      const progressItem = Array.isArray(item.user_checklist_progress) ? item.user_checklist_progress[0] : null
      if (progressItem?.is_completed) {
        completedSet.add(item.id)
      }
      if (progressItem) {
        progressMap.set(item.id, {
          notes: progressItem.notes || null,
          discussWithPartner: progressItem.discuss_with_partner || false,
        })
      }
    })
  })
    
    return { completedSet, progressMap }
  }, [displayCategories])

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md">
          <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">⚠️</span>
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Failed to Load Checklist
          </h3>
          <p className="text-muted-foreground mb-4">
            {error ? getUserFriendlyError(error) : 'Unable to fetch checklist data. Please check your database setup.'}
          </p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['checklist'] })}>
              Try Again
            </Button>
            <Button onClick={() => window.location.reload()} variant="outline">
              Hard Reload
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <SEO
        title={PAGE_SEO.checklist.title}
        description={PAGE_SEO.checklist.description}
        path="/checklist"
        noIndex
      />

      <div className="min-h-screen w-full bg-gradient-to-br from-primary/5 via-background via-60% to-islamic-purple/5">
        <div className="w-full p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6 sm:space-y-8">
          {/* Main Checklist Section */}
          <section id="checklist" className="scroll-mt-20 sm:scroll-mt-24">
          {/* Page Header Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6 sm:mb-8"
          >
            <div className="flex items-center gap-2 text-primary text-xs sm:text-sm font-medium mb-3">
              <Target className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>Track Your Progress</span>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground leading-tight mb-2">
                Marriage Readiness Checklist
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Complete these items to prepare for your blessed union
              </p>
            </div>
          </motion.div>

          {/* Progress Overview Section */}
          <section>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mb-6 sm:mb-8"
            >
              <Card padding="none" className="overflow-hidden">
                <div className="bg-gradient-to-r from-primary/10 via-islamic-gold/5 to-islamic-purple/10 px-6 py-5 sm:px-8 sm:py-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
                    <div className="flex items-center gap-4 sm:gap-5">
                      <div className="h-14 w-14 sm:h-16 sm:w-16 lg:h-20 lg:w-20 rounded-xl sm:rounded-2xl bg-card shadow-sm flex items-center justify-center flex-shrink-0">
                        <span className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary">
                          {progress.percent}%
                        </span>
                      </div>
                      <div>
                        <h2 className="font-semibold text-foreground text-lg sm:text-xl mb-1">
                          Overall Progress
                        </h2>
                        <p className="text-sm sm:text-base text-muted-foreground">
                          {progress.completed} of {progress.total} items completed
                        </p>
                      </div>
                    </div>
                    {progress.percent === 100 && (
                      <div className="flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 bg-badge-gradient rounded-full flex-shrink-0">
                        <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />
                        <span className="text-sm sm:text-base font-medium">All done!</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-4 sm:mt-5">
                    <Progress
                      value={progress.percent}
                      size="lg"
                      variant={progress.percent === 100 ? 'success' : 'primary'}
                    />
                  </div>
                </div>
              </Card>
            </motion.div>
          </section>

          {/* Categories Section */}
          <section>
            <motion.div
              initial="hidden"
              animate="visible"
              variants={CONTAINER_VARIANTS}
              className="space-y-4 sm:space-y-6 mt-6 sm:mt-8"
              style={{ willChange: 'transform, opacity' }}
            >
            {isLoading && !categories ? (
              <div className="space-y-4 sm:space-y-6">
                {/* Progress Card Skeleton */}
                <SkeletonCard />
                {/* Categories Skeleton */}
                <SkeletonList count={4} />
              </div>
            ) : displayCategories.length > 0 ? (
            displayCategories.map((category) => {
              const isExpanded = expandedCategories.has(category.id)
              const items = Array.isArray(category.checklist_items) ? category.checklist_items : []
              const categoryCompleted = items.filter((item) => {
                const progress = Array.isArray(item.user_checklist_progress) ? item.user_checklist_progress : []
                return progress.some((p) => p.is_completed)
              }).length
              const categoryTotal = items.length
              const categoryPercent = categoryTotal > 0
                ? Math.round((categoryCompleted / categoryTotal) * 100)
                : 0

              return (
                <motion.div 
                  key={category.id} 
                  variants={ITEM_VARIANTS}
                  style={{ willChange: 'transform, opacity' }}
                >
                  <Card padding="none" className="overflow-hidden">
                    <button
                      onClick={() => toggleCategory(category.id)}
                      className="w-full text-left"
                      aria-expanded={isExpanded}
                      aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${category.name} category`}
                    >
                      <CardHeader className="px-6 py-5 sm:px-8 sm:py-6">
                        <div className="flex items-center justify-between gap-4">
                          <div className="min-w-0 flex-1">
                            <CardTitle className="text-base sm:text-lg lg:text-xl mb-2">
                              {category.name}
                            </CardTitle>
                            <div className="flex items-center gap-2 sm:gap-3">
                              <span className="text-sm sm:text-base text-muted-foreground">
                                {categoryCompleted} / {categoryTotal}
                              </span>
                              {categoryPercent === 100 && (
                                <span className="text-xs sm:text-sm bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 sm:px-2.5 py-1 rounded-full font-medium">
                                  Complete
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-4 sm:gap-5">
                            <div className="hidden sm:block w-28 sm:w-32">
                              <Progress
                                value={categoryPercent}
                                size="sm"
                                variant={categoryPercent === 100 ? 'success' : 'primary'}
                              />
                            </div>
                            <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                              {isExpanded ? (
                                <ChevronUp className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground" />
                              ) : (
                                <ChevronDown className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground" />
                              )}
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                    </button>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <CardContent className="px-6 pb-6 sm:px-8 sm:pb-8 pt-0">
                            {category.description && (
                              <div className="flex items-start gap-3 p-4 mb-5 sm:mb-6 bg-primary/10 rounded-xl text-sm sm:text-base text-foreground border border-primary/20">
                                <Info className="h-5 w-5 mt-0.5 flex-shrink-0 text-primary" />
                                <p className="leading-relaxed">{category.description}</p>
                              </div>
                            )}
                            <div className="space-y-3 border-t border-border pt-5 sm:pt-6">
                              {items.map((item) => {
                                const isCompleted = completedSet.has(item.id)
                                const progress = progressMap.get(item.id) || { notes: null, discussWithPartner: false }
                                const notes = progress.notes
                                const discussWithPartner = progress.discussWithPartner

                                return (
                                  <div
                                    key={item.id}
                                    className={cn(
                                      'w-full flex items-start gap-4 p-4 sm:p-5 rounded-xl transition-all duration-200 min-h-[56px] touch-manipulation',
                                      'hover:bg-accent/50',
                                      isCompleted && 'bg-primary/5 dark:bg-primary/10 hover:bg-primary/10 dark:hover:bg-primary/20'
                                    )}
                                  >
                                    <motion.button
                                      whileTap={{ scale: 0.98 }}
                                      onClick={() =>
                                        toggleMutation.mutate({
                                          itemId: item.id,
                                          isCompleted,
                                        })
                                      }
                                      disabled={toggleMutation.isPending}
                                      aria-label={`${isCompleted ? 'Mark as incomplete' : 'Mark as complete'}: ${item.title}`}
                                      aria-pressed={isCompleted}
                                      className="flex-shrink-0 mt-0.5"
                                    >
                                      {isCompleted ? (
                                        <motion.div
                                          initial={{ scale: 0, rotate: -180 }}
                                          animate={{ scale: 1, rotate: 0 }}
                                          transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                                        >
                                          <CheckCircle className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
                                        </motion.div>
                                      ) : (
                                        <Circle className="h-6 w-6 sm:h-7 sm:w-7 text-muted-foreground" />
                                      )}
                                    </motion.button>
                                    <div className="flex-1 min-w-0">
                                      <p
                                        className={cn(
                                          'font-medium text-sm sm:text-base transition-colors leading-relaxed',
                                          isCompleted
                                            ? 'text-muted-foreground line-through'
                                            : 'text-foreground'
                                        )}
                                      >
                                        {item.title}
                                      </p>
                                      {item.description && (
                                        <p className="text-sm sm:text-base text-muted-foreground mt-1.5 sm:mt-2 leading-relaxed">
                                          {item.description}
                                        </p>
                                      )}
                                      {notes && (
                                        <p className="text-xs sm:text-sm text-muted-foreground mt-2 italic line-clamp-1">
                                          📝 {notes.substring(0, 50)}{notes.length > 50 ? '...' : ''}
                                        </p>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                      {item.is_required && !isCompleted && (
                                        <span className="text-xs sm:text-sm bg-secondary/20 dark:bg-secondary/30 text-secondary-700 dark:text-secondary-300 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full font-medium">
                                          Required
                                        </span>
                                      )}
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          setNotesModal({
                                            itemId: item.id,
                                            itemTitle: item.title,
                                            notes,
                                          })
                                        }}
                                        className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg hover:bg-accent flex items-center justify-center transition-colors touch-manipulation"
                                        aria-label={`${notes ? 'Edit' : 'Add'} notes for ${item.title}`}
                                      >
                                        <StickyNote className={cn(
                                          'h-4 w-4 sm:h-5 sm:w-5',
                                          notes ? 'text-primary fill-primary/20' : 'text-muted-foreground'
                                        )} />
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          toggleDiscussMutation.mutate({
                                            itemId: item.id,
                                            discussWithPartner: !discussWithPartner,
                                          })
                                        }}
                                        className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg hover:bg-accent flex items-center justify-center transition-colors touch-manipulation"
                                        aria-label={`${discussWithPartner ? 'Remove' : 'Add'} discuss flag for ${item.title}`}
                                      >
                                        <MessageCircle className={cn(
                                          'h-4 w-4 sm:h-5 sm:w-5',
                                          discussWithPartner ? 'text-blue-600 fill-blue-600/20' : 'text-muted-foreground'
                                        )} />
                                      </button>
                                    </div>
                                  </div>
                                )
                              })}

                              {/* Add Custom Item Button */}
                              <div className="mt-5 sm:mt-6 pt-5 sm:pt-6 border-t border-border">
                                <button
                                  onClick={() => {
                                    setSelectedCategoryId(category.id)
                                    setShowCustomDialog(true)
                                  }}
                                  aria-label={`Add custom item to ${category.name}`}
                                  className="w-full flex items-center justify-center gap-2 sm:gap-3 p-4 sm:p-5 rounded-xl border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 dark:hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all min-h-[48px] touch-manipulation"
                                >
                                  <Plus className="h-5 w-5 sm:h-6 sm:w-6" />
                                  <span className="font-medium text-sm sm:text-base">Add Custom Item</span>
                                </button>
                              </div>
                            </div>
                          </CardContent>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>
                </motion.div>
              )
            })
            ) : null}

            {!isLoading && categories && displayCategories.length === 0 && (
              <Card>
                <CardContent className="py-16 sm:py-20 text-center">
                  <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-5 sm:mb-6">
                    <Target className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold text-foreground text-lg sm:text-xl mb-2 sm:mb-3">
                    No checklist items yet
                  </h3>
                  <p className="text-muted-foreground text-sm sm:text-base">
                    Check back soon for your marriage preparation checklist!
                  </p>
                </CardContent>
              </Card>
            )}
          </motion.div>
          </section>
        </section>
        </div>
      </div>

      {/* Custom Item Dialog */}
      {showCustomDialog && selectedCategoryId && (
        <CustomItemDialog
          categoryId={selectedCategoryId}
          userId={user!.id}
          onClose={() => {
            setShowCustomDialog(false)
            setSelectedCategoryId(null)
          }}
        />
      )}

      {/* Notes Modal */}
      {notesModal && (
        <ChecklistItemNotesModal
          isOpen={!!notesModal}
          itemId={notesModal.itemId}
          itemTitle={notesModal.itemTitle}
          currentNotes={notesModal.notes}
          onClose={() => setNotesModal(null)}
        />
      )}

      {/* Printable Checklist - Hidden on screen, visible when printing */}
      {categories && (
        <PrintableChecklist
          categories={categories}
          completedSet={completedSet}
          progressMap={progressMap}
        />
      )}
    </>
  )
}
