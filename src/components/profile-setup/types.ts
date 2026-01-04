import type { Step } from './constants'

export interface ProfileFormData {
  first_name: string
  last_name: string
  date_of_birth: string
  gender: 'male' | 'female' | ''
  marital_status: 'Single' | 'Engaged' | 'Researching' | ''
  country: string
  city: string
  partner_name: string
  wedding_date: string
  partner_using_app: boolean | null
  partner_email: string
}

export interface ProfileSetupStepProps {
  formData: ProfileFormData
  errors: Record<string, string>
  touched: Record<string, boolean>
  onFieldChange: (field: keyof ProfileFormData, value: string | boolean | null) => void
  onFieldBlur: (field: keyof ProfileFormData) => void
  onNext: () => void
  onBack: () => void
  isLoading?: boolean
}

export interface ProfileSetupProps {
  step: Step
  formData: ProfileFormData
  errors: Record<string, string>
  touched: Record<string, boolean>
  completedSteps: Set<Step>
  currentStepIndex: number
  totalSteps: number
  progress: number
  onFieldChange: (field: keyof ProfileFormData, value: string | boolean | null) => void
  onFieldBlur: (field: keyof ProfileFormData) => void
  onStepChange: (step: Step) => void
  onNext: () => void
  onBack: () => void
  onComplete: () => void
  isLoading: boolean
  dateConstraints: {
    maxDate: string
    minDate: string
    weddingMinDate: string
    weddingMaxDate: string
  }
  calculatedAge: number | null
}

