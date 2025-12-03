import { memo, useMemo } from 'react'
import { Card, CardContent } from '../ui/Card'
import { Progress } from '../ui/Progress'

export interface ModuleProgressProps {
  completed: number
  total: number
  showLabel?: boolean
  className?: string
}

export const ModuleProgress = memo(function ModuleProgress({ completed, total, showLabel = true, className }: ModuleProgressProps) {
  // Memoize percent calculation
  const percent = useMemo(() => total > 0 ? Math.round((completed / total) * 100) : 0, [completed, total])

  return (
    <Card className={className}>
      <CardContent className="p-4 sm:p-6">
        {showLabel && (
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">Overall Progress</span>
            <span className="text-sm font-semibold text-primary">{percent}%</span>
          </div>
        )}
        <Progress value={percent} variant="primary" className="h-2" />
        {showLabel && (
          <p className="text-xs text-muted-foreground mt-2">
            {completed} of {total} modules completed
          </p>
        )}
      </CardContent>
    </Card>
  )
})

