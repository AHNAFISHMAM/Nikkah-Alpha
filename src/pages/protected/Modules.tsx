import { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, Search, AlertCircle, Loader2 } from 'lucide-react'
import { Card, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/Alert'
import { ModuleCard } from '../../components/modules/ModuleCard'
import { ModuleProgress } from '../../components/modules/ModuleProgress'
import { useModulesWithProgress } from '../../hooks/useModules'
import { useRealtimeModuleProgress } from '../../hooks/useRealtimeModuleProgress'
import { SEO } from '../../components/SEO'
import { PAGE_SEO } from '../../lib/seo'

// Extract constants to prevent recreation
const CONTAINER_VARIANTS = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
} as const

const ITEM_VARIANTS = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
    },
  },
} as const

export function Modules() {
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'sort_order' | 'title' | 'completion'>('sort_order')

  // Real-time updates for module progress
  useRealtimeModuleProgress()

  // Fetch modules with progress using custom hook
  const {
    data: modulesWithProgress = [],
    isLoading: modulesLoading,
    isError: modulesError,
  } = useModulesWithProgress()

  // Memoize refetch function
  const refetchModules = useCallback(() => {
    window.location.reload()
  }, [])

  // Memoize filter and sort operations to prevent unnecessary recalculations
  const filteredAndSortedModules = useMemo(() => modulesWithProgress
    .filter((module) => {
      if (!searchQuery) return true
      const query = searchQuery.toLowerCase()
      return (
        module.title.toLowerCase().includes(query) ||
        module.description?.toLowerCase().includes(query)
      )
    })
    .sort((a, b) => {
      if (sortBy === 'sort_order') {
        return a.sort_order - b.sort_order
      }
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title)
      }
      if (sortBy === 'completion') {
        // Sort by completion status (completed first, then by progress)
        if (a.isCompleted && !b.isCompleted) return -1
        if (!a.isCompleted && b.isCompleted) return 1
        const aProgress = a.totalLessons > 0 ? a.completedLessons / a.totalLessons : 0
        const bProgress = b.totalLessons > 0 ? b.completedLessons / b.totalLessons : 0
        return bProgress - aProgress
      }
      return 0
    }), [modulesWithProgress, searchQuery, sortBy])

  if (modulesLoading) {
    return (
      <>
        <SEO {...PAGE_SEO.modules} />
        <div className="min-h-screen bg-background">
          <div className="container mx-auto px-4 py-8 sm:py-12 max-w-6xl">
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="text-center">
                <Loader2 className="h-10 w-10 animate-spin text-islamic-gold mx-auto mb-4" />
                <p className="text-muted-foreground">Loading modules...</p>
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }

  if (modulesError) {
    return (
      <>
        <SEO {...PAGE_SEO.modules} />
        <div className="min-h-screen bg-background">
          <div className="container mx-auto px-4 py-8 sm:py-12 max-w-6xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center min-h-[60vh]"
            >
              <Alert variant="error" className="max-w-md">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Failed to Load Modules</AlertTitle>
                <AlertDescription className="mt-2">
                  Unable to fetch modules. Please try again.
                </AlertDescription>
                <div className="mt-4 flex gap-3">
                  <Button onClick={() => refetchModules()} size="sm">
                    Try Again
                  </Button>
                  <Button onClick={() => window.location.reload()} variant="outline" size="sm">
                    Reload Page
                  </Button>
                </div>
              </Alert>
            </motion.div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <SEO {...PAGE_SEO.modules} />
      <motion.div
        className="min-h-screen bg-background"
        variants={CONTAINER_VARIANTS}
        initial="hidden"
        animate="visible"
      >
        <div className="container mx-auto px-4 py-8 sm:py-12 max-w-6xl">
          {/* Header */}
          <motion.div variants={ITEM_VARIANTS} className="mb-8 sm:mb-12">
            <div className="flex items-center gap-3 sm:gap-4 mb-4">
              <div className="p-2 sm:p-3 bg-primary/10 rounded-lg">
                <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Learning Modules</h1>
                <p className="text-sm sm:text-base text-muted-foreground mt-1">
                  Educational content to prepare for your marriage
                </p>
              </div>
            </div>

            {/* Overall Progress */}
            {modulesWithProgress.length > 0 && (
              <ModuleProgress
                completed={modulesWithProgress.filter((m) => m.isCompleted).length}
                total={modulesWithProgress.length}
                className="mt-6 sm:mt-8"
              />
            )}
          </motion.div>

          {/* Search and Sort */}
          {modulesWithProgress.length > 0 && (
            <motion.div variants={ITEM_VARIANTS} className="mb-6 sm:mb-8">
              <Card>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="text"
                          placeholder="Search modules by title or description..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div className="sm:w-48">
                      <select
                        value={sortBy}
                        onChange={(e) =>
                          setSortBy(e.target.value as 'sort_order' | 'title' | 'completion')
                        }
                        className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="sort_order">Sort by Order</option>
                        <option value="title">Sort by Title</option>
                        <option value="completion">Sort by Progress</option>
                      </select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Modules Grid */}
          {filteredAndSortedModules.length === 0 ? (
            <motion.div variants={ITEM_VARIANTS}>
              <Card>
                <CardContent className="p-12 text-center">
                  {searchQuery ? (
                    <>
                      <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No modules found</h3>
                      <p className="text-muted-foreground mb-6">
                        Try adjusting your search query
                      </p>
                      <Button variant="outline" onClick={() => setSearchQuery('')}>
                        Clear Search
                      </Button>
                    </>
                  ) : (
                    <>
                      <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No modules available</h3>
                      <p className="text-muted-foreground">
                        Learning modules will appear here once they are published.
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              variants={ITEM_VARIANTS}
              className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6"
            >
              {filteredAndSortedModules.map((module) => (
                <ModuleCard key={module.id} module={module} />
              ))}
            </motion.div>
          )}
        </div>
      </motion.div>
    </>
  )
}
