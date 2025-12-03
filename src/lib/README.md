# Utility Libraries

Shared utility functions and helpers used throughout the application.

## Files

### `error-handler.ts`
Comprehensive error handling utilities with user-friendly messages.

**Key Functions:**
- `logError(error, context?)` - Log errors with context
- `getUserFriendlyError(error)` - Get user-friendly error messages
- `isRetryableError(error)` - Check if error is retryable
- `extractErrorInfo(error)` - Extract detailed error information

**Usage:**
```typescript
import { logError, getUserFriendlyError } from '@/lib/error-handler'

try {
  await someOperation()
} catch (error) {
  logError(error, 'ComponentName.functionName')
  toast.error(getUserFriendlyError(error))
}
```

### `utils.ts`
General purpose utility functions.

**Key Functions:**
- `cn(...inputs)` - Merge Tailwind classes
- `formatCurrency(amount, currency, locale)` - Format currency
- `formatDate(date, options, locale)` - Format dates
- `formatRelativeTime(date)` - Format relative time (e.g., "2 days ago")
- `calculatePercentage(value, total)` - Calculate percentage
- `truncateText(text, maxLength)` - Truncate text with ellipsis
- `getInitials(name)` - Generate initials from name
- `debounce(func, wait)` - Debounce function calls
- `isValidEmail(email)` - Validate email format
- `validateName(name, fieldName)` - Validate name fields
- `calculateAge(dateOfBirth)` - Calculate age from date of birth

### `supabase.ts`
Supabase client configuration and helpers.

**Key Exports:**
- `supabase` - Configured Supabase client
- `signIn(email, password)` - Sign in helper
- `signUp(email, password, fullName)` - Sign up helper
- `signOut()` - Sign out helper

### `queryClient.ts`
React Query client configuration.

**Configuration:**
- Stale time: 60 seconds
- Garbage collection: 5 minutes
- Retry: 1 attempt
- No refetch on window focus
- No refetch on mount

### `calculations.ts`
Financial calculation utilities.

**Key Functions:**
- Mahr calculations
- Wedding budget calculations
- Cost splitting logic

### `client-only.ts`
Client-side detection utilities.

### `image-utils.ts`
Image handling and manipulation utilities.

## Best Practices

1. **Error Handling**: Always use `error-handler.ts` instead of console.error
2. **Class Merging**: Use `cn()` for conditional Tailwind classes
3. **Type Safety**: All utilities are fully typed
4. **Performance**: Debounce expensive operations
5. **Validation**: Use provided validators for consistent UX
