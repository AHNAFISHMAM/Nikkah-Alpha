import { useState, useEffect, useRef, useCallback } from 'react'

export interface UseResponsiveChartOptions {
  minHeight?: number
  maxHeight?: number
  mobileHeight?: number
  tabletHeight?: number
  desktopHeight?: number
  aspectRatio?: number
}

export interface UseResponsiveChartReturn {
  width: number
  height: number
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  containerRef: React.RefObject<HTMLDivElement>
}

/**
 * Hook for responsive chart dimensions
 * Handles viewport changes, resize events, and orientation changes
 * Mobile-first approach with proper breakpoints
 */
export function useResponsiveChart({
  minHeight = 200,
  maxHeight = 500,
  mobileHeight = 250,
  tabletHeight = 300,
  desktopHeight = 350,
  aspectRatio,
}: UseResponsiveChartOptions = {}): UseResponsiveChartReturn {
  const containerRef = useRef<HTMLDivElement>(null)
  // Initialize with default dimensions to prevent 0 width/height errors
  const getInitialDimensions = () => {
    if (typeof window === 'undefined') return { width: 640, height: mobileHeight }
    const windowWidth = window.innerWidth
    const isMobile = windowWidth < 640
    const isTablet = windowWidth >= 640 && windowWidth < 1024
    const height = isMobile ? mobileHeight : isTablet ? tabletHeight : desktopHeight
    return { width: windowWidth, height: Math.min(maxHeight, Math.max(minHeight, height)) }
  }
  const [dimensions, setDimensions] = useState(getInitialDimensions)

  const updateDimensions = useCallback(() => {
    if (!containerRef.current) {
      // Use window width as fallback
      const windowWidth = typeof window !== 'undefined' ? window.innerWidth : 0
      const isMobile = windowWidth < 640
      const isTablet = windowWidth >= 640 && windowWidth < 1024
      
      let height: number
      if (isMobile) {
        height = mobileHeight
      } else if (isTablet) {
        height = tabletHeight
      } else {
        height = desktopHeight
      }

      setDimensions({
        width: windowWidth,
        height: Math.min(maxHeight, Math.max(minHeight, height)),
      })
      return
    }

    const containerWidth = containerRef.current.offsetWidth || containerRef.current.clientWidth
    const isMobile = containerWidth < 640
    const isTablet = containerWidth >= 640 && containerWidth < 1024
    const isDesktop = containerWidth >= 1024

    let height: number
    if (isMobile) {
      height = mobileHeight
    } else if (isTablet) {
      height = tabletHeight
    } else {
      height = desktopHeight
    }

    // Apply aspect ratio if provided
    if (aspectRatio && containerWidth > 0) {
      height = Math.min(maxHeight, Math.max(minHeight, containerWidth / aspectRatio))
    }

    // Clamp height between min and max
    height = Math.min(maxHeight, Math.max(minHeight, height))

    setDimensions({
      width: containerWidth || 0,
      height,
    })
  }, [minHeight, maxHeight, mobileHeight, tabletHeight, desktopHeight, aspectRatio])

  useEffect(() => {
    // Initial calculation with a small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      updateDimensions()
    }, 0)

    // Use ResizeObserver for container size changes
    let resizeObserver: ResizeObserver | null = null
    if (typeof ResizeObserver !== 'undefined') {
      const observeContainer = () => {
        if (containerRef.current) {
          resizeObserver = new ResizeObserver(() => {
            // Debounce resize events
            setTimeout(updateDimensions, 50)
          })
          resizeObserver.observe(containerRef.current)
        } else {
          // Retry if container not ready
          setTimeout(observeContainer, 100)
        }
      }
      observeContainer()
    }

    // Fallback to window resize events
    const handleResize = () => {
      updateDimensions()
    }
    const handleOrientationChange = () => {
      // Delay to allow orientation change to complete
      setTimeout(updateDimensions, 200)
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('orientationchange', handleOrientationChange)

    return () => {
      clearTimeout(timer)
      if (resizeObserver) {
        resizeObserver.disconnect()
      }
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', handleOrientationChange)
    }
  }, [updateDimensions])

  const isMobile = dimensions.width < 640
  const isTablet = dimensions.width >= 640 && dimensions.width < 1024
  const isDesktop = dimensions.width >= 1024

  return {
    width: dimensions.width || 0,
    height: dimensions.height || 0,
    isMobile,
    isTablet,
    isDesktop,
    containerRef,
  }
}

