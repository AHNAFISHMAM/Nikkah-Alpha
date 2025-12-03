import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { BookOpen, CheckCircle2, Clock, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card'
import { Button } from '../ui/Button'
import { Progress } from '../ui/Progress'

export interface ModuleCardProps {
  module: {
    id: string
    title: string
    description?: string | null
    estimated_duration?: number | null
    completedLessons: number
    totalLessons: number
    isCompleted: boolean
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
    },
  },
}

export function ModuleCard({ module }: ModuleCardProps) {
  const progressPercent =
    module.totalLessons > 0
      ? Math.round((module.completedLessons / module.totalLessons) * 100)
      : 0

  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="h-full flex flex-col hover:border-primary/20 transition-colors">
        <CardHeader>
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-3 flex-1">
              <div className="p-2 bg-primary/10 rounded-lg">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-lg sm:text-xl line-clamp-2">{module.title}</CardTitle>
              </div>
            </div>
            {module.isCompleted && (
              <div className="flex-shrink-0 ml-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              </div>
            )}
          </div>
          {module.description && (
            <CardDescription className="line-clamp-2">{module.description}</CardDescription>
          )}
        </CardHeader>
        <CardContent className="flex-1 flex flex-col">
          {/* Progress */}
          {module.totalLessons > 0 ? (
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">
                  {module.completedLessons} / {module.totalLessons} lessons
                </span>
              </div>
              <Progress value={progressPercent} variant="primary" className="h-2" />
              {module.isCompleted && (
                <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>Completed</span>
                </div>
              )}
            </div>
          ) : (
            <div className="mb-4">
              <p className="text-sm text-muted-foreground">No lessons available</p>
            </div>
          )}

          {/* Estimated Duration */}
          {module.estimated_duration && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
              <Clock className="h-4 w-4" />
              <span>~{module.estimated_duration} min</span>
            </div>
          )}

          {/* Action Button */}
          <Link to={`/modules/${module.id}`} className="mt-auto">
            <Button
              variant="outline"
              className="w-full group"
              rightIcon={
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              }
            >
              {module.isCompleted ? 'Review Module' : 'Start Learning'}
            </Button>
          </Link>
        </CardContent>
      </Card>
    </motion.div>
  )
}

