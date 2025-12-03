import { useState, useEffect } from 'react'

/**
 * Hook to determine optimal toast position based on viewport
 * Returns responsive position configuration
 * Mobile: Bottom-center above bottom nav
 * Desktop: Top-right corner
 */
export function useToastPosition() {
  const [position, setPosition] = useState<'top-right' | 'bottom-center'>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 640 ? 'bottom-center' : 'top-right'
    }
    return 'top-right'
  })
  
  const [containerStyle, setContainerStyle] = useState<React.CSSProperties>(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 640) {
      return {
        bottom: 'calc(80px + env(safe-area-inset-bottom, 0px))',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        pointerEvents: 'none' as const,
      }
    }
    return {
      top: '20px',
      right: '20px',
      zIndex: 9999,
      pointerEvents: 'none' as const,
    }
  })

  useEffect(() => {
    const updatePosition = () => {
      const isMobile = window.innerWidth < 640

      if (isMobile) {
        // Mobile: Bottom-center above bottom nav
        setPosition('bottom-center')
        setContainerStyle({
          bottom: 'calc(80px + env(safe-area-inset-bottom, 0px))',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 9999,
          pointerEvents: 'none' as const,
        })
      } else {
        // Desktop: Top-right
        setPosition('top-right')
        setContainerStyle({
          top: '20px',
          right: '20px',
          zIndex: 9999,
          pointerEvents: 'none' as const,
        })
      }
    }

    // Initial calculation
    updatePosition()

    // Update on resize with debounce
    let timeoutId: NodeJS.Timeout
    const handleResize = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(updatePosition, 150)
    }

    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
      clearTimeout(timeoutId)
    }
  }, [])

  return { position, containerStyle }
}

