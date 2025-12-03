import { ReactNode } from 'react'
import { Skeleton } from '../common/Skeleton'

export interface ChartContainerProps {
  children: ReactNode
  minWidth?: number
  className?: string
  loading?: boolean
  error?: string | null
}

/**
 * ChartContainer Component
 * 
 * Wraps charts with proper constraints and responsive behavior
 * - Enforces minimum width to prevent collapse
 * - Handles overflow gracefully
 * - Provides loading and error states
 * - Mobile-first responsive design
 */
export function ChartContainer({
  children,
  minWidth = 280,
  className = '',
  loading = false,
  error = null,
}: ChartContainerProps) {
  if (error) {
    return (
      <div
        className={`w-full flex items-center justify-center rounded-lg border border-border bg-card/50 p-6 ${className}`}
        style={{ minWidth: `${minWidth}px`, minHeight: '200px' }}
      >
        <p className="text-sm text-muted-foreground text-center">{error}</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div
        className={`w-full ${className}`}
        style={{ minWidth: `${minWidth}px`, minHeight: '250px' }}
      >
        <Skeleton className="h-full w-full rounded-lg" />
      </div>
    )
  }

  return (
    <div
      className={`w-full overflow-hidden ${className}`}
      style={{ minWidth: `${minWidth}px` }}
    >
      {children}
    </div>
  )
}

