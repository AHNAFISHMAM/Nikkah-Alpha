import { useState, useEffect, useRef, useCallback } from 'react'
import toast from 'react-hot-toast'

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

export interface UseAutoSaveNotesOptions {
  moduleId: string | undefined
  notes: string
  initialNotes: string
  onSave: (notes: string) => Promise<void>
  debounceDelay?: number
  enabled?: boolean
}

export interface UseAutoSaveNotesReturn {
  saveStatus: SaveStatus
  lastSavedAt: Date | null
  hasUnsavedChanges: boolean
  retrySave: () => void
}

/**
 * Auto-save hook for module notes with debounce, status tracking, and error handling
 * Mobile-optimized with 1000ms debounce to reduce API calls on slower networks
 */
export function useAutoSaveNotes({
  moduleId,
  notes,
  initialNotes,
  onSave,
  debounceDelay = 1000,
  enabled = true,
}: UseAutoSaveNotesOptions): UseAutoSaveNotesReturn {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  const isInitialMount = useRef(true)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastSavedNotesRef = useRef<string>(initialNotes)
  const hasShownFirstSaveToast = useRef(false)
  const errorToastIdRef = useRef<string | null>(null)

  // Track if notes have changed from initial value
  useEffect(() => {
    const hasChanges = notes !== initialNotes && notes !== lastSavedNotesRef.current
    setHasUnsavedChanges(hasChanges)
  }, [notes, initialNotes])

  // Auto-save with debounce
  useEffect(() => {
    // Skip on initial mount
    if (isInitialMount.current) {
      isInitialMount.current = false
      lastSavedNotesRef.current = initialNotes
      return
    }

    // Skip if disabled, no module ID, or no changes
    if (!enabled || !moduleId || notes === initialNotes || notes === lastSavedNotesRef.current) {
      return
    }

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Set saving status
    setSaveStatus('saving')

    // Create new timeout for debounced save
    timeoutRef.current = setTimeout(async () => {
      try {
        await onSave(notes)
        setSaveStatus('saved')
        setLastSavedAt(new Date())
        const savedNotes = notes
        lastSavedNotesRef.current = savedNotes
        setHasUnsavedChanges(false)

        // Show toast on first successful save after changes
        if (!hasShownFirstSaveToast.current) {
          hasShownFirstSaveToast.current = true
          toast.success('Auto-saved', {
            duration: 2000,
            position: 'top-center',
            icon: '💾',
            style: {
              background: 'linear-gradient(135deg, hsl(46 72% 68% / 0.1), hsl(288 50% 35% / 0.1))',
              border: '1px solid hsl(46 72% 68% / 0.2)',
            },
          })
        }

        // Clear any existing error toast
        if (errorToastIdRef.current) {
          toast.dismiss(errorToastIdRef.current)
          errorToastIdRef.current = null
        }

        // Auto-hide "saved" status after 3 seconds
        setTimeout(() => {
          setSaveStatus((currentStatus) => {
            // Only hide if still in saved state and notes haven't changed
            if (currentStatus === 'saved' && savedNotes === lastSavedNotesRef.current) {
              return 'idle'
            }
            return currentStatus
          })
        }, 3000)
      } catch (error) {
        console.error('Auto-save failed:', error)
        setSaveStatus('error')
        
        // Show error toast with retry option
        if (!errorToastIdRef.current) {
          errorToastIdRef.current = toast.error('Auto-save failed. Tap to retry.', {
            duration: 5000,
            position: 'top-center',
            icon: '⚠️',
            style: {
              background: 'linear-gradient(135deg, hsl(0 65% 55% / 0.1), hsl(0 60% 50% / 0.1))',
              border: '1px solid hsl(0 65% 55% / 0.3)',
            },
            onClick: () => {
              retrySave()
              if (errorToastIdRef.current) {
                toast.dismiss(errorToastIdRef.current)
                errorToastIdRef.current = null
              }
            },
          })
        }
      }
    }, debounceDelay)

    // Cleanup timeout on unmount or dependency change
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [notes, moduleId, initialNotes, onSave, debounceDelay, enabled])

  // Retry save function
  const retrySave = useCallback(async () => {
    if (!enabled || !moduleId || notes === lastSavedNotesRef.current) {
      return
    }

    setSaveStatus('saving')
    
    // Dismiss error toast if showing
    if (errorToastIdRef.current) {
      toast.dismiss(errorToastIdRef.current)
      errorToastIdRef.current = null
    }
    
    try {
      await onSave(notes)
      setSaveStatus('saved')
      setLastSavedAt(new Date())
      lastSavedNotesRef.current = notes
      setHasUnsavedChanges(false)

      // Show success toast on retry
      toast.success('Saved successfully!', {
        duration: 2000,
        position: 'top-center',
        icon: '✅',
        style: {
          background: 'linear-gradient(135deg, hsl(46 72% 68% / 0.1), hsl(288 50% 35% / 0.1))',
          border: '1px solid hsl(46 72% 68% / 0.2)',
        },
      })

      // Auto-hide after 3 seconds
      const savedNotes = notes
      setTimeout(() => {
        setSaveStatus((currentStatus) => {
          // Only hide if still in saved state and notes haven't changed
          if (currentStatus === 'saved' && savedNotes === lastSavedNotesRef.current) {
            return 'idle'
          }
          return currentStatus
        })
      }, 3000)
    } catch (error) {
      console.error('Retry save failed:', error)
      setSaveStatus('error')
      
      // Show error toast again
      errorToastIdRef.current = toast.error('Save failed. Tap to retry.', {
        duration: 5000,
        position: 'top-center',
        icon: '⚠️',
        style: {
          background: 'linear-gradient(135deg, hsl(0 65% 55% / 0.1), hsl(0 60% 50% / 0.1))',
          border: '1px solid hsl(0 65% 55% / 0.3)',
        },
        onClick: () => {
          retrySave()
          if (errorToastIdRef.current) {
            toast.dismiss(errorToastIdRef.current)
            errorToastIdRef.current = null
          }
        },
      })
    }
  }, [notes, moduleId, onSave, enabled])

  // Update lastSavedAt when initialNotes change (from server)
  useEffect(() => {
    if (initialNotes && initialNotes === lastSavedNotesRef.current) {
      // Notes match what we last saved, so we can assume they're synced
      setLastSavedAt(new Date())
    }
  }, [initialNotes])

  // Reset first save toast flag when notes change significantly
  useEffect(() => {
    if (notes !== initialNotes && notes !== lastSavedNotesRef.current) {
      hasShownFirstSaveToast.current = false
    }
  }, [notes, initialNotes])

  return {
    saveStatus,
    lastSavedAt,
    hasUnsavedChanges,
    retrySave,
  }
}

