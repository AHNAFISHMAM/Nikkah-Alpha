import { memo } from 'react'
import { Link } from 'react-router-dom'
import { useState, useRef, useEffect, useMemo } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { 
  DollarSign, 
  AlertCircle, 
  Circle, 
  ArrowRight, 
  CheckCircle,
  Wallet,
  Calculator,
  Target,
  Coins
} from 'lucide-react'
import { Card, CardContent } from '../ui/Card'
import { Button } from '../ui/Button'
import { cn } from '../../lib/utils'
import type { PendingTask } from '../../hooks/usePendingTasks'
import type { Database } from '../../types/database'

type Budget = Database['public']['Tables']['budgets']['Row']
type Mahr = Database['public']['Tables']['mahr']['Row']
type WeddingBudget = Database['public']['Tables']['wedding_budgets']['Row']
type SavingsGoals = Database['public']['Tables']['savings_goals']['Row']

interface QuickOverviewCardProps {
  budgetData: Budget | null
  budgetLoading: boolean
  mahrData: Mahr | null
  mahrLoading: boolean
  weddingBudgetData: WeddingBudget | null
  weddingLoading: boolean
  savingsData: SavingsGoals | null
  savingsLoading: boolean
  pendingTasks: PendingTask[]
  tasksLoading: boolean
}

// Helper functions to calculate totals and statuses
const calculateBudgetTotal = (data: Budget | null): number => {
  if (!data) return 0
  const income = (data.income_his || 0) + (data.income_hers || 0)
  const expenses = Object.entries(data)
    .filter(([key]) => key.startsWith('expense_'))
    .reduce((sum, [, value]) => sum + (Number(value) || 0), 0)
  return income - expenses
}

const calculateWeddingTotal = (data: WeddingBudget | null): number => {
  if (!data) return 0
  return (
    (Number(data.venue_planned) || 0) +
    (Number(data.catering_planned) || 0) +
    (Number(data.photography_planned) || 0) +
    (Number(data.clothing_planned) || 0) +
    (Number(data.decor_planned) || 0) +
    (Number(data.invitations_planned) || 0) +
    (Number(data.other_planned) || 0)
  )
}

const getBudgetStatus = (data: Budget | null): string => {
  if (!data) return 'Not Set'
  const total = calculateBudgetTotal(data)
  if (total > 0) return 'Positive'
  if (total < 0) return 'Over Budget'
  return 'Balanced'
}

const getMahrStatus = (data: Mahr | null): string => {
  if (!data || !data.amount) return 'Not Set'
  return data.status || 'Pending'
}

const getSavingsStatus = (data: SavingsGoals | null): { current: number; target: number; progress: number } => {
  if (!data) return { current: 0, target: 0, progress: 0 }
  // Calculate total current and target across all goals
  const current = (data.emergency_fund_current || 0) + (data.house_current || 0) + (data.other_goal_current || 0)
  const target = (data.emergency_fund_goal || 0) + (data.house_goal || 0) + (data.other_goal_amount || 0)
  const progress = target > 0 ? Math.round((current / target) * 100) : 0
  return { current, target, progress }
}

interface FinancialMiniCardProps {
  icon: React.ReactNode
  label: string
  amount: string | number
  subtitle: string
  color: 'green' | 'purple' | 'blue' | 'amber'
  link: string
  isLoading?: boolean
}

