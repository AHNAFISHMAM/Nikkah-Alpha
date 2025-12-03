import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { PageLoader } from '../common/LoadingSpinner'
import { useMemo, useState, useEffect } from 'react'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireProfile?: boolean
}

export function ProtectedRoute({ children, requireProfile = false }: ProtectedRouteProps) {
  const { user, isLoading, profile } = useAuth()
  const location = useLocation()
  const [profileLoadTimeout, setProfileLoadTimeout] = useState(false)

  // Give profile a reasonable time to load (2 seconds) before timing out
  useEffect(() => {
    if (requireProfile && user && !profile && !isLoading) {
      const timer = setTimeout(() => {
        setProfileLoadTimeout(true)
      }, 2000)
      return () => clearTimeout(timer)
    } else {
      setProfileLoadTimeout(false)
    }
  }, [requireProfile, user, profile, isLoading])

  // Memoize to prevent unnecessary re-renders
  // Check if profile setup is incomplete (missing essential fields)
  const shouldRedirectToProfile = useMemo(() => {
    if (!requireProfile || !profile) return false
    
    // Profile setup is incomplete if essential fields are missing
    const isIncomplete = !profile.first_name || !profile.date_of_birth || !profile.gender || !profile.marital_status
    
    return isIncomplete
  }, [requireProfile, profile])

  // Show loading state - wait a bit longer to ensure auth state is settled
  if (isLoading) {
    return <PageLoader />
  }

  // Redirect unauthenticated users to login
  // Add a small delay check to avoid race conditions with state updates
  if (!user) {
    // Only redirect if we're not already on the login page
    if (location.pathname !== '/login') {
      return <Navigate to="/login" state={{ from: location }} replace />
    }
    return <PageLoader />
  }

  // If profile is required but not loaded yet, show loading
  // But timeout after 2 seconds to prevent infinite loading
  if (requireProfile && !profile && user && !profileLoadTimeout) {
    return <PageLoader />
  }

  // If profile is required and user hasn't completed profile setup
  // Redirect to dedicated profile setup page
  if (shouldRedirectToProfile) {
    // Only redirect if we're not already on the profile-setup page
    if (location.pathname !== '/profile-setup') {
      return <Navigate to="/profile-setup" replace />
    }
  }

  return <>{children}</>
}
