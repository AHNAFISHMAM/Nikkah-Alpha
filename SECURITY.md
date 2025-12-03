# Security Documentation

## Overview

This document outlines the security measures implemented to ensure users can only modify their own data, except for shared/collaborative features where read-only partner access is explicitly allowed.

## Row Level Security (RLS) Policies

### Core Principle
**Users can only modify their own data. Partner access is read-only for collaborative features.**

### Tables and Policies

#### 1. Profiles (`public.profiles`)
- **SELECT**: Users can view their own profile + their active partner's profile (read-only)
- **UPDATE**: Users can only update their own profile
- **INSERT**: Users can only insert their own profile
- **DELETE**: Not allowed via RLS (use admin function for data deletion)

**Partner Access**: Partners can VIEW each other's profiles but CANNOT modify them.

#### 2. User Checklist Progress (`public.user_checklist_progress`)
- **SELECT**: Users can view their own progress only
- **UPDATE/INSERT/DELETE**: Users can only manage their own progress

**No Partner Access**: Checklist progress is private to each user.

#### 3. User Module Progress (`public.user_module_progress`)
- **SELECT**: Users can view their own progress only
- **UPDATE/INSERT/DELETE**: Users can only manage their own progress

**No Partner Access**: Module progress is private to each user.

#### 4. User Discussion Answers (`public.user_discussion_answers`)
- **SELECT**: Users can view their own answers + their partner's answers (read-only)
- **UPDATE/INSERT/DELETE**: Users can only manage their own answers

**Partner Access**: Partners can VIEW each other's discussion answers but CANNOT modify them.

#### 5. Financial Tables (`budgets`, `mahr`, `wedding_budgets`, `savings_goals`)
- **SELECT**: Users can view their own financial data only
- **UPDATE/INSERT/DELETE**: Users can only manage their own financial data

**No Partner Access**: Financial data is private to each user.

#### 6. Module Notes (`public.module_notes`)
- **SELECT**: Users can view their own notes only
- **UPDATE/INSERT/DELETE**: Users can only manage their own notes

**No Partner Access**: Module notes are private to each user.

#### 7. Notifications (`public.notifications`)
- **SELECT**: Users can view their own notifications only
- **UPDATE**: Users can only update their own notifications (e.g., mark as read)
- **INSERT**: Only system functions can create notifications
- **DELETE**: Not allowed via RLS

**No Partner Access**: Notifications are private to each user.

#### 8. Partner Invitations (`public.partner_invitations`)
- **SELECT**: Users can view invitations they sent or received
- **UPDATE/INSERT/DELETE**: Users can only manage invitations they sent or received

**No Partner Access**: Invitations are private to the inviter and invitee.

#### 9. Couples (`public.couples`)
- **SELECT**: Users can view couples they are part of
- **UPDATE/INSERT/DELETE**: Users can only manage couples they are part of

**Partner Access**: Both partners can view and update the couple relationship.

## Client-Side Security

### Route Protection
- All protected routes use `ProtectedRoute` component
- Routes do NOT accept user IDs as URL parameters
- All data fetching uses `user.id` from authentication context

### Data Fetching
- All hooks use `user?.id` from `useAuth()` context
- No hooks accept user IDs as parameters (except admin functions)
- All mutations automatically scope to authenticated user

### Example Secure Pattern

```typescript
// ✅ SECURE: Uses authenticated user ID
export function useProfile() {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null
      return supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)  // Always uses authenticated user
        .maybeSingle()
    }
  })
}

// ❌ INSECURE: Would allow accessing other users' profiles
// export function useProfile(userId?: string) {
//   return useQuery({
//     queryFn: async () => {
//       return supabase
//         .from('profiles')
//         .select('*')
//         .eq('id', userId)  // Could be any user ID
//     }
//   })
// }
```

## Shared/Collaborative Features

### Discussion Answers
- **View**: Partners can view each other's discussion answers
- **Modify**: Partners CANNOT modify each other's answers
- **Purpose**: Enables couples to see each other's responses for discussion

### Profile Information
- **View**: Partners can view each other's basic profile info (name, email)
- **Modify**: Partners CANNOT modify each other's profiles
- **Purpose**: Enables displaying partner information in UI

## Security Best Practices

### 1. Always Use RLS
- All tables have RLS enabled
- Never disable RLS in production
- Test RLS policies regularly

### 2. Use WITH CHECK Clauses
- All UPDATE policies have `WITH CHECK` clauses
- All INSERT policies have `WITH CHECK` clauses
- This prevents users from modifying data to belong to another user

### 3. Client-Side Validation
- Always validate user authentication before mutations
- Never trust client-side data
- Always use authenticated user ID from context

### 4. Partner Access
- Partner access is READ-ONLY by default
- Only allow partner modifications where explicitly needed (e.g., couple status)
- Document all partner access policies

## Testing Security

### Manual Testing
1. Log in as User A
2. Attempt to modify User B's data via API calls
3. Verify RLS policies prevent unauthorized access

### Automated Testing
- Test RLS policies with different user contexts
- Verify partner access is read-only
- Test edge cases (disconnected partners, etc.)

## Migration History

- `20250201000009_ensure_user_data_security.sql`: Comprehensive RLS policy updates with WITH CHECK clauses

## Reporting Security Issues

If you discover a security vulnerability, please report it immediately to the development team.

