import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { HelmetProvider } from 'react-helmet-async'

import { queryClient } from './lib/queryClient'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { ImageRefreshProvider } from './contexts/ImageRefreshContext'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { ProtectedManageRoute } from './components/auth/ProtectedManageRoute'
import { PublicRoute } from './components/auth/PublicRoute'
import { DashboardLayout } from './components/layout/DashboardLayout'
import { PageLoader } from './components/common/LoadingSpinner'
import { ErrorBoundary } from './components/common/ErrorBoundary'
import { NotFound } from './components/common/NotFound'
import { ScrollToTop } from './components/common/ScrollToTop'
import { useCleanupExpiredInvitations } from './hooks/useCleanupExpiredInvitations'
import { useRealtimeNotifications } from './hooks/useNotifications'
import { useRealtimePartnerConnection } from './hooks/useRealtimePartnerConnection'
import { useRealtimeProfile } from './hooks/useRealtimeProfile'
import { useNetworkStatus } from './hooks/useNetworkStatus'
import { useToastPosition } from './hooks/useToastPosition'

// Lazy load pages for better performance
const Home = lazy(() => import('./pages/public/Home').then(m => ({ default: m.Home })))
const Login = lazy(() => import('./pages/public/Login').then(m => ({ default: m.Login })))
const Signup = lazy(() => import('./pages/public/Signup').then(m => ({ default: m.Signup })))
const ConnectionTest = lazy(() => import('./pages/public/ConnectionTest').then(m => ({ default: m.ConnectionTest })))

const AuthenticatedHome = lazy(() => import('./pages/dashboard/AuthenticatedHome').then(m => ({ default: m.AuthenticatedHome })))
const Dashboard = lazy(() => import('./pages/protected/Dashboard').then(m => ({ default: m.Dashboard })))
const Checklist = lazy(() => import('./pages/protected/Checklist').then(m => ({ default: m.Checklist })))
const Financial = lazy(() => import('./pages/protected/Financial').then(m => ({ default: m.Financial })))
const Modules = lazy(() => import('./pages/public/Modules'))
const ModuleDetail = lazy(() => import('./pages/public/ModuleDetail'))
const Discussions = lazy(() => import('./pages/protected/Discussions').then(m => ({ default: m.Discussions })))
const Resources = lazy(() => import('./pages/protected/Resources').then(m => ({ default: m.Resources })))
const Profile = lazy(() => import('./pages/protected/Profile').then(m => ({ default: m.Profile })))
const ProfileSetup = lazy(() => import('./pages/protected/ProfileSetup').then(m => ({ default: m.ProfileSetup })))

const Appearance = lazy(() => import('./pages/manage/Appearance').then(m => ({ default: m.Appearance })))
const ManageDashboard = lazy(() => import('./pages/manage/ManageDashboard').then(m => ({ default: m.ManageDashboard })))
const ChecklistManager = lazy(() => import('./pages/manage/ChecklistManager').then(m => ({ default: m.ChecklistManager })))
const ModulesManager = lazy(() => import('./pages/manage/ModulesManager').then(m => ({ default: m.ModulesManager })))
const DiscussionsManager = lazy(() => import('./pages/manage/DiscussionsManager').then(m => ({ default: m.DiscussionsManager })))
const ResourcesManager = lazy(() => import('./pages/manage/ResourcesManager').then(m => ({ default: m.ResourcesManager })))

