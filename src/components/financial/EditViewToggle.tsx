import { memo } from 'react'
import { Button } from '../ui/Button'
import { Edit2, Save, X, Loader2 } from 'lucide-react'

interface EditViewToggleProps {
  isEditMode: boolean
  onToggle: () => void
  onSave?: () => void
  onCancel?: () => void
  isLoading?: boolean
  disabled?: boolean
  className?: string
}

export const EditViewToggle = memo(function EditViewToggle({
  isEditMode,
  onToggle,
  onSave,
  onCancel,
  isLoading = false,
  disabled = false,
  className = '',
}: EditViewToggleProps) {
  if (isEditMode) {
    return (
      <div className={`flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto ${className}`}>
        <Button
          variant="outline"
          onClick={onCancel || onToggle}
          disabled={isLoading || disabled}
          className="min-h-[48px] sm:min-h-[48px] w-full sm:w-auto touch-manipulation"
          leftIcon={<X className="h-4 w-4 sm:h-5 sm:w-5" />}
        >
          Cancel
        </Button>
        <Button
          onClick={onSave || onToggle}
          disabled={isLoading || disabled}
          className="min-h-[48px] sm:min-h-[48px] w-full sm:w-auto touch-manipulation"
          leftIcon={isLoading ? <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" /> : <Save className="h-4 w-4 sm:h-5 sm:w-5" />}
        >
          {isLoading ? 'Saving...' : 'Save'}
        </Button>
      </div>
    )
  }

  return (
    <Button
      variant="outline"
      onClick={onToggle}
      disabled={disabled}
      className={`min-h-[48px] sm:min-h-[48px] touch-manipulation ${className}`}
      leftIcon={<Edit2 className="h-4 w-4 sm:h-5 sm:w-5" />}
    >
      Edit
    </Button>
  )
})

