import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '../ui/Card'
import { Button } from '../ui/Button'
import { AlertTriangle, X } from 'lucide-react'

export interface Conflict {
  id: string
  type: 'version_mismatch' | 'already_processed' | 'state_conflict'
  message: string
  serverState?: Record<string, unknown>
  localState?: Record<string, unknown>
}

interface ConflictResolutionBannerProps {
  conflict: Conflict | null
  onResolve: (action: 'server' | 'local' | 'dismiss') => void
}

export function ConflictResolutionBanner({ conflict, onResolve }: ConflictResolutionBannerProps) {
  if (!conflict) return null

  const getConflictMessage = () => {
    switch (conflict.type) {
      case 'version_mismatch':
        return 'The invitation status has changed. Would you like to use the latest version?'
      case 'already_processed':
        return 'This invitation has already been processed by another action.'
      case 'state_conflict':
        return 'There was a conflict with the current state. Please refresh to see the latest.'
      default:
        return conflict.message
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        transition={{ duration: 0.3 }}
        className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 z-[9998]"
        style={{
          bottom: 'calc(16px + env(safe-area-inset-bottom, 0px))',
        }}
      >
        <Card className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5">
                <AlertTriangle className="h-full w-full" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground mb-1">Conflict Detected</p>
                <p className="text-xs text-muted-foreground mb-3">{getConflictMessage()}</p>
                <div className="flex flex-col sm:flex-row gap-2">
                  {conflict.type === 'version_mismatch' && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => onResolve('server')}
                        className="h-9 text-xs flex-1 min-h-[44px] sm:min-h-0"
                      >
                        Use Latest
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onResolve('local')}
                        className="h-9 text-xs flex-1 min-h-[44px] sm:min-h-0"
                      >
                        Keep Mine
                      </Button>
                    </>
                  )}
                  {conflict.type === 'already_processed' && (
                    <Button
                      size="sm"
                      onClick={() => onResolve('server')}
                      className="h-9 text-xs w-full min-h-[44px] sm:min-h-0"
                    >
                      Refresh
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onResolve('dismiss')}
                    className="h-9 text-xs flex-1 min-h-[44px] sm:min-h-0"
                    leftIcon={<X className="h-4 w-4" />}
                  >
                    Dismiss
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  )
}

