import { useState, useEffect } from 'react'

export interface UseViewportReturn {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  width: number
  height: number
  showNavLabels: boolean // Show text labels in bottom navigation (>= 360px)
}

/**
 * Hook to detect viewport size and breakpoints
 * Mobile-first approach: < 640px = mobile, 640-1023px = tablet, >= 1024px = desktop
 */
export function useViewport(): UseViewportReturn {
  const [dimensions, setDimensions] = useState(() => {
    if (typeof window === 'undefined') {
      return { width: 1024, height: 768 }
    }
    return {
      width: window.innerWidth,
      height: window.innerHeight,
    }
  })

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    // Initial check
    handleResize()

    window.addEventListener('resize', handleResize)
    window.addEventListener('orientationchange', () => {
      // Delay to allow orientation change to complete
      setTimeout(handleResize, 200)
    })

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  const isMobile = dimensions.width < 640
  const isTablet = dimensions.width >= 640 && dimensions.width < 1024
  const isDesktop = dimensions.width >= 1024
  const showNavLabels = dimensions.width >= 360 // Show labels on screens >= 360px

  return {
    isMobile,
    isTablet,
    isDesktop,
    width: dimensions.width,
    height: dimensions.height,
    showNavLabels,
  }
}

