import { memo, useCallback } from 'react'
import { NavLink, useLocation, Link } from 'react-router-dom'
import {
  LayoutDashboard,
  CheckSquare,
  Calculator,
  BookOpen,
  MessageCircle,
  Library,
  User,
  Shield,
} from 'lucide-react'
import { cn } from '../../lib/utils'
import { useAuth } from '../../contexts/AuthContext'
import { useViewport } from '../../hooks/useViewport'
import { ThemeToggle } from '../common/ThemeToggle'
import { NotificationsBell } from '../common/NotificationsBell'

// Navigation items configuration
const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/checklist', label: 'Checklist', icon: CheckSquare },
  { path: '/financial', label: 'Financial', icon: Calculator },
  { path: '/modules', label: 'Learn', icon: BookOpen },
  { path: '/discussions', label: 'Discuss', icon: MessageCircle },
  { path: '/resources', label: 'Resources', icon: Library },
  // Profile moved to footer (next to Theme Toggle)
] as const

// Mobile bottom navigation: Only 3 items (Checklist, Dashboard, Profile)
// All other items moved to hamburger menu in top header

// Active state uses CSS classes (bg-badge-gradient) for theme compatibility

// Component implementation
function DashboardNavComponent() {
  const location = useLocation()
  const { isAuthenticated, isAdmin } = useAuth()
  const { showNavLabels } = useViewport()

  // Helper function to check if a path is active (memoized)
  const isPathActive = useCallback(
    (path: string) => {
      if (path === '/dashboard') {
        return location.pathname === '/dashboard'
      }
      if (path === '/modules') {
        return location.pathname === '/modules' || location.pathname.startsWith('/modules/')
      }
      return location.pathname === path || location.pathname.startsWith(`${path}/`)
    },
    [location.pathname]
  )

  return (
    <>
      {/* Mobile Bottom Navigation - 3 items: Checklist, Dashboard, Profile */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-lg border-t border-border z-50 safe-area-inset-bottom shadow-lg"
        aria-label="Mobile navigation"
      >
        <div className="flex items-center justify-around px-2 sm:px-4 py-2 safe-area-inset-left safe-area-inset-right">
          {/* Checklist - First */}
          <div className="flex-1 min-w-0 max-w-[33.33%]">
            <NavLink
              to="/checklist"
              className={cn(
                'flex flex-col items-center justify-center rounded-xl transition-all duration-200 touch-manipulation relative',
                'py-2 px-1 sm:px-2 min-h-[56px] sm:min-h-[60px]',
                isPathActive('/checklist')
                  ? 'bg-badge-gradient border border-islamic-gold font-medium text-foreground'
                  : 'text-muted-foreground active:bg-accent/50'
              )}
              aria-current={isPathActive('/checklist') ? 'page' : undefined}
              aria-label="Checklist"
            >
              {isPathActive('/checklist') && (
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent rounded-xl dark:from-islamic-gold/20" />
              )}
              <div className={cn(
                'relative z-10 transition-transform duration-200',
                isPathActive('/checklist') && 'scale-110'
              )}>
                <CheckSquare
                  className={cn(
                    'h-6 w-6 sm:h-7 sm:w-7 transition-colors flex-shrink-0',
                    isPathActive('/checklist') && 'text-foreground'
                  )}
                  aria-hidden="true"
                />
              </div>
              <span className="text-[10px] sm:text-[11px] leading-tight text-center font-medium truncate w-full mt-1 relative z-10 px-1">
                Checklist
              </span>
            </NavLink>
          </div>
          
          {/* Dashboard - Middle */}
          <div className="flex-1 min-w-0 max-w-[33.33%]">
            <NavLink
              to="/dashboard"
              end
              className={cn(
                'flex flex-col items-center justify-center rounded-xl transition-all duration-200 touch-manipulation relative',
                'py-2 px-1 sm:px-2 min-h-[56px] sm:min-h-[60px]',
                isPathActive('/dashboard')
                  ? 'bg-badge-gradient border border-islamic-gold font-medium text-foreground'
                  : 'text-muted-foreground active:bg-accent/50'
              )}
              aria-current={isPathActive('/dashboard') ? 'page' : undefined}
              aria-label="Dashboard"
            >
              {isPathActive('/dashboard') && (
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent rounded-xl dark:from-islamic-gold/20" />
              )}
              <div className={cn(
                'relative z-10 transition-transform duration-200',
                isPathActive('/dashboard') && 'scale-110'
              )}>
                <LayoutDashboard
                  className={cn(
                    'h-6 w-6 sm:h-7 sm:w-7 transition-colors flex-shrink-0',
                    isPathActive('/dashboard') && 'text-foreground'
                  )}
                  aria-hidden="true"
                />
              </div>
              <span className="text-[10px] sm:text-[11px] leading-tight text-center font-medium truncate w-full mt-1 relative z-10 px-1">
                Dashboard
              </span>
            </NavLink>
          </div>
          
          {/* Profile - Last */}
          <div className="flex-1 min-w-0 max-w-[33.33%]">
            <NavLink
              to="/profile"
              className={cn(
                'flex flex-col items-center justify-center rounded-xl transition-all duration-200 touch-manipulation relative',
                'py-2 px-1 sm:px-2 min-h-[56px] sm:min-h-[60px]',
                isPathActive('/profile')
                  ? 'bg-badge-gradient border border-islamic-gold font-medium text-foreground'
                  : 'text-muted-foreground active:bg-accent/50'
              )}
              aria-current={isPathActive('/profile') ? 'page' : undefined}
              aria-label="Profile"
            >
              {isPathActive('/profile') && (
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent rounded-xl dark:from-islamic-gold/20" />
              )}
              <div className={cn(
                'relative z-10 transition-transform duration-200',
                isPathActive('/profile') && 'scale-110'
              )}>
                <User
                  className={cn(
                    'h-6 w-6 sm:h-7 sm:w-7 transition-colors flex-shrink-0',
                    isPathActive('/profile') && 'text-foreground'
                  )}
                  aria-hidden="true"
                />
              </div>
              <span className="text-[10px] sm:text-[11px] leading-tight text-center font-medium truncate w-full mt-1 relative z-10 px-1">
                Profile
              </span>
            </NavLink>
          </div>
        </div>
      </nav>

      {/* Desktop Sidebar Navigation */}
      <aside
        className="hidden lg:flex flex-col fixed left-0 top-0 h-screen w-56 xl:w-64 bg-card border-r border-border z-40"
        aria-label="Main navigation"
      >
        {/* Logo and Brand Name - Clickable to go to home */}
        <Link
          to="/home"
          className="flex items-center gap-3 px-6 py-6 border-b border-border hover:bg-accent/50 transition-colors cursor-pointer group focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-islamic-gold rounded-sm"
          aria-label="Go to home"
        >
          <img
            src="/logo.svg"
            alt="NikahPrep Logo - Crescent Moon and Heart"
            className="h-10 w-10 object-contain flex-shrink-0 transition-transform duration-200 group-hover:scale-110"
            width={40}
            height={40}
            loading="eager"
            decoding="async"
          />
          <span className="text-xl font-bold text-foreground group-hover:text-primary transition-colors duration-200">
            NikahPrep
          </span>
        </Link>

        {/* Nav Links */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto" aria-label="Main navigation">
          {navItems.map((item) => {
            if (!item || !item.path) return null
            const isActive = isPathActive(item.path)
            const Icon = item.icon

            return (
              <div
                key={item.path}
                className="transform transition-transform duration-200 hover:translate-x-1"
              >
                <NavLink
                  to={item.path}
                  end={item.path === '/dashboard'}
                  className={cn(
                    'group flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition-all duration-200 min-h-[44px] cursor-pointer relative overflow-hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-islamic-gold',
                    isActive
                      ? 'bg-badge-gradient border border-islamic-gold font-medium text-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {/* Translucent brand overlay on active */}
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent dark:from-islamic-gold/20" />
                  )}
                  <div
                    className={cn(
                      'transition-transform duration-200',
                      isActive && 'scale-110 rotate-[5deg]'
                    )}
                  >
                    <Icon
                      className={cn(
                        'h-5 w-5 transition-colors relative z-10',
                        isActive
                          ? 'text-[#8B5A2B] dark:text-background'
                          : 'group-hover:text-primary'
                      )}
                      aria-hidden="true"
                    />
                  </div>
                  <span className="relative z-10">{item.label}</span>
                </NavLink>
              </div>
            )
          })}

          {/* Management Link - Admin only */}
          {isAuthenticated && isAdmin && (
            <>
              <div className="my-4 border-t border-border" role="separator" aria-orientation="horizontal" />
              <div className="transform transition-transform duration-200 hover:translate-x-1">
                <NavLink
                  to="/manage"
                  end={false}
                  className={cn(
                    'group flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition-all duration-200 min-h-[44px] cursor-pointer relative overflow-hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-islamic-gold',
                    isPathActive('/manage')
                      ? 'bg-badge-gradient border border-islamic-gold font-medium text-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  )}
                  aria-current={isPathActive('/manage') ? 'page' : undefined}
                >
                  {isPathActive('/manage') && (
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent dark:from-islamic-gold/20" />
                  )}
                  <div
                    className={cn(
                      'transition-transform duration-200',
                      isPathActive('/manage') && 'scale-110 rotate-[5deg]'
                    )}
                  >
                    <Shield
                      className={cn(
                        'h-5 w-5 transition-colors relative z-10',
                        isPathActive('/manage')
                          ? 'text-[#8B5A2B] dark:text-background'
                          : 'group-hover:text-primary'
                      )}
                      aria-hidden="true"
                    />
                  </div>
                  <span className="relative z-10">Manage</span>
                </NavLink>
              </div>
            </>
          )}
        </nav>

        {/* Footer with Profile and Theme Toggle */}
        <div className="px-4 py-4 border-t border-border space-y-3">
          {/* Profile and Theme Toggle - Horizontal Layout */}
          <div className="flex items-center gap-2">
            {/* Profile Link */}
            <NavLink
              to="/profile"
              className={cn(
                'flex-1 flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm transition-all duration-200 min-h-[44px] cursor-pointer relative overflow-hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-islamic-gold group',
                isPathActive('/profile')
                  ? 'bg-badge-gradient border border-islamic-gold font-medium text-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              )}
              aria-current={isPathActive('/profile') ? 'page' : undefined}
            >
              {isPathActive('/profile') && (
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent dark:from-islamic-gold/20" />
              )}
              <User
                className={cn(
                  'h-4 w-4 transition-colors relative z-10 flex-shrink-0',
                  isPathActive('/profile')
                    ? 'text-[#8B5A2B] dark:text-background'
                    : 'group-hover:text-primary'
                )}
                aria-hidden="true"
              />
              <span className="relative z-10 truncate">Profile</span>
            </NavLink>

            {/* Notifications Bell */}
            <div className="flex-shrink-0">
              <NotificationsBell />
            </div>

            {/* Theme Toggle */}
            <div className="flex-shrink-0">
              <ThemeToggle variant="button" size="sm" showLabel={false} />
            </div>
          </div>

          {/* Tagline */}
          <p className="text-xs text-muted-foreground text-center">
            Prepare for your blessed union
          </p>
        </div>
      </aside>
    </>
  )
}

// Memoized export for performance optimization
export const DashboardNav = memo(DashboardNavComponent)
