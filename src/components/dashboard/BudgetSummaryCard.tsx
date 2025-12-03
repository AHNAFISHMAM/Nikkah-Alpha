import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { DollarSign, ArrowRight, TrendingUp } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card'
import { Button } from '../ui/Button'
import { Progress } from '../ui/Progress'
import { cn } from '../../lib/utils'

interface BudgetSummaryCardProps {
  hasBudget: boolean
  budgetAmount: number | null
  isLoading?: boolean
}

export function BudgetSummaryCard({ hasBudget, budgetAmount, isLoading }: BudgetSummaryCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <Card padding="none" className="overflow-hidden">
        <div className="bg-gradient-to-r from-green-500/10 via-green-400/5 to-green-600/10 dark:from-green-500/20 dark:via-green-400/10 dark:to-green-600/20 px-6 py-5 sm:px-8 sm:py-6 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-green-500/10 dark:bg-green-500/20 flex items-center justify-center flex-shrink-0">
                <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <CardTitle className="text-lg sm:text-xl">Budget Summary</CardTitle>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                  {hasBudget ? 'Your wedding budget' : 'Set your wedding budget'}
                </p>
              </div>
            </div>
            {hasBudget && (
              <div className="text-right">
                <span className="text-xs sm:text-sm bg-green-500/10 dark:bg-green-500/20 text-green-700 dark:text-green-400 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full font-medium">
                  Set
                </span>
              </div>
            )}
          </div>
        </div>
        <CardContent className="p-6 sm:p-8">
          {isLoading ? (
            <div className="space-y-4">
              <div className="h-8 w-32 bg-muted rounded animate-pulse" />
              <div className="h-4 w-full bg-muted rounded animate-pulse" />
            </div>
          ) : hasBudget && budgetAmount ? (
            <div className="space-y-4 sm:space-y-5">
              <div>
                <p className="text-2xl sm:text-3xl font-bold text-foreground">
                  ${budgetAmount.toLocaleString()}
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  Total budget allocated
                </p>
              </div>
              <div className="pt-2">
                <Link to="/financial">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full sm:w-auto min-h-[44px]"
                    rightIcon={<ArrowRight className="h-4 w-4" />}
                  >
                    View Budget Details
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-5">
              <div className="text-center py-4 sm:py-6">
                <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <DollarSign className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground" />
                </div>
                <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-5">
                  Set up your wedding budget to track expenses and plan your finances
                </p>
                <Link to="/financial">
                  <Button
                    className="w-full sm:w-auto min-h-[44px]"
                    rightIcon={<ArrowRight className="h-4 w-4" />}
                  >
                    Set Budget
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

