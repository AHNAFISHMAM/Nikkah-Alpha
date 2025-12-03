import { useState, useEffect } from 'react'
import { Loader2, Copy } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card'
import { Textarea } from '../ui/Textarea'
import { Label } from '../ui/Label'
import { Button } from '../ui/Button'
import { useSaveModuleNotes } from '../../hooks/useModules'
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard'

export interface ModuleNotesProps {
  moduleId: string
  initialNotes?: string | null
}

export function ModuleNotes({ moduleId, initialNotes }: ModuleNotesProps) {
  const [notes, setNotes] = useState(initialNotes || '')
  const [isSaving, setIsSaving] = useState(false)
  const saveNotesMutation = useSaveModuleNotes()
  const { copyToClipboard } = useCopyToClipboard()

  // Update notes when initialNotes changes
  useEffect(() => {
    if (initialNotes !== undefined) {
      setNotes(initialNotes || '')
    }
  }, [initialNotes])

  // Auto-save notes with debounce
  useEffect(() => {
    if (!moduleId || !notes || notes === (initialNotes || '')) {
      return
    }

    const timeoutId = setTimeout(() => {
      setIsSaving(true)
      saveNotesMutation.mutate(
        { moduleId, notes },
        {
          onSettled: () => {
            setIsSaving(false)
          },
        }
      )
    }, 1000) // 1 second debounce

    return () => clearTimeout(timeoutId)
  }, [notes, moduleId, initialNotes, saveNotesMutation])

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Your Notes</CardTitle>
          <div className="flex items-center gap-2">
            {notes && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(notes, 'Notes')}
                className="min-h-[36px] min-w-[36px] p-2"
                aria-label="Copy notes"
              >
                <Copy className="h-4 w-4" />
              </Button>
            )}
            {isSaving && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Loader2 className="h-3 w-3 animate-spin" />
                Saving...
              </span>
            )}
          </div>
        </div>
        <CardDescription>
          Add your personal notes and reflections. They will be saved automatically.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Write your notes, reflections, or key takeaways here..."
              className="mt-2 min-h-[200px]"
              rows={10}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