const FinancialMiniCard = memo(function FinancialMiniCard({ 
  icon, 
  label, 
  amount, 
  subtitle, 
  color, 
  link,
  isLoading 
}: FinancialMiniCardProps) {
  // Extract constants to prevent recreation
  const COLOR_CLASSES = {
    green: {
      bg: 'bg-green-500/10 dark:bg-green-500/20',
      text: 'text-green-600 dark:text-green-400',
      border: 'border-green-500/20'
    },
    purple: {
      bg: 'bg-purple-500/10 dark:bg-purple-500/20',
      text: 'text-purple-600 dark:text-purple-400',
      border: 'border-purple-500/20'
    },
    blue: {
      bg: 'bg-blue-500/10 dark:bg-blue-500/20',
      text: 'text-blue-600 dark:text-blue-400',
      border: 'border-blue-500/20'
    },
    amber: {
      bg: 'bg-amber-500/10 dark:bg-amber-500/20',
      text: 'text-amber-600 dark:text-amber-400',
      border: 'border-amber-500/20'
    }
  } as const

  const colors = COLOR_CLASSES[color]

  return (
    <Link
      to={link}
      className="block p-3 sm:p-4 rounded-xl bg-card/30 hover:bg-card/50 dark:bg-card/20 dark:hover:bg-card/40 transition-colors border border-border/50 min-h-[60px] touch-manipulation group"
    >
      <div className="flex items-center gap-3">
        <div className={cn('h-10 w-10 sm:h-11 sm:w-11 rounded-lg flex items-center justify-center flex-shrink-0', colors.bg)}>
          <div className={cn('h-5 w-5 sm:h-6 sm:w-6', colors.text)}>
            {icon}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <h4 className="font-semibold text-sm sm:text-base text-foreground group-hover:text-primary transition-colors">
              {label}
            </h4>
          </div>
          {isLoading ? (
            <div className="space-y-1.5">
              <div className="h-5 w-24 bg-muted rounded animate-pulse" />
              <div className="h-3 w-32 bg-muted rounded animate-pulse" />
            </div>
          ) : (
            <>
              <p className={cn('text-lg sm:text-xl font-bold', colors.text)}>
                {typeof amount === 'number' ? `$${amount.toLocaleString()}` : amount}
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                {subtitle}
              </p>
            </>
          )}
        </div>
        <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
      </div>
    </Link>
  )
})

