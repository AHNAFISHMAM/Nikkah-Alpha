# Role-Based Access Control (RBAC) Implementation

## Overview

Secure role-based access control has been implemented following industry best practices for web application security.

## Implementation Details

### 1. Database Schema

**Role Column:**
- Added `role` column to `profiles` table
- Type: `text` with CHECK constraint: `role IN ('user', 'admin')`
- Default: `'user'`
- Values: `'user'` (default) or `'admin'` (full access)

**Admin User:**
- `kinderahnaf@gmail.com` is set as admin
- Assigned via migration: `20250104000000_add_admin_role_and_policies.sql`

### 2. Security Functions

**`is_admin()` Function:**
- PostgreSQL function that checks if current authenticated user has admin role
- Uses `SECURITY DEFINER` for secure server-side checks
- Used in RLS policies for authorization

**`prevent_role_self_elevation()` Trigger:**
- Prevents users from changing their own role
- Prevents non-admins from changing any roles
- Only admins (via service role) can change user roles

### 3. Row-Level Security (RLS) Policies

**Principle:** Read access for all authenticated users, write access for admins only.

**Protected Tables:**
- `app_settings` - Admin-only management
- `checklist_categories` - Read: all, Write: admin
- `checklist_items` - Read: all, Write: admin
- `modules` - Read: all, Write: admin
- `lessons` - Read: all, Write: admin
- `discussion_prompts` - Read: all, Write: admin
- `resources` - Read: all, Write: admin

**Policy Pattern:**
```sql
-- Read: Everyone authenticated
CREATE POLICY "Anyone can view [table]"
  ON [table] FOR SELECT
  TO authenticated
  USING (true);

-- Write: Admins only
CREATE POLICY "Admins can manage [table]"
  ON [table] FOR INSERT, UPDATE, DELETE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
```

### 4. Frontend Implementation

**AuthContext:**
- Added `isAdmin: boolean` computed property
- Automatically computed from `profile?.role === 'admin'`
- Available throughout the app via `useAuth()` hook

**Navigation:**
- Manage link only visible to admins
- Both mobile and desktop navigation check `isAdmin`

**Route Protection:**
- `ProtectedManageRoute` component checks for admin role
- Redirects non-admin users to dashboard
- Server-side RLS provides additional security layer

### 5. Best Practices Applied

✅ **Principle of Least Privilege**
- Users have minimum permissions by default
- Admin role required for management operations

✅ **Server-Side Authorization**
- RLS policies enforce permissions at database level
- Client-side checks are for UX only
- Cannot be bypassed by manipulating frontend code

✅ **Clear Role Hierarchy**
- Simple two-tier system: `user` and `admin`
- Easy to understand and maintain

✅ **Separation of Duties**
- Users cannot elevate their own privileges
- Role changes require admin intervention

✅ **Defense in Depth**
- Multiple layers: Frontend checks + Route guards + RLS policies
- Each layer provides security independently

## Usage

### Check if User is Admin

```tsx
import { useAuth } from '@/contexts/AuthContext'

function MyComponent() {
  const { isAdmin } = useAuth()
  
  if (isAdmin) {
    // Show admin features
  }
}
```

### Protect Routes

```tsx
<Route
  element={
    <ProtectedManageRoute>
      <ManageDashboard />
    </ProtectedManageRoute>
  }
  path="/manage"
/>
```

### Check in Navigation

```tsx
{isAuthenticated && isAdmin && (
  <NavLink to="/manage">Manage</NavLink>
)}
```

## Migration

Run the migration to set up RBAC:

```sql
-- Run in Supabase SQL Editor
\i supabase/migrations/20250104000000_add_admin_role_and_policies.sql
```

Or apply via Supabase CLI:
```bash
supabase db push
```

## Verification

After migration, verify setup:

```sql
-- Check admin user
SELECT id, email, role FROM profiles WHERE email = 'kinderahnaf@gmail.com';

-- Test admin function (while logged in as admin)
SELECT public.is_admin();

-- List all admins
SELECT id, email, role FROM profiles WHERE role = 'admin';
```

## Security Notes

1. **Never trust client-side checks alone** - RLS policies provide the real security
2. **Role changes must be done via database** - Users cannot self-elevate
3. **Service role key** - Only use service role for admin operations, never expose to client
4. **Regular audits** - Periodically review admin users and permissions

## Adding New Admins

To add a new admin user, run:

```sql
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'newadmin@example.com';
```

**Important:** Only existing admins or service role can execute this (enforced by trigger).

## Files Modified

- `supabase/migrations/20250104000000_add_admin_role_and_policies.sql` - Database migration
- `src/types/database.ts` - Added role field to Profile type
- `src/contexts/AuthContext.tsx` - Added isAdmin computed property
- `src/components/layout/DashboardNav.tsx` - Admin-only Manage link
- `src/components/auth/ProtectedManageRoute.tsx` - Admin-only route protection

## Next Steps

1. Run the migration in your Supabase project
2. Verify `kinderahnaf@gmail.com` has admin role
3. Test Manage feature access (should only work for admin)
4. Test that regular users cannot access `/manage` routes

