import { useState, useEffect } from 'react'
import { Star, X, Check } from 'lucide-react'
import { Button } from '../ui/Button'
import { cn } from '../../lib/utils'

export interface FilterPopoverProps {
  showSavedOnly: boolean
  onShowSavedOnlyChange: (value: boolean) => void
  selectedCategory: string | null
  onCategoryChange: (category: string | null) => void
  categories: string[]
  favoriteCount: number
  onClose: () => void
}

/**
 * FilterPopover Component
 * 
 * Displays filter options in a popover:
 * - Favorites toggle (checkbox)
 * - Category selection (radio group)
 * - Clear filters button
 * - Active filter indicators
 */
export function FilterPopover({
  showSavedOnly,
  onShowSavedOnlyChange,
  selectedCategory,
  onCategoryChange,
  categories,
  favoriteCount,
  onClose,
}: FilterPopoverProps) {
  const [localShowSavedOnly, setLocalShowSavedOnly] = useState(showSavedOnly)
  const [localSelectedCategory, setLocalSelectedCategory] = useState(selectedCategory)

  // Sync local state with props
  useEffect(() => {
    setLocalShowSavedOnly(showSavedOnly)
    setLocalSelectedCategory(selectedCategory)
  }, [showSavedOnly, selectedCategory])

  const hasActiveFilters = localShowSavedOnly || localSelectedCategory !== null

  const handleApply = () => {
    onShowSavedOnlyChange(localShowSavedOnly)
    onCategoryChange(localSelectedCategory)
    onClose()
  }

  const handleClear = () => {
    setLocalShowSavedOnly(false)
    setLocalSelectedCategory(null)
    onShowSavedOnlyChange(false)
    onCategoryChange(null)
    onClose()
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-border">
        <h3 className="font-semibold text-foreground text-sm sm:text-base">Filters</h3>
        {hasActiveFilters && (
          <button
            onClick={handleClear}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Clear all filters"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Favorites Filter */}
      <div className="space-y-2">
        <label className="flex items-center gap-3 cursor-pointer group">
          <div className="relative">
            <input
              type="checkbox"
              checked={localShowSavedOnly}
              onChange={(e) => setLocalShowSavedOnly(e.target.checked)}
              className="sr-only"
              aria-label="Show favorites only"
            />
            <div
              className={cn(
                'w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200',
                localShowSavedOnly
                  ? 'bg-primary border-primary'
                  : 'bg-background border-input group-hover:border-primary/50'
              )}
            >
              {localShowSavedOnly && (
                <Check className="h-3.5 w-3.5 text-primary-foreground" strokeWidth={3} />
              )}
            </div>
          </div>
          <div className="flex-1 flex items-center gap-2">
            <Star
              className={cn(
                'h-4 w-4 transition-colors',
                localShowSavedOnly ? 'text-primary fill-primary' : 'text-muted-foreground'
              )}
            />
            <span className="text-sm text-foreground font-medium">Favorites</span>
            {favoriteCount > 0 && (
              <span className="text-xs text-muted-foreground">({favoriteCount})</span>
            )}
          </div>
        </label>
      </div>

      {/* Category Filter */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Category
        </h4>
        <div className="space-y-1.5">
          {/* All Option */}
          <label className="flex items-center gap-3 cursor-pointer group">
            <div className="relative">
              <input
                type="radio"
                name="category"
                checked={localSelectedCategory === null}
                onChange={() => setLocalSelectedCategory(null)}
                className="sr-only"
                aria-label="All categories"
              />
              <div
                className={cn(
                  'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200',
                  localSelectedCategory === null
                    ? 'border-primary'
                    : 'border-input group-hover:border-primary/50'
                )}
              >
                {localSelectedCategory === null && (
                  <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                )}
              </div>
            </div>
            <span
              className={cn(
                'text-sm transition-colors',
                localSelectedCategory === null
                  ? 'text-foreground font-medium'
                  : 'text-muted-foreground group-hover:text-foreground'
              )}
            >
              All
            </span>
          </label>

          {/* Category Options */}
          {categories.map((category) => (
            <label key={category} className="flex items-center gap-3 cursor-pointer group">
              <div className="relative">
                <input
                  type="radio"
                  name="category"
                  checked={localSelectedCategory === category}
                  onChange={() => setLocalSelectedCategory(category)}
                  className="sr-only"
                  aria-label={`Filter by ${category} category`}
                />
                <div
                  className={cn(
                    'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200',
                    localSelectedCategory === category
                      ? 'border-primary'
                      : 'border-input group-hover:border-primary/50'
                  )}
                >
                  {localSelectedCategory === category && (
                    <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                  )}
                </div>
              </div>
              <span
                className={cn(
                  'text-sm transition-colors capitalize',
                  localSelectedCategory === category
                    ? 'text-foreground font-medium'
                    : 'text-muted-foreground group-hover:text-foreground'
                )}
              >
                {category === 'Scholarly' ? 'Islamic Marriage Resources' :
                 category === 'Finance' ? 'Islamic Finance' :
                 category === 'Duas' ? 'Duas for Marriage' :
                 category === 'Courses' ? 'Pre-Marriage Courses' :
                 category === 'Books' ? 'Recommended Books' :
                 category}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="pt-2 border-t border-border flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleClear}
          className="flex-1 min-h-[44px]"
          disabled={!hasActiveFilters}
        >
          Clear
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={handleApply}
          className="flex-1 min-h-[44px]"
        >
          Apply
        </Button>
      </div>
    </div>
  )
}

