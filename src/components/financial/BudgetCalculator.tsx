import { useState, useEffect, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card'
import { Button } from '../ui/Button'
import { Label } from '../ui/Label'
import { CurrencyInput } from './CurrencyInput'
import { EditViewToggle } from './EditViewToggle'
import { MobilePieChart } from './MobilePieChart'
import { MobileBarChart } from './MobileBarChart'
import { ChartContainer } from './ChartContainer'
import { ChartModal } from './ChartModal'
import { ExpenseSummaryCards } from './ExpenseSummaryCards'
import { useBudget, useUpdateBudget } from '../../hooks/useBudget'
import { useViewport } from '../../hooks/useViewport'
import { formatCurrency } from '../../lib/utils'
import { exportToCSV, formatDateForFilename } from '../../lib/csv-export'
import { Download, Wallet, TrendingUp, TrendingDown, DollarSign } from 'lucide-react'
import { validateAmount } from '../../lib/validation'

const EXPENSE_CATEGORIES = [
  { key: 'expense_housing', label: 'Housing', color: '#3B82F6' },
  { key: 'expense_utilities', label: 'Utilities', color: '#10B981' },
  { key: 'expense_transportation', label: 'Transportation', color: '#F59E0B' },
  { key: 'expense_food', label: 'Food', color: '#EF4444' },
  { key: 'expense_insurance', label: 'Insurance', color: '#8B5CF6' },
  { key: 'expense_debt', label: 'Debt', color: '#EC4899' },
  { key: 'expense_entertainment', label: 'Entertainment', color: '#06B6D4' },
  { key: 'expense_dining', label: 'Dining Out', color: '#84CC16' },
  { key: 'expense_clothing', label: 'Clothing', color: '#F97316' },
  { key: 'expense_gifts', label: 'Gifts', color: '#14B8A6' },
  { key: 'expense_charity', label: 'Charity', color: '#6366F1' },
] as const

interface BudgetData {
  income_his: number
  income_hers: number
  expense_housing: number
  expense_utilities: number
  expense_transportation: number
  expense_food: number
  expense_insurance: number
  expense_debt: number
  expense_entertainment: number
  expense_dining: number
  expense_clothing: number
  expense_gifts: number
  expense_charity: number
}

export function BudgetCalculator() {
  const { data: budgetData, isLoading } = useBudget()
  const updateMutation = useUpdateBudget()
  const { isMobile, isTablet } = useViewport()
  const [isEditMode, setIsEditMode] = useState(false)
  const [showPieChartModal, setShowPieChartModal] = useState(false)
  const [showBarChartModal, setShowBarChartModal] = useState(false)
  
  // Show summary cards on mobile and tablet, inline charts on desktop
  const showSummaryCards = isMobile || isTablet
  const [formData, setFormData] = useState<BudgetData>({
    income_his: 0,
    income_hers: 0,
    expense_housing: 0,
    expense_utilities: 0,
    expense_transportation: 0,
    expense_food: 0,
    expense_insurance: 0,
    expense_debt: 0,
    expense_entertainment: 0,
    expense_dining: 0,
    expense_clothing: 0,
    expense_gifts: 0,
    expense_charity: 0,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Initialize form data from fetched data
  useEffect(() => {
    if (budgetData && !isEditMode) {
      setFormData({
        income_his: budgetData.income_his || 0,
        income_hers: budgetData.income_hers || 0,
        expense_housing: budgetData.expense_housing || 0,
        expense_utilities: budgetData.expense_utilities || 0,
        expense_transportation: budgetData.expense_transportation || 0,
        expense_food: budgetData.expense_food || 0,
        expense_insurance: budgetData.expense_insurance || 0,
        expense_debt: budgetData.expense_debt || 0,
        expense_entertainment: budgetData.expense_entertainment || 0,
        expense_dining: budgetData.expense_dining || 0,
        expense_clothing: budgetData.expense_clothing || 0,
        expense_gifts: budgetData.expense_gifts || 0,
        expense_charity: budgetData.expense_charity || 0,
      })
    }
  }, [budgetData, isEditMode])

  // Memoized calculations to prevent unnecessary recalculations
  const totalIncome = useMemo(() => formData.income_his + formData.income_hers, [formData.income_his, formData.income_hers])
  const totalExpenses = useMemo(() => 
    Object.entries(formData)
      .filter(([key]) => key.startsWith('expense_'))
      .reduce((sum, [, value]) => sum + (value || 0), 0),
    [formData]
  )
  const surplus = useMemo(() => totalIncome - totalExpenses, [totalIncome, totalExpenses])

  // Memoized chart data preparation
  const pieChartData = useMemo(() => 
    EXPENSE_CATEGORIES.map((category) => ({
      name: category.label,
      value: formData[category.key as keyof BudgetData] as number,
      color: category.color,
    })).filter((item) => item.value > 0),
    [formData]
  )

  const barChartData = useMemo(() =>
    EXPENSE_CATEGORIES.map((category) => {
      const value = formData[category.key as keyof BudgetData] as number
      return {
        name: category.label,
        Amount: value,
      }
    }).filter((item) => item.Amount > 0),
    [formData]
  )

  const handleFieldChange = useCallback((field: keyof BudgetData, value: number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error for this field
    setErrors((prev) => {
      if (prev[field]) {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      }
      return prev
    })
  }, [])

  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {}

    // Validate all fields
    Object.entries(formData).forEach(([key, value]) => {
      const validation = validateAmount(value, { min: 0, max: 10000000 })
      if (!validation.isValid) {
        newErrors[key] = validation.error || 'Invalid amount'
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData])

  const handleSave = () => {
    if (!validateForm()) {
      return
    }

    updateMutation.mutate(formData, {
      onSuccess: () => {
        setIsEditMode(false)
      },
    })
  }

  const handleCancel = () => {
    // Reset form data to saved data
    if (budgetData) {
      setFormData({
        income_his: budgetData.income_his || 0,
        income_hers: budgetData.income_hers || 0,
        expense_housing: budgetData.expense_housing || 0,
        expense_utilities: budgetData.expense_utilities || 0,
        expense_transportation: budgetData.expense_transportation || 0,
        expense_food: budgetData.expense_food || 0,
        expense_insurance: budgetData.expense_insurance || 0,
        expense_debt: budgetData.expense_debt || 0,
        expense_entertainment: budgetData.expense_entertainment || 0,
        expense_dining: budgetData.expense_dining || 0,
        expense_clothing: budgetData.expense_clothing || 0,
        expense_gifts: budgetData.expense_gifts || 0,
        expense_charity: budgetData.expense_charity || 0,
      })
    }
    setErrors({})
    setIsEditMode(false)
  }

  const handleExport = () => {
    const exportData = [
      { 'Total Income': formatCurrency(totalIncome) },
      { 'Total Expenses': formatCurrency(totalExpenses) },
      { 'Surplus/Deficit': formatCurrency(surplus) },
      ...EXPENSE_CATEGORIES.map((category) => ({
        [category.label]: formatCurrency(formData[category.key as keyof BudgetData] as number),
      })),
    ]

    exportToCSV(exportData, `budget-${formatDateForFilename()}`)
  }

  if (isLoading) {
    return (
      <Card padding="none">
        <CardContent className="p-6 sm:p-8">
          <div className="flex items-center justify-center min-h-[200px]">
            <p className="text-sm sm:text-base text-muted-foreground">Loading budget data...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card padding="none">
      <CardHeader className="border-b border-border px-6 py-5 sm:px-8 sm:py-6">
        {/* Mobile-first: Stack vertically on mobile, horizontal on larger screens */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          {/* Title Section */}
          <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 min-w-0 flex-1">
            <div className="h-9 w-9 sm:h-10 sm:w-10 lg:h-12 lg:w-12 rounded-xl bg-secondary/10 dark:bg-secondary/20 flex items-center justify-center flex-shrink-0">
              <Wallet className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-secondary-foreground" />
            </div>
            <div className="min-w-0 flex-1">
              <CardTitle className="text-base sm:text-lg lg:text-xl truncate">Monthly Budget Calculator</CardTitle>
              <CardDescription className="text-xs sm:text-sm lg:text-base mt-0.5 line-clamp-1">
                Track your income and expenses
              </CardDescription>
            </div>
          </div>
          
          {/* Buttons Section - Mobile: Full width, Desktop: Auto */}
          {!isEditMode && (
            <div className="flex gap-2 sm:flex-shrink-0">
              <Button
                variant="outline"
                size="md"
                onClick={handleExport}
                className="min-h-[44px] sm:min-h-[48px] touch-manipulation flex-1 sm:flex-initial"
                leftIcon={<Download className="h-4 w-4 sm:h-5 sm:w-5" />}
              >
                <span className="text-sm sm:text-base">Export</span>
              </Button>
              <EditViewToggle
                isEditMode={isEditMode}
                onToggle={() => setIsEditMode(true)}
                disabled={isLoading}
                className="flex-1 sm:flex-initial"
              />
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
        {isEditMode ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 sm:space-y-8"
          >
            {/* Income Section */}
            <div className="space-y-4 sm:space-y-5">
              <h3 className="text-base sm:text-lg font-semibold text-foreground">Income</h3>
              <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
                <CurrencyInput
                  label="His Income"
                  value={formData.income_his}
                  onChange={(value) => handleFieldChange('income_his', value)}
                  error={errors.income_his}
                  min={0}
                  max={10000000}
                  leftIcon={<DollarSign className="h-5 w-5" />}
                />
                <CurrencyInput
                  label="Her Income"
                  value={formData.income_hers}
                  onChange={(value) => handleFieldChange('income_hers', value)}
                  error={errors.income_hers}
                  min={0}
                  max={10000000}
                  leftIcon={<DollarSign className="h-5 w-5" />}
                />
              </div>
            </div>

            {/* Fixed Expenses Section */}
            <div className="space-y-4 sm:space-y-5 border-t border-border pt-6">
              <h3 className="text-base sm:text-lg font-semibold text-foreground">Fixed Expenses</h3>
              <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
                {EXPENSE_CATEGORIES.slice(0, 6).map((category) => (
                  <CurrencyInput
                    key={category.key}
                    label={category.label}
                    value={formData[category.key as keyof BudgetData] as number}
                    onChange={(value) => handleFieldChange(category.key as keyof BudgetData, value)}
                    error={errors[category.key]}
                    min={0}
                    max={10000000}
                  />
                ))}
              </div>
            </div>

            {/* Variable Expenses Section */}
            <div className="space-y-4 sm:space-y-5 border-t border-border pt-6">
              <h3 className="text-base sm:text-lg font-semibold text-foreground">Variable Expenses</h3>
              <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
                {EXPENSE_CATEGORIES.slice(6).map((category) => (
                  <CurrencyInput
                    key={category.key}
                    label={category.label}
                    value={formData[category.key as keyof BudgetData] as number}
                    onChange={(value) => handleFieldChange(category.key as keyof BudgetData, value)}
                    error={errors[category.key]}
                    min={0}
                    max={10000000}
                  />
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="sticky bottom-0 bg-card border-t border-border -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-4 sm:py-5 mt-6 sm:mt-8 safe-area-inset-bottom">
              <EditViewToggle
                isEditMode={isEditMode}
                onToggle={handleSave}
                onCancel={handleCancel}
                onSave={handleSave}
                isLoading={updateMutation.isPending}
              />
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 sm:space-y-8"
          >
            {/* Summary Cards */}
            <div className="grid sm:grid-cols-3 gap-4 sm:gap-5">
              <Card variant="outlined" padding="md" className="text-center p-4 sm:p-6">
                <div className="flex items-center justify-center gap-2 mb-2 sm:mb-3">
                  <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                  <Label className="text-xs sm:text-sm text-muted-foreground">Total Income</Label>
                </div>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">{formatCurrency(totalIncome)}</p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1 sm:mt-2">Planned</p>
              </Card>

              <Card variant="outlined" padding="md" className="text-center p-4 sm:p-6">
                <div className="flex items-center justify-center gap-2 mb-2 sm:mb-3">
                  <Wallet className="h-5 w-5 sm:h-6 sm:w-6 text-secondary" />
                  <Label className="text-xs sm:text-sm text-muted-foreground">Total Expenses</Label>
                </div>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">{formatCurrency(totalExpenses)}</p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1 sm:mt-2">Spent</p>
              </Card>

              <Card
                variant="outlined"
                padding="md"
                className={`text-center p-4 sm:p-6 ${surplus >= 0 ? 'border-green-500' : 'border-red-500'}`}
              >
                <div className="flex items-center justify-center gap-2 mb-2 sm:mb-3">
                  {surplus >= 0 ? (
                    <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                  ) : (
                    <TrendingDown className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
                  )}
                  <Label className="text-xs sm:text-sm text-muted-foreground">Surplus/Deficit</Label>
                </div>
                <p
                  className={`text-xl sm:text-2xl lg:text-3xl font-bold ${surplus >= 0 ? 'text-green-600' : 'text-red-600'}`}
                >
                  {formatCurrency(surplus)}
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1 sm:mt-2">
                  {surplus >= 0 ? 'On track' : 'Review budget'}
                </p>
              </Card>
            </div>

            {/* Charts - Conditional Rendering: Summary Cards on Mobile/Tablet, Charts on Desktop */}
            {pieChartData.length > 0 && (
              <div className="space-y-3 sm:space-y-4">
                {showSummaryCards ? (
                  <ExpenseSummaryCards
                    data={pieChartData}
                    title="Expense Breakdown"
                    onViewChart={() => setShowPieChartModal(true)}
                    chartType="pie"
                  />
                ) : (
                  <>
                    <h3 className="text-base sm:text-lg font-semibold text-foreground">Expense Breakdown</h3>
                    <ChartContainer minWidth={280}>
                      <MobilePieChart data={pieChartData} />
                    </ChartContainer>
                  </>
                )}
              </div>
            )}

            {barChartData.length > 0 && (
              <div className="space-y-3 sm:space-y-4">
                {showSummaryCards ? (
                  <ExpenseSummaryCards
                    data={barChartData.map((item) => ({
                      name: item.name,
                      value: item.Amount,
                      color: '#8B5CF6',
                    }))}
                    title="Expenses by Category"
                    onViewChart={() => setShowBarChartModal(true)}
                    chartType="bar"
                  />
                ) : (
                  <>
                    <h3 className="text-base sm:text-lg font-semibold text-foreground">Expenses by Category</h3>
                    <ChartContainer minWidth={320}>
                      <MobileBarChart
                        data={barChartData}
                        dataKeys={[
                          {
                            key: 'Amount',
                            name: 'Amount',
                            color: '#8B5CF6',
                          },
                        ]}
                      />
                    </ChartContainer>
                  </>
                )}
              </div>
            )}

            {/* Chart Modals for Mobile */}
            <ChartModal
              isOpen={showPieChartModal}
              onClose={() => setShowPieChartModal(false)}
              title="Expense Breakdown"
              description="Visual breakdown of your expenses by category"
            >
              <div className="w-full flex flex-col items-center justify-center" style={{ minHeight: '500px' }}>
                <ChartContainer minWidth={280}>
                  <MobilePieChart data={pieChartData} height={450} />
                </ChartContainer>
              </div>
            </ChartModal>

            <ChartModal
              isOpen={showBarChartModal}
              onClose={() => setShowBarChartModal(false)}
              title="Expenses by Category"
              description="Compare expenses across different categories"
            >
              <div className="w-full flex flex-col items-center justify-center" style={{ minHeight: '500px' }}>
                <ChartContainer minWidth={320}>
                  <MobileBarChart
                    data={barChartData}
                    dataKeys={[
                      {
                        key: 'Amount',
                        name: 'Amount',
                        color: '#8B5CF6',
                      },
                    ]}
                    height={450}
                  />
                </ChartContainer>
              </div>
            </ChartModal>
          </motion.div>
        )}
      </CardContent>
    </Card>
  )
}

