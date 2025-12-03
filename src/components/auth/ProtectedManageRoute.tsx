import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { PageLoader } from '../common/LoadingSpinner'
import type { ReactNode } from 'react'

interface ProtectedManageRouteProps {
  children: ReactNode
}

// Admin-only route protection
// Following RBAC best practices: server-side authorization checks enforced via RLS
export function ProtectedManageRoute({ children }: ProtectedManageRouteProps) {
  const { isAuthenticated, isLoading, isAdmin } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return <PageLoader />
  }

  if (!isAuthenticated) {
    // Redirect to login but save the attempted location
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (!isAdmin) {
    // User is authenticated but not admin - redirect to dashboard
    // RLS policies will also prevent unauthorized access at the database level
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}
