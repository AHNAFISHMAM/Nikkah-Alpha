import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Heart, Mail, Sparkles } from 'lucide-react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Label } from '../ui/Label'
import { DatePicker } from '../ui/DatePicker'
import { validateName } from '../../lib/validation'
import type { ProfileSetupStepProps } from './types'

interface RelationshipStepProps extends ProfileSetupStepProps {
  weddingDateConstraints: {
    min: string
    max: string
  }
  validateField: (fieldName: string, value: string | boolean | undefined) => string | null
}

export function RelationshipStep({
  formData,
  errors,
  touched,
  onFieldChange,
  onFieldBlur,
  onNext,
  onBack,
  isLoading,
  weddingDateConstraints,
  validateField,
}: RelationshipStepProps) {
  const handlePartnerNameChange = (value: string) => {
    onFieldChange('partner_name', value)
  }

  const handleWeddingDateChange = (value: string) => {
    onFieldChange('wedding_date', value)
  }

  const handleWeddingDatePickerChange = (date: string) => {
    onFieldChange('wedding_date', date)
    onFieldBlur('wedding_date')
  }

  const handlePartnerUsingAppChange = (value: boolean) => {
    onFieldChange('partner_using_app', value)
    if (!value) {
      onFieldChange('partner_email', '')
    }
  }

  const handlePartnerEmailChange = (value: string) => {
    onFieldChange('partner_email', value)
  }

  return (
    <motion.div
      key="relationship"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
    >
      <div className="space-y-3">
        <Input
          label="Partner Name (Optional)"
          value={formData.partner_name}
          onChange={(e) => handlePartnerNameChange(e.target.value)}
          onBlur={() => onFieldBlur('partner_name')}
          placeholder="Enter your partner's name"
          error={touched.partner_name ? errors.partner_name : undefined}
          hint="Letters, spaces, hyphens, and apostrophes only."
          leftIcon={<Heart className="h-4 w-4" />}
          aria-invalid={touched.partner_name && !!errors.partner_name}
        />

        <div>
          <Label htmlFor="wedding_date" className="text-sm font-medium mb-1.5">
            Wedding Date (Optional)
          </Label>
          <DatePicker
            id="wedding_date"
            value={formData.wedding_date}
            onChange={(e) => handleWeddingDateChange(e.target.value)}
            onDateChange={handleWeddingDatePickerChange}
            onBlur={() => onFieldBlur('wedding_date')}
            placeholder="Select your wedding date"
            min={weddingDateConstraints.min}
            max={weddingDateConstraints.max}
            error={touched.wedding_date ? !!errors.wedding_date : undefined}
            helperText={touched.wedding_date && errors.wedding_date ? errors.wedding_date : undefined}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Is your partner using this app?
          </label>
          <p className="text-xs text-muted-foreground mb-3">
            If yes, we'll send them an invitation to connect. If no, you can still use the app independently.
          </p>
          <div className="flex gap-3">
            <Button
              variant={formData.partner_using_app === true ? 'primary' : 'outline'}
              onClick={() => handlePartnerUsingAppChange(true)}
              className="flex-1"
            >
              Yes
            </Button>
            <Button
              variant={formData.partner_using_app === false ? 'primary' : 'outline'}
              onClick={() => handlePartnerUsingAppChange(false)}
              className="flex-1"
            >
              No
            </Button>
          </div>
        </div>

        {formData.partner_using_app === true && (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Input
                label="Partner Email (Required)"
                type="email"
                value={formData.partner_email}
                onChange={(e) => handlePartnerEmailChange(e.target.value)}
                onBlur={() => onFieldBlur('partner_email')}
                placeholder="Enter your partner's email"
                error={touched.partner_email ? errors.partner_email : undefined}
                hint="We'll send them an invitation email to connect with you on the app."
                leftIcon={<Mail className="h-4 w-4" />}
                aria-invalid={touched.partner_email && !!errors.partner_email}
              />
              {touched.partner_email && !errors.partner_email && formData.partner_email && (
                <motion.p
                  key="success"
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.2 }}
                  id="partner_email-success"
                  className="text-xs sm:text-sm text-success font-medium mt-1.5 px-1"
                  aria-live="polite"
                >
                  ✓ Valid email address
                </motion.p>
              )}
            </motion.div>
          </AnimatePresence>
        )}

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
            isLoading={isLoading}
            rightIcon={<Sparkles className="h-4 w-4" />}
          >
            Complete
          </Button>
        </div>
      </div>
    </motion.div>
  )
}

