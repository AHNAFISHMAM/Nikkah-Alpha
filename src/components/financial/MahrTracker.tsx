import { useState, useEffect, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card'
import { Button } from '../ui/Button'
import { Label } from '../ui/Label'
import { Progress } from '../ui/Progress'
import { CurrencyInput } from './CurrencyInput'
import { Textarea } from '../ui/Textarea'
import { EditViewToggle } from './EditViewToggle'
import { useMahr, useUpdateMahr } from '../../hooks/useMahr'
import { formatCurrency } from '../../lib/utils'
import { exportToCSV, formatDateForFilename } from '../../lib/csv-export'
import { Download, Calculator, CheckCircle2, Clock, AlertCircle, DollarSign } from 'lucide-react'
import { validateAmount, validatePaidAmount } from '../../lib/validation'

interface MahrFormData {
  amount: number
  amount_paid: number
  deferred_schedule: string
  notes: string
}

export function MahrTracker() {
  const { data: mahrData, isLoading } = useMahr()
  const updateMutation = useUpdateMahr()
  const [isEditMode, setIsEditMode] = useState(false)
  const [formData, setFormData] = useState<MahrFormData>({
    amount: 0,
    amount_paid: 0,
    deferred_schedule: '',
    notes: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Initialize form data from fetched data
  useEffect(() => {
    if (mahrData && !isEditMode) {
      setFormData({
        amount: mahrData.amount || 0,
        amount_paid: mahrData.amount_paid || 0,
        deferred_schedule: mahrData.deferred_schedule || '',
        notes: mahrData.notes || '',
      })
    }
  }, [mahrData, isEditMode])

  // Memoized calculations to prevent unnecessary recalculations
  const remaining = useMemo(() => 
    (formData.amount || 0) - (formData.amount_paid || 0),
    [formData.amount, formData.amount_paid]
  )
  const progress = useMemo(() => 
    formData.amount > 0 ? ((formData.amount_paid || 0) / formData.amount) * 100 : 0,
    [formData.amount, formData.amount_paid]
  )
  const status = useMemo(() => mahrData?.status || 'Pending', [mahrData?.status])

  const handleFieldChange = useCallback((field: keyof MahrFormData, value: number | string) => {
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

    // Validate amount (required)
    const amountValidation = validateAmount(formData.amount, { min: 0, max: 100000000, required: true, fieldName: 'Mahr amount' })
    if (!amountValidation.isValid) {
      newErrors.amount = amountValidation.error || 'Invalid amount'
    }

    // Validate amount_paid
    if (formData.amount_paid > 0) {
      const paidValidation = validatePaidAmount(formData.amount_paid, formData.amount, 'Amount paid')
      if (!paidValidation.isValid) {
        newErrors.amount_paid = paidValidation.error || 'Invalid amount paid'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData])

  const handleSave = () => {
    if (!validateForm()) {
      return
    }

    updateMutation.mutate(
      {
        amount: formData.amount,
        amount_paid: formData.amount_paid,
        deferred_schedule: formData.deferred_schedule || null,
        notes: formData.notes || null,
      },
      {
        onSuccess: () => {
          setIsEditMode(false)
        },
      }
    )
  }

  const handleCancel = () => {
    if (mahrData) {
      setFormData({
        amount: mahrData.amount || 0,
        amount_paid: mahrData.amount_paid || 0,
        deferred_schedule: mahrData.deferred_schedule || '',
        notes: mahrData.notes || '',
      })
    }
    setErrors({})
    setIsEditMode(false)
  }

  const handleExport = () => {
    const exportData = [
      {
        'Total Mahr': formatCurrency(formData.amount),
        'Amount Paid': formatCurrency(formData.amount_paid),
        'Remaining': formatCurrency(remaining),
        'Progress %': `${progress.toFixed(1)}%`,
        'Status': status,
        'Deferred Schedule': formData.deferred_schedule || '',
        'Notes': formData.notes || '',
      },
    ]

    exportToCSV(exportData, `mahr-${formatDateForFilename()}`)
  }

  const getStatusConfig = () => {
    switch (status) {
      case 'Paid':
        return {
          icon: CheckCircle2,
          color: 'text-green-600',
          bgColor: 'bg-green-50 dark:bg-green-950/30',
          borderColor: 'border-green-200 dark:border-green-800',
          label: 'Paid',
        }
      case 'Partial':
        return {
          icon: AlertCircle,
          color: 'text-amber-600',
          bgColor: 'bg-amber-50 dark:bg-amber-950/30',
          borderColor: 'border-amber-200 dark:border-amber-800',
          label: 'Partial',
        }
      default:
        return {
          icon: Clock,
          color: 'text-foreground',
          bgColor: 'bg-amber-50/70 dark:bg-amber-950/20',
          borderColor: 'border-amber-100 dark:border-amber-900/50',
          label: 'Pending',
        }
    }
  }

  const statusConfig = getStatusConfig()
  const StatusIcon = statusConfig.icon

  if (isLoading) {
    return (
      <Card padding="none">
        <CardContent className="p-6 sm:p-8">
          <div className="flex items-center justify-center min-h-[200px]">
            <p className="text-sm sm:text-base text-muted-foreground">Loading mahr data...</p>
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
            <div className="h-9 w-9 sm:h-10 sm:w-10 lg:h-12 lg:w-12 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center flex-shrink-0">
              <Calculator className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <CardTitle className="text-base sm:text-lg lg:text-xl truncate">Mahr Tracker</CardTitle>
              <CardDescription className="text-xs sm:text-sm lg:text-base mt-0.5 line-clamp-1">
                Track your mahr payment status
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
            <CurrencyInput
              label="Mahr Amount *"
              value={formData.amount}
              onChange={(value) => handleFieldChange('amount', value)}
              error={errors.amount}
              min={0}
              max={100000000}
              leftIcon={<DollarSign className="h-5 w-5" />}
              required
            />

            <CurrencyInput
              label="Amount Paid"
              value={formData.amount_paid}
              onChange={(value) => handleFieldChange('amount_paid', value)}
              error={errors.amount_paid}
              min={0}
              max={100000000}
              leftIcon={<DollarSign className="h-5 w-5" />}
              hint="Amount already paid towards mahr"
            />

            <div>
              <Label className="text-sm sm:text-base mb-2">Deferred Payment Schedule</Label>
              <Textarea
                value={formData.deferred_schedule}
                onChange={(e) => handleFieldChange('deferred_schedule', e.target.value)}
                placeholder="e.g., $500 monthly for 12 months..."
                rows={3}
                className="min-h-[80px] sm:min-h-[100px]"
              />
            </div>

            <div>
              <Label className="text-sm sm:text-base mb-2">Notes</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => handleFieldChange('notes', e.target.value)}
                placeholder="Add any additional notes..."
                rows={3}
                className="min-h-[80px] sm:min-h-[100px]"
              />
            </div>

            {/* Action Buttons */}
            <div className="sticky bottom-0 bg-card border-t border-border -mx-6 sm:-mx-8 px-6 sm:px-8 py-4 sm:py-5 mt-6 sm:mt-8">
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
            {/* Status Card */}
            <Card
              variant="outlined"
              padding="md"
              className={`${statusConfig.bgColor} ${statusConfig.borderColor} border-2`}
            >
              <div className="flex items-center gap-3 sm:gap-4">
                <StatusIcon className={`h-6 w-6 sm:h-8 sm:w-8 ${statusConfig.color}`} />
                <div>
                  <Label className="text-xs sm:text-sm text-muted-foreground">Payment Status</Label>
                  <p className={`text-lg sm:text-xl font-bold ${statusConfig.color}`}>
                    {statusConfig.label}
                  </p>
                </div>
              </div>
            </Card>

            {/* Summary Grid */}
            <div className="grid sm:grid-cols-3 gap-4 sm:gap-5">
              <Card variant="outlined" padding="md" className="text-center">
                <Label className="text-xs sm:text-sm text-muted-foreground mb-2">Total Mahr</Label>
                <p className="text-xl sm:text-2xl font-bold text-foreground">
                  {formatCurrency(formData.amount)}
                </p>
              </Card>

              <Card variant="outlined" padding="md" className="text-center">
                <Label className="text-xs sm:text-sm text-muted-foreground mb-2">Amount Paid</Label>
                <p className="text-xl sm:text-2xl font-bold text-green-600">
                  {formatCurrency(formData.amount_paid)}
                </p>
              </Card>

              <Card variant="outlined" padding="md" className="text-center">
                <Label className="text-xs sm:text-sm text-muted-foreground mb-2">Remaining</Label>
                <p className="text-xl sm:text-2xl font-bold text-amber-600">
                  {formatCurrency(remaining)}
                </p>
              </Card>
            </div>

            {/* Progress Bar */}
            {formData.amount > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm sm:text-base">Payment Progress</Label>
                  <span className="text-sm sm:text-base font-semibold text-foreground">
                    {progress.toFixed(1)}%
                  </span>
                </div>
                <Progress value={progress} className="h-3" />
              </div>
            )}

            {/* Payment Schedule Card */}
            {formData.deferred_schedule && (
              <Card variant="outlined" padding="md">
                <Label className="text-sm sm:text-base font-semibold mb-2">Payment Schedule</Label>
                <p className="text-sm sm:text-base text-foreground whitespace-pre-wrap">
                  {formData.deferred_schedule}
                </p>
              </Card>
            )}

            {/* Notes Card */}
            {formData.notes && (
              <Card variant="outlined" padding="md">
                <Label className="text-sm sm:text-base font-semibold mb-2">Notes</Label>
                <p className="text-sm sm:text-base text-foreground whitespace-pre-wrap">
                  {formData.notes}
                </p>
              </Card>
            )}
          </motion.div>
        )}
      </CardContent>
    </Card>
  )
}

