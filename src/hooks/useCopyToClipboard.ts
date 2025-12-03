import { useState, useCallback } from 'react'
import toast from 'react-hot-toast'

/**
 * Hook for copying text to clipboard with toast feedback
 * Mobile-optimized with consistent styling
 */
export function useCopyToClipboard() {
  const [isCopying, setIsCopying] = useState(false)

  const copyToClipboard = useCallback(async (text: string, label: string = 'Text') => {
    if (!text || text.trim() === '') {
      toast.error('Nothing to copy', {
        duration: 2000,
        position: 'top-center',
        icon: '⚠️',
      })
      return false
    }

    setIsCopying(true)

    try {
      await navigator.clipboard.writeText(text)
      toast.success(`${label} copied!`, {
        duration: 2000,
        position: 'top-center',
        icon: '📋',
        style: {
          background: 'linear-gradient(135deg, hsl(46 72% 68% / 0.1), hsl(288 50% 35% / 0.1))',
          border: '1px solid hsl(46 72% 68% / 0.2)',
        },
      })
      return true
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
      toast.error('Failed to copy. Please try again.', {
        duration: 3000,
        position: 'top-center',
        icon: '❌',
        style: {
          background: 'linear-gradient(135deg, hsl(0 65% 55% / 0.1), hsl(0 60% 50% / 0.1))',
          border: '1px solid hsl(0 65% 55% / 0.3)',
        },
      })
      return false
    } finally {
      setIsCopying(false)
    }
  }, [])

  return { copyToClipboard, isCopying }
}

