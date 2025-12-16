import { motion } from 'framer-motion'
import { User, ArrowLeft, ArrowRight } from 'lucide-react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { validateName } from '../../lib/validation'
import type { ProfileSetupStepProps } from './types'

export function EssentialStep({
  formData,
  errors,
  touched,
  onFieldChange,
  onFieldBlur,
  onNext,
  onBack,
}: ProfileSetupStepProps) {
  const handleFirstNameChange = (value: string) => {
    onFieldChange('first_name', value)
    // Clear error immediately if field becomes valid
    if (value && validateName(value, 'first_name') === null && errors.first_name) {
      // Error clearing handled by parent
    }
  }

  const handleLastNameChange = (value: string) => {
    onFieldChange('last_name', value)
    // Clear error immediately if field becomes valid
    if (value && value.trim() && validateName(value, 'last_name') === null && errors.last_name) {
      // Error clearing handled by parent
    }
  }

  return (
    <motion.div
      key="essential"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
    >
      <div className="space-y-3">
        <div>
          <Input
            id="first_name"
            label="First Name"
            value={formData.first_name}
            onChange={(e) => handleFirstNameChange(e.target.value)}
            onBlur={() => onFieldBlur('first_name')}
            placeholder="Enter your first name"
            autoFocus
            maxLength={50}
            error={touched.first_name ? errors.first_name : undefined}
            hint="This will be visible to other users. Letters, spaces, hyphens, and apostrophes only."
            leftIcon={<User className="h-4 w-4" />}
            aria-invalid={touched.first_name && !!errors.first_name}
          />
          {touched.first_name && !errors.first_name && formData.first_name && (
            <motion.p
              key="success"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2 }}
              id="first_name-success"
              className="text-xs sm:text-sm text-success font-medium mt-1.5 px-1"
              aria-live="polite"
            >
              ✓ Valid name
            </motion.p>
          )}
        </div>

        <div>
          <Input
            id="last_name"
            label="Last Name (Optional)"
            value={formData.last_name}
            onChange={(e) => handleLastNameChange(e.target.value)}
            onBlur={() => onFieldBlur('last_name')}
            placeholder="Enter your last name"
            maxLength={50}
            error={touched.last_name ? errors.last_name : undefined}
            leftIcon={<User className="h-4 w-4" />}
            aria-invalid={touched.last_name && !!errors.last_name}
          />
          {touched.last_name && !errors.last_name && formData.last_name && (
            <motion.p
              key="success"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2 }}
              id="last_name-success"
              className="text-xs sm:text-sm text-success font-medium mt-1.5 px-1"
              aria-live="polite"
            >
              ✓ Valid name
            </motion.p>
          )}
        </div>

        <div className="pt-4 mt-2 flex gap-3">
          <Button
            onClick={onBack}
            variant="outline"
            className="flex-1"
            size="sm"
            leftIcon={<ArrowLeft className="h-4 w-4" />}
            disabled={true}
          >
            Back
          </Button>
          <Button
            onClick={onNext}
            className="flex-1"
            size="sm"
            rightIcon={<ArrowRight className="h-4 w-4" />}
            disabled={!formData.first_name.trim()}
          >
            Continue
          </Button>
        </div>
      </div>
    </motion.div>
  )
}

