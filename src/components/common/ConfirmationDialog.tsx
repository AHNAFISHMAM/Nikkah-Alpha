import { memo, useMemo } from 'react'
import { Button } from '../ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { cn } from '../../lib/utils'

interface ConfirmationDialogProps {
  isOpen: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'info'
  onConfirm: () => void
  onCancel: () => void
}

// Extract constants to prevent recreation
const VARIANT_STYLES = {
  danger: 'text-error dark:text-error',
  warning: 'text-warning dark:text-warning',
  info: 'text-info dark:text-info',
} as const

const BUTTON_VARIANTS = {
  danger: 'bg-error text-error-foreground hover:bg-error/90 dark:bg-error dark:text-error-foreground dark:hover:bg-error/80',
  warning: 'bg-warning text-warning-foreground hover:bg-warning/90 dark:bg-warning dark:text-warning-foreground dark:hover:bg-warning/80',
  info: 'bg-info text-info-foreground hover:bg-info/90 dark:bg-info dark:text-info-foreground dark:hover:bg-info/80',
} as const

export const ConfirmationDialog = memo(function ConfirmationDialog({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'info',
  onConfirm,
  onCancel,
}: ConfirmationDialogProps) {
  if (!isOpen) return null

  // Memoize variant styles
  const titleStyle = useMemo(() => VARIANT_STYLES[variant], [variant])
  const buttonStyle = useMemo(() => BUTTON_VARIANTS[variant], [variant])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/50 dark:bg-black/70 backdrop-blur-sm safe-area-inset-top safe-area-inset-bottom">
      <Card className="max-w-md w-full">
        <CardHeader className="px-6 py-5 sm:px-8 sm:py-6">
          <CardTitle className={cn('text-lg sm:text-xl', titleStyle)}>{title}</CardTitle>
        </CardHeader>
        <CardContent className="px-6 pb-6 sm:px-8 sm:pb-8 space-y-4">
          <p className="text-sm sm:text-base text-muted-foreground dark:text-muted-foreground">{message}</p>
          <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
            <Button 
              onClick={onCancel} 
              variant="outline"
              className="w-full sm:w-auto min-h-[44px] order-2 sm:order-1"
            >
              {cancelText}
            </Button>
            <Button
              onClick={onConfirm}
              className={cn('w-full sm:w-auto min-h-[44px] order-1 sm:order-2', buttonStyle)}
            >
              {confirmText}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
})

