import { useState, useEffect, useMemo, useCallback, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSearchParams } from 'react-router-dom'
import { SEO } from '../../components/SEO'
import { PAGE_SEO } from '../../lib/seo'
import {
  Calculator,
  Coins,
  Wallet,
  Users,
  TrendingUp,
  DollarSign,
  Target,
  CheckCircle,
} from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { formatCurrency, cn } from '../../lib/utils'
import { calculateMahrRange } from '../../lib/calculations'
import type { MahrCalculationInput } from '../../lib/calculations'
import { BudgetCalculator } from '../../components/financial/BudgetCalculator'
import { MahrTracker } from '../../components/financial/MahrTracker'
import { WeddingBudget } from '../../components/financial/WeddingBudget'
import { SavingsGoals } from '../../components/financial/SavingsGoals'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Label } from '../../components/ui/Label'
import { Progress } from '../../components/ui/Progress'
import { useRealtimeFinancialData } from '../../hooks/useRealtimeFinancialData'
import { useScrollToSection } from '../../hooks/useScrollToSection'

type TabType = 'budget' | 'mahr' | 'wedding' | 'savings'

// Extract constants to prevent recreation
const TABS: Array<{ id: TabType; label: string; icon: typeof Wallet }> = [
  { id: 'budget', label: 'Budget', icon: Wallet },
  { id: 'mahr', label: 'Mahr', icon: Calculator },
  { id: 'wedding', label: 'Wedding', icon: Target },
  { id: 'savings', label: 'Savings', icon: Coins },
]

