import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

/**
 * Hook to monitor network status and show toast notifications
 * Mobile-optimized for frequent network changes
 */
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(() => {
    if (typeof window !== 'undefined') {
      return navigator.onLine
    }
    return true
  })

  const [hasShownOfflineToast, setHasShownOfflineToast] = useState(false)
  const [hasShownOnlineToast, setHasShownOnlineToast] = useState(false)

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      
      // Only show toast if we were previously offline
      if (hasShownOfflineToast) {
        toast.success('Back online. Syncing data...', {
          duration: 3000,
          position: 'top-center',
          icon: '🌐',
          style: {
            background: 'linear-gradient(135deg, hsl(46 72% 68% / 0.1), hsl(288 50% 35% / 0.1))',
            border: '1px solid hsl(46 72% 68% / 0.2)',
          },
        })
        setHasShownOnlineToast(true)
        setHasShownOfflineToast(false)
      }
    }

    const handleOffline = () => {
      setIsOnline(false)
      
      // Only show toast once per offline session
      if (!hasShownOfflineToast) {
        toast.error('No internet connection. Changes will sync when online.', {
          duration: 5000,
          position: 'top-center',
          icon: '📡',
          style: {
            background: 'linear-gradient(135deg, hsl(0 65% 55% / 0.1), hsl(0 60% 50% / 0.1))',
            border: '1px solid hsl(0 65% 55% / 0.3)',
          },
        })
        setHasShownOfflineToast(true)
        setHasShownOnlineToast(false)
      }
    }

    // Set initial state
    if (typeof window !== 'undefined') {
      setIsOnline(navigator.onLine)
    }

    // Add event listeners
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [hasShownOfflineToast, hasShownOnlineToast])

  return { isOnline }
}

