import { User } from 'lucide-react'
import { usePartnerDiscussionAnswers } from '../../hooks/usePartnerDiscussionAnswers'
import { cn } from '../../lib/utils'

interface PartnerStatusBadgeProps {
  promptId: string
  className?: string
}

/**
 * Badge component that shows if partner has answered a discussion prompt
 * Only renders if partner has answered
 */
export function PartnerStatusBadge({ promptId, className }: PartnerStatusBadgeProps) {
  const { data: partnerAnswer, isLoading } = usePartnerDiscussionAnswers(promptId)

  // Don't show anything if loading, no partner, or partner hasn't answered
  if (isLoading || !partnerAnswer || (!partnerAnswer.answer && !partnerAnswer.follow_up_notes)) {
    return null
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-xs sm:text-sm text-secondary bg-secondary/10 dark:bg-secondary/20 px-2 py-1 rounded-full',
        className
      )}
      title="Your partner has answered this prompt"
    >
      <User className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
      <span className="hidden sm:inline">Partner answered</span>
    </span>
  )
}

