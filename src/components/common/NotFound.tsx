import { Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { PageLoader } from './LoadingSpinner'

export function NotFound() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return <PageLoader />
  }

  // Redirect authenticated users to dashboard, unauthenticated to home
  return <Navigate to={user ? '/dashboard' : '/'} replace />
}

