import React, { useState, useRef, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Bell, Check, Trash2 } from 'lucide-react'
import { Button } from '../ui/Button'
import { Card, CardContent } from '../ui/Card'
import { useNotifications, useUnreadNotificationCount, useMarkNotificationRead, useMarkAllNotificationsRead, useDeleteNotification, useDeleteAllReadNotifications } from '../../hooks/useNotifications'
import { buildNotificationRoute } from '../../lib/notification-routes'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '../../lib/utils'
import { Portal } from './Portal'
import toast from 'react-hot-toast'
import { lockBodyScroll, unlockBodyScroll } from '../../utils/scrollLock'

/**
 * Notifications Bell Component - Mobile-First Design
 * Shows unread notification count and dropdown with notifications
 * Uses Supabase Realtime for instant updates (no external APIs)
 * Optimized for 320px+ viewports
 */
export function NotificationsBell() {
  const [isOpen, setIsOpen] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 })
  const buttonRef = useRef<HTMLButtonElement>(null)
  const { data: notifications = [], isLoading } = useNotifications()
  const { data: unreadCount = 0 } = useUnreadNotificationCount()
  const markReadMutation = useMarkNotificationRead()
  const markAllReadMutation = useMarkAllNotificationsRead()
  const deleteAllReadMutation = useDeleteAllReadNotifications()

  // Prioritize unread notifications - they should already be sorted by the hook
  const unreadNotifications = useMemo(() => notifications.filter(n => !n.is_read), [notifications])
  const readNotifications = useMemo(() => notifications.filter(n => n.is_read).slice(0, 5), [notifications])

  // Calculate dropdown position - Mobile-first
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const updatePosition = () => {
        if (!buttonRef.current) return
        
        const rect = buttonRef.current.getBoundingClientRect()
        const viewportWidth = window.innerWidth
        const viewportHeight = window.innerHeight
        
        // Mobile-first: full width minus safe margins
        const isMobile = viewportWidth < 640 // sm breakpoint (mobile-first)
        const mobilePadding = 16 // 4 * 4px = 16px
        const desktopWidth = 384 // w-96 = 384px
        const mobileWidth = viewportWidth - (mobilePadding * 2)
        
        const dropdownWidth = isMobile ? mobileWidth : desktopWidth
        const maxHeight = Math.min(viewportHeight * 0.75, 600) // 75vh max
        
        // Calculate position
        let top: number
        let left: number
        
        if (isMobile) {
          // Mobile: center horizontally, position above if near bottom
          left = mobilePadding
          
          // Check if button is in bottom 40% of screen
          const buttonBottomPercent = (rect.bottom / viewportHeight) * 100
          const spaceBelow = viewportHeight - rect.bottom
          
          if (buttonBottomPercent > 60 || spaceBelow < maxHeight + 20) {
            // Position above button
            top = rect.top - maxHeight - 12
            // Ensure it doesn't go off top
            if (top < mobilePadding) {
              top = mobilePadding
            }
          } else {
            // Position below button
            top = rect.bottom + 12
          }
        } else {
          // Desktop: align to button right edge
          left = rect.right - dropdownWidth
          // Ensure it doesn't go off left edge
          if (left < mobilePadding) {
            left = mobilePadding
          }
          
          // Position below button
          top = rect.bottom + 8
          // If not enough space below, position above
          if (top + maxHeight > viewportHeight - mobilePadding) {
            top = rect.top - maxHeight - 8
            if (top < mobilePadding) {
              top = mobilePadding
            }
          }
        }
        
        setPosition({ top, left, width: dropdownWidth })
      }
      
      updatePosition()
      
      // Update on resize/scroll
      window.addEventListener('resize', updatePosition)
      window.addEventListener('scroll', updatePosition, true)
      
      return () => {
        window.removeEventListener('resize', updatePosition)
        window.removeEventListener('scroll', updatePosition, true)
      }
    }
  }, [isOpen])

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  // Prevent body scroll when open on mobile (using centralized scroll lock)
  useEffect(() => {
    if (isOpen) {
      lockBodyScroll()
      return () => unlockBodyScroll()
    }
  }, [isOpen])

  const handleMarkRead = (notificationId: string) => {
    markReadMutation.mutate(notificationId)
  }

  const handleMarkAllRead = () => {
    markAllReadMutation.mutate()
  }

  const handleDeleteAllRead = () => {
    const readCount = readNotifications.length
    if (readCount === 0) return
    
    deleteAllReadMutation.mutate(undefined, {
      onSuccess: () => {
        toast.success(`Deleted ${readCount} notification${readCount > 1 ? 's' : ''}`, {
          duration: 3000,
        })
      },
      onError: () => {
        toast.error('Failed to delete notifications. Please try again.')
      },
    })
  }

  return (
    <>
      <div className="relative">
        <Button
          ref={buttonRef}
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="relative min-h-[44px] min-w-[44px] touch-manipulation"
          aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
          aria-expanded={isOpen}
        >
          <Bell className={cn(
            "h-5 w-5 transition-colors",
            unreadCount > 0 && "text-primary"
          )} />
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 20 }}
              className="absolute -top-1 -right-1 h-5 w-5 sm:h-6 sm:w-6 rounded-full bg-error text-error-foreground text-xs font-bold flex items-center justify-center min-w-[20px] shadow-lg ring-2 ring-background z-10"
              aria-label={`${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`}
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.span>
          )}
        </Button>
      </div>

      <Portal>
        <AnimatePresence>
          {isOpen && (
            <>
              {/* Backdrop - Mobile-first: darker on mobile for better visibility */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-[9998] bg-black/40 md:bg-black/20 dark:bg-black/60 md:dark:bg-black/40"
                onClick={() => setIsOpen(false)}
              />
              
              {/* Dropdown - Mobile-first responsive */}
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="fixed z-[9999] max-h-[75vh] overflow-hidden"
                style={{
                  top: `${position.top}px`,
                  left: `${position.left}px`,
                  width: `${position.width}px`,
                }}
              >
                <Card className="shadow-2xl border-border w-full" padding="none">
                  {/* Header - Mobile-first padding */}
                  <div className="p-3 sm:p-4 border-b border-border flex items-center justify-between gap-2 sm:gap-3">
                    <h3 className="font-semibold text-foreground text-base sm:text-lg">Notifications</h3>
                    <div className="flex items-center gap-1 sm:gap-2">
                      {readNotifications.length > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleDeleteAllRead}
                          disabled={deleteAllReadMutation.isPending}
                          className="text-xs sm:text-sm min-h-[36px] px-2 sm:px-3 touch-manipulation whitespace-nowrap text-muted-foreground hover:text-destructive"
                          leftIcon={<Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />}
                          aria-label={`Clear all ${readNotifications.length} read notification${readNotifications.length > 1 ? 's' : ''}`}
                        >
                          Clear All
                        </Button>
                      )}
                      {unreadCount > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleMarkAllRead}
                          disabled={markAllReadMutation.isPending}
                          className="text-xs sm:text-sm min-h-[36px] px-2 sm:px-3 touch-manipulation whitespace-nowrap"
                        >
                          Mark all read
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {/* Content - Mobile-first scrollable */}
                  <CardContent className="p-0 max-h-[calc(75vh-60px)] overflow-y-auto overscroll-contain">
                    {isLoading ? (
                      <div className="p-6 sm:p-8 text-center text-muted-foreground text-sm sm:text-base">
                        Loading notifications...
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="p-6 sm:p-8 text-center text-muted-foreground text-sm sm:text-base">
                        No notifications yet
                      </div>
                    ) : unreadNotifications.length === 0 && readNotifications.length === 0 ? (
                      <div className="p-6 sm:p-8 text-center text-muted-foreground text-sm sm:text-base">
                        No notifications yet
                      </div>
                    ) : (
                      <div className="divide-y divide-border">
                        {/* Unread notifications - Always show first if they exist */}
                        {unreadNotifications.length > 0 && (
                          <>
                            <div className="px-3 sm:px-4 py-2 bg-primary/10 dark:bg-primary/20 border-b border-primary/20">
                              <p className="text-xs sm:text-sm font-semibold text-primary">
                                {unreadNotifications.length} unread notification{unreadNotifications.length > 1 ? 's' : ''}
                              </p>
                            </div>
                            {unreadNotifications.map((notification) => (
                              <NotificationItem
                                key={notification.id}
                                notification={notification}
                                onMarkRead={() => handleMarkRead(notification.id)}
                                onNavigate={() => {
                                  setIsOpen(false)
                                }}
                                isUnread
                              />
                            ))}
                            {readNotifications.length > 0 && (
                              <div className="px-3 sm:px-4 py-2 bg-muted/30 border-t border-border">
                                <p className="text-xs sm:text-sm font-medium text-muted-foreground">Earlier</p>
                              </div>
                            )}
                          </>
                        )}
                        {/* Read notifications - Only show if there are unread OR if there are no unread but there are read */}
                        {readNotifications.length > 0 && (
                          <>
                            {readNotifications.map((notification) => (
                              <NotificationItem
                                key={notification.id}
                                notification={notification}
                                onMarkRead={() => handleMarkRead(notification.id)}
                                onNavigate={() => {
                                  setIsOpen(false)
                                }}
                                isUnread={false}
                              />
                            ))}
                          </>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </Portal>
    </>
  )
}

interface NotificationItemProps {
  notification: {
    id: string
    type: string
    title: string
    message: string
    related_entity_type: string | null
    related_entity_id: string | null
    is_read: boolean
    created_at: string
  }
  onMarkRead: () => void
  onNavigate: () => void
  isUnread: boolean
}

function NotificationItem({ notification, onMarkRead, onNavigate, isUnread }: NotificationItemProps) {
  const navigate = useNavigate()
  const deleteMutation = useDeleteNotification()
  const [swipeOffset, setSwipeOffset] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const itemRef = useRef<HTMLDivElement>(null)
  const startXRef = useRef<number>(0)
  const isDraggingRef = useRef(false)
  const deletedNotificationRef = useRef<typeof notification | null>(null)

  // Swipe gesture handling for mobile
  const startYRef = useRef<number>(0)
  const isHorizontalSwipeRef = useRef<boolean | null>(null)

  const handleTouchStart = (e: React.TouchEvent) => {
    startXRef.current = e.touches[0].clientX
    startYRef.current = e.touches[0].clientY
    isDraggingRef.current = false
    isHorizontalSwipeRef.current = null
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingRef.current) {
      isDraggingRef.current = true
    }
    
    const currentX = e.touches[0].clientX
    const currentY = e.touches[0].clientY
    const diffX = startXRef.current - currentX
    const diffY = Math.abs(startYRef.current - currentY)
    
    // Determine if this is a horizontal or vertical swipe
    if (isHorizontalSwipeRef.current === null) {
      // Check if horizontal movement is greater than vertical
      isHorizontalSwipeRef.current = Math.abs(diffX) > diffY && Math.abs(diffX) > 10
    }
    
    // Only allow swipe left if it's a horizontal swipe
    if (isHorizontalSwipeRef.current && diffX > 0) {
      setSwipeOffset(Math.min(diffX, 80)) // Max 80px swipe
    } else if (isHorizontalSwipeRef.current === false) {
      // Vertical scroll - reset swipe
      setSwipeOffset(0)
    }
  }

  const handleTouchEnd = () => {
    if (swipeOffset > 40 && isHorizontalSwipeRef.current) {
      // Swipe threshold reached - show delete button
      setSwipeOffset(80)
    } else {
      // Reset swipe
      setSwipeOffset(0)
    }
    isDraggingRef.current = false
    isHorizontalSwipeRef.current = null
  }

  const handleDelete = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation()
    }
    
    setIsDeleting(true)
    deletedNotificationRef.current = notification
    
    deleteMutation.mutate(notification.id, {
      onSuccess: () => {
        toast.success('Notification deleted', {
          duration: 3000,
        })
      },
      onError: () => {
        setIsDeleting(false)
        setSwipeOffset(0)
        toast.error('Failed to delete notification. Please try again.')
      },
    })
  }

  const handleClick = () => {
    // Don't navigate if swiping (swipe-to-delete is secondary method)
    if (isDraggingRef.current || swipeOffset > 0) {
      setSwipeOffset(0)
      return
    }

    // Mark as read if unread
    if (isUnread) {
      onMarkRead()
    }
    
    // Build route using centralized configuration
    const route = buildNotificationRoute({
      type: notification.type,
      related_entity_type: notification.related_entity_type,
      related_entity_id: notification.related_entity_id,
    })
    
    if (route) {
      onNavigate() // Close dropdown
      // Small delay to ensure dropdown closes smoothly
      setTimeout(() => {
        navigate(route)
      }, 100)
    }
  }

  // Remove from DOM immediately when deleting
  if (isDeleting) {
    return null
  }

  return (
    <div className="relative overflow-hidden touch-pan-y">
      {/* Delete button - revealed on swipe (secondary method, always-visible button is primary) */}
      <motion.div
        className="absolute right-0 top-0 bottom-0 flex items-center justify-center bg-destructive z-10"
        style={{
          width: '80px',
        }}
        animate={{
          x: swipeOffset > 0 ? 0 : 80,
          opacity: swipeOffset > 0 ? 1 : 0,
        }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
      >
        <button
          onClick={handleDelete}
          className="h-full w-full flex items-center justify-center touch-manipulation min-h-[60px] sm:min-h-[64px] active:bg-destructive/90"
          aria-label="Delete notification (swipe action)"
        >
          <Trash2 className="h-6 w-6 text-destructive-foreground" />
        </button>
      </motion.div>

      {/* Notification content */}
      <motion.div
        ref={itemRef}
        className={cn(
          'p-3 sm:p-4 active:bg-accent/70 transition-colors cursor-pointer touch-manipulation min-h-[60px] sm:min-h-[64px] relative bg-background',
          isUnread && 'bg-primary/5 dark:bg-primary/10'
        )}
        onClick={handleClick}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        animate={{
          x: -swipeOffset,
        }}
        transition={{ duration: swipeOffset > 0 ? 0.2 : 0.3, ease: 'easeOut' }}
        style={{
          touchAction: swipeOffset > 0 ? 'none' : 'pan-y', // Allow vertical scrolling, prevent horizontal when swiping
        }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            handleClick()
          }
          if (e.key === 'Delete' || e.key === 'Backspace') {
            e.preventDefault()
            handleDelete()
          }
        }}
        aria-label={`${notification.title}. ${notification.message}. Click to view. Press Delete to remove.`}
      >
        <div className="flex items-start gap-2 sm:gap-3">
          <div className="flex-1 min-w-0 pr-2">
            <p className={cn(
              'text-sm sm:text-base font-medium leading-snug',
              isUnread ? 'text-foreground' : 'text-muted-foreground'
            )}>
              {notification.title}
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 leading-relaxed">
              {notification.message}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
            </p>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            {/* Delete button - ALWAYS VISIBLE on all devices */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleDelete(e)
              }}
              disabled={deleteMutation.isPending}
              className={cn(
                "flex-shrink-0 p-2.5 rounded-lg transition-all touch-manipulation",
                "min-h-[44px] min-w-[44px] flex items-center justify-center group",
                "active:bg-destructive/20 active:scale-95",
                "hover:bg-destructive/10 hover:text-destructive",
                "focus:outline-none focus:ring-2 focus:ring-destructive/50 focus:ring-offset-2",
                deleteMutation.isPending && "opacity-50 cursor-not-allowed"
              )}
              aria-label="Delete notification"
            >
              <Trash2 
                className={cn(
                  "h-4 w-4 sm:h-5 sm:w-5 transition-colors",
                  "text-muted-foreground group-hover:text-destructive",
                  deleteMutation.isPending && "animate-pulse"
                )} 
                aria-hidden="true"
              />
            </button>
            {isUnread && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onMarkRead()
                }}
                className="flex-shrink-0 p-2.5 rounded-lg active:bg-accent/70 hover:bg-accent/50 transition-colors touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2"
                aria-label="Mark as read"
              >
                <Check 
                  className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" 
                  aria-hidden="true"
                />
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
