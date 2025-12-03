import { motion } from 'framer-motion'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { formatCurrency } from '../../lib/utils'
import { BarChart3, PieChart as PieChartIcon } from 'lucide-react'

export interface ExpenseSummaryItem {
  name: string
  value: number
  color: string
  percentage?: number
}

export interface ExpenseSummaryCardsProps {
  data: ExpenseSummaryItem[]
  title: string
  onViewChart: () => void
  chartType?: 'pie' | 'bar'
  className?: string
}

/**
 * Summary cards component for mobile view
 * Shows top 3 expenses with quick stats
 * Replaces charts on mobile for better UX
 */
export function ExpenseSummaryCards({
  data,
  title,
  onViewChart,
  chartType = 'pie',
  className = '',
}: ExpenseSummaryCardsProps) {
  // Sort by value and take top 3
  const topExpenses = [...data]
    .sort((a, b) => b.value - a.value)
    .slice(0, 3)
    .map((item) => {
      const total = data.reduce((sum, d) => sum + d.value, 0)
      const percentage = total > 0 ? (item.value / total) * 100 : 0
      return { ...item, percentage }
    })

  const total = data.reduce((sum, item) => sum + item.value, 0)

  if (topExpenses.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <p className="text-sm text-muted-foreground">No expenses to display</p>
      </div>
    )
  }

  const ChartIcon = chartType === 'pie' ? PieChartIcon : BarChart3

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Summary Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-foreground">{title}</h3>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Top {topExpenses.length} categories
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Total</p>
          <p className="text-lg font-bold text-foreground">{formatCurrency(total)}</p>
        </div>
      </div>

      {/* Top Expenses Cards */}
      <div className="space-y-3">
        {topExpenses.map((expense, index) => (
          <motion.div
            key={expense.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card
              variant="outlined"
              padding="md"
              className="border-l-4"
              style={{ borderLeftColor: expense.color }}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {/* Color indicator */}
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: expense.color }}
                  />
                  {/* Expense info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground text-sm sm:text-base truncate">
                      {expense.name}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {expense.percentage?.toFixed(1)}%
                      </p>
                      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden max-w-[100px]">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${expense.percentage}%`,
                            backgroundColor: expense.color,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                {/* Amount */}
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-foreground text-sm sm:text-base">
                    {formatCurrency(expense.value)}
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* View Full Chart Button */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <Button
          onClick={onViewChart}
          variant="outline"
          className="w-full min-h-[48px] sm:min-h-[48px] touch-manipulation"
          leftIcon={<ChartIcon className="h-4 w-4 sm:h-5 sm:w-5" />}
        >
          View Full Chart
        </Button>
      </motion.div>
    </div>
  )
}

