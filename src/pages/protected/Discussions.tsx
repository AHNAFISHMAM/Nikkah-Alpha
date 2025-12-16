import { useState, useMemo, useCallback, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { SEO } from '../../components/SEO'
import { PAGE_SEO } from '../../lib/seo'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  MessageCircle,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Circle,
  Loader2,
  Heart,
  Users,
  Sparkles,
  User,
  Info,
  UserPlus,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { usePartner } from '../../hooks/usePartner'
import { useRealtimePartnerDiscussionAnswers } from '../../hooks/useRealtimePartnerDiscussionAnswers'
import { useRealtimeOwnDiscussionAnswers } from '../../hooks/useRealtimeOwnDiscussionAnswers'
import { useScrollToSection } from '../../hooks/useScrollToSection'
import { logError, getUserFriendlyError } from '../../lib/error-handler'
import type { UserDiscussionAnswer, DiscussionPrompt, Database } from '../../types/database'
import { Card, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Progress } from '../../components/ui/Progress'
import { cn } from '../../lib/utils'
import { NotesEditor } from '../../components/discussions/NotesEditor'
import { PartnerStatusBadge } from '../../components/discussions/PartnerStatusBadge'
import { SkeletonCard, SkeletonList } from '../../components/common/Skeleton'

// Extract constants to prevent recreation
const CATEGORY_CONFIG: Record<string, { color: string; bgColor: string; icon: typeof Heart }> = {
  values: { color: 'text-primary', bgColor: 'bg-primary/10 dark:bg-accent/30', icon: Heart },
  family: { color: 'text-secondary-foreground', bgColor: 'bg-secondary/10 dark:bg-accent/30', icon: Users },
  lifestyle: { color: 'text-accent-foreground', bgColor: 'bg-accent/10 dark:bg-accent/30', icon: Sparkles },
  finances: { color: 'text-blue-600 dark:text-blue-300', bgColor: 'bg-blue-100 dark:bg-blue-900/20', icon: MessageCircle },
  faith: { color: 'text-purple-600 dark:text-purple-300', bgColor: 'bg-purple-100 dark:bg-purple-900/20', icon: Heart },
  communication: { color: 'text-pink-600 dark:text-pink-300', bgColor: 'bg-pink-100 dark:bg-pink-900/20', icon: MessageCircle },
  goals: { color: 'text-amber-600 dark:text-amber-300', bgColor: 'bg-amber-100 dark:bg-amber-900/20', icon: Sparkles },
}

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

function DiscussionsComponent() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { data: partnerId } = usePartner()
  const [expandedPrompts, setExpandedPrompts] = useState<Set<string>>(new Set())

  // Real-time updates for discussion answers
  useRealtimePartnerDiscussionAnswers() // Partner's answers
  useRealtimeOwnDiscussionAnswers() // Own answers
  
  // Auto-scroll to section when hash is present in URL
  useScrollToSection()

  const { data: prompts, isLoading, isError, error } = useQuery({
    queryKey: ['discussions', user?.id],
    queryFn: async () => {
      if (!user) {
        throw new Error('User not authenticated')
      }

      if (!supabase) {
        throw new Error('Supabase is not configured')
      }

      // Fetch prompts and user answers separately for better compatibility
      // This avoids PostgREST relationship inference issues
      const promptsResult = await supabase
        .from('discussion_prompts')
        .select('*')
        .order('sort_order', { ascending: true })

      if (promptsResult.error) {
        logError(promptsResult.error, 'Discussions.fetchDiscussions')
        throw promptsResult.error
      }

      // Fetch user answers with error handling for schema cache issues
      // If table isn't in cache yet (404), return empty answers array
      let answersResult: { data: UserDiscussionAnswer[] | null; error: Error | null } = { data: [], error: null }
      try {
        const result = await supabase
          .from('user_discussion_answers')
          .select('*')
          .eq('user_id', user.id)
        
        if (result.error) {
          // Check for 404, schema cache errors, or table not found
          const error = result.error
          const statusCode = (error as { status?: number; code?: string | number })?.status || (error as { status?: number; code?: string | number })?.code
          const errorMessage = error.message || String(error)
          
          // Handle 404 or schema cache issues gracefully
          if (statusCode === 404 || 
              statusCode === 'PGRST116' ||
              errorMessage.includes('schema cache') || 
              errorMessage.includes('Could not find the table') ||
              errorMessage.includes('404') ||
              errorMessage.includes('Not Found')) {
            logError(error, 'Discussions.fetchUserAnswers - Schema cache/404 issue, using empty answers')
            answersResult = { data: [], error: null }
          } else {
            // For other errors, log but continue with empty answers (non-fatal)
            logError(error, 'Discussions.fetchUserAnswers - Non-fatal error, using empty answers')
            answersResult = { data: [], error: null }
          }
        } else {
          // Success - use the data
          answersResult = result
        }
      } catch (err: unknown) {
        // Catch network errors, 404s, or any other exceptions
        const error = err as { message?: string; status?: number; code?: string | number; statusCode?: number }
        const errorMessage = error?.message || String(err)
        const statusCode = error?.status || error?.code || error?.statusCode
        
        // Handle 404 or schema cache issues gracefully
        if (statusCode === 404 || 
            statusCode === 'PGRST116' ||
            errorMessage.includes('schema cache') || 
            errorMessage.includes('Could not find the table') ||
            errorMessage.includes('404') ||
            errorMessage.includes('Not Found')) {
          logError(err, 'Discussions.fetchUserAnswers - Schema cache/404 issue, using empty answers')
          answersResult = { data: [], error: null }
        } else {
          // For any other error, log but continue with empty answers (non-fatal)
          logError(err, 'Discussions.fetchUserAnswers - Error caught, using empty answers')
          answersResult = { data: [], error: null }
        }
      }

      // Combine prompts with user answers
      type PromptWithAnswers = DiscussionPrompt & {
        user_discussion_answers: UserDiscussionAnswer[]
      }

      const prompts = (promptsResult.data || []) as DiscussionPrompt[]
      const answers = (answersResult?.data || []) as UserDiscussionAnswer[]
      const answersByPromptId = new Map<string, UserDiscussionAnswer>(
        answers.map(a => [a.prompt_id, a])
      )

      // Combine prompts with user answers
      return prompts.map(prompt => ({
        ...prompt,
        user_discussion_answers: answersByPromptId.has(prompt.id) 
          ? [answersByPromptId.get(prompt.id)!] 
          : []
      })) as PromptWithAnswers[]
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes - discussion prompts don't change often
    retry: (failureCount, error: unknown) => {
      // Don't retry on 404 or schema cache errors
      const err = error as { status?: number; code?: string | number; statusCode?: number; message?: string }
      const statusCode = err?.status || err?.code || err?.statusCode
      const errorMessage = err?.message || String(error)
      
      if (statusCode === 404 || 
          statusCode === 'PGRST116' ||
          errorMessage?.includes('schema cache') || 
          errorMessage?.includes('Could not find the table') ||
          errorMessage?.includes('404')) {
        return false // Don't retry
      }
      // Retry up to 1 time for other errors
      return failureCount < 1
    },
    retryDelay: 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    gcTime: 300000, // 5 minutes cache
  })

  const toggleDiscussedMutation = useMutation({
    mutationFn: async ({ promptId, isDiscussed }: { promptId: string; isDiscussed: boolean }) => {
      if (!user) throw new Error('Not authenticated')
      if (!supabase) throw new Error('Supabase is not configured')

      const { error } = await supabase
        .from('user_discussion_answers')
        .upsert({
          user_id: user.id,
          prompt_id: promptId,
          is_discussed: !isDiscussed,
        } as Database['public']['Tables']['user_discussion_answers']['Insert'], {
          onConflict: 'user_id,prompt_id'
        })

      if (error) throw error
    },
    onSuccess: (_, { isDiscussed }) => {
      queryClient.invalidateQueries({ queryKey: ['discussions'] })
      queryClient.invalidateQueries({ queryKey: ['progress-stats'] })
      // Invalidate partner answer queries so partner sees updated status
      queryClient.invalidateQueries({ queryKey: ['partner-discussion-answer'] })
      toast.success(isDiscussed ? '✅ Marked as not discussed' : '✅ Great conversation!')
    },
    onError: (error) => {
      logError(error, 'Discussions.toggleDiscussed')
      toast.error(`❌ ${getUserFriendlyError(error)}`)
    },
  })

  // Memoize toggle function
  const togglePrompt = useCallback((promptId: string) => {
    setExpandedPrompts((prev) => {
      const next = new Set(prev)
      if (next.has(promptId)) {
        next.delete(promptId)
      } else {
        next.add(promptId)
      }
      return next
    })
  }, [])

  // Use safe defaults while loading - memoized
  const displayPrompts = useMemo(() => prompts || [], [prompts])
  
  // Type for prompt with answers
  type PromptWithAnswers = DiscussionPrompt & {
    user_discussion_answers: UserDiscussionAnswer[]
  }

  // Memoize grouped prompts calculation
  const groupedPrompts = useMemo(() => displayPrompts.reduce((acc: Record<string, PromptWithAnswers[]>, prompt: PromptWithAnswers) => {
    const category = prompt.category || 'Other'
    if (!acc[category]) acc[category] = []
    acc[category].push(prompt)
    return acc
  }, {}), [displayPrompts])
  
  // Memoize progress calculations
  const { totalPrompts, discussedPrompts, progress, isAllDiscussed } = useMemo(() => {
    const total = displayPrompts.length
    const discussed = displayPrompts.filter((p: PromptWithAnswers) => {
    const answers = Array.isArray(p.user_discussion_answers) ? p.user_discussion_answers : []
    return answers.some((a: UserDiscussionAnswer) => a.is_discussed)
  }).length
    const progressPercent = total > 0 ? (discussed / total) * 100 : 0
    const allDiscussed = discussed === total && total > 0
    
    return {
      totalPrompts: total,
      discussedPrompts: discussed,
      progress: progressPercent,
      isAllDiscussed: allDiscussed,
    }
  }, [displayPrompts])

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md">
          <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">⚠️</span>
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Failed to Load Discussions
          </h3>
          <p className="text-muted-foreground mb-4">
            {error ? getUserFriendlyError(error) : 'Unable to fetch discussion prompts. Please check your database setup.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              onClick={() => queryClient.invalidateQueries({ queryKey: ['discussions'] })}
              className="min-h-[44px] w-full sm:w-auto"
            >
              Try Again
            </Button>
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline"
              className="min-h-[44px] w-full sm:w-auto"
            >
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
        title={PAGE_SEO.discussions.title}
        description={PAGE_SEO.discussions.description}
        path="/discussions"
        noIndex
      />

      <div className="min-h-screen w-full bg-gradient-to-br from-primary/5 via-background via-60% to-islamic-purple/5 dark:bg-background">
        <div className="w-full p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6 sm:space-y-8">
          {/* Main Discussions Section */}
          <section id="discussions" className="scroll-mt-20 sm:scroll-mt-24">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-6 sm:mb-8"
              style={{ willChange: 'transform, opacity' }}
            >
              <div className="flex items-center gap-2 text-primary text-sm sm:text-base font-medium mb-2 sm:mb-3">
                <Heart className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>Connect & Communicate</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-2 sm:mb-3">
                Discussion Prompts
              </h1>
              <div className="flex items-center gap-2 sm:gap-3">
                <p className="text-muted-foreground dark:text-muted-foreground/90 text-sm sm:text-base">
                  Important conversations to have with your partner
                </p>
                <div
                  className="group relative"
                  title="Your answers are automatically shared with your partner when they view this prompt"
                >
                  <Info className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground hover:text-foreground transition-colors cursor-help" />
                  <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block w-48 sm:w-64 bg-foreground text-background text-xs px-3 py-2 rounded-lg shadow-lg z-50 pointer-events-none whitespace-normal text-center">
                    Your answers are automatically shared with your partner
                  </span>
                </div>
              </div>
            </motion.div>

          {/* Connect Partner CTA - Show when no partner */}
          {!partnerId && (
            <section>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ willChange: 'transform, opacity' }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="mb-6 sm:mb-8"
              >
                <Card className="overflow-hidden" padding="none">
                  <div className="p-4 sm:p-6 bg-primary/5 dark:bg-card dark:border dark:border-border/50 rounded-xl">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                        <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-primary/10 dark:bg-accent/50 flex items-center justify-center flex-shrink-0">
                          <UserPlus className="h-5 w-5 sm:h-6 sm:w-6 text-primary dark:text-primary/90" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm sm:text-base font-medium text-foreground dark:text-foreground/95 mb-1">
                            Connect with your partner
                          </p>
                          <p className="text-xs sm:text-sm text-muted-foreground dark:text-muted-foreground/85">
                            Share answers and collaborate together on these discussions
                          </p>
                        </div>
                      </div>
                      <Button
                        onClick={() => navigate('/profile')}
                        variant="outline"
                        size="sm"
                        className="min-h-[44px] flex-shrink-0"
                        leftIcon={<UserPlus className="h-4 w-4" />}
                      >
                        Connect Partner
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </section>
          )}

          {/* Progress Overview */}
          <section>
            {isLoading && displayPrompts.length === 0 && user ? (
              <div className="space-y-4 sm:space-y-6">
                <SkeletonList count={5} />
              </div>
            ) : !user ? (
              <Card>
                <CardContent className="py-16 sm:py-20 text-center">
                  <h3 className="font-semibold text-foreground text-lg sm:text-xl mb-2 sm:mb-3">
                    Please log in to view discussions
                  </h3>
                  <p className="text-muted-foreground text-sm sm:text-base">
                    You need to be authenticated to access this page.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="mb-6 sm:mb-8"
              >
                <Card className="overflow-hidden" padding="none">
                  <div className="bg-gradient-to-r from-primary/10 via-islamic-gold/5 to-islamic-purple/10 dark:bg-card dark:border dark:border-border/50 p-6 sm:p-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
                      <div>
                        <h2 className="font-semibold text-foreground dark:text-foreground/95 text-lg sm:text-xl mb-1">
                          Discussions Completed
                        </h2>
                        <p className="text-muted-foreground dark:text-muted-foreground/85 text-sm sm:text-base">
                          {discussedPrompts} of {totalPrompts} conversations
                        </p>
                      </div>
                      {isAllDiscussed && (
                        <div className="flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 bg-pink-100 dark:bg-pink-900/40 text-pink-700 dark:text-pink-300 rounded-full min-h-[36px] sm:min-h-[40px]">
                          <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                          <span className="font-medium text-sm sm:text-base">All Done!</span>
                        </div>
                      )}
                    </div>
                    <div className="mt-4 sm:mt-5">
                      <Progress
                        value={progress}
                        size="lg"
                        variant={isAllDiscussed ? 'success' : 'primary'}
                      />
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}
          </section>

          {/* Prompts by Category */}
          <section>
            <motion.div
              initial="hidden"
              animate="visible"
              variants={CONTAINER_VARIANTS}
              className="space-y-6 sm:space-y-8 mt-6 sm:mt-8"
            >
            {groupedPrompts && Object.entries(groupedPrompts).map(([category, categoryPrompts]: [string, PromptWithAnswers[]]) => {
              const config = CATEGORY_CONFIG[category] || { color: 'text-muted-foreground', bgColor: 'bg-muted', icon: MessageCircle }
              const CategoryIcon = config.icon
              const categoryDiscussed = categoryPrompts.filter((p: PromptWithAnswers) =>
                p.user_discussion_answers?.some((a: UserDiscussionAnswer) => a.is_discussed)
              ).length

                return (
                  <motion.div
                    key={category}
                    variants={ITEM_VARIANTS}
                  >
                    {/* Category Header */}
                    <div className="flex items-center justify-between mb-4 sm:mb-5">
                      <div className="flex items-center gap-3">
                        <h2 className="text-base sm:text-lg font-semibold text-foreground dark:text-foreground/95 capitalize">
                          {category}
                        </h2>
                        <span className="text-sm text-muted-foreground dark:text-muted-foreground/85">
                          {categoryDiscussed} / {categoryPrompts.length} discussed
                        </span>
                      </div>
                      {categoryDiscussed === categoryPrompts.length && categoryPrompts.length > 0 && (
                        <span className="text-xs sm:text-sm font-medium text-green-600 dark:text-green-300 bg-green-100 dark:bg-green-900/40 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full">
                          Complete
                        </span>
                      )}
                    </div>

                    {/* Category Prompts */}
                    <div className="space-y-4 sm:space-y-5">
                      {categoryPrompts.map((prompt: PromptWithAnswers) => {
                        const isExpanded = expandedPrompts.has(prompt.id)
                        const userAnswer = prompt.user_discussion_answers?.[0]
                        const isDiscussed = userAnswer?.is_discussed || false

                        return (
                          <motion.div
                            key={prompt.id}
                            whileHover={{
                              y: -8,
                              scale: 1.02,
                              transition: {
                                type: "spring",
                                stiffness: 300,
                                damping: 20,
                              },
                            }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Card
                              className={cn(
                                'overflow-hidden transition-all duration-200 cursor-pointer relative border-2 hover:border-primary/20 dark:hover:border-primary/30 hover:shadow-sm',
                                isDiscussed && 'bg-green-50/50 dark:bg-green-950/30 border-green-200 dark:border-green-700/50'
                              )}
                              padding="none"
                            >
                              {/* Stripe-style gradient overlay on hover */}
                              <motion.div
                                className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 dark:from-primary/10 dark:via-transparent dark:to-primary/10 opacity-0 z-0 pointer-events-none"
                                whileHover={{ opacity: 1 }}
                                transition={{ duration: 0.3 }}
                              />
                              {/* Subtle shine effect on hover */}
                              <motion.div
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 dark:via-white/5 to-transparent -translate-x-full z-0 pointer-events-none"
                                whileHover={{ x: "200%" }}
                                transition={{ duration: 0.6, ease: "easeInOut" }}
                              />
                              <button
                                onClick={() => togglePrompt(prompt.id)}
                                className="w-full text-left touch-manipulation relative z-10"
                                type="button"
                                aria-expanded={isExpanded}
                                aria-controls={`prompt-content-${prompt.id}`}
                              >
                                <div className="flex items-center gap-4 sm:gap-5 p-5 sm:p-6 min-h-[72px] sm:min-h-[80px]">
                                <div className="flex-1 min-w-0">
                                  <h3 className={cn(
                                    'font-semibold text-base sm:text-lg mb-1 transition-colors',
                                    isDiscussed ? 'text-muted-foreground dark:text-muted-foreground/70 line-through' : 'text-foreground dark:text-foreground/95 group-hover:text-primary'
                                  )}>
                                    {prompt.title}
                                  </h3>
                                  {prompt.description && !isExpanded && (
                                    <p className="text-sm sm:text-base text-muted-foreground dark:text-muted-foreground/85 line-clamp-1">
                                      {prompt.description}
                                    </p>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                                  {isDiscussed && (
                                    <span className="hidden sm:inline-flex text-xs sm:text-sm font-medium text-green-600 dark:text-green-300 bg-green-100 dark:bg-green-900/40 px-3 py-1.5 rounded-full">
                                      Discussed
                                    </span>
                                  )}
                                  <PartnerStatusBadge promptId={prompt.id} />
                                  <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg bg-muted flex items-center justify-center">
                                    {isExpanded ? (
                                      <ChevronUp className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground" />
                                    ) : (
                                      <ChevronDown className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground" />
                                    )}
                                  </div>
                                </div>
                              </div>
                            </button>

                            <AnimatePresence>
                              {isExpanded && (
                                <motion.div
                                  id={`prompt-content-${prompt.id}`}
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="overflow-hidden"
                                >
                                  <div className="px-5 sm:px-6 pb-5 sm:pb-6 pt-0 border-t border-border">
                                    {prompt.description && (
                                      <p className="text-muted-foreground dark:text-muted-foreground/85 mt-5 sm:mt-6 mb-5 sm:mb-6 leading-relaxed text-sm sm:text-base">
                                        {prompt.description}
                                      </p>
                                    )}

                                    <div className="mt-5 sm:mt-6">
                                      <Button
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          toggleDiscussedMutation.mutate({
                                            promptId: prompt.id,
                                            isDiscussed,
                                          })
                                        }}
                                        variant={isDiscussed ? 'outline' : 'primary'}
                                        disabled={toggleDiscussedMutation.isPending}
                                        className="min-h-[44px] w-full sm:w-auto"
                                        leftIcon={isDiscussed ? <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5" /> : <Circle className="h-4 w-4 sm:h-5 sm:w-5" />}
                                      >
                                        {isDiscussed ? 'Mark as Not Discussed' : 'We Discussed This'}
                                      </Button>
                                    </div>

                                  {/* Answer and Notes Editor */}
                                  <NotesEditor
                                    promptId={prompt.id}
                                    userId={user!.id}
                                    initialAnswer={userAnswer?.answer || null}
                                    initialNotes={userAnswer?.follow_up_notes || null}
                                    answerId={userAnswer?.id || null}
                                  />
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </Card>
                          </motion.div>
                      )
                    })}
                  </div>
                </motion.div>
              )
            })}

              {(!prompts || prompts.length === 0) && (
                <Card>
                  <CardContent className="py-16 sm:py-20 text-center">
                    <h3 className="font-semibold text-foreground text-lg sm:text-xl mb-2 sm:mb-3">
                      No discussion prompts yet
                    </h3>
                    <p className="text-muted-foreground text-sm sm:text-base">
                      Check back soon for conversation starters with your partner!
                    </p>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          </section>
          </section>
        </div>
      </div>
    </>
  )
}

export const Discussions = memo(DiscussionsComponent)
