import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { NavLink, useLocation } from 'react-router-dom'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { Portal } from './Portal'
import { cn } from '../../lib/utils'
import { useAuth } from '../../contexts/AuthContext'
import { NotificationsBell } from './NotificationsBell'
import {
  Calculator,
  BookOpen,
  Library,
  MessageCircle,
  Shield,
} from 'lucide-react'

interface MoreMenuItem {
  path: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  adminOnly?: boolean
}

const moreMenuItems: MoreMenuItem[] = [
  { path: '/financial', label: 'Financial', icon: Calculator },
  { path: '/modules', label: 'Learn', icon: BookOpen },
  { path: '/resources', label: 'Resources', icon: Library },
  { path: '/discussions', label: 'Discussions', icon: MessageCircle },
  { path: '/manage', label: 'Manage', icon: Shield, adminOnly: true },
]

export function MoreMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 })
  const buttonRef = useRef<HTMLButtonElement>(null)
  const location = useLocation()
  const { isAdmin } = useAuth()

  const visibleItems = moreMenuItems.filter(item => !item.adminOnly || isAdmin)

  // Calculate menu position
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const updatePosition = () => {
        if (!buttonRef.current) return
        
        const rect = buttonRef.current.getBoundingClientRect()
        const viewportHeight = window.innerHeight
        const menuWidth = 240
        const menuItemHeight = 48
        const notificationsSectionHeight = 80 // Height for notifications section
        const menuHeight = visibleItems.length * menuItemHeight + notificationsSectionHeight + 16
        
        // Position below button (top-right corner)
        let top = rect.bottom + 8
        let left = rect.right - menuWidth
        
        // Ensure menu stays within viewport
        if (left < 16) {
          left = 16
        }
        if (top + menuHeight > viewportHeight - 16) {
          // If not enough space below, position above
          top = rect.top - menuHeight - 8
          if (top < 16) {
            top = 16
          }
        }
        
        setPosition({ top, left, width: menuWidth })
      }
      
      updatePosition()
      window.addEventListener('resize', updatePosition)
      window.addEventListener('scroll', updatePosition, true)
      
      return () => {
        window.removeEventListener('resize', updatePosition)
        window.removeEventListener('scroll', updatePosition, true)
      }
    }
  }, [isOpen, visibleItems.length])

  // Close on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  // Prevent body scroll when open on mobile
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = ''
      }
    }
  }, [isOpen])

  const isPathActive = (path: string) => {
    if (path === '/dashboard') return location.pathname === '/dashboard'
    return location.pathname === path || location.pathname.startsWith(`${path}/`)
  }

  return (
    <>
      <Button
        ref={buttonRef}
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative min-h-[44px] min-w-[44px] touch-manipulation bg-transparent hover:bg-transparent active:bg-transparent transition-all duration-200"
        aria-label="Menu"
        aria-expanded={isOpen}
      >
        {isOpen ? (
          <X className="h-6 w-6 text-foreground transition-transform duration-200" />
        ) : (
          <Menu className="h-6 w-6 text-foreground transition-transform duration-200" />
        )}
      </Button>

      <Portal>
        <AnimatePresence>
          {isOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-[9998] bg-black/20 md:bg-black/10"
                onClick={() => setIsOpen(false)}
              />
              
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="fixed z-[9999]"
                style={{
                  top: `${position.top}px`,
                  left: `${position.left}px`,
                  width: `${position.width}px`,
                }}
              >
                <Card className="shadow-2xl border-border p-2" padding="none">
                  {/* Notifications - First item in dropdown */}
                  <div className="px-3 py-2 border-b border-border mb-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Notifications
                      </span>
                    </div>
                    <div className="flex justify-center">
                      <NotificationsBell />
                    </div>
                  </div>
                  
                  {/* Other menu items */}
                  {visibleItems.map((item) => {
                    const Icon = item.icon
                    const isActive = isPathActive(item.path)
                    
                    return (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={() => setIsOpen(false)}
                        className={cn(
                          'flex items-center gap-3 px-3 py-3 rounded-lg transition-colors touch-manipulation min-h-[44px]',
                          isActive
                            ? 'bg-primary/10 text-foreground font-medium'
                            : 'text-muted-foreground active:bg-accent active:text-foreground'
                        )}
                      >
                        <Icon className="h-5 w-5 flex-shrink-0" />
                        <span className="text-sm">{item.label}</span>
                      </NavLink>
                    )
                  })}
                </Card>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </Portal>
    </>
  )
}

