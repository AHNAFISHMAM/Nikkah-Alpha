import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { SEO } from '../../components/SEO'
import { PAGE_SEO } from '../../lib/seo'
import {
  CheckCircle,
  Calculator,
  BookOpen,
  MessageCircle,
  Calendar,
  Sparkles,
  Clock,
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { Card, CardContent } from '../../components/ui/Card'
import { formatDate, cn } from '../../lib/utils'
import { useProgressStats } from '../../hooks/useProgressStats'
import { usePendingTasks } from '../../hooks/usePendingTasks'
import { useRecentActivity } from '../../hooks/useRecentActivity'
import { useRealtimeRecentActivity } from '../../hooks/useRealtimeRecentActivity'
import { useRealtimeProgressStats } from '../../hooks/useRealtimeProgressStats'
import { useRealtimePendingTasks } from '../../hooks/useRealtimePendingTasks'
import { useRealtimeFinancialData } from '../../hooks/useRealtimeFinancialData'
import { useScrollToSection } from '../../hooks/useScrollToSection'
import { useBudget } from '../../hooks/useBudget'
import { useMahr } from '../../hooks/useMahr'
import { useWeddingBudget } from '../../hooks/useWeddingBudget'
import { useSavingsGoals } from '../../hooks/useSavingsGoals'
import { QuickOverviewCard } from '../../components/dashboard/QuickOverviewCard'
import { RecentActivityCard } from '../../components/dashboard/RecentActivityCard'
import { CollapsibleSection } from '../../components/common/CollapsibleSection'
import { ReadinessScoreCard } from '../../components/dashboard/ReadinessScoreCard'
import { calculateReadinessScore } from '../../lib/calculations'
import { useGentleReminders } from '../../hooks/useGentleReminders'
import { useNetworkStatus } from '../../hooks/useNetworkStatus'

const quickActions = [
  {
    path: '/checklist',
    icon: CheckCircle,
    label: 'Checklist',
    description: 'Track progress',
    color: 'bg-gradient-to-br from-primary to-primary/80',
    shadowColor: 'shadow-primary/25',
  },
  {
    path: '/financial',
    icon: Calculator,
    label: 'Financial',
    description: 'Plan budget',
    color: 'bg-gradient-to-br from-secondary to-secondary/80',
    shadowColor: 'shadow-secondary/25',
  },
  {
    path: '/modules',
    icon: BookOpen,
    label: 'Learn',
    description: '5 modules',
    color: 'bg-gradient-to-br from-purple-500 to-purple-600',
    shadowColor: 'shadow-purple/25',
  },
  {
    path: '/discussions',
    icon: MessageCircle,
    label: 'Discuss',
    description: 'Talk together',
    color: 'bg-gradient-to-br from-purple-500 to-purple-600',
    shadowColor: 'shadow-purple/25',
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
}

export function Dashboard() {
  const { profile, user } = useAuth()
  const { data: stats, isLoading: statsLoading } = useProgressStats(user?.id)
  const { data: pendingTasks, isLoading: tasksLoading } = usePendingTasks(user?.id)
  const { data: recentActivity, isLoading: activityLoading } = useRecentActivity(user?.id)
  
  // Financial data
  const { data: budgetData, isLoading: budgetLoading } = useBudget()
  const { data: mahrData, isLoading: mahrLoading } = useMahr()
  const { data: weddingBudgetData, isLoading: weddingLoading } = useWeddingBudget()
  const { data: savingsData, isLoading: savingsLoading } = useSavingsGoals()
  
  // Real-time subscriptions for instant updates
  const { isConnected: activityConnected } = useRealtimeRecentActivity()
  useRealtimeProgressStats() // Real-time progress stats updates
  useRealtimePendingTasks() // Real-time pending tasks updates
  useRealtimeFinancialData() // Real-time financial data updates
  
  // Gentle reminders and proactive notifications
  useGentleReminders()
  
  // Network status monitoring
  useNetworkStatus()
  
  // Auto-scroll to section when hash is present in URL
  useScrollToSection()

  const firstName = profile?.full_name?.split(' ')[0] || 'there'
  const weddingDate = profile?.wedding_date ? new Date(profile.wedding_date) : null
  const daysUntilWedding = weddingDate
    ? Math.ceil((weddingDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  // Use default values if stats are loading - don't block the UI
  const displayStats = stats || {
    checklistCompleted: 0,
    checklistTotal: 0,
    checklistPercent: 0,
    modulesCompleted: 0,
    modulesTotal: 5,
    discussionsCompleted: 0,
    discussionsTotal: 16,
    daysUntilWedding: null,
    weddingDate: null,
    hasBudget: false,
    budgetAmount: null,
  }

  // Calculate combined readiness score
  const readinessScore = calculateReadinessScore({
    checklistPercent: displayStats.checklistPercent,
    modulesCompleted: displayStats.modulesCompleted,
    modulesTotal: displayStats.modulesTotal,
    discussionsCompleted: displayStats.discussionsCompleted,
    discussionsTotal: displayStats.discussionsTotal,
  })

  return (
    <>
      <SEO
        title={PAGE_SEO.dashboard.title}
        description={PAGE_SEO.dashboard.description}
        path="/dashboard"
        noIndex
      />

      <div className="w-full space-y-4 sm:space-y-6 lg:space-y-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-r from-primary/10 via-islamic-gold/5 to-islamic-purple/10 p-6 sm:p-8 border border-primary/10"
        >
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 text-primary text-xs sm:text-sm font-medium mb-2">
                <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>Assalamu Alaikum</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground leading-tight mb-2">
                {getGreeting()}, {firstName}!
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Continue your marriage preparation journey
              </p>
            </div>

            {weddingDate && daysUntilWedding && daysUntilWedding > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex items-center gap-4 p-4 sm:p-5 rounded-xl bg-card/50 backdrop-blur-sm border border-primary/20 shadow-sm flex-shrink-0"
              >
                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-muted-foreground mb-0.5">Wedding Date</p>
                  <p className="font-bold text-sm sm:text-base text-foreground">
                    {daysUntilWedding} days to go
                  </p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">
                    {formatDate(weddingDate)}
                  </p>
                </div>
              </motion.div>
            )}
          </div>

          {/* Decorative Sparkles Icon */}
          <motion.div
            className="absolute right-4 sm:right-6 top-4 sm:top-6 z-0"
            initial={{ opacity: 0, scale: 0, rotate: -180 }}
            animate={{ opacity: 0.3, scale: 1, rotate: 0 }}
            transition={{ duration: 1, delay: 0.4, ease: 'easeOut' }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: 'linear',
              }}
            >
              <Sparkles className="h-8 w-8 sm:h-10 sm:w-10 text-brand" />
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Readiness Score Section - Prominent Display */}
        <section>
          <ReadinessScoreCard
            readinessScore={readinessScore}
            isLoading={statsLoading}
          />
        </section>

        {/* Quick Actions Section */}
        <section>
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="grid grid-cols-2 sm:grid-cols-4 gap-0 overflow-hidden rounded-2xl border-2 border-border"
          >
            {quickActions.map((action, index) => (
              <motion.div 
                key={action.path} 
                variants={itemVariants}
                className={cn(
                  "relative",
                  index > 0 && "border-l border-border",
                  index >= 2 && "sm:border-t-0",
                  index < 2 && "border-b border-border sm:border-b-0"
                )}
                whileHover={{
                  y: -4,
                  scale: 1.01,
                  transition: {
                    type: "spring",
                    stiffness: 300,
                    damping: 20,
                  },
                }}
                whileTap={{ scale: 0.99 }}
              >
                <Link to={action.path}>
                  <Card
                    className="h-full overflow-hidden group cursor-pointer relative border-0 transition-all duration-300 hover:bg-accent/50 rounded-none"
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
                    <CardContent className="p-4 sm:p-5 relative z-10">
                      <div
                        className={`h-10 w-10 sm:h-12 sm:w-12 rounded-xl ${action.color} flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300`}
                      >
                        <action.icon className={cn(
                          "h-5 w-5 sm:h-6 sm:w-6",
                          action.path === '/financial'
                            ? "text-secondary-foreground"
                            : "text-primary-foreground"
                        )} />
                      </div>
                      <h3 className="font-semibold text-sm sm:text-base text-foreground mb-1 group-hover:text-primary transition-colors">
                        {action.label}
                      </h3>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {action.description}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Quick Overview Section - Budget + Pending Tasks Combined */}
        <section>
          <QuickOverviewCard
            budgetData={budgetData ?? null}
            budgetLoading={budgetLoading}
            mahrData={mahrData ?? null}
            mahrLoading={mahrLoading}
            weddingBudgetData={weddingBudgetData ?? null}
            weddingLoading={weddingLoading}
            savingsData={savingsData ?? null}
            savingsLoading={savingsLoading}
            pendingTasks={pendingTasks || []}
            tasksLoading={tasksLoading}
          />
        </section>

        {/* Recent Activity Section - Collapsible */}
        <section>
          <CollapsibleSection
            title="Recent Activity"
            subtitle={
              activityLoading
                ? 'Loading...'
                : recentActivity && recentActivity.length > 0
                ? `Last ${recentActivity.length} ${recentActivity.length === 1 ? 'activity' : 'activities'}`
                : 'No recent activity'
            }
            icon={
              <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400" />
              </div>
            }
            defaultExpanded={false}
          >
            <RecentActivityCard
              activities={recentActivity || []}
              isLoading={activityLoading}
              isConnected={activityConnected}
            />
          </CollapsibleSection>
        </section>
      </div>
    </>
  )
}
