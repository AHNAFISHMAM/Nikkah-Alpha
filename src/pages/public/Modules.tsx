import { useQuery } from '@tanstack/react-query'
import { memo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useScrollToSection } from '../../hooks/useScrollToSection'
import { SEO } from '../../components/SEO'
import { PAGE_SEO } from '../../lib/seo'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card'
import { Progress } from '../../components/ui/Progress'
import { Skeleton } from '../../components/common/Skeleton'
import { BookOpen, CheckCircle } from 'lucide-react'
import { logWarning } from '../../lib/logger'

interface Module {
  id: string
  title: string
  description: string
  sort_order: number
}

interface ModuleNote {
  module_id: string
  is_completed: boolean
}

function ModulesPageComponent() {
  const { user, isLoading: authLoading } = useAuth()
  
  // Auto-scroll to section when hash is present in URL
  useScrollToSection()

  const { data, isLoading: queryLoading, isError, error } = useQuery({
    queryKey: ['modules', user?.id],
    queryFn: async () => {
      if (!supabase) throw new Error('Database not configured')

      // Always fetch modules (public data)
      const { data: modules, error: modulesError } = await supabase
        .from('modules')
        .select('*')

      if (modulesError) throw modulesError

      // Only fetch notes if user is authenticated
      let notes: ModuleNote[] = []
      if (user) {
        const { data: notesData, error: notesError } = await supabase
          .from('module_notes')
          .select('module_id, is_completed')
          .eq('user_id', user.id)

        if (notesError) {
          // Log error but don't fail - notes are optional
          logWarning('Failed to fetch module notes', 'Modules')
        } else {
          notes = notesData || []
        }
      }

      // Sort modules client-side by sort_order (PostgREST schema cache issue)
      const sortedModules = (modules as any[])?.sort((a, b) => {
        const aIndex = a?.sort_order ?? 999
        const bIndex = b?.sort_order ?? 999
        return aIndex - bIndex
      }) || []

      return { modules: sortedModules, notes }
    },
    enabled: !authLoading, // Run query once auth state is determined (even if no user)
  })

  // Show loading while auth is loading or query is loading
  if (authLoading || queryLoading) {
    return <ModulesSkeleton />
  }

  // Show error state if query failed
  if (isError) {
    return (
      <div className="space-y-6">
        <div className="text-center py-10">
          <p className="text-muted-foreground mb-4">
            Failed to load modules. Please try again.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="text-primary hover:underline"
          >
            Reload Page
          </button>
          {error && (
            <p className="text-sm text-muted-foreground mt-2">
              {error instanceof Error ? error.message : 'Unknown error'}
            </p>
          )}
        </div>
      </div>
    )
  }

  const modules = data?.modules as Module[] || []
  const notes = data?.notes as ModuleNote[] || []

  const completedCount = notes.filter(n => n.is_completed).length
  const totalModules = modules.length
  const progress = totalModules > 0 ? Math.round((completedCount / totalModules) * 100) : 0

  const isModuleCompleted = (moduleId: string) => {
    return notes.some(n => n.module_id === moduleId && n.is_completed)
  }

  return (
    <div className="space-y-6">
      {/* Main Modules Section */}
      <section id="modules" className="scroll-mt-20 sm:scroll-mt-24">
        <SEO
          title={PAGE_SEO.modules.title}
        description={PAGE_SEO.modules.description}
        path="/modules"
        noIndex
      />

      {/* Header */}
      <motion.div
        className="space-y-0.5 sm:space-y-2 mb-6 sm:mb-8"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 0 }}
      >
        <motion.h1
          className="text-2xl sm:text-3xl font-bold"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
        >
          Learning Modules
        </motion.h1>
        <motion.p
          className="text-sm sm:text-base text-muted-foreground"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.5 }}
        >
          Islamic marriage preparation content
        </motion.p>
      </motion.div>

      {/* Progress Card */}
      <motion.div
        className="mb-6 sm:mb-8"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 0.8 }}
      >
        <Card>
          <CardContent className="p-4 sm:pt-6 sm:p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs sm:text-sm font-medium">Overall Progress</span>
              <span className="text-sm sm:text-base font-bold text-primary">{progress}%</span>
            </div>
            <Progress value={progress} variant="primary" size="md" />
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-2">
              {completedCount} of {totalModules} modules completed
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Modules Grid */}
      <motion.div
        className="grid gap-4 sm:gap-5 sm:grid-cols-2 mt-6 sm:mt-8"
        initial="hidden"
        animate="visible"
        variants={{
          visible: {
            transition: {
              staggerChildren: 0.15,
              delayChildren: 1.1,
            },
          },
        }}
      >
        {modules.map((module, index) => {
          const completed = isModuleCompleted(module.id)
          return (
            <motion.div
              key={module.id}
              variants={{
                hidden: { opacity: 0, y: 30, scale: 0.95 },
                visible: {
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  transition: {
                    duration: 0.8,
                    ease: "easeOut",
                  },
                },
              }}
            >
              <Link to={`/modules/${module.id}`}>
                <motion.div
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
                  className="h-full"
                >
                  <Card className="h-full cursor-pointer relative overflow-hidden group border-2 transition-all duration-300 hover:border-primary/20 hover:shadow-sm">
                    {/* Stripe-style gradient overlay on hover */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 opacity-0 pointer-events-none"
                      whileHover={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                    {/* Subtle shine effect on hover */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full pointer-events-none"
                      whileHover={{ x: "200%" }}
                      transition={{ duration: 0.6, ease: "easeInOut" }}
                    />
                    
                    <CardHeader className="p-4 sm:p-6 relative z-10">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <motion.div
                            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shrink-0 ${
                              completed ? 'bg-green-100 text-green-600' : 'bg-primary/10 text-primary'
                            }`}
                            whileHover={{
                              scale: 1.1,
                              rotate: completed ? 0 : 5,
                              transition: { type: "spring", stiffness: 400, damping: 10 },
                            }}
                          >
                            {completed ? (
                              <motion.div
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                              >
                                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                              </motion.div>
                            ) : (
                              <BookOpen className="h-4 w-4 sm:h-5 sm:w-5" />
                            )}
                          </motion.div>
                          <div className="min-w-0">
                            <CardTitle className="text-base sm:text-lg">
                              Module {index + 1}
                            </CardTitle>
                            <p className="text-xs sm:text-sm text-muted-foreground truncate">
                              {module.title}
                            </p>
                          </div>
                        </div>
                        {completed && (
                          <motion.span
                            className="text-[10px] sm:text-xs bg-green-100 text-green-600 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full whitespace-nowrap shrink-0"
                            whileHover={{ scale: 1.1 }}
                            transition={{ type: "spring", stiffness: 400, damping: 10 }}
                          >
                            Done
                          </motion.span>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6 pt-0 relative z-10">
                      <CardDescription className="line-clamp-2 text-xs sm:text-sm">
                        {module.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                </motion.div>
              </Link>
            </motion.div>
          )
        })}
      </motion.div>
      </section>
    </div>
  )
}

function ModulesSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-5 w-64" />
      </div>
      <Card>
        <CardContent className="pt-6">
          <Skeleton className="h-4 w-full" />
        </CardContent>
      </Card>
      <div className="grid gap-4 md:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-16 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default memo(ModulesPageComponent)
