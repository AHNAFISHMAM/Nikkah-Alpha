import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence, PanInfo } from 'framer-motion'
import { X, ChevronLeft, ChevronRight, Palette, BarChart3, Sparkles, Sliders, Eye, GitCompare } from 'lucide-react'
import { Button } from '../ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { useTheme, type GreenTheme } from '../../contexts/ThemeContext'
import { useGreenTheme } from '../../hooks/useGreenTheme'
import { Progress } from '../ui/Progress'
import { Input } from '../ui/Input'
import { Label } from '../ui/Label'
import { ScrollableContainer } from '../common/ScrollableContainer'

interface ThemeShowcaseModalProps {
  isOpen: boolean
  selectedTheme: GreenTheme
  onClose: () => void
  onApply: (theme: GreenTheme) => void
}

type SlideType = 'comparison' | 'components' | 'statistics' | 'mood' | 'picker' | 'preview'

const SLIDES: { id: SlideType; title: string; icon: typeof Palette }[] = [
  { id: 'comparison', title: 'Compare Themes', icon: GitCompare },
  { id: 'components', title: 'Component Showcase', icon: Palette },
  { id: 'statistics', title: 'Theme Statistics', icon: BarChart3 },
  { id: 'mood', title: 'Theme Mood', icon: Sparkles },
  { id: 'picker', title: 'Customize', icon: Sliders },
  { id: 'preview', title: 'Live Preview', icon: Eye },
]

// Mock statistics data (replace with real data later)
const THEME_STATS = {
  emerald: { percentage: 45, users: 1250, trending: true },
  forest: { percentage: 28, users: 780, trending: false },
  mint: { percentage: 15, users: 420, trending: false },
  sage: { percentage: 8, users: 220, trending: false },
  jade: { percentage: 4, users: 110, trending: false },
}

