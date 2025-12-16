import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, StickyNote, Save, Copy } from 'lucide-react'
import { Button } from '../ui/Button'
import { Textarea } from '../ui/Textarea'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'
import { logError } from '../../lib/error-handler'
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard'

interface ChecklistItemNotesModalProps {
  isOpen: boolean
  itemId: string
  itemTitle: string
  currentNotes: string | null
  onClose: () => void
}

export function ChecklistItemNotesModal({
  isOpen,
  itemId,
  itemTitle,
  currentNotes,
  onClose,
}: ChecklistItemNotesModalProps) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [notes, setNotes] = useState(currentNotes || '')
  const [isSaving, setIsSaving] = useState(false)
  const { copyToClipboard } = useCopyToClipboard()

  useEffect(() => {
    if (isOpen) {
      setNotes(currentNotes || '')
    }
  }, [isOpen, currentNotes])

  const saveNotesMutation = useMutation({
    mutationFn: async (notesText: string) => {
      if (!user) throw new Error('Not authenticated')
      if (!supabase) throw new Error('Supabase is not configured')

      const { error } = await supabase
        .from('user_checklist_progress')
        .upsert(
          {
            user_id: user.id,
            item_id: itemId,
            notes: notesText.trim() || null,
            is_completed: false,
          },
          {
            onConflict: 'user_id,item_id',
          }
        )

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checklist'] })
      toast.success('Note saved')
      onClose()
    },
    onError: (error) => {
      logError(error, 'ChecklistItemNotesModal.saveNotes')
      toast.error('Failed to save note')
      setIsSaving(false)
    },
  })

  const handleSave = () => {
    setIsSaving(true)
    saveNotesMutation.mutate(notes)
  }

  const handleClose = () => {
    if (notes !== (currentNotes || '')) {
      if (confirm('You have unsaved changes. Close without saving?')) {
        onClose()
      }
    } else {
      onClose()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/50 z-40 sm:z-50"
          />

          {/* Modal - Mobile: Bottom Sheet, Desktop: Centered */}
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:max-w-lg sm:w-full sm:max-h-[80vh] bg-background rounded-t-2xl sm:rounded-2xl shadow-2xl z-50 flex flex-col max-h-[85vh] safe-area-inset-bottom"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border flex-shrink-0 safe-area-inset-top">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <StickyNote className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-base sm:text-lg">Personal Notes</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1">{itemTitle}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {notes && (
                  <button
                    onClick={() => copyToClipboard(notes, 'Notes')}
                    className="h-10 w-10 rounded-lg hover:bg-accent flex items-center justify-center transition-colors touch-manipulation min-h-[44px] min-w-[44px]"
                    aria-label="Copy notes"
                  >
                    <Copy className="h-5 w-5" />
                  </button>
                )}
                <button
                  onClick={handleClose}
                  className="h-10 w-10 rounded-lg hover:bg-accent flex items-center justify-center transition-colors touch-manipulation min-h-[44px] min-w-[44px]"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 min-h-0">
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add your personal notes about this item..."
                className="min-h-[120px] sm:min-h-[200px] resize-none text-sm sm:text-base"
                maxLength={1000}
              />
              <p className="text-xs text-muted-foreground mt-2 text-right">
                {notes.length}/1000 characters
              </p>
            </div>

            {/* Footer */}
            <div className="flex flex-col-reverse sm:flex-row gap-3 p-4 sm:p-6 border-t border-border flex-shrink-0">
              <Button
                variant="outline"
                onClick={handleClose}
                className="flex-1 min-h-[44px] sm:min-h-[48px]"
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                isLoading={isSaving}
                className="flex-1 min-h-[44px] sm:min-h-[48px]"
                leftIcon={<Save className="h-4 w-4" />}
              >
                Save Note
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

