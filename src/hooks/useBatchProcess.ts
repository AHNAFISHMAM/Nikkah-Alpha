import { useState, useCallback } from 'react'
import toast from 'react-hot-toast'
import toast from 'react-hot-toast'

/**
 * Hook for batch processing items with progress tracking
 */
export function useBatchProcess<T, R>() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState({ current: 0, total: 0 })
  const [shouldCancel, setShouldCancel] = useState(false)

  const processBatch = useCallback(
    async (
      items: T[],
      processor: (item: T, index: number) => Promise<R>,
      options?: {
        batchSize?: number
        delayMs?: number
        onProgress?: (current: number, total: number) => void
        onComplete?: (results: R[]) => void
        onError?: (error: Error, item: T, index: number) => void
      }
    ): Promise<R[]> => {
      setIsProcessing(true)
      setShouldCancel(false)
      const batchSize = options?.batchSize || 10
      const delayMs = options?.delayMs || 2000
      const totalBatches = Math.ceil(items.length / batchSize)
      const results: R[] = []
      let processedCount = 0

      const toastId = toast.loading(`Processing batch 1/${totalBatches}...`, {
        position: 'top-center',
        style: {
          background: 'linear-gradient(135deg, hsl(46 72% 68% / 0.1), hsl(288 50% 35% / 0.1))',
          border: '1px solid hsl(46 72% 68% / 0.2)',
        },
      })

      try {
        for (let i = 0; i < totalBatches; i++) {
          if (shouldCancel) {
            toast.error('Operation cancelled', {
              id: toastId,
              position: 'top-center',
              icon: '⚠️',
            })
            break
          }

          const batch = items.slice(i * batchSize, (i + 1) * batchSize)

          // Process batch
          const batchResults = await Promise.allSettled(
            batch.map((item, batchIndex) => processor(item, i * batchSize + batchIndex))
          )

          // Handle results
          batchResults.forEach((result, batchIndex) => {
            if (result.status === 'fulfilled') {
              results.push(result.value)
              processedCount++
            } else {
              const item = batch[batchIndex]
              const error = result.reason instanceof Error ? result.reason : new Error(String(result.reason))
              options?.onError?.(error, item, i * batchSize + batchIndex)
              console.error(`Error processing item ${i * batchSize + batchIndex}:`, error)
            }
          })

          // Update progress
          setProgress({ current: processedCount, total: items.length })
          options?.onProgress?.(processedCount, items.length)

          // Update toast with progress
          toast.loading(`Processing batch ${i + 1}/${totalBatches}... (${processedCount}/${items.length})`, {
            id: toastId,
            position: 'top-center',
            style: {
              background: 'linear-gradient(135deg, hsl(46 72% 68% / 0.1), hsl(288 50% 35% / 0.1))',
              border: '1px solid hsl(46 72% 68% / 0.2)',
            },
          })

          // Delay between batches (except for last batch)
          if (i < totalBatches - 1 && !shouldCancel) {
            await new Promise((resolve) => setTimeout(resolve, delayMs))
          }
        }

        if (!shouldCancel) {
          toast.success(`✅ Processed ${processedCount} items successfully!`, {
            id: toastId,
            duration: 4000,
            position: 'top-center',
            icon: '🎉',
            style: {
              background: 'linear-gradient(135deg, hsl(46 72% 68% / 0.15), hsl(288 50% 35% / 0.15))',
              border: '1px solid hsl(46 72% 68% / 0.3)',
            },
          })
          options?.onComplete?.(results)
        }

        return results
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        toast.error(`❌ Batch processing failed: ${errorMessage}`, {
          id: toastId,
          duration: 5000,
          position: 'top-center',
          icon: '❌',
          style: {
            background: 'linear-gradient(135deg, hsl(0 65% 55% / 0.1), hsl(0 60% 50% / 0.1))',
            border: '1px solid hsl(0 65% 55% / 0.3)',
          },
        })
        throw error
      } finally {
        setIsProcessing(false)
        setProgress({ current: 0, total: 0 })
      }
    },
    [shouldCancel]
  )

  const cancel = useCallback(() => {
    setShouldCancel(true)
  }, [])

  return {
    isProcessing,
    progress,
    processBatch,
    cancel,
  }
}