export function ThemeShowcaseModal({ isOpen, selectedTheme, onClose, onApply }: ThemeShowcaseModalProps) {
  const { greenTheme, setGreenTheme } = useTheme()
  const [currentSlide, setCurrentSlide] = useState(0)
  const [previewTheme, setPreviewTheme] = useState<GreenTheme>(selectedTheme)
  const [customColor, setCustomColor] = useState('#10b981')
  const touchStartX = useRef(0)
  const touchEndX = useRef(0)

  // Reset preview theme when modal opens
  useEffect(() => {
    if (isOpen) {
      setPreviewTheme(selectedTheme)
      setCurrentSlide(0)
    }
  }, [isOpen, selectedTheme])

  // Apply preview theme to document for real-time preview
  // Best Practice: Use a container-scoped approach for better isolation
  useEffect(() => {
    if (isOpen) {
      // Set preview attribute on document root for global CSS variable updates
      document.documentElement.setAttribute('data-green-theme-preview', previewTheme)
      return () => {
        document.documentElement.removeAttribute('data-green-theme-preview')
      }
    }
  }, [isOpen, previewTheme])

  // Focus management - focus modal on open
  useEffect(() => {
    if (isOpen) {
      // Focus the modal container for accessibility
      const modal = document.querySelector('[role="dialog"]') as HTMLElement
      if (modal) {
        modal.focus()
      }
    }
  }, [isOpen])

  // Navigation handlers - defined first for use in other handlers
  const handleNext = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % SLIDES.length)
  }, [])

  const handlePrevious = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length)
  }, [])

  // Touch/swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    touchEndX.current = e.changedTouches[0].clientX
    handleSwipe()
  }

  const handleSwipe = useCallback(() => {
    const swipeDistance = touchStartX.current - touchEndX.current
    const minSwipeDistance = 50

    if (Math.abs(swipeDistance) > minSwipeDistance) {
      if (swipeDistance > 0) {
        handleNext()
      } else {
        handlePrevious()
      }
    }
  }, [handleNext, handlePrevious])

  // Drag handler for framer-motion
  const handleDragEnd = useCallback((_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const swipeThreshold = 50
    if (info.offset.x > swipeThreshold) {
      handlePrevious()
    } else if (info.offset.x < -swipeThreshold) {
      handleNext()
    }
  }, [handleNext, handlePrevious])

  // Keyboard navigation - placed after handleNext/handlePrevious are defined
  useEffect(() => {
    if (!isOpen) return

    const handleKeyPress = (e: KeyboardEvent) => {
      // Prevent default only for our handled keys
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'Escape') {
        e.preventDefault()
      }
      
      if (e.key === 'ArrowLeft') {
        handlePrevious()
      } else if (e.key === 'ArrowRight') {
        handleNext()
      } else if (e.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [isOpen, handleNext, handlePrevious, onClose])

  const handleApply = () => {
    setGreenTheme(previewTheme)
    onApply(previewTheme)
    onClose()
  }

  if (!isOpen) return null

  const currentSlideData = SLIDES[currentSlide]

  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 dark:bg-black/80 backdrop-blur-sm safe-area-inset-top safe-area-inset-bottom"
          role="dialog"
          aria-modal="true"
          aria-labelledby="theme-modal-title"
          onClick={(e) => {
            // Close on backdrop click (best practice)
            if (e.target === e.currentTarget) {
              onClose()
            }
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full max-w-4xl h-[90vh] max-h-[90vh] bg-background rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border bg-gradient-to-r from-primary/5 to-primary/10">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center">
                  <currentSlideData.icon className="h-5 w-5 text-primary" aria-hidden="true" />
                </div>
                <div>
                  <h2 id="theme-modal-title" className="text-xl font-bold text-foreground">
                    {currentSlideData.title}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {previewTheme.charAt(0).toUpperCase() + previewTheme.slice(1)} Theme
                  </p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onClose} 
                className="flex-shrink-0 min-h-[44px] min-w-[44px]"
                aria-label="Close theme modal"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Carousel Container */}
            <div 
              className="flex-1 overflow-hidden relative touch-pan-y"
              role="region"
              aria-label={`Slide ${currentSlide + 1} of ${SLIDES.length}`}
            >
              <motion.div
                className="flex h-full will-change-transform"
                animate={{ x: `-${currentSlide * 100}%` }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.1}
                dragMomentum={false}
                dragDirectionLock={true}
                onDragStart={(_, info) => {
                  // Only allow horizontal drag if the initial movement is more horizontal than vertical
                  const isHorizontalDrag = Math.abs(info.offset.x) > Math.abs(info.offset.y)
                  if (!isHorizontalDrag) {
                    // Prevent drag if it's more vertical (allow scrolling instead)
                    return false
                  }
                }}
                onDragEnd={handleDragEnd}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
              >
                {/* Slide 1: Theme Comparison */}
                <div className="min-w-full h-full flex flex-col">
                  <ScrollableContainer 
                    className="flex-1"
                    scrollbarStyle="thin"
                    showFadeIndicators={true}
                  >
                    <div className="p-4 sm:p-6">
                      <ThemeComparisonSlide
                        currentTheme={greenTheme}
                        previewTheme={previewTheme}
                        onThemeChange={setPreviewTheme}
                      />
                    </div>
                  </ScrollableContainer>
                </div>

                {/* Slide 2: Component Showcase */}
                <div className="min-w-full h-full flex flex-col">
                  <ScrollableContainer 
                    className="flex-1"
                    scrollbarStyle="thin"
                    showFadeIndicators={true}
                  >
                    <div className="p-4 sm:p-6">
                      <ComponentShowcaseSlide theme={previewTheme} />
                    </div>
                  </ScrollableContainer>
                </div>

                {/* Slide 3: Statistics */}
                <div className="min-w-full h-full flex flex-col">
                  <ScrollableContainer 
                    className="flex-1"
                    scrollbarStyle="thin"
                    showFadeIndicators={true}
                  >
                    <div className="p-4 sm:p-6">
                      <StatisticsSlide selectedTheme={previewTheme} />
                    </div>
                  </ScrollableContainer>
                </div>

                {/* Slide 4: Mood Board */}
                <div className="min-w-full h-full flex flex-col">
                  <ScrollableContainer 
                    className="flex-1"
                    scrollbarStyle="thin"
                    showFadeIndicators={true}
                  >
                    <div className="p-4 sm:p-6">
                      <MoodBoardSlide theme={previewTheme} />
                    </div>
                  </ScrollableContainer>
                </div>

                {/* Slide 5: Color Picker */}
                <div className="min-w-full h-full flex flex-col">
                  <ScrollableContainer 
                    className="flex-1"
                    scrollbarStyle="thin"
                    showFadeIndicators={true}
                  >
                    <div className="p-4 sm:p-6">
                      <ColorPickerSlide
                        theme={previewTheme}
                        customColor={customColor}
                        onColorChange={setCustomColor}
                      />
                    </div>
                  </ScrollableContainer>
                </div>

                {/* Slide 6: Live Preview */}
                <div className="min-w-full h-full flex flex-col">
                  <ScrollableContainer 
                    className="flex-1"
                    scrollbarStyle="thin"
                    showFadeIndicators={true}
                  >
                    <div className="p-4 sm:p-6">
                      <LivePreviewSlide theme={previewTheme} />
                    </div>
                  </ScrollableContainer>
                </div>
              </motion.div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-t border-border bg-card/50">
              {/* Slide Indicators */}
              <div className="flex items-center gap-2">
                {SLIDES.map((slide, index) => (
                  <button
                    key={slide.id}
                    onClick={() => setCurrentSlide(index)}
                    className={`h-2 rounded-full transition-all duration-200 ${
                      index === currentSlide
                        ? 'w-8 bg-primary'
                        : 'w-2 bg-muted hover:bg-muted-foreground/50'
                    }`}
                    aria-label={`Go to slide ${index + 1}: ${slide.title}`}
                  />
                ))}
              </div>

              {/* Navigation Arrows */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrevious}
                  aria-label="Previous slide"
                  className="touch-target-sm"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground min-w-[60px] text-center hidden sm:inline">
                  {currentSlide + 1} / {SLIDES.length}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNext}
                  aria-label="Next slide"
                  className="touch-target-sm"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              {/* Apply Button */}
              <Button
                onClick={handleApply}
                disabled={previewTheme === greenTheme}
                className="min-w-[100px]"
              >
                {previewTheme === greenTheme ? 'Current Theme' : 'Apply Theme'}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

// Slide 1: Theme Comparison
// Best Practice: Use scoped theme containers for side-by-side comparison
function ThemeComparisonSlide({
  currentTheme,
  previewTheme,
  onThemeChange,
}: {
  currentTheme: GreenTheme
  previewTheme: GreenTheme
  onThemeChange: (theme: GreenTheme) => void
}) {
  const { allThemes, getThemeMeta } = useGreenTheme()

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-xl sm:text-2xl font-bold mb-1">Compare Themes</h3>
        <p className="text-sm text-muted-foreground">See how different themes look side by side</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Current Theme - Use actual current theme, not preview */}
        <div data-green-theme={currentTheme}>
          <Card className="border-2 border-primary/30">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Current Theme</span>
                <span className="text-sm font-normal text-muted-foreground capitalize">{currentTheme}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ThemePreviewComponents theme={currentTheme} useCurrentTheme={true} />
            </CardContent>
          </Card>
        </div>

        {/* Preview Theme - Uses preview theme from document attribute */}
        <Card className="border-2 border-primary">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Preview Theme</span>
              <span className="text-sm font-normal text-muted-foreground capitalize">{previewTheme}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ThemePreviewComponents theme={previewTheme} useCurrentTheme={false} />
          </CardContent>
        </Card>
      </div>

      {/* Theme Selector */}
      <div className="space-y-3">
        <Label>Select Theme to Preview</Label>
        <div className="grid grid-cols-5 gap-2">
          {allThemes.map((theme) => {
            const meta = getThemeMeta(theme)
            return (
              <button
                key={theme}
                onClick={() => onThemeChange(theme)}
                className={`h-12 rounded-lg transition-all ${
                  previewTheme === theme
                    ? 'ring-2 ring-primary ring-offset-2 scale-105'
                    : 'hover:scale-105'
                }`}
                style={{ backgroundColor: meta.color }}
                aria-label={`Preview ${meta.label} theme`}
              >
                {previewTheme === theme && (
                  <span className="text-white text-xs font-bold">✓</span>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// Slide 2: Component Showcase
// Best Practice: Compact layout with tabs to reduce vertical space
function ComponentShowcaseSlide({ theme }: { theme: GreenTheme }) {
  const { getThemeMeta } = useGreenTheme()
  const meta = getThemeMeta(theme)
  const [activeTab, setActiveTab] = useState<'buttons' | 'forms' | 'badges'>('buttons')

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-xl sm:text-2xl font-bold mb-1">Component Showcase</h3>
        <p className="text-sm text-muted-foreground">See how {meta.label} theme looks on UI components</p>
      </div>

      {/* Tabs for better organization */}
      <div className="flex gap-2 border-b border-border">
        {(['buttons', 'forms', 'badges'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[300px]">
        {activeTab === 'buttons' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
              Primary
            </Button>
            <Button variant="secondary" className="w-full">Secondary</Button>
            <Button variant="outline" className="w-full">Outline</Button>
            <Button variant="ghost" className="w-full">Ghost</Button>
          </div>
        )}

        {activeTab === 'forms' && (
          <div className="space-y-4">
            <div>
              <Label className="text-sm">Input Field</Label>
              <Input placeholder="Enter text..." className="mt-1" />
            </div>
            <div>
              <Label className="text-sm">Progress Bar</Label>
              <Progress value={65} className="h-2 mt-1" />
            </div>
            <Card className="shadow-md">
              <div className="p-3">
                <p className="text-sm">Card Component</p>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'badges' && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-medium text-white bg-primary">
                Badge
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary/20 text-primary border border-primary/30">
                Soft Badge
              </span>
            </div>
            <div className="p-3 rounded-lg text-sm bg-primary/10 border-l-4 border-primary">
              Status message with theme accent
            </div>
            <div className="pt-2 border-t border-border">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div
                  className="h-4 w-4 rounded border border-border"
                  style={{ backgroundColor: meta.color }}
                  aria-hidden="true"
                />
                <span>Theme: {meta.label} ({meta.color})</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Slide 3: Statistics
// Best Practice: Compact layout with condensed cards
function StatisticsSlide({ selectedTheme }: { selectedTheme: GreenTheme }) {
  const { allThemes, getThemeMeta } = useGreenTheme()

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-xl sm:text-2xl font-bold mb-1">Theme Statistics</h3>
        <p className="text-sm text-muted-foreground">See which themes are most popular</p>
      </div>

      <div className="space-y-3">
        {allThemes.map((theme) => {
          const meta = getThemeMeta(theme)
          const stats = THEME_STATS[theme]
          const isSelected = theme === selectedTheme

          return (
            <Card 
              key={theme} 
              className={isSelected ? 'border-2 border-primary shadow-md' : ''}
            >
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                    <div
                      className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg border-2 border-border flex-shrink-0"
                      style={{ backgroundColor: meta.color }}
                      aria-label={`${meta.label} theme color`}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold capitalize text-sm sm:text-base truncate">
                          {meta.label}
                        </h4>
                        {stats.trending && (
                          <span className="px-1.5 py-0.5 bg-primary/10 text-primary text-xs rounded-full font-medium flex-shrink-0">
                            🔥
                          </span>
                        )}
                        {isSelected && (
                          <span className="px-1.5 py-0.5 bg-primary text-primary-foreground text-xs rounded-full font-medium flex-shrink-0">
                            ✓
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {stats.users.toLocaleString()} users • {stats.percentage}%
                      </p>
                    </div>
                  </div>
                </div>
                <div className="relative h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${stats.percentage}%`,
                      backgroundColor: meta.color,
                    }}
                    role="progressbar"
                    aria-valuenow={stats.percentage}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${meta.label} theme usage: ${stats.percentage}%`}
                  />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

// Slide 4: Mood Board
// Best Practice: Compact layout with grid organization
function MoodBoardSlide({ theme }: { theme: GreenTheme }) {
  const { getThemeMeta } = useGreenTheme()
  const meta = getThemeMeta(theme)

  const moodData = {
    emerald: {
      mood: 'Energetic • Focused • Productive',
      keywords: ['Ambition', 'Growth', 'Success', 'Vitality'],
      bestFor: ['Daytime work', 'High-energy tasks', 'Creative projects'],
      personality: 'Ambitious, Driven, Goal-oriented',
    },
    forest: {
      mood: 'Calm • Grounded • Stable',
      keywords: ['Nature', 'Balance', 'Harmony', 'Strength'],
      bestFor: ['Reading', 'Extended sessions', 'Deep focus'],
      personality: 'Thoughtful, Reliable, Steady',
    },
    mint: {
      mood: 'Fresh • Creative • Inspiring',
      keywords: ['Innovation', 'Clarity', 'Renewal', 'Optimism'],
      bestFor: ['Creative work', 'Brainstorming', 'Design tasks'],
      personality: 'Creative, Optimistic, Forward-thinking',
    },
    sage: {
      mood: 'Relaxed • Natural • Peaceful',
      keywords: ['Wisdom', 'Serenity', 'Balance', 'Mindfulness'],
      bestFor: ['Meditation', 'Relaxation', 'Evening use'],
      personality: 'Calm, Wise, Balanced',
    },
    jade: {
      mood: 'Cool • Balanced • Soothing',
      keywords: ['Tranquility', 'Balance', 'Harmony', 'Clarity'],
      bestFor: ['Evening work', 'Calm activities', 'Long sessions'],
      personality: 'Balanced, Soothing, Clear-minded',
    },
  }

  const mood = moodData[theme]

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-xl sm:text-2xl font-bold mb-1">Theme Mood</h3>
        <p className="text-sm text-muted-foreground">Discover the personality of {meta.label} theme</p>
      </div>

      <Card className="overflow-hidden">
        {/* Compact Header */}
        <div className="h-20 sm:h-24 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center px-4">
          <div className="flex items-center gap-3">
            <div
              className="h-12 w-12 sm:h-14 sm:w-14 rounded-full shadow-lg border-2 border-background flex-shrink-0"
              style={{ backgroundColor: meta.color }}
              aria-label={`${meta.label} theme color`}
            />
            <div>
              <h4 className="text-lg sm:text-xl font-bold capitalize">{meta.label}</h4>
              <p className="text-sm text-primary font-medium">{mood.mood}</p>
            </div>
          </div>
        </div>
        <CardContent className="p-4 sm:p-6 space-y-4">
          {/* Keywords - Compact grid */}
          <div>
            <h5 className="font-semibold mb-2 text-sm">Keywords</h5>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {mood.keywords.map((keyword) => (
                <span
                  key={keyword}
                  className="px-2 py-1 rounded-lg text-xs sm:text-sm font-medium bg-primary/15 text-primary border border-primary/30"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>

          {/* Best For & Personality - Side by side on larger screens */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <h5 className="font-semibold mb-2 text-sm">Best For</h5>
              <ul className="space-y-1.5">
                {mood.bestFor.map((item, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <span className="text-primary font-bold">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-2 text-sm">Personality</h5>
              <p className="text-sm text-muted-foreground">{mood.personality}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Slide 5: Color Picker
// Best Practice: Compact layout with side-by-side organization
function ColorPickerSlide({
  theme,
  customColor,
  onColorChange,
}: {
  theme: GreenTheme
  customColor: string
  onColorChange: (color: string) => void
}) {
  const { getThemeMeta } = useGreenTheme()
  const meta = getThemeMeta(theme)

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-xl sm:text-2xl font-bold mb-1">Customize Theme</h3>
        <p className="text-sm text-muted-foreground">Adjust the color to your preference</p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Color Customization</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current Theme & Custom Color - Side by side */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Current Theme */}
            <div className="space-y-2">
              <Label className="text-sm">Current Theme</Label>
              <div className="flex items-center gap-3">
                <div
                  className="h-12 w-12 rounded-xl shadow-lg border-2 border-border flex-shrink-0"
                  style={{ backgroundColor: meta.color }}
                  aria-label={`${meta.label} theme color: ${meta.color}`}
                />
                <div className="min-w-0">
                  <p className="font-semibold capitalize text-sm">{meta.label}</p>
                  <p className="text-xs text-muted-foreground font-mono truncate">{meta.color}</p>
                </div>
              </div>
            </div>

            {/* Custom Color Picker */}
            <div className="space-y-2">
              <Label htmlFor="color-picker" className="text-sm">Custom Color</Label>
              <div className="flex items-center gap-2">
                <input
                  id="color-picker"
                  type="color"
                  value={customColor}
                  onChange={(e) => onColorChange(e.target.value)}
                  className="h-12 w-12 rounded-xl cursor-pointer border-2 border-border flex-shrink-0"
                  aria-label="Color picker for custom theme color"
                />
                <Input
                  value={customColor}
                  onChange={(e) => {
                    const value = e.target.value
                    if (/^#[0-9A-Fa-f]{0,6}$/.test(value) || value === '') {
                      onColorChange(value)
                    }
                  }}
                  placeholder="#10b981"
                  className="font-mono text-sm"
                  aria-label="Hex color code input"
                />
              </div>
            </div>
          </div>

          {/* Preview - Compact */}
          <div className="space-y-2">
            <Label className="text-sm">Preview</Label>
            <div className="grid grid-cols-2 gap-2">
              <div
                className="p-3 rounded-lg text-white text-xs font-medium text-center"
                style={{ backgroundColor: customColor || meta.color }}
              >
                Custom
              </div>
              <div className="p-3 rounded-lg text-white text-xs font-medium text-center bg-primary">
                Preview
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-border">
            <p className="text-xs text-muted-foreground text-center">
              Custom colors saved locally. Full customization coming soon!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Slide 6: Live Preview
// Best Practice: Compact dashboard preview
function LivePreviewSlide({ theme }: { theme: GreenTheme }) {
  const { getThemeMeta } = useGreenTheme()
  const meta = getThemeMeta(theme)

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-xl sm:text-2xl font-bold mb-1">Live Preview</h3>
        <p className="text-sm text-muted-foreground">See how {meta.label} theme looks in a real app interface</p>
      </div>

      <Card className="overflow-hidden">
        {/* Compact Header */}
        <div className="h-10 flex items-center px-3 sm:px-4 border-b border-border bg-primary/10">
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-primary" />
            <span className="text-xs sm:text-sm font-medium">Dashboard Preview</span>
          </div>
        </div>
        <CardContent className="p-4 sm:p-6">
          <div className="space-y-3">
            {/* Mini Dashboard - Compact */}
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-muted-foreground">Progress</span>
                  <span className="text-xs font-semibold text-primary">65%</span>
                </div>
                <Progress value={65} className="h-1.5" />
              </div>
              <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                <div className="text-xs text-muted-foreground mb-1">Tasks</div>
                <div className="text-base sm:text-lg font-bold text-primary">12</div>
              </div>
            </div>

            {/* Sample Content - Compact */}
            <div className="space-y-2">
              <div className="p-2.5 rounded-lg flex items-center gap-2.5 bg-primary/5">
                <div className="h-8 w-8 rounded-lg flex items-center justify-center text-white text-sm font-bold bg-primary flex-shrink-0">
                  A
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs sm:text-sm font-medium truncate">Sample Card</div>
                  <div className="text-xs text-muted-foreground truncate">With theme colors applied</div>
                </div>
              </div>

              <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-sm">
                Primary Action
              </Button>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 text-sm">Cancel</Button>
                <Button className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground text-sm">
                  Confirm
                </Button>
              </div>
            </div>

            {/* Theme Reference - Compact */}
            <div className="pt-3 border-t border-border">
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <div
                  className="h-3 w-3 rounded border border-border"
                  style={{ backgroundColor: meta.color }}
                  aria-hidden="true"
                />
                <span className="truncate">{meta.label} ({meta.color})</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Helper: Theme Preview Components
// Best Practice: Support both current theme (inline styles) and preview theme (CSS variables)
function ThemePreviewComponents({ 
  theme, 
  useCurrentTheme = false 
}: { 
  theme: GreenTheme
  useCurrentTheme?: boolean 
}) {
  const { getThemeMeta } = useGreenTheme()
  const meta = getThemeMeta(theme)

  // If using current theme, use inline styles to show actual theme colors
  // If using preview theme, rely on CSS variables set by data-green-theme-preview
  if (useCurrentTheme) {
    return (
      <div className="space-y-3">
        {/* Use inline styles for current theme to show actual colors */}
        <Button
          className="w-full text-white"
          style={{ backgroundColor: meta.color }}
        >
          Button
        </Button>
        <div
          className="p-3 rounded-lg text-sm"
          style={{ 
            backgroundColor: `${meta.color}15`, 
            borderLeft: `4px solid ${meta.color}` 
          }}
        >
          Card with theme accent
        </div>
        <div className="flex items-center gap-2">
          <div
            className="h-6 w-6 rounded-full"
            style={{ backgroundColor: meta.color }}
          />
          <span className="text-sm">Badge</span>
        </div>
        <div className="pt-2 border-t border-border">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div
              className="h-4 w-4 rounded border border-border"
              style={{ backgroundColor: meta.color }}
              aria-hidden="true"
            />
            <span>{meta.label} ({meta.color})</span>
          </div>
        </div>
      </div>
    )
  }

  // For preview theme, use CSS variables (set by data-green-theme-preview on document)
  return (
    <div className="space-y-3">
      {/* Use CSS variables for preview theme support */}
      <Button className="w-full text-white bg-primary hover:bg-primary/90">
        Button
      </Button>
      <div className="p-3 rounded-lg text-sm bg-primary/10 border-l-4 border-primary">
        Card with theme accent
      </div>
      <div className="flex items-center gap-2">
        <div className="h-6 w-6 rounded-full bg-primary" />
        <span className="text-sm">Badge</span>
      </div>
      {/* Show color swatch for reference */}
      <div className="pt-2 border-t border-border">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div
            className="h-4 w-4 rounded border border-border"
            style={{ backgroundColor: meta.color }}
            aria-hidden="true"
          />
          <span>{meta.label} ({meta.color})</span>
        </div>
      </div>
    </div>
  )
}

