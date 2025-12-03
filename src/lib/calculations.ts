// Financial calculation utilities for NikahPrep

export interface MahrCalculationInput {
  regionAverage: number
  educationLevel: 'high_school' | 'bachelors' | 'masters' | 'doctorate'
  profession: string
  yearsWorking: number
  customFactors?: number
}

export interface MahrCalculationResult {
  suggestedMin: number
  suggestedMax: number
  average: number
  factors: {
    education: number
    experience: number
    region: number
  }
}

// Mahr calculation based on various factors
export function calculateMahrRange(input: MahrCalculationInput): MahrCalculationResult {
  const educationMultipliers = {
    high_school: 1.0,
    bachelors: 1.2,
    masters: 1.4,
    doctorate: 1.6,
  }

  const educationFactor = educationMultipliers[input.educationLevel] || 1.0
  const experienceFactor = 1 + Math.min(input.yearsWorking * 0.02, 0.3) // Max 30% increase
  const customFactor = input.customFactors || 1.0

  const baseAmount = input.regionAverage
  const adjustedAmount = baseAmount * educationFactor * experienceFactor * customFactor

  return {
    suggestedMin: Math.round(adjustedAmount * 0.8),
    suggestedMax: Math.round(adjustedAmount * 1.2),
    average: Math.round(adjustedAmount),
    factors: {
      education: educationFactor,
      experience: experienceFactor,
      region: 1.0,
    },
  }
}

export interface WeddingBudgetInput {
  totalBudget: number
  guestCount: number
  venueType: 'budget' | 'moderate' | 'luxury'
  includePhotography: boolean
  includeVideography: boolean
  includeLiveMusic: boolean
}

export interface WeddingBudgetBreakdown {
  venue: number
  catering: number
  photography: number
  videography: number
  attire: number
  decorations: number
  music: number
  invitations: number
  transportation: number
  miscellaneous: number
  total: number
  perGuest: number
}

// Wedding budget calculator with category breakdown
export function calculateWeddingBudget(input: WeddingBudgetInput): WeddingBudgetBreakdown {
  const { totalBudget, guestCount, venueType, includePhotography, includeVideography, includeLiveMusic } = input

  // Base percentages (adjusted based on options)
  let venuePercent = venueType === 'luxury' ? 0.35 : venueType === 'moderate' ? 0.30 : 0.25
  let cateringPercent = 0.30
  let photographyPercent = includePhotography ? 0.10 : 0
  let videographyPercent = includeVideography ? 0.08 : 0
  let attirePercent = 0.08
  let decorationsPercent = 0.07
  let musicPercent = includeLiveMusic ? 0.05 : 0.02
  let invitationsPercent = 0.02
  let transportationPercent = 0.03

  // Calculate total used percentage
  const usedPercent = venuePercent + cateringPercent + photographyPercent +
    videographyPercent + attirePercent + decorationsPercent +
    musicPercent + invitationsPercent + transportationPercent

  // Remaining goes to miscellaneous
  const miscPercent = Math.max(0, 1 - usedPercent)

  return {
    venue: Math.round(totalBudget * venuePercent),
    catering: Math.round(totalBudget * cateringPercent),
    photography: Math.round(totalBudget * photographyPercent),
    videography: Math.round(totalBudget * videographyPercent),
    attire: Math.round(totalBudget * attirePercent),
    decorations: Math.round(totalBudget * decorationsPercent),
    music: Math.round(totalBudget * musicPercent),
    invitations: Math.round(totalBudget * invitationsPercent),
    transportation: Math.round(totalBudget * transportationPercent),
    miscellaneous: Math.round(totalBudget * miscPercent),
    total: totalBudget,
    perGuest: guestCount > 0 ? Math.round(totalBudget / guestCount) : 0,
  }
}

export interface SavingsGoalInput {
  targetAmount: number
  currentSavings: number
  monthlyIncome: number
  monthlyExpenses: number
  targetDate: Date
}

export interface SavingsGoalResult {
  monthlyRequired: number
  monthsToGoal: number
  isAchievable: boolean
  disposableIncome: number
  savingsRate: number
  projectedDate: Date
}

// Savings goal calculator
export function calculateSavingsGoal(input: SavingsGoalInput): SavingsGoalResult {
  const { targetAmount, currentSavings, monthlyIncome, monthlyExpenses, targetDate } = input

  const remainingAmount = targetAmount - currentSavings
  const disposableIncome = monthlyIncome - monthlyExpenses

  // Calculate months until target date
  const now = new Date()
  const monthsUntilTarget = Math.max(1,
    (targetDate.getFullYear() - now.getFullYear()) * 12 +
    (targetDate.getMonth() - now.getMonth())
  )

  const monthlyRequired = remainingAmount / monthsUntilTarget
  const isAchievable = monthlyRequired <= disposableIncome

  // Calculate how long it would actually take with current disposable income
  const actualMonthsToGoal = disposableIncome > 0
    ? Math.ceil(remainingAmount / disposableIncome)
    : Infinity

  const projectedDate = new Date()
  projectedDate.setMonth(projectedDate.getMonth() + actualMonthsToGoal)

  const savingsRate = monthlyIncome > 0
    ? (disposableIncome / monthlyIncome) * 100
    : 0

  return {
    monthlyRequired: Math.round(monthlyRequired),
    monthsToGoal: actualMonthsToGoal,
    isAchievable,
    disposableIncome: Math.round(disposableIncome),
    savingsRate: Math.round(savingsRate),
    projectedDate,
  }
}

