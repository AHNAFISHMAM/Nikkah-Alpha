import { type ReactNode } from 'react'
import { ErrorBoundary } from './ErrorBoundary'
import { Card, CardContent } from '../ui/Card'
import { Button } from '../ui/Button'

interface RouteErrorBoundaryProps {
  children: ReactNode
}

export function RouteErrorBoundary({ children }: RouteErrorBoundaryProps) {
  return (
    <ErrorBoundary
      fallback={(error) => (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-neutral-50 to-white">
          <Card className="max-w-md w-full">
            <CardContent className="pt-6">
              <div className="text-center mb-6">
                <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">⚠️</span>
                </div>
                <h2 className="text-xl font-bold text-neutral-900 mb-2">Something went wrong</h2>
                <p className="text-neutral-600 text-sm">
                  {error instanceof Error ? error.message : 'An unexpected error occurred'}
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={() => window.location.href = '/dashboard'}
                  className="flex-1"
                  variant="primary"
                >
                  Go to Dashboard
                </Button>
                <Button
                  onClick={() => window.location.reload()}
                  className="flex-1"
                  variant="outline"
                >
                  Reload Page
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    >
      {children}
    </ErrorBoundary>
  )
}
