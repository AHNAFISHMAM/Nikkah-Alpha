import { memo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  CheckCircle, 
  BookOpen, 
  MessageCircle, 
  DollarSign, 
  User, 
  Clock
} from 'lucide-react'
import { Button } from '../ui/Button'
import { cn } from '../../lib/utils'
import type { ActivityItem } from '../../hooks/useRecentActivity'

interface RecentActivityCardProps {
  activities: ActivityItem[]
  isLoading?: boolean
  isConnected?: boolean
}

const activityIcons = {
  checklist: CheckCircle,
  module: BookOpen,
  discussion: MessageCircle,
  budget: DollarSign,
  profile: User,
}

const activityColors = {
  checklist: 'text-primary',
  module: 'text-accent',
  discussion: 'text-islamic-purple',
  budget: 'text-green-600 dark:text-green-400',
  profile: 'text-blue-600 dark:text-blue-400',
}

const activityBgColors = {
  checklist: 'bg-primary/10 dark:bg-primary/20',
  module: 'bg-accent/10 dark:bg-accent/20',
  discussion: 'bg-purple-100 dark:bg-purple-900/30',
  budget: 'bg-green-100 dark:bg-green-900/30',
  profile: 'bg-blue-100 dark:bg-blue-900/30',
}

export const RecentActivityCard = memo(function RecentActivityCard({ 
  activities, 
  isLoading
}: RecentActivityCardProps) {
  const hasActivities = activities && activities.length > 0

  return (
    <div className="w-full">
      <div>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-start gap-3 sm:gap-4">
                <div className="h-10 w-10 rounded-full bg-muted animate-pulse flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
                  <div className="h-3 w-1/2 bg-muted rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : hasActivities ? (
          <div className="space-y-3 sm:space-y-4">
            {activities.map((activity) => {
              const Icon = activityIcons[activity.type]
              const iconColor = activityColors[activity.type]
              const bgColor = activityBgColors[activity.type]

              return (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-start gap-3 sm:gap-4 min-h-[60px]"
                >
                  {/* Timeline dot and line */}
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div className={cn(
                      'h-10 w-10 sm:h-12 sm:w-12 rounded-full flex items-center justify-center',
                      bgColor
                    )}>
                      <Icon className={cn('h-5 w-5 sm:h-6 sm:w-6', iconColor)} />
                    </div>
                    {activity.id !== activities[activities.length - 1].id && (
                      <div className="w-0.5 h-full min-h-[20px] bg-border mt-2" />
                    )}
                  </div>

                  {/* Activity content */}
                  <div className="flex-1 min-w-0 pt-1">
                    <p className="font-medium text-sm sm:text-base text-foreground line-clamp-2">
                      {activity.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {activity.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-6 sm:py-8">
            <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <Clock className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground" />
            </div>
            <p className="text-sm sm:text-base font-medium text-foreground mb-2">
              No recent activity
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-5">
              Complete tasks, finish modules, or update your profile to see activity here
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/checklist">
                <Button
                  variant="outline"
                  size="sm"
                  className="min-h-[44px] w-full sm:w-auto"
                >
                  Go to Checklist
                </Button>
              </Link>
              <Link to="/modules">
                <Button
                  variant="outline"
                  size="sm"
                  className="min-h-[44px] w-full sm:w-auto"
                >
                  View Modules
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
})
