import { useState } from 'react'
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
import { Card, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Progress } from '../../components/ui/Progress'
import { cn } from '../../lib/utils'
import { NotesEditor } from '../../components/discussions/NotesEditor'
import { PartnerStatusBadge } from '../../components/discussions/PartnerStatusBadge'

const categoryConfig: Record<string, { color: string; bgColor: string; icon: typeof Heart }> = {
  values: { color: 'text-primary', bgColor: 'bg-primary/10 dark:bg-primary/20', icon: Heart },
  family: { color: 'text-secondary-foreground', bgColor: 'bg-secondary/10 dark:bg-secondary/20', icon: Users },
  lifestyle: { color: 'text-accent-foreground', bgColor: 'bg-accent/10 dark:bg-accent/20', icon: Sparkles },
  finances: { color: 'text-blue-600 dark:text-blue-400', bgColor: 'bg-blue-100 dark:bg-blue-900/30', icon: MessageCircle },
  faith: { color: 'text-purple-600 dark:text-purple-400', bgColor: 'bg-purple-100 dark:bg-purple-900/30', icon: Heart },
  communication: { color: 'text-pink-600 dark:text-pink-400', bgColor: 'bg-pink-100 dark:bg-pink-900/30', icon: MessageCircle },
  goals: { color: 'text-amber-600 dark:text-amber-400', bgColor: 'bg-amber-100 dark:bg-amber-900/30', icon: Sparkles },
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
}