export const QuickOverviewCard = memo(function QuickOverviewCard({
  budgetData,
  budgetLoading,
  mahrData,
  mahrLoading,
  weddingBudgetData,
  weddingLoading,
  savingsData,
  savingsLoading,
  pendingTasks,
  tasksLoading,
}: QuickOverviewCardProps) {
  const [activeTab, setActiveTab] = useState<'financial' | 'tasks'>('financial')
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState(0)
  const shouldReduceMotion = useReducedMotion()
  const hasTasks = pendingTasks && pendingTasks.length > 0
  // Show more tasks: 5 on mobile, 6 on desktop for better visual balance
  const displayTasks = pendingTasks.slice(0, 6) // Show max 6 tasks (will be limited by available space)

  // Memoized financial calculations to prevent unnecessary recalculations
  const budgetTotal = useMemo(() => calculateBudgetTotal(budgetData), [budgetData])
  const budgetStatus = useMemo(() => getBudgetStatus(budgetData), [budgetData])
  const hasBudget = useMemo(() => !!budgetData && budgetTotal !== 0, [budgetData, budgetTotal])

  const mahrAmount = useMemo(() => mahrData?.amount || 0, [mahrData])
  const mahrStatus = useMemo(() => getMahrStatus(mahrData), [mahrData])
  const hasMahr = useMemo(() => !!mahrData && mahrAmount > 0, [mahrData, mahrAmount])

  const weddingTotal = useMemo(() => calculateWeddingTotal(weddingBudgetData), [weddingBudgetData])
  const hasWedding = useMemo(() => !!weddingBudgetData && weddingTotal > 0, [weddingBudgetData, weddingTotal])

  const savingsStatus = useMemo(() => getSavingsStatus(savingsData), [savingsData])
  const hasSavings = useMemo(() => !!savingsData && savingsStatus.target > 0, [savingsData, savingsStatus])

  // Note: isLoading is calculated inline where needed to avoid unused variable warning

  // Measure container width for accurate transform calculation
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth
        // Only update if width is valid
        if (width > 0) {
          setContainerWidth((prevWidth) => {
            // Only update if width actually changed to prevent unnecessary re-renders
            return width !== prevWidth ? width : prevWidth
          })
        }
      }
    }

    // Initial measurement with small delay to ensure DOM is ready
    const timeoutId = setTimeout(updateWidth, 0)

    // Update on resize using ResizeObserver (more efficient)
    let resizeObserver: ResizeObserver | null = null
    if (typeof ResizeObserver !== 'undefined' && containerRef.current) {
      resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const width = entry.contentRect.width
          if (width > 0) {
            setContainerWidth((prevWidth) => {
              return width !== prevWidth ? width : prevWidth
            })
          }
        }
      })
      resizeObserver.observe(containerRef.current)
    }

    // Fallback for browsers without ResizeObserver
    const handleResize = () => {
      updateWidth()
    }
    window.addEventListener('resize', handleResize)

    return () => {
      clearTimeout(timeoutId)
      if (resizeObserver) {
        resizeObserver.disconnect()
      }
      window.removeEventListener('resize', handleResize)
    }
  }, []) // Empty dependency array - only run on mount

  // Calculate transform in pixels (not percentages)
  // When financial: show first panel (0px), when tasks: show second panel (-containerWidth)
  const slideDistance = shouldReduceMotion 
    ? 0 
    : activeTab === 'financial' 
      ? 0 
      : containerWidth > 0 
        ? -containerWidth 
        : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <Card padding="none" className="overflow-hidden">
        <CardContent className="p-4 sm:p-6">
          
          {/* Tab Bar - Mobile Only */}
          <div className="border-b border-border mb-4 sm:mb-6 lg:hidden" role="tablist" aria-label="Overview sections">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setActiveTab('financial')}
                role="tab"
                aria-selected={activeTab === 'financial'}
                aria-controls="financial-panel"
                id="financial-tab"
                className={cn(
                  'px-4 py-3 min-h-[48px] text-sm font-medium transition-all duration-200',
                  'border-b-2 touch-manipulation',
                  activeTab === 'financial'
                    ? 'border-primary text-primary bg-primary/5'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-accent/50'
                )}
              >
                Financial
              </button>
              <button
                onClick={() => setActiveTab('tasks')}
                role="tab"
                aria-selected={activeTab === 'tasks'}
                aria-controls="tasks-panel"
                id="tasks-tab"
                className={cn(
                  'px-4 py-3 min-h-[48px] text-sm font-medium transition-all duration-200',
                  'border-b-2 touch-manipulation',
                  activeTab === 'tasks'
                    ? 'border-primary text-primary bg-primary/5'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-accent/50'
                )}
              >
                Tasks
              </button>
            </div>
          </div>

          {/* Mobile: Sliding Container */}
          <div 
            ref={containerRef}
            className="lg:hidden overflow-hidden relative w-full tab-slider-container"
            style={{ 
              height: 'calc(100vh - 320px)', // Account for header (~60px), tabs (~60px), card padding (~32px), margins (~40px), and bottom nav (~80px)
              maxHeight: '650px', // Maximum height for large phones
              minHeight: '450px' // Minimum height for small screens
            }}
          >
            <motion.div
              className="flex h-full tab-slider-content"
              animate={{ x: slideDistance }}
              transition={{ 
                duration: shouldReduceMotion ? 0 : 0.3, 
                ease: 'easeInOut' 
              }}
              style={{ 
                width: containerWidth > 0 ? `${containerWidth * 2}px` : '200%', // 2x container width for two panels
                willChange: 'transform'
              }}
            >
              {/* Financial Section - Exact container width */}
              <div 
                id="financial-panel"
                role="tabpanel"
                aria-labelledby="financial-tab"
                aria-hidden={activeTab !== 'financial'}
                className="flex-shrink-0 p-4 flex flex-col space-y-4 overflow-y-auto tab-content-scroll tab-panel"
                style={{
                  width: containerWidth > 0 ? `${containerWidth}px` : '50%', // Exact container width in pixels
                  height: '100%',
                  maxHeight: '100%',
                  minHeight: 0, // Critical for flex scrolling
                  paddingBottom: 'calc(100px + env(safe-area-inset-bottom, 0px))'
                }}
              >
                {/* Financial Overview Header */}
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base sm:text-lg text-foreground">Financial Overview</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                      Your financial planning at a glance
                    </p>
                  </div>
                </div>

                {/* Financial Mini Cards */}
                <div className="space-y-3 flex-1">
                  <FinancialMiniCard
                    icon={<Wallet className="h-full w-full" />}
                    label="Budget"
                    amount={budgetTotal}
                    subtitle={hasBudget ? `Status: ${budgetStatus}` : 'Monthly budget'}
                    color="green"
                    link="/financial?tab=budget"
                    isLoading={budgetLoading}
                  />

                  <FinancialMiniCard
                    icon={<Calculator className="h-full w-full" />}
                    label="Mahr"
                    amount={mahrAmount}
                    subtitle={hasMahr ? `Status: ${mahrStatus}` : 'Mahr amount'}
                    color="purple"
                    link="/financial?tab=mahr"
                    isLoading={mahrLoading}
                  />

                  <FinancialMiniCard
                    icon={<Target className="h-full w-full" />}
                    label="Wedding"
                    amount={weddingTotal}
                    subtitle={hasWedding ? 'Total allocated' : 'Wedding budget'}
                    color="blue"
                    link="/financial?tab=wedding"
                    isLoading={weddingLoading}
                  />

                  <FinancialMiniCard
                    icon={<Coins className="h-full w-full" />}
                    label="Savings"
                    amount={hasSavings ? `${savingsStatus.current.toLocaleString()} / ${savingsStatus.target.toLocaleString()}` : 0}
                    subtitle={hasSavings ? `${savingsStatus.progress}% progress` : 'Savings goals'}
                    color="amber"
                    link="/financial?tab=savings"
                    isLoading={savingsLoading}
                  />
                </div>

                <Link to="/financial" className="block mt-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full min-h-[44px]"
                    rightIcon={<ArrowRight className="h-4 w-4" />}
                  >
                    View All Financial Details
                  </Button>
                </Link>
              </div>

              {/* Tasks Section - Exact container width */}
              <div 
                id="tasks-panel"
                role="tabpanel"
                aria-labelledby="tasks-tab"
                aria-hidden={activeTab !== 'tasks'}
                className="flex-shrink-0 p-4 flex flex-col space-y-4 overflow-y-auto tab-content-scroll tab-panel"
                style={{
                  width: containerWidth > 0 ? `${containerWidth}px` : '50%', // Exact container width in pixels
                  height: '100%',
                  maxHeight: '100%',
                  minHeight: 0, // Critical for flex scrolling
                  paddingBottom: 'calc(100px + env(safe-area-inset-bottom, 0px))'
                }}
              >
                {/* Tasks Header */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                      <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-base sm:text-lg text-foreground">Upcoming Tasks</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                        {tasksLoading ? 'Loading...' : hasTasks ? `${pendingTasks.length} pending ${pendingTasks.length === 1 ? 'task' : 'tasks'}` : 'All tasks completed!'}
                      </p>
                    </div>
                  </div>
                  {hasTasks && (
                    <span className="text-xs sm:text-sm bg-amber-500/10 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full font-medium flex-shrink-0">
                      {pendingTasks.length}
                    </span>
                  )}
                </div>

                {/* Tasks Content */}
                {tasksLoading ? (
                  <div className="space-y-3 flex-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />
                    ))}
                  </div>
                ) : hasTasks ? (
                  <div className="space-y-3 flex-1">
                    {displayTasks.map((task) => (
                      <Link
                        key={task.id}
                        to="/checklist"
                        className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl bg-card/30 hover:bg-card/50 dark:bg-card/20 dark:hover:bg-card/40 transition-colors border border-border/50 min-h-[60px] touch-manipulation group"
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
                    {pendingTasks.length > displayTasks.length && (
                      <div className="pt-2 mt-auto">
                        <Link to="/checklist" className="block">
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full min-h-[44px]"
                            rightIcon={<ArrowRight className="h-4 w-4" />}
                          >
                            View All Tasks ({pendingTasks.length})
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-6 sm:py-8 flex-1 flex flex-col justify-center">
                    <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                      <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                    </div>
                    <p className="text-sm sm:text-base font-medium text-foreground mb-2">
                      All tasks completed!
                    </p>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-5">
                      Great job staying on top of your wedding preparation
                    </p>
                    <Link to="/checklist" className="inline-block">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full sm:w-auto min-h-[44px]"
                        rightIcon={<ArrowRight className="h-4 w-4" />}
                      >
                        View Checklist
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Desktop: Side-by-side Grid */}
          <div className="hidden lg:grid lg:grid-cols-2 gap-6">
            {/* Financial Section - Left */}
            <div className="flex flex-col h-full p-5 space-y-4 border-r border-border/50 pr-6">
              {/* Financial Overview Header */}
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-base sm:text-lg text-foreground">Financial Overview</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                    Your financial planning at a glance
                  </p>
                </div>
              </div>

              {/* Financial Mini Cards */}
              <div className="space-y-3 flex-1">
                <FinancialMiniCard
                  icon={<Wallet className="h-full w-full" />}
                  label="Budget"
                  amount={budgetTotal}
                  subtitle={hasBudget ? `Status: ${budgetStatus}` : 'Monthly budget'}
                  color="green"
                  link="/financial?tab=budget"
                  isLoading={budgetLoading}
                />

                <FinancialMiniCard
                  icon={<Calculator className="h-full w-full" />}
                  label="Mahr"
                  amount={mahrAmount}
                  subtitle={hasMahr ? `Status: ${mahrStatus}` : 'Mahr amount'}
                  color="purple"
                  link="/financial?tab=mahr"
                  isLoading={mahrLoading}
                />

                <FinancialMiniCard
                  icon={<Target className="h-full w-full" />}
                  label="Wedding"
                  amount={weddingTotal}
                  subtitle={hasWedding ? 'Total allocated' : 'Wedding budget'}
                  color="blue"
                  link="/financial?tab=wedding"
                  isLoading={weddingLoading}
                />

                <FinancialMiniCard
                  icon={<Coins className="h-full w-full" />}
                  label="Savings"
                  amount={hasSavings ? `${savingsStatus.current.toLocaleString()} / ${savingsStatus.target.toLocaleString()}` : 0}
                  subtitle={hasSavings ? `${savingsStatus.progress}% progress` : 'Savings goals'}
                  color="amber"
                  link="/financial?tab=savings"
                  isLoading={savingsLoading}
                />
              </div>

              <Link to="/financial" className="block mt-auto">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full min-h-[44px]"
                  rightIcon={<ArrowRight className="h-4 w-4" />}
                >
                  View All Financial Details
                </Button>
              </Link>
            </div>

            {/* Tasks Section - Right */}
            <div className="flex flex-col h-full p-5 space-y-4 pl-6">
              {/* Tasks Header */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base sm:text-lg text-foreground">Upcoming Tasks</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                      {tasksLoading ? 'Loading...' : hasTasks ? `${pendingTasks.length} pending ${pendingTasks.length === 1 ? 'task' : 'tasks'}` : 'All tasks completed!'}
                    </p>
                  </div>
                </div>
                {hasTasks && (
                  <span className="text-xs sm:text-sm bg-amber-500/10 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full font-medium flex-shrink-0">
                    {pendingTasks.length}
                  </span>
                )}
              </div>

              {/* Tasks Content */}
              {tasksLoading ? (
                <div className="space-y-3 flex-1">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : hasTasks ? (
                <div className="space-y-3 flex-1">
                  {displayTasks.map((task) => (
                    <Link
                      key={task.id}
                      to="/checklist"
                      className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl bg-card/30 hover:bg-card/50 dark:bg-card/20 dark:hover:bg-card/40 transition-colors border border-border/50 min-h-[60px] touch-manipulation group"
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
                  {pendingTasks.length > displayTasks.length && (
                    <div className="pt-2 mt-auto">
                      <Link to="/checklist" className="block">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full min-h-[44px]"
                          rightIcon={<ArrowRight className="h-4 w-4" />}
                        >
                          View All Tasks ({pendingTasks.length})
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-6 sm:py-8 flex-1 flex flex-col justify-center">
                  <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                  </div>
                  <p className="text-sm sm:text-base font-medium text-foreground mb-2">
                    All tasks completed!
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-5">
                    Great job staying on top of your wedding preparation
                  </p>
                  <Link to="/checklist" className="inline-block">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full sm:w-auto min-h-[44px]"
                      rightIcon={<ArrowRight className="h-4 w-4" />}
                    >
                      View Checklist
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>

        </CardContent>
      </Card>
    </motion.div>
  )
})