export interface CostSplitInput {
  totalCost: number
  brideContribution: number
  groomContribution: number
  familyContributions: { name: string; amount: number }[]
}

export interface CostSplitResult {
  remaining: number
  bridePercent: number
  groomPercent: number
  familyPercent: number
  isFullyCovered: boolean
  breakdown: { name: string; amount: number; percent: number }[]
}

// Wedding cost split calculator
export function calculateCostSplit(input: CostSplitInput): CostSplitResult {
  const { totalCost, brideContribution, groomContribution, familyContributions } = input

  const totalFamilyContribution = familyContributions.reduce((sum, f) => sum + f.amount, 0)
  const totalContributions = brideContribution + groomContribution + totalFamilyContribution
  const remaining = Math.max(0, totalCost - totalContributions)

  const bridePercent = totalCost > 0 ? (brideContribution / totalCost) * 100 : 0
  const groomPercent = totalCost > 0 ? (groomContribution / totalCost) * 100 : 0
  const familyPercent = totalCost > 0 ? (totalFamilyContribution / totalCost) * 100 : 0

  const breakdown = [
    { name: 'Bride', amount: brideContribution, percent: bridePercent },
    { name: 'Groom', amount: groomContribution, percent: groomPercent },
    ...familyContributions.map(f => ({
      name: f.name,
      amount: f.amount,
      percent: totalCost > 0 ? (f.amount / totalCost) * 100 : 0,
    })),
  ]

  return {
    remaining: Math.round(remaining),
    bridePercent: Math.round(bridePercent),
    groomPercent: Math.round(groomPercent),
    familyPercent: Math.round(familyPercent),
    isFullyCovered: remaining === 0,
    breakdown,
  }
}

// Checklist progress calculation
export function calculateChecklistProgress(
  completedItems: number,
  totalItems: number
): { percent: number; status: 'not_started' | 'in_progress' | 'almost_done' | 'complete' } {
  if (totalItems === 0) {
    return { percent: 0, status: 'not_started' }
  }

  const percent = Math.round((completedItems / totalItems) * 100)

  let status: 'not_started' | 'in_progress' | 'almost_done' | 'complete'
  if (percent === 0) {
    status = 'not_started'
  } else if (percent < 75) {
    status = 'in_progress'
  } else if (percent < 100) {
    status = 'almost_done'
  } else {
    status = 'complete'
  }

  return { percent, status }
}

// Module progress calculation
export function calculateModuleProgress(
  completedLessons: number,
  totalLessons: number,
  quizScore?: number
): { percent: number; isComplete: boolean; grade?: string } {
  if (totalLessons === 0) {
    return { percent: 0, isComplete: false }
  }

  const lessonPercent = (completedLessons / totalLessons) * 100
  const isComplete = completedLessons === totalLessons && (quizScore === undefined || quizScore >= 70)

  let grade: string | undefined
  if (quizScore !== undefined) {
    if (quizScore >= 90) grade = 'A'
    else if (quizScore >= 80) grade = 'B'
    else if (quizScore >= 70) grade = 'C'
    else grade = 'Incomplete'
  }

  return {
    percent: Math.round(lessonPercent),
    isComplete,
    grade,
  }
}

// Combined readiness score calculation
export interface ReadinessScoreInput {
  checklistPercent: number
  modulesCompleted: number
  modulesTotal: number
  discussionsCompleted: number
  discussionsTotal: number
}

export interface ReadinessScoreResult {
  overallPercent: number
  status: 'not_started' | 'beginning' | 'in_progress' | 'almost_ready' | 'ready'
  breakdown: {
    checklist: number
    modules: number
    discussions: number
  }
}

/**
 * Calculates overall marriage readiness score from multiple components
 * Weighted: Checklist 50%, Modules 30%, Discussions 20%
 */
export function calculateReadinessScore(input: ReadinessScoreInput): ReadinessScoreResult {
  const { checklistPercent, modulesCompleted, modulesTotal, discussionsCompleted, discussionsTotal } = input

  // Calculate individual percentages
  const modulesPercent = modulesTotal > 0
    ? Math.round((modulesCompleted / modulesTotal) * 100)
    : 0
  
  const discussionsPercent = discussionsTotal > 0
    ? Math.round((discussionsCompleted / discussionsTotal) * 100)
    : 0

  // Weighted average: Checklist 50%, Modules 30%, Discussions 20%
  const overallPercent = Math.round(
    checklistPercent * 0.5 +
    modulesPercent * 0.3 +
    discussionsPercent * 0.2
  )

  // Determine status
  let status: 'not_started' | 'beginning' | 'in_progress' | 'almost_ready' | 'ready'
  if (overallPercent === 0) {
    status = 'not_started'
  } else if (overallPercent < 25) {
    status = 'beginning'
  } else if (overallPercent < 75) {
    status = 'in_progress'
  } else if (overallPercent < 100) {
    status = 'almost_ready'
  } else {
    status = 'ready'
  }

  return {
    overallPercent,
    status,
    breakdown: {
      checklist: checklistPercent,
      modules: modulesPercent,
      discussions: discussionsPercent,
    },
  }
}
