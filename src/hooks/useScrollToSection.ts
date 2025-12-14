import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { logWarning } from '../lib/logger'

/**
 * Hook to automatically scroll to a section when URL hash is present
 * 
 * This hook:
 * - Detects hash anchors in the URL (e.g., #partner-connection)
 * - Scrolls to the corresponding element with matching ID
 * - Works with scrollable containers (dashboard layout) and html element scroll (public pages)
 * - Best Practice: Uses document.documentElement for public pages since html is the scroll container
 * - Removes hash from URL after scrolling for clean URLs
 * - Handles mobile headers and provides proper offset
 * 
 * @param options - Configuration options
 * @param options.offset - Scroll offset in pixels (default: 80)
 * @param options.delay - Delay before scrolling in ms (default: 150)
 * @param options.scrollContainer - CSS selector for scrollable container (default: 'main[role="main"]')
 * 
 * @example
 * // In a page component
 * useScrollToSection()
 * 
 * // With custom options
 * useScrollToSection({ offset: 100, delay: 200 })
 */
export function useScrollToSection(options?: {
  offset?: number
  delay?: number
  scrollContainer?: string
}) {
  const location = useLocation()
  const { offset = 80, delay = 150, scrollContainer = 'main[role="main"]' } = options || {}

  useEffect(() => {
    const hash = location.hash
    if (!hash) return

    // Extract section ID from hash (remove #)
    const sectionId = hash.substring(1)
    if (!sectionId) return

    // Small delay to ensure DOM is ready and page is rendered
    const timer = setTimeout(() => {
      const element = document.getElementById(sectionId)
      if (!element) {
        console.warn(`[useScrollToSection] Element with id "${sectionId}" not found`)
        return
      }

      // Find the scrollable container
      const container = document.querySelector(scrollContainer) as HTMLElement

      if (container) {
        // Scroll within the container (dashboard layout)
        const containerRect = container.getBoundingClientRect()
        const elementRect = element.getBoundingClientRect()

        // Calculate the scroll position needed to bring element into view
        const scrollTop = container.scrollTop + (elementRect.top - containerRect.top) - offset

        container.scrollTo({
          top: Math.max(0, scrollTop), // Ensure we don't scroll to negative position
          behavior: 'smooth',
        })
      } else {
        // Fix: Use html element scroll for public pages (html is the scroll container)
        const htmlElement = document.documentElement
        const elementTop = element.getBoundingClientRect().top + htmlElement.scrollTop - offset

        htmlElement.scrollTo({
          top: Math.max(0, elementTop),
          left: 0,
          behavior: 'smooth',
        })
      }

      // Remove hash from URL after scrolling (clean URL)
      // Small delay to ensure scroll animation starts
      setTimeout(() => {
        window.history.replaceState(null, '', location.pathname + location.search)
      }, 100)
    }, delay)

    return () => clearTimeout(timer)
  }, [location.hash, location.pathname, location.search, offset, delay, scrollContainer])
}

