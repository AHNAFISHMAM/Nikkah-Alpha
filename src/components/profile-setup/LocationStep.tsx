import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ArrowRight, MapPin } from 'lucide-react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { CustomDropdown } from '../ui/CustomDropdown'
import { COUNTRIES } from './constants'
import type { ProfileSetupStepProps } from './types'

export function LocationStep({
  formData,
  errors,
  touched,
  onFieldChange,
  onFieldBlur,
  onNext,
  onBack,
}: ProfileSetupStepProps) {
  const handleCountryChange = (value: string) => {
    onFieldChange('country', value)
    // Clear city if country is cleared
    if (!value) {
      onFieldChange('city', '')
    }
  }

  const handleCityChange = (value: string) => {
    onFieldChange('city', value)
  }

  return (
    <motion.div
      key="location"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
    >
      <div className="space-y-3">
        <div>
          <div className="mb-1.5">
            <label
              htmlFor="country"
              className="block text-sm font-medium text-foreground"
            >
              Country (Optional)
            </label>
          </div>
          <CustomDropdown
            id="country"
            value={formData.country}
            onChange={handleCountryChange}
            options={COUNTRIES}
            placeholder="Select your country"
            className="w-full"
          />
          {touched.country && errors.country && (
            <p className="text-xs text-error mt-1.5 px-1">{errors.country}</p>
          )}
        </div>

        {formData.country && (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Input
                label="City (Required if country selected)"
                value={formData.city}
                onChange={(e) => handleCityChange(e.target.value)}
                onBlur={() => onFieldBlur('city')}
                placeholder="Enter your city"
                error={touched.city ? errors.city : undefined}
                leftIcon={<MapPin className="h-4 w-4" />}
                aria-invalid={touched.city && !!errors.city}
              />
            </motion.div>
          </AnimatePresence>
        )}

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="text-xs sm:text-sm text-muted-foreground mt-2 px-1 leading-relaxed"
        >
          Location information helps us provide relevant content, resources, and connect you with local marriage preparation services in your area.
        </motion.p>

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
          >
            Continue
          </Button>
        </div>
      </div>
    </motion.div>
  )
}

