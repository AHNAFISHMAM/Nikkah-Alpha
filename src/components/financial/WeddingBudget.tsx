import { memo, useState, useEffect, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card'
import { Button } from '../ui/Button'
import { Label } from '../ui/Label'
import { Progress } from '../ui/Progress'
import { CurrencyInput } from './CurrencyInput'
import { EditViewToggle } from './EditViewToggle'
import { MobileBarChart } from './MobileBarChart'
import { ChartContainer } from './ChartContainer'
import { ChartModal } from './ChartModal'
import { ExpenseSummaryCards } from './ExpenseSummaryCards'
import { useWeddingBudget, useUpdateWeddingBudget } from '../../hooks/useWeddingBudget'
import { useViewport } from '../../hooks/useViewport'
import { formatCurrency } from '../../lib/utils'
import { exportToCSV, formatDateForFilename } from '../../lib/csv-export'
import { Download, Wallet, AlertTriangle } from 'lucide-react'
import { validateAmount } from '../../lib/validation'

const WEDDING_CATEGORIES = [
  { key: 'venue', label: 'Venue', icon: '🏛️' },
  { key: 'catering', label: 'Catering', icon: '🍽️' },
  { key: 'photography', label: 'Photography', icon: '📸' },
  { key: 'clothing', label: 'Clothing/Jewelry', icon: '👗' },
  { key: 'decor', label: 'Decorations', icon: '🎨' },
  { key: 'invitations', label: 'Invitations', icon: '💌' },
  { key: 'other', label: 'Other Expenses', icon: '📋' },
] as const

interface WeddingBudgetFormData {
  venue_planned: number
  venue_spent: number
  catering_planned: number
  catering_spent: number
  photography_planned: number
  photography_spent: number
  clothing_planned: number
  clothing_spent: number
  decor_planned: number
  decor_spent: number
  invitations_planned: number
  invitations_spent: number
  other_planned: number
  other_spent: number
}

export const WeddingBudget = memo(function WeddingBudget() {
  const { data: weddingBudgetData, isLoading } = useWeddingBudget()
  const updateMutation = useUpdateWeddingBudget()
  const { isMobile, isTablet } = useViewport()
  const [isEditMode, setIsEditMode] = useState(false)
  const [showChartModal, setShowChartModal] = useState(false)
  
  // Show summary cards on mobile and tablet, inline charts on desktop
  const showSummaryCards = isMobile || isTablet
  const [formData, setFormData] = useState<WeddingBudgetFormData>({
    venue_planned: 0,
    venue_spent: 0,
    catering_planned: 0,
    catering_spent: 0,
    photography_planned: 0,
    photography_spent: 0,
    clothing_planned: 0,
    clothing_spent: 0,
    decor_planned: 0,
    decor_spent: 0,
    invitations_planned: 0,
    invitations_spent: 0,
    other_planned: 0,
    other_spent: 0,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [warnings, setWarnings] = useState<Record<string, string>>({})

  // Initialize form data from fetched data
  useEffect(() => {
    if (weddingBudgetData && !isEditMode) {
      setFormData({
        venue_planned: weddingBudgetData.venue_planned || 0,
        venue_spent: weddingBudgetData.venue_spent || 0,
        catering_planned: weddingBudgetData.catering_planned || 0,
        catering_spent: weddingBudgetData.catering_spent || 0,
        photography_planned: weddingBudgetData.photography_planned || 0,
        photography_spent: weddingBudgetData.photography_spent || 0,
        clothing_planned: weddingBudgetData.clothing_planned || 0,
        clothing_spent: weddingBudgetData.clothing_spent || 0,
        decor_planned: weddingBudgetData.decor_planned || 0,
        decor_spent: weddingBudgetData.decor_spent || 0,
        invitations_planned: weddingBudgetData.invitations_planned || 0,
        invitations_spent: weddingBudgetData.invitations_spent || 0,
        other_planned: weddingBudgetData.other_planned || 0,
        other_spent: weddingBudgetData.other_spent || 0,
      })
    }
  }, [weddingBudgetData, isEditMode])

  // Memoized calculations to prevent unnecessary recalculations
  const totalPlanned = useMemo(() =>
    Object.entries(formData)
      .filter(([key]) => key.endsWith('_planned'))
      .reduce((sum, [, value]) => sum + (value || 0), 0),
    [formData]
  )

  const totalSpent = useMemo(() =>
    Object.entries(formData)
      .filter(([key]) => key.endsWith('_spent'))
      .reduce((sum, [, value]) => sum + (value || 0), 0),
    [formData]
  )

  const remaining = useMemo(() => totalPlanned - totalSpent, [totalPlanned, totalSpent])
  const percentageSpent = useMemo(() => 
    totalPlanned > 0 ? (totalSpent / totalPlanned) * 100 : 0,
    [totalPlanned, totalSpent]
  )

  // Memoized bar chart data preparation
  const barChartData = useMemo(() =>
    WEDDING_CATEGORIES.map((category) => {
      const planned = formData[`${category.key}_planned` as keyof WeddingBudgetFormData] as number
      const spent = formData[`${category.key}_spent` as keyof WeddingBudgetFormData] as number
      return {
        name: category.label,
        Planned: planned,
        Spent: spent,
      }
    }).filter((item) => item.Planned > 0 || item.Spent > 0),
    [formData]
  )

  const handleFieldChange = useCallback((field: keyof WeddingBudgetFormData, value: number) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value }
      
      // Check for warnings (spent > planned)
      if (field.endsWith('_spent')) {
        const plannedField = field.replace('_spent', '_planned') as keyof WeddingBudgetFormData
        const planned = updated[plannedField] as number
        setWarnings((prev) => {
          if (value > planned && planned > 0) {
            return {
              ...prev,
              [field]: `Spent exceeds planned amount by ${formatCurrency(value - planned)}`,
            }
          } else {
            const newWarnings = { ...prev }
            delete newWarnings[field]
            return newWarnings
          }
        })
      }
      
      return updated
    })

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
    if (weddingBudgetData) {
      setFormData({
        venue_planned: weddingBudgetData.venue_planned || 0,
        venue_spent: weddingBudgetData.venue_spent || 0,
        catering_planned: weddingBudgetData.catering_planned || 0,
        catering_spent: weddingBudgetData.catering_spent || 0,
        photography_planned: weddingBudgetData.photography_planned || 0,
        photography_spent: weddingBudgetData.photography_spent || 0,
        clothing_planned: weddingBudgetData.clothing_planned || 0,
        clothing_spent: weddingBudgetData.clothing_spent || 0,
        decor_planned: weddingBudgetData.decor_planned || 0,
        decor_spent: weddingBudgetData.decor_spent || 0,
        invitations_planned: weddingBudgetData.invitations_planned || 0,
        invitations_spent: weddingBudgetData.invitations_spent || 0,
        other_planned: weddingBudgetData.other_planned || 0,
        other_spent: weddingBudgetData.other_spent || 0,
      })
    }
    setErrors({})
    setWarnings({})
    setIsEditMode(false)
  }

  const handleExport = () => {
    const exportData = [
      ...WEDDING_CATEGORIES.map((category) => {
        const planned = formData[`${category.key}_planned` as keyof WeddingBudgetFormData] as number
        const spent = formData[`${category.key}_spent` as keyof WeddingBudgetFormData] as number
        const remaining = planned - spent
        return {
          Category: category.label,
          Planned: formatCurrency(planned),
          Spent: formatCurrency(spent),
          Remaining: formatCurrency(remaining),
          'Over Budget': remaining < 0 ? formatCurrency(Math.abs(remaining)) : '',
        }
      }),
      {
        Category: 'TOTAL',
        Planned: formatCurrency(totalPlanned),
        Spent: formatCurrency(totalSpent),
        Remaining: formatCurrency(remaining),
        'Over Budget': remaining < 0 ? formatCurrency(Math.abs(remaining)) : '',
      },
    ]

    exportToCSV(exportData, `wedding-budget-${formatDateForFilename()}`)
  }

  if (isLoading) {
    return (
      <Card padding="none">
        <CardContent className="p-6 sm:p-8">
          <div className="flex items-center justify-center min-h-[200px]">
            <p className="text-sm sm:text-base text-muted-foreground">Loading wedding budget data...</p>
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
              <CardTitle className="text-base sm:text-lg lg:text-xl truncate">Wedding Budget Planner</CardTitle>
              <CardDescription className="text-xs sm:text-sm lg:text-base mt-0.5 line-clamp-1">
                Plan and track your wedding expenses
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
            {WEDDING_CATEGORIES.map((category) => {
              const plannedField = `${category.key}_planned` as keyof WeddingBudgetFormData
              const spentField = `${category.key}_spent` as keyof WeddingBudgetFormData
              const planned = formData[plannedField] as number
              const spent = formData[spentField] as number

              return (
                <div key={category.key} className="space-y-4 sm:space-y-5 border-b border-border pb-6 last:border-0">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <span className="text-xl sm:text-2xl">{category.icon}</span>
                    <Label className="text-base sm:text-lg font-semibold">{category.label}</Label>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
                    <CurrencyInput
                      label="Planned"
                      value={planned}
                      onChange={(value) => handleFieldChange(plannedField, value)}
                      error={errors[plannedField]}
                      min={0}
                      max={10000000}
                    />
                    <CurrencyInput
                      label="Spent"
                      value={spent}
                      onChange={(value) => handleFieldChange(spentField, value)}
                      error={errors[spentField]}
                      hint={warnings[spentField]}
                      min={0}
                      max={10000000}
                    />
                  </div>
                  {warnings[spentField] && (
                    <p className="text-xs sm:text-sm text-amber-600 flex items-center gap-1">
                      <AlertTriangle className="h-4 w-4" />
                      {warnings[spentField]}
                    </p>
                  )}
                </div>
              )
            })}

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
                <Label className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3">Total Budget</Label>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">
                  {formatCurrency(totalPlanned)}
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1 sm:mt-2">Planned</p>
              </Card>

              <Card variant="outlined" padding="md" className="text-center p-4 sm:p-6">
                <Label className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3">Total Spent</Label>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-amber-600">
                  {formatCurrency(totalSpent)}
                </p>
              </Card>

              <Card
                variant="outlined"
                padding="md"
                className={`text-center p-4 sm:p-6 ${remaining >= 0 ? 'border-green-500' : 'border-red-500'}`}
              >
                <Label className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3">Remaining</Label>
                <p className={`text-xl sm:text-2xl lg:text-3xl font-bold ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(remaining)}
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1 sm:mt-2">
                  {remaining >= 0 ? 'On track' : 'Over budget'}
                </p>
              </Card>
            </div>

            {/* Overall Progress */}
            {totalPlanned > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm sm:text-base">Overall Progress</Label>
                  <span className="text-sm sm:text-base font-semibold text-foreground">
                    {percentageSpent.toFixed(1)}%
                  </span>
                </div>
                <Progress value={percentageSpent} className="h-3" />
                {percentageSpent > 100 && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertTriangle className="h-4 w-4" />
                    You're over budget by {formatCurrency(Math.abs(remaining))}
                  </p>
                )}
              </div>
            )}

            {/* Bar Chart - Conditional Rendering: Summary Cards on Mobile/Tablet, Charts on Desktop */}
            {barChartData.length > 0 && (
              <div className="space-y-3 sm:space-y-4">
                {showSummaryCards ? (
                  <ExpenseSummaryCards
                    data={barChartData
                      .map((item) => ({
                        name: item.name,
                        value: item.Spent || 0,
                        color: item.Spent > (item.Planned || 0) ? '#EF4444' : '#FBD07C',
                        percentage: item.Planned > 0 ? ((item.Spent || 0) / item.Planned) * 100 : 0,
                      }))
                      .filter((item) => item.value > 0 || item.percentage > 0)}
                    title="Budget vs Spent"
                    onViewChart={() => setShowChartModal(true)}
                    chartType="bar"
                  />
                ) : (
                  <>
                    <h3 className="text-base sm:text-lg font-semibold text-foreground">Budget vs Spent</h3>
                    <ChartContainer minWidth={320}>
                      <MobileBarChart
                        data={barChartData}
                        dataKeys={[
                          { key: 'Planned', name: 'Planned', color: '#8B5CF6' },
                          { key: 'Spent', name: 'Spent', color: '#FBD07C' },
                        ]}
                      />
                    </ChartContainer>
                  </>
                )}
              </div>
            )}

            {/* Chart Modal for Mobile */}
            <ChartModal
              isOpen={showChartModal}
              onClose={() => setShowChartModal(false)}
              title="Budget vs Spent"
              description="Compare planned budget with actual spending"
            >
              <div className="w-full flex flex-col items-center justify-center" style={{ minHeight: '500px' }}>
                <ChartContainer minWidth={320}>
                  <MobileBarChart
                    data={barChartData}
                    dataKeys={[
                      { key: 'Planned', name: 'Planned', color: '#8B5CF6' },
                      { key: 'Spent', name: 'Spent', color: '#FBD07C' },
                    ]}
                    height={450}
                  />
                </ChartContainer>
              </div>
            </ChartModal>

            {/* Category Breakdown */}
            <div className="space-y-4">
              <h3 className="text-base sm:text-lg font-semibold text-foreground">Category Breakdown</h3>
              <div className="space-y-3">
                {WEDDING_CATEGORIES.map((category) => {
                  const planned = formData[`${category.key}_planned` as keyof WeddingBudgetFormData] as number
                  const spent = formData[`${category.key}_spent` as keyof WeddingBudgetFormData] as number
                  const categoryRemaining = planned - spent
                  const categoryPercentage = planned > 0 ? (spent / planned) * 100 : 0

                  if (planned === 0 && spent === 0) return null

                  return (
                    <Card key={category.key} variant="outlined" padding="sm">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-xl">{category.icon}</span>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <Label className="text-sm sm:text-base font-semibold">{category.label}</Label>
                            <span className="text-sm sm:text-base font-semibold text-foreground">
                              {formatCurrency(spent)} / {formatCurrency(planned)}
                            </span>
                          </div>
                          <Progress value={categoryPercentage} className="h-2" />
                          {categoryRemaining < 0 && (
                            <p className="text-xs text-red-600 mt-1">
                              Over by {formatCurrency(Math.abs(categoryRemaining))}
                            </p>
                          )}
                        </div>
                      </div>
                    </Card>
                  )
                })}
              </div>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  )
})

