import { memo, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle, Circle, ArrowRight, AlertCircle } from 'lucide-react'
import { Card, CardTitle, CardContent } from '../ui/Card'
import { Button } from '../ui/Button'
import type { PendingTask } from '../../hooks/usePendingTasks'

interface PendingTasksCardProps {
  tasks: PendingTask[]
  isLoading?: boolean
}

// Extract constants to prevent recreation
const CARD_ANIMATION = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay: 0.4 },
} as const

const SKELETON_ITEMS = [1, 2, 3] as const

export const PendingTasksCard = memo(function PendingTasksCard({ tasks, isLoading }: PendingTasksCardProps) {
  const hasTasks = useMemo(() => tasks && tasks.length > 0, [tasks])
  
  // Memoize task count text
  const taskCountText = useMemo(() => {
    if (isLoading) return 'Loading...'
    if (!hasTasks) return 'All tasks completed!'
    return `${tasks.length} pending ${tasks.length === 1 ? 'task' : 'tasks'}`
  }, [tasks, hasTasks, isLoading])

  return (
    <motion.div
      initial={CARD_ANIMATION.initial}
      animate={CARD_ANIMATION.animate}
      transition={CARD_ANIMATION.transition}
    >
      <Card padding="none" className="overflow-hidden">
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-amber-600/10 dark:from-amber-500/20 dark:via-amber-400/10 dark:to-amber-600/20 px-6 py-5 sm:px-8 sm:py-6 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <CardTitle className="text-lg sm:text-xl">Important Tasks</CardTitle>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                  {taskCountText}
                </p>
              </div>
            </div>
            {hasTasks && (
              <div className="text-right">
                <span className="text-xs sm:text-sm bg-amber-500/10 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full font-medium">
                  {tasks.length}
                </span>
              </div>
            )}
          </div>
        </div>
        <CardContent className="p-6 sm:p-8">
          {isLoading ? (
            <div className="space-y-3">
              {SKELETON_ITEMS.map((i) => (
                <div key={i} className="h-12 bg-muted rounded-lg animate-pulse" />
              ))}
            </div>
          ) : hasTasks ? (
            <div className="space-y-3 sm:space-y-4">
              {tasks.map((task) => (
                <Link
                  key={task.id}
                  to="/checklist"
                  className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl bg-card/30 hover:bg-card/50 dark:bg-card/20 dark:hover:bg-card/40 transition-colors border border-border/50 min-h-[52px] sm:min-h-[56px] touch-manipulation group"
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {task.is_required ? (
                      <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600 dark:text-amber-400" />
                    ) : (
                      <Circle className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground group-hover:text-foreground transition-colors" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm sm:text-base text-foreground group-hover:text-primary transition-colors line-clamp-2">
                      {task.title}
                    </p>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                      {task.category_name}
                      {task.is_required && (
                        <span className="ml-2 text-amber-600 dark:text-amber-400 font-medium">
                          • Required
                        </span>
                      )}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 mt-0.5" />
                </Link>
              ))}
              <div className="pt-2 border-t border-border">
                <Link to="/checklist">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full sm:w-auto min-h-[44px]"
                    rightIcon={<ArrowRight className="h-4 w-4" />}
                  >
                    View All Tasks
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 sm:py-8">
              <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <CheckCircle className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
              </div>
              <p className="text-sm sm:text-base font-medium text-foreground mb-2">
                All tasks completed!
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-5">
                Great job staying on top of your wedding preparation
              </p>
              <Link to="/checklist">
                <Button
                  variant="outline"
                  size="sm"
                  className="min-h-[44px]"
                  rightIcon={<ArrowRight className="h-4 w-4" />}
                >
                  View Checklist
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
})

