import { memo, useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card'
import { Button } from '../ui/Button'
import { Label } from '../ui/Label'
import { Input } from '../ui/Input'
import { Progress } from '../ui/Progress'
import { CurrencyInput } from './CurrencyInput'
import { EditViewToggle } from './EditViewToggle'
import { useSavingsGoals, useUpdateSavingsGoals } from '../../hooks/useSavingsGoals'
import { formatCurrency } from '../../lib/utils'
import { exportToCSV, formatDateForFilename } from '../../lib/csv-export'
import { Download, Coins, Shield, Home, Target, CheckCircle2 } from 'lucide-react'
import { validateAmount, validatePaidAmount } from '../../lib/validation'

interface SavingsGoal {
  id: string
  name: string
  icon: typeof Shield
  color: string
  description: string
  goalField: 'emergency_fund_goal' | 'house_goal' | 'other_goal_amount'
  currentField: 'emergency_fund_current' | 'house_current' | 'other_goal_current'
}

interface SavingsGoalsFormData {
  emergency_fund_goal: number
  emergency_fund_current: number
  house_goal: number
  house_current: number
  other_goal_name: string
  other_goal_amount: number
  other_goal_current: number
}

const PRE_DEFINED_GOALS: Omit<SavingsGoal, 'goalField' | 'currentField'>[] = [
  {
    id: 'emergency',
    name: 'Emergency Fund',
    icon: Shield,
    color: 'text-green-600',
    description: '3-6 months of expenses',
  },
  {
    id: 'house',
    name: 'House Down Payment',
    icon: Home,
    color: 'text-primary',
    description: 'Save for your future home',
  },
]

export const SavingsGoals = memo(function SavingsGoals() {
  const { data: savingsGoalsData, isLoading } = useSavingsGoals()
  const updateMutation = useUpdateSavingsGoals()
  const [isEditMode, setIsEditMode] = useState(false)
  const [formData, setFormData] = useState<SavingsGoalsFormData>({
    emergency_fund_goal: 0,
    emergency_fund_current: 0,
    house_goal: 0,
    house_current: 0,
    other_goal_name: '',
    other_goal_amount: 0,
    other_goal_current: 0,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Initialize form data from fetched data
  useEffect(() => {
    if (savingsGoalsData && !isEditMode) {
      setFormData({
        emergency_fund_goal: savingsGoalsData.emergency_fund_goal || 0,
        emergency_fund_current: savingsGoalsData.emergency_fund_current || 0,
        house_goal: savingsGoalsData.house_goal || 0,
        house_current: savingsGoalsData.house_current || 0,
        other_goal_name: savingsGoalsData.other_goal_name || '',
        other_goal_amount: savingsGoalsData.other_goal_amount || 0,
        other_goal_current: savingsGoalsData.other_goal_current || 0,
      })
    }
  }, [savingsGoalsData, isEditMode])

  const handleFieldChange = useCallback((field: keyof SavingsGoalsFormData, value: number | string) => {
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

    // Validate all goal and current fields
    const goals: Array<{ goalField: keyof SavingsGoalsFormData; currentField: keyof SavingsGoalsFormData }> = [
      { goalField: 'emergency_fund_goal', currentField: 'emergency_fund_current' },
      { goalField: 'house_goal', currentField: 'house_current' },
      { goalField: 'other_goal_amount', currentField: 'other_goal_current' },
    ]

    goals.forEach(({ goalField, currentField }) => {
      const goal = formData[goalField] as number
      const current = formData[currentField] as number

      if (goal > 0) {
        // Validate goal amount
        const goalValidation = validateAmount(goal, { min: 0, max: 100000000 })
        if (!goalValidation.isValid) {
          newErrors[goalField] = goalValidation.error || 'Invalid goal amount'
        }

        // Validate current amount
        const currentValidation = validatePaidAmount(current, goal, 'Current amount')
        if (!currentValidation.isValid) {
          newErrors[currentField] = currentValidation.error || 'Invalid current amount'
        }
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData])

  const handleSave = () => {
    if (!validateForm()) {
      return
    }

    updateMutation.mutate(
      {
        emergency_fund_goal: formData.emergency_fund_goal,
        emergency_fund_current: formData.emergency_fund_current,
        house_goal: formData.house_goal,
        house_current: formData.house_current,
        other_goal_name: formData.other_goal_name || null,
        other_goal_amount: formData.other_goal_amount,
        other_goal_current: formData.other_goal_current,
      },
      {
        onSuccess: () => {
          setIsEditMode(false)
        },
      }
    )
  }

  const handleCancel = () => {
    if (savingsGoalsData) {
      setFormData({
        emergency_fund_goal: savingsGoalsData.emergency_fund_goal || 0,
        emergency_fund_current: savingsGoalsData.emergency_fund_current || 0,
        house_goal: savingsGoalsData.house_goal || 0,
        house_current: savingsGoalsData.house_current || 0,
        other_goal_name: savingsGoalsData.other_goal_name || '',
        other_goal_amount: savingsGoalsData.other_goal_amount || 0,
        other_goal_current: savingsGoalsData.other_goal_current || 0,
      })
    }
    setErrors({})
    setIsEditMode(false)
  }

  const handleExport = () => {
    const activeGoals = [
      {
        'Goal Name': 'Emergency Fund',
        'Goal Amount': formatCurrency(formData.emergency_fund_goal),
        'Current Amount': formatCurrency(formData.emergency_fund_current),
        'Remaining': formatCurrency(Math.max(0, formData.emergency_fund_goal - formData.emergency_fund_current)),
        'Progress %': formData.emergency_fund_goal > 0
          ? `${((formData.emergency_fund_current / formData.emergency_fund_goal) * 100).toFixed(1)}%`
          : '0%',
        'Status': formData.emergency_fund_current >= formData.emergency_fund_goal ? 'Complete' : 'In Progress',
      },
      {
        'Goal Name': 'House Down Payment',
        'Goal Amount': formatCurrency(formData.house_goal),
        'Current Amount': formatCurrency(formData.house_current),
        'Remaining': formatCurrency(Math.max(0, formData.house_goal - formData.house_current)),
        'Progress %': formData.house_goal > 0
          ? `${((formData.house_current / formData.house_goal) * 100).toFixed(1)}%`
          : '0%',
        'Status': formData.house_current >= formData.house_goal ? 'Complete' : 'In Progress',
      },
    ]

    if (formData.other_goal_name && formData.other_goal_amount > 0) {
      activeGoals.push({
        'Goal Name': formData.other_goal_name,
        'Goal Amount': formatCurrency(formData.other_goal_amount),
        'Current Amount': formatCurrency(formData.other_goal_current),
        'Remaining': formatCurrency(Math.max(0, formData.other_goal_amount - formData.other_goal_current)),
        'Progress %': formData.other_goal_amount > 0
          ? `${((formData.other_goal_current / formData.other_goal_amount) * 100).toFixed(1)}%`
          : '0%',
        'Status': formData.other_goal_current >= formData.other_goal_amount ? 'Complete' : 'In Progress',
      })
    }

    exportToCSV(activeGoals, `savings-goals-${formatDateForFilename()}`)
  }

  const getGoalData = (_goal: (typeof PRE_DEFINED_GOALS)[0], goalField: keyof SavingsGoalsFormData, currentField: keyof SavingsGoalsFormData) => {
    const goalAmount = formData[goalField] as number
    const currentAmount = formData[currentField] as number
    const progress = goalAmount > 0 ? Math.min(100, (currentAmount / goalAmount) * 100) : 0
    const remaining = Math.max(0, goalAmount - currentAmount)
    const isComplete = currentAmount >= goalAmount && goalAmount > 0

    return { goalAmount, currentAmount, progress, remaining, isComplete }
  }

  const activeGoals: SavingsGoal[] = [
    {
      ...PRE_DEFINED_GOALS[0],
      goalField: 'emergency_fund_goal' as const,
      currentField: 'emergency_fund_current' as const,
    },
    {
      ...PRE_DEFINED_GOALS[1],
      goalField: 'house_goal' as const,
      currentField: 'house_current' as const,
    },
  ].filter((goal) => formData[goal.goalField] > 0)

  if (formData.other_goal_name && formData.other_goal_amount > 0) {
    activeGoals.push({
      id: 'other',
      name: formData.other_goal_name,
      icon: Target,
      color: 'text-amber-600',
      description: 'Custom savings goal',
      goalField: 'other_goal_amount',
      currentField: 'other_goal_current',
    })
  }

  if (isLoading) {
    return (
      <Card padding="none">
        <CardContent className="p-6 sm:p-8">
          <div className="flex items-center justify-center min-h-[200px]">
            <p className="text-sm sm:text-base text-muted-foreground">Loading savings goals...</p>
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
            <div className="h-9 w-9 sm:h-10 sm:w-10 lg:h-12 lg:w-12 rounded-xl bg-purple-500/10 dark:bg-purple-500/20 flex items-center justify-center flex-shrink-0">
              <Coins className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-purple-600" />
            </div>
            <div className="min-w-0 flex-1">
              <CardTitle className="text-base sm:text-lg lg:text-xl truncate">Savings Goals Tracker</CardTitle>
              <CardDescription className="text-xs sm:text-sm lg:text-base mt-0.5 line-clamp-1">
                Set and track your savings goals
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

      <CardContent className="p-6 sm:p-8 space-y-6 sm:space-y-8">
        {isEditMode ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 sm:space-y-8"
          >
            {/* Emergency Fund */}
            <div className="space-y-4 border-b border-border pb-6">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-600" />
                <Label className="text-base sm:text-lg font-semibold">Emergency Fund</Label>
              </div>
              <p className="text-sm sm:text-base text-muted-foreground">3-6 months of expenses</p>
              <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
                <CurrencyInput
                  label="Goal Amount"
                  value={formData.emergency_fund_goal}
                  onChange={(value) => handleFieldChange('emergency_fund_goal', value)}
                  error={errors.emergency_fund_goal}
                  min={0}
                  max={100000000}
                />
                <CurrencyInput
                  label="Current Amount"
                  value={formData.emergency_fund_current}
                  onChange={(value) => handleFieldChange('emergency_fund_current', value)}
                  error={errors.emergency_fund_current}
                  min={0}
                  max={100000000}
                />
              </div>
            </div>

            {/* House Down Payment */}
            <div className="space-y-4 border-b border-border pb-6">
              <div className="flex items-center gap-2">
                <Home className="h-5 w-5 text-primary" />
                <Label className="text-base sm:text-lg font-semibold">House Down Payment</Label>
              </div>
              <p className="text-sm sm:text-base text-muted-foreground">Save for your future home</p>
              <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
                <CurrencyInput
                  label="Goal Amount"
                  value={formData.house_goal}
                  onChange={(value) => handleFieldChange('house_goal', value)}
                  error={errors.house_goal}
                  min={0}
                  max={100000000}
                />
                <CurrencyInput
                  label="Current Amount"
                  value={formData.house_current}
                  onChange={(value) => handleFieldChange('house_current', value)}
                  error={errors.house_current}
                  min={0}
                  max={100000000}
                />
              </div>
            </div>

            {/* Custom Goal */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-amber-600" />
                <Label className="text-base sm:text-lg font-semibold">Custom Goal</Label>
              </div>
              <Input
                label="Goal Name"
                value={formData.other_goal_name}
                onChange={(e) => handleFieldChange('other_goal_name', e.target.value)}
                placeholder="e.g., Vacation Fund"
                className="min-h-[44px] sm:min-h-[48px]"
              />
              <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
                <CurrencyInput
                  label="Goal Amount"
                  value={formData.other_goal_amount}
                  onChange={(value) => handleFieldChange('other_goal_amount', value)}
                  error={errors.other_goal_amount}
                  min={0}
                  max={100000000}
                />
                <CurrencyInput
                  label="Current Amount"
                  value={formData.other_goal_current}
                  onChange={(value) => handleFieldChange('other_goal_current', value)}
                  error={errors.other_goal_current}
                  min={0}
                  max={100000000}
                />
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
            {activeGoals.length === 0 ? (
              <div className="text-center py-12">
                <Coins className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-sm sm:text-base text-muted-foreground">
                  No savings goals set yet. Click Edit to add your first goal!
                </p>
              </div>
            ) : (
              activeGoals.map((goal) => {
                const { goalAmount, currentAmount, progress, remaining, isComplete } = getGoalData(
                  goal,
                  goal.goalField,
                  goal.currentField
                )
                const Icon = goal.icon

                return (
                  <Card
                    key={goal.id}
                    variant="outlined"
                    padding="md"
                    className={isComplete ? 'border-green-500 border-2' : ''}
                  >
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex items-center gap-3">
                        <Icon className={`h-6 w-6 sm:h-8 sm:w-8 ${goal.color}`} />
                        <div>
                          <div className="flex items-center gap-2">
                            <Label className="text-base sm:text-lg font-semibold">{goal.name}</Label>
                            {isComplete && (
                              <CheckCircle2 className="h-5 w-5 text-green-600" />
                            )}
                          </div>
                          <p className="text-xs sm:text-sm text-muted-foreground">{goal.description}</p>
                        </div>
                      </div>
                    </div>

                    {isComplete && (
                      <div className="mb-4 p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
                        <p className="text-sm sm:text-base font-semibold text-green-800 dark:text-green-300">
                          🎉 Goal achieved! Mashallah!
                        </p>
                      </div>
                    )}

                    <div className="grid sm:grid-cols-3 gap-4 mb-4">
                      <div>
                        <Label className="text-xs sm:text-sm text-muted-foreground">Goal Amount</Label>
                        <p className="text-lg sm:text-xl font-bold text-foreground">
                          {formatCurrency(goalAmount)}
                        </p>
                      </div>
                      <div>
                        <Label className="text-xs sm:text-sm text-muted-foreground">Saved</Label>
                        <p className="text-lg sm:text-xl font-bold text-green-600">
                          {formatCurrency(currentAmount)}
                        </p>
                      </div>
                      <div>
                        <Label className="text-xs sm:text-sm text-muted-foreground">Remaining</Label>
                        <p className="text-lg sm:text-xl font-bold text-amber-600">
                          {formatCurrency(remaining)}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm sm:text-base">Progress</Label>
                        <span className="text-sm sm:text-base font-semibold text-foreground">
                          {progress.toFixed(1)}%
                        </span>
                      </div>
                      <Progress value={progress} className={`h-3 ${isComplete ? 'bg-green-500' : ''}`} />
                    </div>
                  </Card>
                )
              })
            )}
          </motion.div>
        )}
      </CardContent>
    </Card>
  )
})

