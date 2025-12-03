import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '../../lib/supabase'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { cn } from '../../lib/utils'
import { logError } from '../../lib/error-handler'

interface CustomItemDialogProps {
  categoryId: string
  userId: string
  onClose: () => void
}

export function CustomItemDialog({ categoryId, userId, onClose }: CustomItemDialogProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const queryClient = useQueryClient()

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!supabase) throw new Error('Supabase is not configured')
      
      // First create the checklist item
      const { data: newItem, error: itemError } = await supabase
        .from('checklist_items')
        // @ts-expect-error - Supabase type inference issue
        .insert({
          category_id: categoryId,
          title,
          description: description || null,
          is_required: false,
          sort_order: 999, // Put custom items at the end
        })
        .select()
        .single()

      if (itemError) throw itemError

      if (!newItem?.id) {
        throw new Error('Failed to create checklist item')
      }

      // Then create the user progress entry (uncompleted)
      const { error: progressError } = await supabase
        .from('user_checklist_progress')
        // @ts-expect-error - Supabase type inference issue
        .insert({
          user_id: userId,
          item_id: newItem.id,
          is_completed: false
        })

      if (progressError) throw progressError
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checklist'] })
      toast.success('Custom item added!')
      onClose()
    },
    onError: (error) => {
      logError(error, 'CustomItemDialog.createItem')
      toast.error('Failed to add item')
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      toast.error('Please enter a title')
      return
    }
    if (title.trim().length < 3) {
      toast.error('Title must be at least 3 characters')
      return
    }
    createMutation.mutate()
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 z-modal-backdrop flex items-center justify-center p-4 sm:p-6 bg-black/50 dark:bg-black/70 backdrop-blur-sm safe-area-inset-top safe-area-inset-bottom"
      onClick={handleBackdropClick}
    >
      <div className="bg-card border border-border rounded-2xl max-w-md w-full p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-card-foreground">
            Add Custom Checklist Item
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-accent rounded-lg transition-colors text-muted-foreground hover:text-foreground min-h-[44px] min-w-[44px] flex items-center justify-center touch-manipulation"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Item Title"
            placeholder="e.g., Book photographer"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            autoFocus
          />

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Description (optional)
            </label>
            <textarea
              placeholder="Add any details about this item..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className={cn(
                "w-full rounded-xl border border-input bg-background",
                "px-4 py-3 text-sm resize-none",
                "focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary",
                "placeholder:text-muted-foreground"
              )}
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              type="submit"
              className="flex-1 min-h-[44px]"
              disabled={createMutation.isPending}
              isLoading={createMutation.isPending}
              leftIcon={<Plus className="h-4 w-4" />}
            >
              Add Item
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={createMutation.isPending}
              className="min-h-[44px]"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