function AppContent() {
  // Cleanup expired invitations on app load
  useCleanupExpiredInvitations()
  // Subscribe to real-time notifications
  useRealtimeNotifications()
  // Real-time partner connection status (global)
  useRealtimePartnerConnection()
  // Real-time profile updates (global)
  useRealtimeProfile()
  // Monitor network status globally
  useNetworkStatus()

  return (
    <Suspense fallback={<PageLoader />}>
                  <Routes>
                  {/* Public Routes */}
                  <Route
                    path="/"
                    element={
                      <PublicRoute redirectTo="/home">
                        <Home />
                      </PublicRoute>
                    }
                  />
                  <Route
                    path="/login"
                    element={
                      <PublicRoute>
                        <Login />
                      </PublicRoute>
                    }
                  />
                  <Route
                    path="/signup"
                    element={
                      <PublicRoute>
                        <Signup />
                      </PublicRoute>
                    }
                  />
                  <Route
                    path="/test-connection"
                    element={<ConnectionTest />}
                  />

                  {/* Profile Setup Route - Protected but doesn't require complete profile */}
                  <Route
                    path="/profile-setup"
                    element={
                      <ProtectedRoute requireProfile={false}>
                        <ProfileSetup />
                      </ProtectedRoute>
                    }
                  />

                  {/* Protected Dashboard Routes - Require profile completion */}
                  <Route
                    element={
                      <ProtectedRoute requireProfile={true}>
                        <DashboardLayout />
                      </ProtectedRoute>
                    }
                  >
                    <Route path="/home" element={<AuthenticatedHome />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/checklist" element={<Checklist />} />
                    <Route path="/financial" element={<Financial />} />
                    <Route path="/modules" element={<Modules />} />
                    <Route path="/modules/:moduleId" element={<ModuleDetail />} />
                    <Route path="/discussions" element={<Discussions />} />
                    <Route path="/resources" element={<Resources />} />
                    <Route path="/profile" element={<Profile />} />
                  </Route>

                  {/* Management Routes - Admin only (RBAC protected) */}
                  <Route
                    element={
                      <ProtectedManageRoute>
                        <DashboardLayout />
                      </ProtectedManageRoute>
                    }
                  >
                    <Route path="/manage" element={<ManageDashboard />} />
                    <Route path="/manage/checklist" element={<ChecklistManager />} />
                    <Route path="/manage/modules" element={<ModulesManager />} />
                    <Route path="/manage/discussions" element={<DiscussionsManager />} />
                    <Route path="/manage/resources" element={<ResourcesManager />} />
                    <Route path="/manage/appearance" element={<Appearance />} />
                  </Route>

                  {/* Catch-all redirect */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
    </Suspense>
  )
}

function App() {
  const { position, containerStyle } = useToastPosition()

  return (
    <ErrorBoundary>
      <HelmetProvider>
        <ThemeProvider>
          <QueryClientProvider client={queryClient}>
            <ImageRefreshProvider>
              <BrowserRouter>
                <ScrollToTop />
                <AuthProvider>
                <AppContent />

              {/* Toast notifications - Theme-aware, responsive positioning */}
              <Toaster
                position={position}
                containerStyle={containerStyle}
                gutter={12}
                toastOptions={{
                  duration: 3000,
                  style: {
                    borderRadius: '12px',
                    padding: '12px 16px',
                    minWidth: '280px',
                    maxWidth: position === 'bottom-center' ? 'calc(100vw - 32px)' : '400px',
                    fontSize: '14px',
                    zIndex: 9999,
                    pointerEvents: 'auto',
                    margin: 0, // Remove default margin, use gutter instead
                    backgroundColor: 'var(--toast-bg)',
                    color: 'var(--toast-text)',
                    border: '1.5px solid var(--toast-border)',
                  },
                  success: {
                    style: {
                      backgroundColor: 'var(--toast-success-bg)',
                      color: 'var(--toast-success-text)',
                      border: '1.5px solid var(--toast-success-border)',
                    },
                    iconTheme: {
                      primary: 'var(--color-success)',
                      secondary: 'var(--color-success-foreground)',
                    },
                  },
                  error: {
                    style: {
                      backgroundColor: 'var(--toast-error-bg)',
                      color: 'var(--toast-error-text)',
                      border: '1.5px solid var(--toast-error-border)',
                    },
                    iconTheme: {
                      primary: 'var(--color-error)',
                      secondary: 'var(--color-error-foreground)',
                    },
                  },
                }}
              />
                </AuthProvider>
              </BrowserRouter>
            </ImageRefreshProvider>
          </QueryClientProvider>
        </ThemeProvider>
      </HelmetProvider>
    </ErrorBoundary>
  )
}

export default App
