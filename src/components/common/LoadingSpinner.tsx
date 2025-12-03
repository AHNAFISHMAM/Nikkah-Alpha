import { cn } from '../../lib/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  fullScreen?: boolean
}

export function LoadingSpinner({ size = 'md', className, fullScreen = false }: LoadingSpinnerProps) {
  const sizes = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-3',
    lg: 'h-12 w-12 border-4',
  }

  const spinner = (
    <div
      className={cn(
        'animate-spin rounded-full border-islamic-gold/30 border-t-islamic-gold',
        sizes[size],
        className
      )}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background/80 dark:bg-background/90 backdrop-blur-sm z-50">
        {spinner}
      </div>
    )
  }

  return spinner
}

// Full page loading state with branding
export function PageLoader() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-islamic-gold/10 via-islamic-gold/5 to-background">
      <div className="flex flex-col items-center gap-4">
        <div className="text-4xl font-bold text-islamic-gold drop-shadow-sm">NikahPrep</div>
        <div className="relative">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-islamic-gold/30 border-t-islamic-gold" />
          <div className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-islamic-gold border border-islamic-gold shadow flex items-center justify-center">
            <div className="h-3 w-3 rounded-full bg-white/90" />
          </div>
        </div>
        <p className="text-islamic-gold/80 animate-pulse font-medium">Loading...</p>
      </div>
    </div>
  )
}
