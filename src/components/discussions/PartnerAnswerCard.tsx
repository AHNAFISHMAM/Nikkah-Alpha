import { Heart, User, Eye, EyeOff } from 'lucide-react'
import { Button } from '../ui/Button'
import { useState } from 'react'
import { usePartnerDiscussionAnswers } from '../../hooks/usePartnerDiscussionAnswers'
import { usePartner } from '../../hooks/usePartner'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '../../lib/utils'

interface PartnerAnswerCardProps {
  promptId: string
  className?: string
}

export function PartnerAnswerCard({ promptId, className }: PartnerAnswerCardProps) {
  const { data: partnerAnswer, isLoading, isError } = usePartnerDiscussionAnswers(promptId)
  const { data: partnerId } = usePartner()
  const [isExpanded, setIsExpanded] = useState(true)

  // Loading state
  if (isLoading) {
    return (
      <div
        className={cn(
          'mt-4 sm:mt-5 p-4 sm:p-5 bg-muted/30 rounded-xl border border-border/50 animate-pulse',
          className
        )}
      >
        <div className="h-20 bg-muted rounded" />
      </div>
    )
  }

  // No partner connected - don't show anything
  if (!partnerId || isError) {
    return null
  }

  // Partner exists but hasn't answered yet (partnerAnswer is null but partnerId exists)
  if (partnerId && !partnerAnswer) {
    return (
      <div
        className={cn(
          'mt-4 sm:mt-5 p-4 sm:p-5 bg-muted/30 rounded-xl border border-border/50',
          className
        )}
      >
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
            <Heart className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm sm:text-base font-medium text-muted-foreground">
              Your partner hasn't answered yet
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Their answer will appear here when they respond
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Partner has answered
  const hasAnswer = partnerAnswer?.answer
  const hasNotes = partnerAnswer?.follow_up_notes

  return (
    <div className={cn('mt-4 sm:mt-5', className)}>
      {/* Header with toggle */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-secondary/20 dark:bg-secondary/30 flex items-center justify-center flex-shrink-0">
            <User className="h-4 w-4 sm:h-5 sm:w-5 text-secondary" />
          </div>
          <div>
            <p className="text-sm sm:text-base font-semibold text-foreground">
              Partner's Answer
            </p>
            {partnerAnswer?.updated_at && (
              <p className="text-xs text-muted-foreground">
                Updated{' '}
                {formatDistanceToNow(new Date(partnerAnswer.updated_at), { addSuffix: true })}
              </p>
            )}
          </div>
        </div>
        {(hasAnswer || hasNotes) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="min-h-[36px] min-w-[36px] p-0"
            aria-label={isExpanded ? 'Hide partner answer' : 'Show partner answer'}
          >
            {isExpanded ? (
              <EyeOff className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Eye className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
        )}
      </div>

      {/* Partner's Answer Content */}
      {isExpanded && (
        <div className="space-y-4 sm:space-y-5">
          {hasAnswer && (
            <div className="p-4 sm:p-5 bg-secondary/5 dark:bg-secondary/10 rounded-xl border border-secondary/20 dark:border-secondary/30">
              <p className="text-xs sm:text-sm font-medium text-secondary mb-3 sm:mb-4">
                Their Answer
              </p>
              <p className="text-sm sm:text-base text-foreground whitespace-pre-wrap leading-relaxed">
                {partnerAnswer.answer}
              </p>
            </div>
          )}

          {hasNotes && (
            <div className="p-4 sm:p-5 bg-secondary/5 dark:bg-secondary/10 rounded-xl border border-secondary/20 dark:border-secondary/30">
              <p className="text-xs sm:text-sm font-medium text-secondary mb-3 sm:mb-4">
                Their Discussion Notes
              </p>
              <p className="text-sm sm:text-base text-foreground whitespace-pre-wrap leading-relaxed">
                {partnerAnswer.follow_up_notes}
              </p>
            </div>
          )}

          {!hasAnswer && !hasNotes && (
            <div className="p-4 sm:p-5 bg-muted/30 rounded-xl border border-border/50 text-center">
              <p className="text-sm text-muted-foreground">
                Your partner marked this as discussed but hasn't added an answer yet.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

