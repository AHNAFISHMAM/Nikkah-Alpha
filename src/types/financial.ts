// Financial types for NikahPrep calculators

export interface MahrData {
  regionAverage: number
  educationLevel: 'high_school' | 'bachelors' | 'masters' | 'doctorate'
  profession: string
  yearsWorking: number
  customFactors?: number
  calculatedMin?: number
  calculatedMax?: number
  calculatedAverage?: number
  notes?: string
}

export interface BudgetCategory {
  name: string
  amount: number
  percent: number
  isCustom?: boolean
}

export interface WeddingBudgetData {
  totalBudget: number
  guestCount: number
  venueType: 'budget' | 'moderate' | 'luxury'
  includePhotography: boolean
  includeVideography: boolean
  includeLiveMusic: boolean
  categories: BudgetCategory[]
  notes?: string
}

export interface SavingsGoalData {
  targetAmount: number
  currentSavings: number
  monthlyIncome: number
  monthlyExpenses: number
  targetDate: string
  monthlyRequired?: number
  monthsToGoal?: number
  isAchievable?: boolean
  notes?: string
}

export interface FamilyContribution {
  id: string
  name: string
  amount: number
  relationship: string
}

export interface CostSplitData {
  totalCost: number
  brideContribution: number
  groomContribution: number
  familyContributions: FamilyContribution[]
  remaining?: number
  notes?: string
}

export type FinancialDataType = 'mahr' | 'budget' | 'savings' | 'cost_split'

export interface FinancialDataPayload {
  mahr?: MahrData
  budget?: WeddingBudgetData
  savings?: SavingsGoalData
  cost_split?: CostSplitData
}

// Currency options
export interface Currency {
  code: string
  symbol: string
  name: string
}

export const CURRENCIES: Currency[] = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
  { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal' },
  { code: 'PKR', symbol: '₨', name: 'Pakistani Rupee' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit' },
  { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah' },
  { code: 'TRY', symbol: '₺', name: 'Turkish Lira' },
  { code: 'EGP', symbol: 'E£', name: 'Egyptian Pound' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
]

// Regional mahr averages (approximate)
export const REGIONAL_MAHR_AVERAGES: Record<string, number> = {
  'North America': 10000,
  'Europe': 8000,
  'Middle East': 25000,
  'South Asia': 5000,
  'Southeast Asia': 3000,
  'Africa': 2000,
  'Australia': 12000,
}

// Budget category defaults
export const DEFAULT_BUDGET_CATEGORIES = [
  { name: 'Venue', percent: 30 },
  { name: 'Catering', percent: 25 },
  { name: 'Photography', percent: 10 },
  { name: 'Attire', percent: 8 },
  { name: 'Decorations', percent: 7 },
  { name: 'Music/Entertainment', percent: 5 },
  { name: 'Invitations', percent: 3 },
  { name: 'Transportation', percent: 3 },
  { name: 'Miscellaneous', percent: 9 },
]