export function Discussions() {
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
        .order('order_index', { ascending: true })

      if (promptsResult.error) {
        logError(promptsResult.error, 'Discussions.fetchDiscussions')
        throw promptsResult.error
      }

      // Fetch user answers with error handling for schema cache issues
      // If table isn't in cache yet (404), return empty answers array
      let answersResult: { data: any[] | null; error: any } = { data: [], error: null }
      try {
        const result = await supabase
          .from('user_discussion_answers')
          .select('*')
          .eq('user_id', user.id)
        
        if (result.error) {
          // Check for 404, schema cache errors, or table not found
          const error = result.error
          const statusCode = (error as any)?.status || (error as any)?.code
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
      } catch (err: any) {
        // Catch network errors, 404s, or any other exceptions
        const errorMessage = err?.message || String(err)
        const statusCode = err?.status || err?.code || err?.statusCode
        
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
      type PromptData = {
        id: string
        category: string
        title: string
        description: string | null
        order_index: number
        created_at: string
      }

      type AnswerData = {
        id: string
        user_id: string
        prompt_id: string
        answer: string | null
        is_discussed: boolean
        follow_up_notes: string | null
        discussed_at: string | null
        created_at: string
        updated_at: string
      }

      const prompts = (promptsResult.data || []) as PromptData[]
      const answers = ((answersResult?.data || []) as AnswerData[]) || []
      const answersByPromptId = new Map<string, AnswerData>(
        answers.map(a => [a.prompt_id, a])
      )

      // Combine prompts with user answers
      return prompts.map(prompt => ({
        ...prompt,
        user_discussion_answers: answersByPromptId.has(prompt.id) 
          ? [answersByPromptId.get(prompt.id)!] 
          : []
      })) as any[]
    },
    enabled: !!user,
    staleTime: 60000,
    retry: (failureCount, error: any) => {
      // Don't retry on 404 or schema cache errors
      const statusCode = error?.status || error?.code || error?.statusCode
      const errorMessage = error?.message || String(error)
      
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
        } as any, {
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

  const togglePrompt = (promptId: string) => {
    setExpandedPrompts((prev) => {
      const next = new Set(prev)
      if (next.has(promptId)) {
        next.delete(promptId)
      } else {
        next.add(promptId)
      }
      return next
    })
  }

  // Use safe defaults while loading
  const displayPrompts = prompts || []
  
  // Group prompts by category
  const groupedPrompts = displayPrompts.reduce((acc: Record<string, any[]>, prompt: any) => {
    const category = prompt.category || 'Other'
    if (!acc[category]) acc[category] = []
    acc[category].push(prompt)
    return acc
  }, {})
  
  // Calculate progress with safe access
  const totalPrompts = displayPrompts.length
  const discussedPrompts = displayPrompts.filter((p: any) => {
    const answers = Array.isArray(p.user_discussion_answers) ? p.user_discussion_answers : []
    return answers.some((a: any) => a.is_discussed)
  }).length
  const progress = totalPrompts > 0 ? (discussedPrompts / totalPrompts) * 100 : 0
  const isAllDiscussed = discussedPrompts === totalPrompts && totalPrompts > 0

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

      <div className="min-h-screen w-full bg-gradient-to-br from-primary/5 via-background via-60% to-islamic-purple/5">
        <div className="w-full p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6 sm:space-y-8">
          {/* Main Discussions Section */}
          <section id="discussions" className="scroll-mt-20 sm:scroll-mt-24">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-6 sm:mb-8"
            >
              <div className="flex items-center gap-2 text-primary text-sm sm:text-base font-medium mb-2 sm:mb-3">
                <Heart className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>Connect & Communicate</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-2 sm:mb-3">
                Discussion Prompts
              </h1>
              <div className="flex items-center gap-2 sm:gap-3">
                <p className="text-muted-foreground text-sm sm:text-base">
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
                transition={{ duration: 0.5, delay: 0.1 }}
                className="mb-6 sm:mb-8"
              >
                <Card className="overflow-hidden" padding="none">
                  <div className="p-4 sm:p-6 bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-xl">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                        <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center flex-shrink-0">
                          <UserPlus className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm sm:text-base font-medium text-foreground mb-1">
                            Connect with your partner
                          </p>
                          <p className="text-xs sm:text-sm text-muted-foreground">
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
              <Card>
                <CardContent className="py-16 sm:py-20 text-center">
                  <Loader2 className="h-10 w-10 sm:h-12 sm:w-12 animate-spin text-islamic-gold mx-auto mb-4 sm:mb-5" />
                  <p className="text-muted-foreground text-sm sm:text-base">Loading discussions...</p>
                </CardContent>
              </Card>
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
                  <div className="bg-gradient-to-r from-primary/10 via-islamic-gold/5 to-islamic-purple/10 dark:from-primary/20 dark:via-islamic-gold/10 dark:to-islamic-purple/20 p-6 sm:p-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
                      <div>
                        <h2 className="font-semibold text-foreground text-lg sm:text-xl mb-1">
                          Discussions Completed
                        </h2>
                        <p className="text-muted-foreground text-sm sm:text-base">
                          {discussedPrompts} of {totalPrompts} conversations
                        </p>
                      </div>
                      {isAllDiscussed && (
                        <div className="flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400 rounded-full min-h-[36px] sm:min-h-[40px]">
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
              variants={containerVariants}
              className="space-y-6 sm:space-y-8 mt-6 sm:mt-8"
            >
            {groupedPrompts && Object.entries(groupedPrompts).map(([category, categoryPrompts]: [string, any[]]) => {
              const config = categoryConfig[category] || { color: 'text-muted-foreground', bgColor: 'bg-muted', icon: MessageCircle }
              const CategoryIcon = config.icon
              const categoryDiscussed = categoryPrompts.filter((p: any) =>
                p.user_discussion_answers?.some((a: any) => a.is_discussed)
              ).length

                return (
                  <motion.div
                    key={category}
                    variants={itemVariants}
                  >
                    {/* Category Header */}
                    <div className="flex items-center justify-between mb-4 sm:mb-5">
                      <div className="flex items-center gap-3">
                        <h2 className="text-base sm:text-lg font-semibold text-foreground capitalize">
                          {category}
                        </h2>
                        <span className="text-sm text-muted-foreground">
                          {categoryDiscussed} / {categoryPrompts.length} discussed
                        </span>
                      </div>
                      {categoryDiscussed === categoryPrompts.length && categoryPrompts.length > 0 && (
                        <span className="text-xs sm:text-sm font-medium text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full">
                          Complete
                        </span>
                      )}
                    </div>

                    {/* Category Prompts */}
                    <div className="space-y-4 sm:space-y-5">
                      {categoryPrompts.map((prompt: any) => {
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
                                'overflow-hidden transition-all duration-200 cursor-pointer relative border-2 hover:border-primary/20 hover:shadow-sm',
                                isDiscussed && 'bg-green-50/50 dark:bg-green-950/20 border-green-200 dark:border-green-800'
                              )}
                              padding="none"
                            >
                              {/* Stripe-style gradient overlay on hover */}
                              <motion.div
                                className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 opacity-0 z-0 pointer-events-none"
                                whileHover={{ opacity: 1 }}
                                transition={{ duration: 0.3 }}
                              />
                              {/* Subtle shine effect on hover */}
                              <motion.div
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full z-0 pointer-events-none"
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
                                    isDiscussed ? 'text-muted-foreground line-through' : 'text-foreground group-hover:text-primary'
                                  )}>
                                    {prompt.title}
                                  </h3>
                                  {prompt.description && !isExpanded && (
                                    <p className="text-sm sm:text-base text-muted-foreground line-clamp-1">
                                      {prompt.description}
                                    </p>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                                  {isDiscussed && (
                                    <span className="hidden sm:inline-flex text-xs sm:text-sm font-medium text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-3 py-1.5 rounded-full">
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
                                      <p className="text-muted-foreground mt-5 sm:mt-6 mb-5 sm:mb-6 leading-relaxed text-sm sm:text-base">
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
