import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { Button } from '../ui/Button'
import { Label } from '../ui/Label'
import { CustomDropdown } from '../ui/CustomDropdown'
import { DatePicker } from '../ui/DatePicker'
import type { ProfileSetupStepProps } from './types'

interface PersonalStepProps extends ProfileSetupStepProps {
  dateConstraints: {
    maxDate: string
    minDate: string
  }
  calculatedAge: number | null
  validateField: (fieldName: string, value: string | boolean | undefined) => string | null
}

export function PersonalStep({
  formData,
  errors,
  touched,
  onFieldChange,
  onFieldBlur,
  onNext,
  onBack,
  dateConstraints,
  calculatedAge,
  validateField,
}: PersonalStepProps) {
  const handleDateChange = (value: string) => {
    onFieldChange('date_of_birth', value)
    onFieldBlur('date_of_birth')
  }

  const handleDatePickerChange = (date: string) => {
    onFieldChange('date_of_birth', date)
    onFieldBlur('date_of_birth')
  }

  const handleGenderChange = (value: string) => {
    const genderValue = value as 'male' | 'female'
    onFieldChange('gender', genderValue)
    onFieldBlur('gender')
  }

  const handleMaritalStatusChange = (value: string) => {
    const statusValue = value as 'Single' | 'Engaged' | 'Researching'
    onFieldChange('marital_status', statusValue)
    onFieldBlur('marital_status')
  }

  return (
    <motion.div
      key="personal"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
    >
      <div className="space-y-4">
        {/* Date of Birth */}
        <div>
          <Label htmlFor="date_of_birth" required className="text-sm font-medium mb-1.5">
            Date of Birth
          </Label>
          <DatePicker
            id="date_of_birth"
            value={formData.date_of_birth}
            onChange={(e) => handleDateChange(e.target.value)}
            onDateChange={handleDatePickerChange}
            onBlur={() => onFieldBlur('date_of_birth')}
            min={dateConstraints.minDate}
            max={dateConstraints.maxDate}
            placeholder="mm/dd/yyyy"
            required
            error={touched.date_of_birth ? !!errors.date_of_birth : undefined}
            helperText={touched.date_of_birth && errors.date_of_birth ? errors.date_of_birth : undefined}
            className="w-full"
            aria-invalid={touched.date_of_birth && !!errors.date_of_birth}
          />
          <AnimatePresence mode="wait">
            {calculatedAge !== null && !errors.date_of_birth && formData.date_of_birth ? (
              <motion.p
                key="success"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.2 }}
                className="text-xs sm:text-sm text-primary font-medium mt-1.5 px-1"
                aria-live="polite"
              >
                ✓ You are {calculatedAge} {calculatedAge === 1 ? 'year' : 'years'} old
              </motion.p>
            ) : !touched.date_of_birth && !formData.date_of_birth ? (
              <motion.p
                key="hint"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-xs sm:text-sm text-muted-foreground mt-1.5"
              >
                Tap to select your date of birth. You must be 18 years or older.
              </motion.p>
            ) : null}
          </AnimatePresence>
          <p className="text-xs sm:text-sm text-muted-foreground mt-2 px-1 leading-relaxed">
            We collect your date of birth to verify you meet the age requirement and to personalize your experience with age-appropriate content.
          </p>
        </div>

        {/* Gender */}
        <div>
          <div className="mb-1.5">
            <label
              htmlFor="gender"
              className="block text-sm font-medium text-foreground"
            >
              Gender
              <span className="text-destructive ml-1">*</span>
            </label>
          </div>
          <CustomDropdown
            id="gender"
            value={formData.gender}
            onChange={handleGenderChange}
            options={[
              { value: 'male', label: 'Male' },
              { value: 'female', label: 'Female' }
            ]}
            placeholder="Select your gender"
            className="w-full"
          />
          {touched.gender && errors.gender && (
            <p className="text-xs text-error mt-1.5 px-1">{errors.gender}</p>
          )}
          {!touched.gender && !formData.gender && (
            <p className="text-xs text-muted-foreground mt-1.5 px-1">
              Tap to select your gender. This helps us personalize your experience.
            </p>
          )}
          <AnimatePresence mode="wait">
            {formData.gender && !errors.gender && touched.gender ? (
              <motion.p
                key="success"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.2 }}
                className="text-xs sm:text-sm text-primary font-medium mt-1.5 px-1"
                aria-live="polite"
              >
                ✓ Gender selected
              </motion.p>
            ) : null}
          </AnimatePresence>
        </div>

        {/* Marital Status */}
        <div>
          <div className="mb-1.5">
            <label
              htmlFor="marital_status"
              className="block text-sm font-medium text-foreground"
            >
              Marital Status
              <span className="text-destructive ml-1">*</span>
            </label>
          </div>
          <CustomDropdown
            id="marital_status"
            value={formData.marital_status}
            onChange={handleMaritalStatusChange}
            options={[
              { value: 'Single', label: 'Single' },
              { value: 'Engaged', label: 'Engaged' },
              { value: 'Researching', label: 'Researching' }
            ]}
            placeholder="Select status..."
            className="w-full"
          />
          {touched.marital_status && errors.marital_status && (
            <p className="text-xs text-error mt-1.5 px-1">{errors.marital_status}</p>
          )}
          {!touched.marital_status && !formData.marital_status && (
            <p className="text-xs text-muted-foreground mt-1.5 px-1">
              Tap to select your current relationship status.
            </p>
          )}
          <AnimatePresence mode="wait">
            {formData.marital_status && !errors.marital_status && touched.marital_status ? (
              <motion.p
                key="success"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.2 }}
                className="text-xs sm:text-sm text-primary font-medium mt-1.5 px-1"
                aria-live="polite"
              >
                ✓ Status selected
              </motion.p>
            ) : null}
          </AnimatePresence>
        </div>

        {/* Navigation Buttons */}
        <div className="pt-4 flex gap-3">
          <Button
            onClick={onBack}
            variant="outline"
            className="flex-1"
            size="sm"
            leftIcon={<ArrowLeft className="h-4 w-4" />}
          >
            Back
          </Button>
          <Button
            onClick={onNext}
            className="flex-1"
            size="sm"
            rightIcon={<ArrowRight className="h-4 w-4" />}
            disabled={
              !!errors.date_of_birth ||
              !!errors.gender ||
              !!errors.marital_status ||
              !formData.date_of_birth ||
              !formData.gender ||
              !formData.marital_status
            }
          >
            Next
          </Button>
        </div>
      </div>
    </motion.div>
  )
}

