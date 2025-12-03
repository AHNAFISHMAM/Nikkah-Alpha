import { useState, useCallback, useRef } from 'react'
import toast from 'react-hot-toast'

/**
 * Hook for cancellable async operations
 */
export function useCancellableOperation<T>() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const shouldCancelRef = useRef(false)
  const abortControllerRef = useRef<AbortController | null>(null)

  const startOperation = useCallback(
    async (
      operation: (signal: AbortSignal, onProgress?: (progress: number) => void) => Promise<T>,
      options?: {
        onSuccess?: (result: T) => void
        onError?: (error: Error) => void
        successMessage?: string
        errorMessage?: string
      }
    ) => {
      setIsProcessing(true)
      setProgress(0)
      shouldCancelRef.current = false

      // Create abort controller
      const abortController = new AbortController()
      abortControllerRef.current = abortController

      const toastId = toast.loading('Processing...')

      try {
        const result = await operation(abortController.signal, (prog) => {
          setProgress(prog)
        })

        if (shouldCancelRef.current) {
          toast.error('Operation cancelled', { id: toastId })
          return
        }

        toast.success(options?.successMessage || 'Operation completed!', { id: toastId })
        options?.onSuccess?.(result)
        return result
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          toast.error('Operation cancelled', { id: toastId })
          return
        }

        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        toast.error(options?.errorMessage || `Failed: ${errorMessage}`, { id: toastId })
        options?.onError?.(error instanceof Error ? error : new Error(errorMessage))
        throw error
      } finally {
        setIsProcessing(false)
        setProgress(0)
        abortControllerRef.current = null
      }
    },
    []
  )

  const cancelOperation = useCallback(() => {
    shouldCancelRef.current = true
    abortControllerRef.current?.abort()
  }, [])

  return {
    isProcessing,
    progress,
    startOperation,
    cancelOperation,
  }
}

