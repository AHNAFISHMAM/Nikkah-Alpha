import { User, Calendar, MapPin, Heart } from 'lucide-react'

export type Step = 'essential' | 'personal' | 'location' | 'relationship'

export const STEP_CONFIG = {
  essential: { index: 0, icon: User, title: 'Essential Information', subtitle: "Let's start with your name" },
  personal: { index: 1, icon: Calendar, title: 'Personal Details', subtitle: 'Help us personalize your experience' },
  location: { index: 2, icon: MapPin, title: 'Location', subtitle: 'Optional - helps us provide relevant content' },
  relationship: { index: 3, icon: Heart, title: 'Relationship', subtitle: 'Tell us about your partner' },
} as const

export const COUNTRIES: { value: string; label: string }[] = [
  { value: 'US', label: 'United States' },
  { value: 'CA', label: 'Canada' },
  { value: 'GB', label: 'United Kingdom' },
  { value: 'AU', label: 'Australia' },
  { value: 'SA', label: 'Saudi Arabia' },
  { value: 'AE', label: 'United Arab Emirates' },
  { value: 'PK', label: 'Pakistan' },
  { value: 'BD', label: 'Bangladesh' },
  { value: 'IN', label: 'India' },
  { value: 'MY', label: 'Malaysia' },
  { value: 'ID', label: 'Indonesia' },
  { value: 'TR', label: 'Turkey' },
  { value: 'EG', label: 'Egypt' },
  { value: 'ZA', label: 'South Africa' },
  { value: 'NG', label: 'Nigeria' },
  { value: 'KE', label: 'Kenya' },
  { value: 'OTHER', label: 'Other' },
]

