import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * ScrollToTop Component
 * 
 * Automatically scrolls to the top of the page when the route changes.
 * Works for both window scroll (public pages) and scrollable containers (dashboard layout).
 * Mobile-first: Optimized for smooth scrolling on all devices.
 */
export function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      // Try to find the scrollable main element (dashboard layout)
      const mainElement = document.querySelector('main[role="main"]') as HTMLElement
      
      if (mainElement) {
        // Scroll the main container (dashboard layout)
        mainElement.scrollTo({
          top: 0,
          left: 0,
          behavior: 'smooth',
        })
      } else {
        // Fallback to window scroll (public pages)
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: 'smooth',
        })
      }
    }, 0)

    return () => clearTimeout(timer)
  }, [pathname])

  return null
}

