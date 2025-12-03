import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { PageLoader } from '../common/LoadingSpinner'
import { useMemo } from 'react'

interface PublicRouteProps {
  children: React.ReactNode
  redirectTo?: string
}

/**
 * PublicRoute Component
 * 
 * Prevents authenticated users from accessing public pages (landing, login, signup).
 * 
 * Best Practices Implemented:
 * 1. Redirects authenticated users to personalized dashboard (/home)
 * 2. Preserves intended destination when available
 * 3. Handles profile completion state appropriately
 * 4. Prevents redirect loops with proper path checking
 * 
 * Implications:
 * - UX: Authenticated users see relevant content, not marketing material
 * - Security: Clear separation between public and authenticated areas
 * - Performance: Avoids loading unnecessary public page content
 * - Navigation: Maintains logical flow and prevents confusion
 */
export function PublicRoute({ children, redirectTo = '/home' }: PublicRouteProps) {
  const { user, isLoading, profile } = useAuth()
  const location = useLocation()

  // Determine the best redirect destination
  const redirectPath = useMemo(() => {
    // Priority 1: If there's a saved location from a protected route, use that
    const from = location.state?.from?.pathname
    if (from && from !== location.pathname && from.startsWith('/')) {
      // Only redirect to valid paths (not external URLs)
      return from
    }
    
    // Priority 2: If profile is complete, redirect to authenticated home
    if (profile && profile.first_name && profile.date_of_birth && profile.gender && profile.marital_status) {
      return '/home'
    }
    
    // Priority 3: If profile is incomplete, redirect to profile setup
    if (user && profile && (!profile.first_name || !profile.date_of_birth || !profile.gender || !profile.marital_status)) {
      return '/profile-setup'
    }
    
    // Priority 4: Default redirect (authenticated home)
    return redirectTo
  }, [location.state?.from?.pathname, location.pathname, redirectTo, user, profile])

  // Show loading state while checking authentication
  if (isLoading) {
    return <PageLoader />
  }

  // If user is authenticated, redirect them away from public routes
  if (user) {
    const currentPath = location.pathname
    const isPublicRoute = currentPath === '/' || currentPath === '/login' || currentPath === '/signup'
    
    // Always redirect authenticated users away from public routes
    // Signup page will handle its own redirect logic in useEffect
    if (isPublicRoute && redirectPath !== currentPath) {
      return <Navigate to={redirectPath} replace />
    }
  }

  // Allow unauthenticated users to see public content
  return <>{children}</>
}