function FinancialComponent() {
  const [searchParams, setSearchParams] = useSearchParams()
  const tabParam = searchParams.get('tab') as TabType | null
  // Memoize initial tab calculation
  const initialTab = useMemo(() => {
    return tabParam && TABS.some(t => t.id === tabParam) ? tabParam : 'budget'
  }, [tabParam])
  
  const [activeTab, setActiveTab] = useState<TabType>(initialTab)

  // Real-time updates for financial data
  useRealtimeFinancialData()

  // Update URL when tab changes
  useEffect(() => {
    if (activeTab) {
      setSearchParams({ tab: activeTab }, { replace: true })
    }
  }, [activeTab, setSearchParams])

  // Update tab when URL changes - memoize check
  const isValidTab = useMemo(() => tabParam && TABS.some(t => t.id === tabParam), [tabParam])
  
  useEffect(() => {
    if (isValidTab && tabParam) {
      setActiveTab(tabParam)
    }
  }, [isValidTab, tabParam])
  
  // Memoize tab change handler
  const handleTabChange = useCallback((tabId: TabType) => {
    setActiveTab(tabId)
  }, [])
  
  // Auto-scroll to section when hash is present in URL
  useScrollToSection()

  return (
    <>
      <SEO
        title={PAGE_SEO.financial.title}
        description={PAGE_SEO.financial.description}
        path="/financial"
        noIndex
      />

      <div className="min-h-screen bg-background">
        <div className="w-full p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6 sm:space-y-8 lg:space-y-10">
          {/* Main Financial Section */}
          <section id="financial" className="scroll-mt-20 sm:scroll-mt-24">
          {/* Page Header Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-2 sm:mb-4"
            style={{ willChange: 'transform, opacity' }}
          >
            <div className="flex items-center gap-2 text-primary text-xs sm:text-sm font-medium mb-3">
              <DollarSign className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>Plan Your Finances</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground leading-tight mb-2">
              Financial Planning Tools
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Smart tools to help you plan and manage wedding finances
            </p>
          </motion.div>

          {/* Tab Navigation */}
          <div className="border-b border-border mb-4 sm:mb-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
              {TABS.map((tab) => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={cn(
                      'flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2',
                      'px-3 sm:px-4 py-3 sm:py-4 min-h-[56px] sm:min-h-[48px]',
                      'text-xs sm:text-sm font-medium transition-all duration-200',
                      'border-b-2 border-transparent touch-manipulation',
                      isActive
                        ? 'text-primary border-primary bg-primary/5'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent/50 active:bg-accent/70'
                    )}
                    aria-selected={isActive}
                    aria-label={tab.label}
                  >
                    <Icon className="h-5 w-5 sm:h-5 sm:w-5 flex-shrink-0" />
                    <span className="text-[11px] sm:text-sm leading-tight text-center">{tab.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="mt-4 sm:mt-6"
              style={{ willChange: 'transform, opacity' }}
            >
              {activeTab === 'budget' && <div id="budget" className="scroll-mt-20 sm:scroll-mt-24"><BudgetCalculator /></div>}
              {activeTab === 'mahr' && <div id="mahr" className="scroll-mt-20 sm:scroll-mt-24"><MahrTracker /></div>}
              {activeTab === 'wedding' && <div id="wedding" className="scroll-mt-20 sm:scroll-mt-24"><WeddingBudget /></div>}
              {activeTab === 'savings' && <div id="savings" className="scroll-mt-20 sm:scroll-mt-24"><SavingsGoals /></div>}
            </motion.div>
          </AnimatePresence>
          </section>
        </div>
      </div>
    </>
  )
}

// Legacy Mahr Calculator (kept for reference, but MahrTracker is now the main component)
function MahrCalculator() {
  const [input, setInput] = useState<MahrCalculationInput>({
    regionAverage: 10000,
    educationLevel: 'bachelors',
    profession: '',
    yearsWorking: 0,
  })
  const [result, setResult] = useState<ReturnType<typeof calculateMahrRange> | null>(null)

  const handleCalculate = () => {
    const calculated = calculateMahrRange(input)
    setResult(calculated)
  }

  return (
    <Card padding="none">
      <CardHeader className="border-b border-border px-6 py-5 sm:px-8 sm:py-6">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center flex-shrink-0">
            <Calculator className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg sm:text-xl">Mahr Calculator</CardTitle>
            <CardDescription className="text-sm sm:text-base mt-0.5">Calculate a suggested mahr range</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 sm:p-8 space-y-6">
        <div>
          <Label className="text-sm sm:text-base mb-2">Regional Average Mahr (USD)</Label>
          <Input
            type="number"
            value={input.regionAverage}
            onChange={(e) => setInput({ ...input, regionAverage: Number(e.target.value) })}
            leftIcon={<DollarSign className="h-5 w-5" />}
            className="min-h-[44px] sm:min-h-[48px]"
          />
        </div>

        <div>
          <Label className="text-sm sm:text-base mb-2">Education Level</Label>
          <select
            value={input.educationLevel}
            onChange={(e) => setInput({ ...input, educationLevel: e.target.value as MahrCalculationInput['educationLevel'] })}
            className="w-full rounded-xl border border-border px-4 py-3 min-h-[44px] sm:min-h-[48px] text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-primary/50 bg-card"
          >
            <option value="high_school">High School</option>
            <option value="bachelors">Bachelor's Degree</option>
            <option value="masters">Master's Degree</option>
            <option value="doctorate">Doctorate</option>
          </select>
        </div>

        <div>
          <Label className="text-sm sm:text-base mb-2">Years of Work Experience</Label>
          <Input
            type="number"
            value={input.yearsWorking}
            onChange={(e) => setInput({ ...input, yearsWorking: Number(e.target.value) })}
            className="min-h-[44px] sm:min-h-[48px]"
          />
        </div>

        <Button onClick={handleCalculate} className="w-full min-h-[48px]" size="lg">
          Calculate Mahr Range
        </Button>

        {result && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 sm:mt-8 p-6 sm:p-8 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl border border-primary/10"
          >
            <h3 className="font-semibold text-foreground text-base sm:text-lg mb-5 sm:mb-6 flex items-center gap-2 sm:gap-3">
              <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              Suggested Mahr Range
            </h3>
            <div className="grid grid-cols-3 gap-3 sm:gap-4 text-center">
              <div className="p-4 sm:p-5 bg-card rounded-xl shadow-sm">
                <p className="text-xs sm:text-sm text-muted-foreground mb-2">Minimum</p>
                <p className="text-lg sm:text-xl font-bold text-foreground">
                  {formatCurrency(result.suggestedMin)}
                </p>
              </div>
              <div className="p-4 sm:p-5 bg-primary/10 dark:bg-primary/20 rounded-xl">
                <p className="text-xs sm:text-sm text-primary mb-2">Suggested</p>
                <p className="text-lg sm:text-xl font-bold text-primary">
                  {formatCurrency(result.average)}
                </p>
              </div>
              <div className="p-4 sm:p-5 bg-card rounded-xl shadow-sm">
                <p className="text-xs sm:text-sm text-muted-foreground mb-2">Maximum</p>
                <p className="text-lg sm:text-xl font-bold text-foreground">
                  {formatCurrency(result.suggestedMax)}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  )
}

// Legacy Cost Split Calculator (kept for reference)
function CostSplitCalculator() {
  const [totalCost, setTotalCost] = useState(30000)
  const [brideContribution, setBrideContribution] = useState(10000)
  const [groomContribution, setGroomContribution] = useState(15000)

  const remaining = Math.max(0, totalCost - brideContribution - groomContribution)
  const bridePercent = totalCost > 0 ? Math.round((brideContribution / totalCost) * 100) : 0
  const groomPercent = totalCost > 0 ? Math.round((groomContribution / totalCost) * 100) : 0
  const coveredPercent = Math.min(100, bridePercent + groomPercent)

  return (
    <Card padding="none">
      <CardHeader className="border-b border-border px-6 py-5 sm:px-8 sm:py-6">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-purple-500/10 dark:bg-purple-500/20 flex items-center justify-center flex-shrink-0">
            <Users className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
          </div>
          <div>
            <CardTitle className="text-lg sm:text-xl">Cost Split Calculator</CardTitle>
            <CardDescription className="text-sm sm:text-base mt-0.5">Manage how wedding costs are split</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 sm:p-8 space-y-6">
        <div>
          <Label className="text-sm sm:text-base mb-2">Total Wedding Cost (USD)</Label>
          <Input
            type="number"
            value={totalCost}
            onChange={(e) => setTotalCost(Number(e.target.value))}
            leftIcon={<DollarSign className="h-5 w-5" />}
            className="min-h-[44px] sm:min-h-[48px]"
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
          <div>
            <Label className="text-sm sm:text-base mb-2">Bride's Family Contribution</Label>
            <Input
              type="number"
              value={brideContribution}
              onChange={(e) => setBrideContribution(Number(e.target.value))}
              leftIcon={<DollarSign className="h-5 w-5" />}
              className="min-h-[44px] sm:min-h-[48px]"
            />
          </div>
          <div>
            <Label className="text-sm sm:text-base mb-2">Groom's Family Contribution</Label>
            <Input
              type="number"
              value={groomContribution}
              onChange={(e) => setGroomContribution(Number(e.target.value))}
              leftIcon={<DollarSign className="h-5 w-5" />}
              className="min-h-[44px] sm:min-h-[48px]"
            />
          </div>
        </div>

        <div className="p-6 sm:p-8 bg-gradient-to-br from-blue-50 to-purple-50 dark:bg-card dark:border dark:border-border/50 rounded-2xl border border-blue-100">
          <h3 className="font-semibold text-foreground text-base sm:text-lg mb-5 sm:mb-6">Contribution Summary</h3>

          <div className="space-y-5 sm:space-y-6">
            <div>
              <div className="flex justify-between text-sm sm:text-base mb-3">
                <span className="text-muted-foreground">Bride's Family</span>
                <span className="font-semibold text-foreground">{bridePercent}% ({formatCurrency(brideContribution)})</span>
              </div>
              <Progress value={bridePercent} size="md" className="[&>div]:bg-pink-500" />
            </div>

            <div>
              <div className="flex justify-between text-sm sm:text-base mb-3">
                <span className="text-muted-foreground">Groom's Family</span>
                <span className="font-semibold text-foreground">{groomPercent}% ({formatCurrency(groomContribution)})</span>
              </div>
              <Progress value={groomPercent} size="md" className="[&>div]:bg-blue-500" />
            </div>

            <div className="pt-5 sm:pt-6 border-t border-border">
              <div className="flex justify-between text-sm sm:text-base mb-3">
                <span className="text-foreground font-medium">Total Covered</span>
                <span className="font-semibold text-foreground">{coveredPercent}%</span>
              </div>
              <Progress
                value={coveredPercent}
                size="lg"
                variant={remaining === 0 ? 'success' : 'warning'}
              />
            </div>

            {remaining > 0 ? (
              <div className="flex items-center justify-between p-4 sm:p-5 bg-amber-100 dark:bg-amber-950/30 rounded-xl">
                <span className="text-amber-800 dark:text-amber-300 font-medium text-sm sm:text-base">Remaining to Cover</span>
                <span className="text-amber-900 dark:text-amber-200 font-bold text-lg sm:text-xl">
                  {formatCurrency(remaining)}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 sm:gap-3 p-4 sm:p-5 bg-green-100 dark:bg-green-950/30 rounded-xl">
                <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 dark:text-green-400" />
                <span className="text-green-800 dark:text-green-300 font-medium text-sm sm:text-base">Fully Covered!</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
