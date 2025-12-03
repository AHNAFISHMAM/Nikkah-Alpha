import { motion } from 'framer-motion'
import { TrendingUp, CheckCircle, BookOpen, MessageCircle, Target } from 'lucide-react'
import { Card, CardContent } from '../ui/Card'
import { Progress } from '../ui/Progress'
import { cn } from '../../lib/utils'
import type { ReadinessScoreResult } from '../../lib/calculations'

interface ReadinessScoreCardProps {
  readinessScore: ReadinessScoreResult
  isLoading?: boolean
}

const statusConfig = {
  not_started: {
    label: 'Getting Started',
    color: 'text-muted-foreground',
    bgColor: 'bg-muted/50',
    progressColor: 'bg-muted',
    message: 'Begin your marriage preparation journey',
  },
  beginning: {
    label: 'Beginning',
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-500/10 dark:bg-blue-500/20',
    progressColor: 'bg-blue-500',
    message: 'You\'re on the right track!',
  },
  in_progress: {
    label: 'In Progress',
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-500/10 dark:bg-amber-500/20',
    progressColor: 'bg-amber-500',
    message: 'Keep up the great work!',
  },
  almost_ready: {
    label: 'Almost Ready',
    color: 'text-primary',
    bgColor: 'bg-primary/10 dark:bg-primary/20',
    progressColor: 'bg-primary',
    message: 'You\'re almost there!',
  },
  ready: {
    label: 'Ready',
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-500/10 dark:bg-green-500/20',
    progressColor: 'bg-green-500',
    message: 'Congratulations! You\'re ready!',
  },
}

export function ReadinessScoreCard({ readinessScore, isLoading }: ReadinessScoreCardProps) {
  const config = statusConfig[readinessScore.status]

  if (isLoading) {
    return (
      <Card padding="none" className="overflow-hidden">
        <CardContent className="p-6 sm:p-8">
          <div className="space-y-4">
            <div className="h-8 w-48 bg-muted rounded animate-pulse" />
            <div className="h-32 bg-muted rounded animate-pulse" />
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-muted rounded animate-pulse" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <Card padding="none" className="overflow-hidden border-2 border-primary/20">
        <CardContent className="p-6 sm:p-8">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Target className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-foreground">Marriage Readiness Score</h2>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                    {config.message}
                  </p>
                </div>
              </div>
            </div>
            <div className={cn('px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold', config.bgColor, config.color)}>
              {config.label}
            </div>
          </div>

          {/* Main Score Display */}
          <div className="relative mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="relative">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="text-6xl sm:text-7xl lg:text-8xl font-bold text-primary"
                >
                  {readinessScore.overallPercent}%
                </motion.div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-xs sm:text-sm text-muted-foreground whitespace-nowrap"
                >
                  Overall Readiness
                </motion.div>
              </div>
            </div>
            <Progress 
              value={readinessScore.overallPercent} 
              max={100} 
              className="h-3 sm:h-4"
            />
          </div>

          {/* Breakdown */}
          <div className="space-y-4">
            <h3 className="text-sm sm:text-base font-semibold text-foreground mb-3">
              Component Breakdown
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Checklist */}
              <div className="space-y-2 p-4 rounded-xl bg-card/50 border border-border/50">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                  <span className="text-sm sm:text-base font-medium text-foreground">Checklist</span>
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-primary">
                  {readinessScore.breakdown.checklist}%
                </div>
                <Progress 
                  value={readinessScore.breakdown.checklist} 
                  max={100} 
                  size="sm"
                  className="h-2"
                />
                <p className="text-xs text-muted-foreground">50% weight</p>
              </div>

              {/* Modules */}
              <div className="space-y-2 p-4 rounded-xl bg-card/50 border border-border/50">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-accent flex-shrink-0" />
                  <span className="text-sm sm:text-base font-medium text-foreground">Modules</span>
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-accent">
                  {readinessScore.breakdown.modules}%
                </div>
                <Progress 
                  value={readinessScore.breakdown.modules} 
                  max={100} 
                  variant="secondary"
                  size="sm"
                  className="h-2"
                />
                <p className="text-xs text-muted-foreground">30% weight</p>
              </div>

              {/* Discussions */}
              <div className="space-y-2 p-4 rounded-xl bg-card/50 border border-border/50">
                <div className="flex items-center gap-2 mb-2">
                  <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5 text-islamic-purple flex-shrink-0" />
                  <span className="text-sm sm:text-base font-medium text-foreground">Discussions</span>
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-islamic-purple">
                  {readinessScore.breakdown.discussions}%
                </div>
                <Progress 
                  value={readinessScore.breakdown.discussions} 
                  max={100} 
                  variant="success"
                  size="sm"
                  className="h-2"
                />
                <p className="text-xs text-muted-foreground">20% weight</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

