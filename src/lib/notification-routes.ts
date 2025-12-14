/**
 * Notification Routing Configuration
 * 
 * Centralized configuration for mapping notification types to their target routes.
 * This system supports:
 * - Route with hash anchors (scroll to specific section)
 * - Route with query parameters (filter/search)
 * - Route with dynamic segments (entity IDs)
 * - Simple routes (direct navigation)
 * 
 * To add a new notification type:
 * 1. Add the notification type to NotificationRouteConfig
 * 2. Define the route pattern (path, hash, query, etc.)
 * 3. Add the corresponding section ID to the target page
 * 4. Add scroll-to-section logic if using hash anchors
 * 
 * @example
 * // Simple route
 * { type: 'welcome', route: { path: '/dashboard' } }
 * 
 * // Route with hash anchor
 * { type: 'partner_invitation', route: { path: '/profile', hash: 'partner-connection' } }
 * 
 * // Route with query parameter
 * { type: 'discussion_reminder', route: { path: '/discussions', query: { highlight: 'prompt-123' } } }
 * 
 * // Route with dynamic segment
 * { type: 'module_completed', route: { path: '/modules', dynamicSegment: 'moduleId', entityIdField: 'related_entity_id' } }
 */

export interface NotificationRoute {
  /** Base path to navigate to */
  path: string
  /** Hash anchor to scroll to (e.g., 'partner-connection') */
  hash?: string
  /** Query parameters as key-value pairs */
  query?: Record<string, string>
  /** Dynamic route segment name (e.g., 'moduleId' for /modules/:moduleId) */
  dynamicSegment?: string
  /** Field name to use for dynamic segment value (default: 'related_entity_id') */
  entityIdField?: 'related_entity_id' | 'related_entity_type'
}

export interface NotificationRouteConfig {
  /** Notification type from database */
  type: string
  /** Route configuration */
  route: NotificationRoute
  /** Optional: Custom handler function for complex navigation logic */
  handler?: (notification: {
    type: string
    related_entity_type: string | null
    related_entity_id: string | null
  }) => string | null
}

/**
 * Notification routing configuration
 * Add new notification types here as your app grows
 */
export const NOTIFICATION_ROUTES: NotificationRouteConfig[] = [
  // Partner-related notifications
  {
    type: 'partner_invitation',
    route: {
      path: '/profile',
      hash: 'partner-connection',
    },
  },
  {
    type: 'invitation_accepted',
    route: {
      path: '/profile',
      hash: 'partner-connection',
    },
  },
  {
    type: 'invitation_declined',
    route: {
      path: '/profile',
      hash: 'partner-connection',
    },
  },
  {
    type: 'partner_disconnected',
    route: {
      path: '/profile',
      hash: 'partner-connection',
    },
  },
  
  // Discussion-related notifications (future)
  {
    type: 'discussion_reminder',
    route: {
      path: '/discussions',
      query: { highlight: 'prompt' }, // Will be replaced with actual prompt ID
    },
    handler: (notification) => {
      if (notification.related_entity_id) {
        return `/discussions?highlight=${notification.related_entity_id}`
      }
      return '/discussions'
    },
  },
  {
    type: 'partner_discussion_answer',
    route: {
      path: '/discussions',
      hash: 'discussions',
    },
  },
  
  // Module-related notifications (future)
  {
    type: 'module_completed',
    route: {
      path: '/modules',
      hash: 'modules',
    },
  },
  {
    type: 'module_reminder',
    route: {
      path: '/modules',
      hash: 'modules',
    },
  },
  
  // Checklist-related notifications (future)
  {
    type: 'checklist_item_reminder',
    route: {
      path: '/checklist',
      hash: 'checklist',
    },
  },
  {
    type: 'checklist_milestone',
    route: {
      path: '/checklist',
      hash: 'checklist',
    },
  },
  
  // Financial-related notifications (future)
  {
    type: 'budget_alert',
    route: {
      path: '/financial',
      hash: 'budget',
    },
  },
  {
    type: 'savings_goal_reminder',
    route: {
      path: '/financial',
      hash: 'savings',
    },
  },
  
  // Resource-related notifications (future)
  {
    type: 'new_resource_available',
    route: {
      path: '/resources',
      hash: 'resources',
    },
  },
  {
    type: 'favorite_resource_updated',
    route: {
      path: '/resources',
      hash: 'favorites',
      query: { favorites: 'true' },
    },
  },
  
  // Dashboard notifications (future)
  {
    type: 'readiness_milestone',
    route: {
      path: '/dashboard',
      hash: 'readiness-score',
    },
  },
  {
    type: 'progress_update',
    route: {
      path: '/dashboard',
      hash: 'progress',
    },
  },
]

/**
 * Build navigation URL from notification route configuration
 * 
 * @param notification - Notification object with type and related entity info
 * @returns Complete URL string with path, hash, and query params, or null if no route found
 */
import { logWarning } from './logger'

export function buildNotificationRoute(notification: {
  type: string
  related_entity_type: string | null
  related_entity_id: string | null
}): string | null {
  // Find route configuration for this notification type
  const config = NOTIFICATION_ROUTES.find((r) => r.type === notification.type)
  
  if (!config) {
    // Default fallback: navigate to dashboard
    logWarning(`No route configured for notification type: ${notification.type}`, 'NotificationRoutes')
    return '/dashboard'
  }
  
  // Use custom handler if provided
  if (config.handler) {
    return config.handler(notification)
  }
  
  // Build route from configuration
  const { route } = config
  let url = route.path
  
  // Add dynamic segment if specified
  if (route.dynamicSegment) {
    const entityIdField = route.entityIdField || 'related_entity_id'
    const entityId = entityIdField === 'related_entity_id' 
      ? notification.related_entity_id 
      : notification.related_entity_type
    
    if (entityId) {
      url = `${url}/${entityId}`
    }
  }
  
  // Add query parameters
  if (route.query) {
    const queryParams = new URLSearchParams()
    Object.entries(route.query).forEach(([key, value]) => {
      // Replace placeholders with actual values
      let paramValue = value
      if (value === 'prompt' && notification.related_entity_id) {
        paramValue = notification.related_entity_id
      } else if (value === 'moduleId' && notification.related_entity_id) {
        paramValue = notification.related_entity_id
      }
      queryParams.append(key, paramValue)
    })
    const queryString = queryParams.toString()
    if (queryString) {
      url = `${url}?${queryString}`
    }
  }
  
  // Add hash anchor
  if (route.hash) {
    url = `${url}#${route.hash}`
  }
  
  return url
}

/**
 * Get all notification types that are configured
 * Useful for validation and debugging
 */
export function getConfiguredNotificationTypes(): string[] {
  return NOTIFICATION_ROUTES.map((r) => r.type)
}

/**
 * Check if a notification type has a configured route
 */
export function hasNotificationRoute(type: string): boolean {
  return NOTIFICATION_ROUTES.some((r) => r.type === type)
}

