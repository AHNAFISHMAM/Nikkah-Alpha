import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Save, Edit2, Copy } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '../../lib/supabase'
import { Button } from '../ui/Button'
import { Textarea } from '../ui/Textarea'
import { PartnerAnswerCard } from './PartnerAnswerCard'
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard'

interface NotesEditorProps {
  promptId: string
  userId: string
  initialAnswer?: string | null
  initialNotes?: string | null
  answerId?: string | null
}

export function NotesEditor({ promptId, userId, initialAnswer, initialNotes, answerId }: NotesEditorProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [answer, setAnswer] = useState(initialAnswer || '')
  const [notes, setNotes] = useState(initialNotes || '')
  const queryClient = useQueryClient()
  const { copyToClipboard } = useCopyToClipboard()

  const saveMutation = useMutation({
    mutationFn: async ({ answer, notes }: { answer: string; notes: string }) => {
      if (!supabase) throw new Error('Supabase is not configured')
      
      const upsertData: any = {
        user_id: userId,
        prompt_id: promptId,
        answer: answer.trim() || null,
        follow_up_notes: notes.trim() || null,
      }
      
      if (answerId) {
        upsertData.id = answerId
      }

      const { error } = await supabase
        .from('user_discussion_answers')
        .upsert(upsertData, {
          onConflict: 'user_id,prompt_id'
        })

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discussions'] })
      queryClient.invalidateQueries({ queryKey: ['progress-stats'] })
      // Invalidate partner answer queries so partner sees updated status
      queryClient.invalidateQueries({ queryKey: ['partner-discussion-answer'] })
      toast.success('Answer and notes saved!')
      setIsEditing(false)
    },
    onError: () => {
      toast.error('Failed to save answer and notes')
    }
  })

  const handleSave = () => {
    saveMutation.mutate({ answer, notes })
  }

  const handleCancel = () => {
    setAnswer(initialAnswer || '')
    setNotes(initialNotes || '')
    setIsEditing(false)
  }

  const hasContent = answer || notes

  // Empty state - show button to add answer/notes
  if (!isEditing && !hasContent) {
    return (
      <div className="mt-5 sm:mt-6 p-4 sm:p-5 border-2 border-dashed border-border rounded-xl hover:border-primary/50 transition-colors">
        <button
          onClick={() => setIsEditing(true)}
          className="w-full text-left text-sm sm:text-base text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2 sm:gap-3 min-h-[44px] touch-manipulation"
          type="button"
        >
          <Edit2 className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
          <span>Add your answer and discussion notes...</span>
        </button>
      </div>
    )
  }

  // View mode - show saved answer and notes with edit button
  if (!isEditing) {
    return (
      <div className="mt-5 sm:mt-6 space-y-4 sm:space-y-5">
        {answer && (
          <div className="p-4 sm:p-5 bg-primary/5 dark:bg-primary/10 rounded-xl border border-primary/20 dark:border-primary/30">
            <div className="flex items-start justify-between mb-3 sm:mb-4">
              <p className="text-sm sm:text-base font-medium text-primary">Your Answer</p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => copyToClipboard(answer, 'Answer')}
                  className="text-primary hover:text-primary/70 dark:hover:text-primary/80 transition-colors p-2 -mr-2 -mt-2 min-h-[36px] min-w-[36px] flex items-center justify-center touch-manipulation"
                  aria-label="Copy answer"
                  type="button"
                >
                  <Copy className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-primary hover:text-primary/70 dark:hover:text-primary/80 transition-colors p-2 -mr-2 -mt-2 min-h-[36px] min-w-[36px] flex items-center justify-center touch-manipulation"
                  aria-label="Edit answer"
                  type="button"
                >
                  <Edit2 className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              </div>
            </div>
            <p className="text-sm sm:text-base text-foreground whitespace-pre-wrap leading-relaxed">{answer}</p>
          </div>
        )}
        {notes && (
          <div className="p-4 sm:p-5 bg-primary/5 dark:bg-primary/10 rounded-xl border border-primary/20 dark:border-primary/30">
            <div className="flex items-start justify-between mb-3 sm:mb-4">
              <p className="text-sm sm:text-base font-medium text-primary">Discussion Notes</p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => copyToClipboard(notes, 'Notes')}
                  className="text-primary hover:text-primary/70 dark:hover:text-primary/80 transition-colors p-2 -mr-2 -mt-2 min-h-[36px] min-w-[36px] flex items-center justify-center touch-manipulation"
                  aria-label="Copy notes"
                  type="button"
                >
                  <Copy className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-primary hover:text-primary/70 dark:hover:text-primary/80 transition-colors p-2 -mr-2 -mt-2 min-h-[36px] min-w-[36px] flex items-center justify-center touch-manipulation"
                  aria-label="Edit notes"
                  type="button"
                >
                  <Edit2 className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              </div>
            </div>
            <p className="text-sm sm:text-base text-foreground whitespace-pre-wrap leading-relaxed">{notes}</p>
          </div>
        )}
        {!answer && !notes && (
          <button
            onClick={() => setIsEditing(true)}
            className="w-full text-left p-4 sm:p-5 border-2 border-dashed border-neutral-200 dark:border-border rounded-xl hover:border-primary/50 dark:hover:border-primary/50 transition-colors min-h-[44px] touch-manipulation"
            type="button"
          >
            <span className="text-sm sm:text-base text-neutral-500 dark:text-muted-foreground">Add your answer and notes...</span>
          </button>
        )}

        {/* Partner's Answer Section */}
        <PartnerAnswerCard promptId={promptId} />
      </div>
    )
  }

  // Edit mode - show textareas and save/cancel buttons
  return (
    <div className="mt-5 sm:mt-6 space-y-5 sm:space-y-6">
      <div>
        <label className="block text-sm sm:text-base font-medium text-foreground mb-3">
          Your Answer
        </label>
        <Textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Write your thoughts and answer here..."
          className="min-h-[120px] sm:min-h-[140px]"
        />
      </div>
      <div>
        <label className="block text-sm sm:text-base font-medium text-foreground mb-3">
          Discussion Notes
        </label>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add notes from your discussion with your partner..."
          className="min-h-[100px] sm:min-h-[120px]"
        />
      </div>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
        <Button
          onClick={handleSave}
          disabled={saveMutation.isPending}
          isLoading={saveMutation.isPending}
          leftIcon={<Save className="h-4 w-4 sm:h-5 sm:w-5" />}
          className="min-h-[44px] w-full sm:w-auto"
        >
          Save Answer & Notes
        </Button>
        <Button
          onClick={handleCancel}
          variant="outline"
          disabled={saveMutation.isPending}
          className="min-h-[44px] w-full sm:w-auto"
        >
          Cancel
        </Button>
      </div>
    </div>
  )
}
