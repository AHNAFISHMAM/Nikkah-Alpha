# 🗄️ MASTER SUPABASE DATABASE & RLS PROMPT
## Production-Grade Database Schema, Security, and Query Development Workflow

---

## 📋 OVERVIEW

This master prompt provides a comprehensive, systematic approach to designing, implementing, and securing Supabase database schemas with Row-Level Security (RLS) policies. It covers schema design, migrations, RLS policies, query optimization, security best practices, and TypeScript integration.

**Applicable to:**
- Database schema design and migrations
- Row-Level Security (RLS) policy creation
- Query optimization and indexing
- Database functions and triggers
- Real-time subscriptions setup
- TypeScript type generation
- Security auditing and testing
- Performance optimization

---

## 🎯 CORE PRINCIPLES

### 1. **Security First**
- **RLS is MANDATORY** - All tables must have RLS enabled
- **Principle of Least Privilege** - Users get minimum required permissions
- **Defense in Depth** - Multiple security layers (RLS + client-side validation)
- **WITH CHECK clauses** - Always use for UPDATE and INSERT policies
- **Never trust client-side** - RLS provides the real security

### 2. **Data Ownership Model**
- **User-Owned Data**: Users can only modify their own data
- **Partner Read-Only Access**: Partners can VIEW but NOT modify each other's data (for collaborative features)
- **Admin-Only Access**: Certain tables are read-only for users, write-only for admins
- **Public Read-Only**: Some tables (like `modules`, `resources`) are readable by all authenticated users

### 3. **Query Optimization**
- **Indexes**: Create indexes for frequently queried columns
- **Selective Queries**: Only select needed columns
- **Efficient Joins**: Use proper foreign keys and indexes
- **Pagination**: Use `.range()` for large datasets
- **Error Handling**: Always handle Supabase errors gracefully

### 4. **Type Safety**
- **TypeScript Types**: Generate types from database schema
- **Type-Safe Queries**: Use typed Supabase client
- **Interface Definitions**: Define clear interfaces for query results

---

## 🔍 PHASE 1: SCHEMA DESIGN & PLANNING

### Step 1.1: Understand Requirements
```
1. Identify the data entities and relationships
2. Determine data ownership (user-owned, partner-shared, admin-managed, public)
3. Identify access patterns (read/write permissions)
4. Plan for future scalability
5. Consider data privacy and GDPR requirements
6. Plan for soft deletes if needed
```

### Step 1.2: Design Schema Structure
```
1. Define tables and columns
2. Set up foreign key relationships
3. Define constraints (NOT NULL, UNIQUE, CHECK)
4. Plan indexes for performance
5. Design for RLS (include user_id columns where needed)
6. Plan for timestamps (created_at, updated_at)
7. Consider JSONB columns for flexible data
```

### Step 1.3: Research Best Practices
**Research Sources:**
1. **Supabase Documentation**
   - Schema design patterns
   - RLS policy patterns
   - Performance optimization
   - URL: https://supabase.com/docs

2. **PostgreSQL Best Practices**
   - Index strategies
   - Query optimization
   - Constraint design
   - URL: https://www.postgresql.org/docs/

3. **Security Best Practices**
   - OWASP Database Security
   - RLS policy patterns
   - SQL injection prevention
   - URL: https://owasp.org/

4. **Database Design Patterns**
   - Normalization (1NF, 2NF, 3NF)
   - Denormalization strategies
   - Soft delete patterns
   - Audit logging patterns

### Step 1.4: Plan RLS Policies
```
For each table, determine:
1. Who can SELECT (read)?
2. Who can INSERT (create)?
3. Who can UPDATE (modify)?
4. Who can DELETE (remove)?
5. Are there partner access requirements?
6. Are there admin-only operations?
7. What are the WITH CHECK requirements?
```

---

## 🛠️ PHASE 2: MIGRATION CREATION

### Step 2.1: Migration File Structure
```
File naming: YYYYMMDDHHMMSS_descriptive_name.sql
Location: supabase/migrations/

Example: 20250201000009_ensure_user_data_security.sql
```

### Step 2.2: Migration Template
```sql
-- =============================================
-- [Migration Title]
-- =============================================
-- Description: [What this migration does]
-- Date: [YYYY-MM-DD]
-- Related: [Related migrations or issues]

BEGIN;

-- =============================================
-- 1. CREATE TABLE (if new table)
-- =============================================
CREATE TABLE IF NOT EXISTS public.table_name (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- other columns
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- =============================================
-- 2. CREATE INDEXES
-- =============================================
CREATE INDEX IF NOT EXISTS idx_table_name_user_id 
  ON public.table_name(user_id);

-- =============================================
-- 3. ENABLE RLS
-- =============================================
ALTER TABLE public.table_name ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 4. CREATE RLS POLICIES
-- =============================================
-- SELECT policy
CREATE POLICY "Users can view own [resource]"
  ON public.table_name FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- INSERT policy
CREATE POLICY "Users can insert own [resource]"
  ON public.table_name FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- UPDATE policy
CREATE POLICY "Users can update own [resource]"
  ON public.table_name FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- DELETE policy (if needed)
CREATE POLICY "Users can delete own [resource]"
  ON public.table_name FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- =============================================
-- 5. CREATE TRIGGERS (if needed)
-- =============================================
-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_table_name_updated_at
  BEFORE UPDATE ON public.table_name
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- 6. COMMENTS (documentation)
-- =============================================
COMMENT ON TABLE public.table_name IS 'Description of table purpose';
COMMENT ON POLICY "Users can view own [resource]" ON public.table_name IS 
  'Users can only view their own [resource]. Partner access is read-only via separate policy.';

COMMIT;
```

### Step 2.3: Migration Checklist
- [ ] Migration file named correctly (timestamp prefix)
- [ ] BEGIN/COMMIT transaction blocks
- [ ] Table created with proper constraints
- [ ] Foreign keys defined with ON DELETE CASCADE
- [ ] Indexes created for frequently queried columns
- [ ] RLS enabled on table
- [ ] All RLS policies created (SELECT, INSERT, UPDATE, DELETE as needed)
- [ ] WITH CHECK clauses on UPDATE and INSERT policies
- [ ] Triggers created (updated_at, etc.)
- [ ] Comments added for documentation
- [ ] Tested in development environment

---

## 🔒 PHASE 3: RLS POLICY PATTERNS

### Pattern 1: User-Owned Data (Private)
**Use Case**: Data that belongs to a single user, no partner access
**Examples**: `user_checklist_progress`, `user_module_progress`, `budgets`, `mahr`

```sql
-- SELECT: Users can only view their own data
CREATE POLICY "Users can view own [resource]"
  ON public.table_name FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- INSERT: Users can only insert their own data
CREATE POLICY "Users can insert own [resource]"
  ON public.table_name FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- UPDATE: Users can only update their own data
CREATE POLICY "Users can update own [resource]"
  ON public.table_name FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)  -- Can only update if it's theirs
  WITH CHECK (auth.uid() = user_id);  -- Must remain theirs after update

-- DELETE: Users can only delete their own data
CREATE POLICY "Users can delete own [resource]"
  ON public.table_name FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
```

### Pattern 2: Partner Read-Only Access
**Use Case**: Partners can VIEW but NOT modify each other's data
**Examples**: `profiles`, `user_discussion_answers`

```sql
-- SELECT: Users can view their own data + partner's data (read-only)
CREATE POLICY "Users can view own [resource]"
  ON public.table_name FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id  -- Own data
    OR
    -- Partner access (read-only)
    EXISTS (
      SELECT 1 FROM public.couples c
      WHERE (c.user1_id = auth.uid() AND c.user2_id = user_id)
         OR (c.user2_id = auth.uid() AND c.user1_id = user_id)
      AND c.status = 'active'
    )
  );

-- INSERT/UPDATE/DELETE: Only own data (no partner modification)
CREATE POLICY "Users can insert own [resource]"
  ON public.table_name FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own [resource]"
  ON public.table_name FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own [resource]"
  ON public.table_name FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
```

### Pattern 3: Admin-Only Write Access
**Use Case**: All authenticated users can read, only admins can write
**Examples**: `modules`, `lessons`, `checklist_categories`, `resources`

```sql
-- SELECT: All authenticated users can read
CREATE POLICY "Anyone can view [resource]"
  ON public.table_name FOR SELECT
  TO authenticated
  USING (true);

-- INSERT/UPDATE/DELETE: Admins only
CREATE POLICY "Admins can manage [resource]"
  ON public.table_name FOR INSERT, UPDATE, DELETE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
```

### Pattern 4: Couple-Shared Data
**Use Case**: Both partners can read and write
**Examples**: `couples` table

```sql
-- SELECT: Users can view couples they are part of
CREATE POLICY "Users can view own couple"
  ON public.table_name FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user1_id OR auth.uid() = user2_id
  );

-- UPDATE: Both partners can update
CREATE POLICY "Users can update own couple"
  ON public.table_name FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user1_id OR auth.uid() = user2_id
  )
  WITH CHECK (
    auth.uid() = user1_id OR auth.uid() = user2_id
  );
```

### Pattern 5: Bidirectional Access
**Use Case**: Users can access data where they are either sender or receiver
**Examples**: `partner_invitations`

```sql
-- SELECT: Users can view invitations they sent or received
CREATE POLICY "Users can view own invitations"
  ON public.table_name FOR SELECT
  TO authenticated
  USING (
    auth.uid() = inviter_id  -- Sent by user
    OR
    (SELECT email FROM public.profiles WHERE id = auth.uid()) = invitee_email  -- Received by user
  );

-- UPDATE: Users can update invitations they sent or received
CREATE POLICY "Users can update own invitations"
  ON public.table_name FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = inviter_id
    OR
    (SELECT email FROM public.profiles WHERE id = auth.uid()) = invitee_email
  )
  WITH CHECK (
    auth.uid() = inviter_id
    OR
    (SELECT email FROM public.profiles WHERE id = auth.uid()) = invitee_email
  );
```

### RLS Policy Checklist
- [ ] RLS enabled on table
- [ ] SELECT policy created
- [ ] INSERT policy created (if needed)
- [ ] UPDATE policy created (if needed)
- [ ] DELETE policy created (if needed)
- [ ] WITH CHECK clauses on UPDATE and INSERT
- [ ] Partner access handled correctly (read-only)
- [ ] Admin access handled correctly (if applicable)
- [ ] Policies tested with different user contexts
- [ ] Comments added to policies

---

## 📊 PHASE 4: QUERY IMPLEMENTATION

### Step 4.1: Query Patterns

#### Pattern 1: Simple Select
```typescript
// ✅ CORRECT - Type-safe, error handling
const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', user.id)
  .maybeSingle()

if (error) {
  logError(error, 'useProfile')
  throw error
}

return data
```

#### Pattern 2: Select with Joins
```typescript
// ✅ CORRECT - Nested select for relationships
const { data, error } = await supabase
  .from('checklist_categories')
  .select(`
    *,
    checklist_items (
      *,
      user_checklist_progress (*)
    )
  `)
  .order('sort_order')

if (error) {
  logError(error, 'Checklist.fetchChecklist')
  throw error
}

// Type-safe handling of nested relations
return (data || []).map(cat => ({
  ...cat,
  checklist_items: Array.isArray(cat.checklist_items) 
    ? cat.checklist_items 
    : [],
}))
```

#### Pattern 3: Insert with Error Handling
```typescript
// ✅ CORRECT - Error handling, user_id from auth context
const { data, error } = await supabase
  .from('user_checklist_progress')
  .insert({
    user_id: user.id,  // Always from auth context
    item_id: itemId,
    is_completed: true,
  })
  .select()
  .single()

if (error) {
  logError(error, 'Checklist.toggleItem')
  throw error
}

return data
```

#### Pattern 4: Update with Error Handling
```typescript
// ✅ CORRECT - Error handling, user_id from auth context
const { data, error } = await supabase
  .from('profiles')
  .update({
    first_name: firstName,
    updated_at: new Date().toISOString(),
  })
  .eq('id', user.id)  // Always from auth context
  .select()
  .single()

if (error) {
  logError(error, 'useUpdateProfile')
  throw error
}

return data
```

#### Pattern 5: Delete with Error Handling
```typescript
// ✅ CORRECT - Error handling, user_id from auth context
const { error } = await supabase
  .from('user_resource_favorites')
  .delete()
  .eq('user_id', user.id)  // Always from auth context
  .eq('resource_id', resourceId)

if (error) {
  logError(error, 'useFavoriteResources.removeFavorite')
  throw error
}
```

#### Pattern 6: Pagination
```typescript
// ✅ CORRECT - Pagination with range
const { data, error, count } = await supabase
  .from('resources')
  .select('*', { count: 'exact' })
  .order('created_at', { ascending: false })
  .range(page * pageSize, (page + 1) * pageSize - 1)

if (error) {
  logError(error, 'Resources.fetchResources')
  throw error
}

return { data: data || [], count: count || 0 }
```

#### Pattern 7: Complex Query with Filters
```typescript
// ✅ CORRECT - Multiple filters, ordering
const { data, error } = await supabase
  .from('notifications')
  .select('*')
  .eq('user_id', user.id)
  .eq('is_read', false)
  .order('created_at', { ascending: false })
  .limit(50)

if (error) {
  logError(error, 'useNotifications')
  throw error
}

return data || []
```

### Step 4.2: Query Best Practices

#### ✅ DO:
- Always check for errors
- Use `.maybeSingle()` when expecting 0 or 1 result
- Use `.single()` when expecting exactly 1 result
- Use `.eq('user_id', user.id)` from auth context (never accept user_id as parameter)
- Use TypeScript types from `Database` type
- Handle null/undefined results gracefully
- Use `.select()` with specific columns when possible
- Use indexes for frequently filtered columns
- Use `.range()` for pagination
- Log errors with context

#### ❌ DON'T:
- Accept `user_id` as a parameter (security risk)
- Ignore errors
- Use `SELECT *` when you only need specific columns
- Forget to handle null/undefined results
- Skip error logging
- Use client-side filtering when database filtering is possible
- Create N+1 queries (use joins instead)

### Step 4.3: Query Checklist
- [ ] Error handling implemented
- [ ] User ID from auth context (not parameter)
- [ ] TypeScript types used
- [ ] Null/undefined handling
- [ ] Error logging with context
- [ ] Efficient query (indexes used, selective columns)
- [ ] Pagination for large datasets
- [ ] Proper use of `.single()`, `.maybeSingle()`, or array results

---

## 🔐 PHASE 5: SECURITY IMPLEMENTATION

### Step 5.1: Security Checklist

#### Database Level
- [ ] RLS enabled on all tables
- [ ] All policies have WITH CHECK clauses (for UPDATE/INSERT)
- [ ] No policies allow users to modify other users' data
- [ ] Partner access is read-only (SELECT only)
- [ ] Admin functions use SECURITY DEFINER
- [ ] Triggers prevent privilege escalation
- [ ] Foreign keys have ON DELETE CASCADE where appropriate

#### Application Level
- [ ] All queries use `user.id` from auth context
- [ ] No hooks accept `user_id` as parameter (except admin)
- [ ] Route protection implemented
- [ ] Client-side validation (but not trusted)
- [ ] Error messages don't leak sensitive information

### Step 5.2: Security Testing
```typescript
// Test RLS policies:
// 1. Log in as User A
// 2. Attempt to query User B's data
// 3. Verify RLS blocks unauthorized access

// Example test:
const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', otherUserId)  // Should fail if not authorized

// Should return empty or error, not other user's data
```

### Step 5.3: Common Security Pitfalls

#### ❌ INSECURE:
```typescript
// ❌ WRONG - Accepts user_id as parameter
export function useProfile(userId?: string) {
  return useQuery({
    queryFn: async () => {
      return supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)  // Security risk!
    }
  })
}
```

#### ✅ SECURE:
```typescript
// ✅ CORRECT - Uses authenticated user ID
export function useProfile() {
  const { user } = useAuth()
  return useQuery({
    queryFn: async () => {
      if (!user?.id) return null
      return supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)  // Always from auth context
        .maybeSingle()
    }
  })
}
```

---

## ⚡ PHASE 6: PERFORMANCE OPTIMIZATION

### Step 6.1: Index Creation
```sql
-- ✅ CORRECT - Index on frequently queried column
CREATE INDEX IF NOT EXISTS idx_profiles_user_id 
  ON public.profiles(user_id);

-- ✅ CORRECT - Composite index for multi-column queries
CREATE INDEX IF NOT EXISTS idx_checklist_progress_user_item 
  ON public.user_checklist_progress(user_id, item_id);

-- ✅ CORRECT - Index on foreign key
CREATE INDEX IF NOT EXISTS idx_checklist_items_category_id 
  ON public.checklist_items(category_id);
```

### Step 6.2: Query Optimization
```typescript
// ✅ CORRECT - Select only needed columns
const { data } = await supabase
  .from('profiles')
  .select('id, first_name, last_name, email')  // Specific columns
  .eq('id', user.id)

// ✅ CORRECT - Use indexes
const { data } = await supabase
  .from('user_checklist_progress')
  .select('*')
  .eq('user_id', user.id)  // Indexed column
  .eq('item_id', itemId)   // Indexed column

// ✅ CORRECT - Limit results
const { data } = await supabase
  .from('notifications')
  .select('*')
  .eq('user_id', user.id)
  .limit(50)  // Limit large datasets
```

### Step 6.3: Performance Checklist
- [ ] Indexes created for frequently queried columns
- [ ] Composite indexes for multi-column queries
- [ ] Foreign keys indexed
- [ ] Queries use indexed columns in WHERE clauses
- [ ] Pagination implemented for large datasets
- [ ] Only select needed columns
- [ ] Avoid N+1 queries (use joins)
- [ ] Use `.range()` for pagination

---

## 🔄 PHASE 7: REAL-TIME SETUP

### Step 7.1: Enable Realtime
```sql
-- Enable realtime for table
ALTER PUBLICATION supabase_realtime ADD TABLE public.table_name;

-- Set replica identity (required for UPDATE/DELETE events)
ALTER TABLE public.table_name REPLICA IDENTITY FULL;
```

### Step 7.2: Realtime Subscription Pattern
```typescript
// ✅ CORRECT - Real-time subscription with cleanup
useEffect(() => {
  if (!user?.id || !supabase) return

  const channel = supabase
    .channel('table_name_changes')
    .on(
      'postgres_changes',
      {
        event: '*',  // INSERT, UPDATE, DELETE
        schema: 'public',
        table: 'table_name',
        filter: `user_id=eq.${user.id}`,  // Filter to user's data
      },
      (payload) => {
        // Invalidate React Query cache
        queryClient.invalidateQueries({ queryKey: ['table_name', user.id] })
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}, [user?.id, queryClient])
```

### Step 7.3: Realtime Checklist
- [ ] Realtime enabled on table
- [ ] Replica identity set to FULL
- [ ] Subscription filters to user's data
- [ ] Cleanup on unmount
- [ ] Debounced cache invalidation (if needed)
- [ ] Error handling for connection issues

---

## 📝 PHASE 8: TYPE GENERATION

### Step 8.1: Generate Types
```bash
# Generate TypeScript types from Supabase schema
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.ts
```

### Step 8.2: Use Types in Queries
```typescript
import type { Database } from '../types/database'

// ✅ CORRECT - Typed Supabase client
const supabase = createClient<Database>(url, key)

// ✅ CORRECT - Type-safe query
const { data } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', user.id)
  .maybeSingle()

// data is typed as Database['public']['Tables']['profiles']['Row'] | null
```

### Step 8.3: Type Safety Checklist
- [ ] Types generated from database schema
- [ ] Supabase client typed with Database type
- [ ] Query results properly typed
- [ ] Interfaces defined for complex query results
- [ ] Types updated after schema changes

---

## 🧪 PHASE 9: TESTING & VERIFICATION

### Step 9.1: Manual Testing
```
1. Test as regular user:
   - Can read own data ✅
   - Can write own data ✅
   - Cannot read other users' data ✅
   - Cannot write other users' data ✅

2. Test as partner:
   - Can read partner's data (if applicable) ✅
   - Cannot write partner's data ✅

3. Test as admin:
   - Can read admin-managed tables ✅
   - Can write admin-managed tables ✅
```

### Step 9.2: SQL Testing
```sql
-- Test RLS policy (run as different users)
-- 1. Set role to test user
SET ROLE authenticated;
SET request.jwt.claim.sub = 'user-uuid-here';

-- 2. Test query
SELECT * FROM public.profiles WHERE id = 'other-user-uuid';
-- Should return empty if RLS is working

-- 3. Test own data
SELECT * FROM public.profiles WHERE id = 'user-uuid-here';
-- Should return data
```

### Step 9.3: Testing Checklist
- [ ] RLS policies tested with different users
- [ ] Partner access tested (read-only)
- [ ] Admin access tested
- [ ] Error handling tested
- [ ] Performance tested (query speed)
- [ ] Real-time subscriptions tested
- [ ] Migration tested in development

---

## 📚 REFERENCE PATTERNS

### Complete Migration Example
```sql
-- =============================================
-- Create User Notes Table
-- =============================================
BEGIN;

-- Create table
CREATE TABLE IF NOT EXISTS public.user_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_notes_user_id 
  ON public.user_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notes_created_at 
  ON public.user_notes(created_at DESC);

-- Enable RLS
ALTER TABLE public.user_notes ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own notes"
  ON public.user_notes FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notes"
  ON public.user_notes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notes"
  ON public.user_notes FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own notes"
  ON public.user_notes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE TRIGGER update_user_notes_updated_at
  BEFORE UPDATE ON public.user_notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comments
COMMENT ON TABLE public.user_notes IS 'User notes table - private to each user';
COMMENT ON POLICY "Users can view own notes" ON public.user_notes IS 
  'Users can only view their own notes. No partner access.';

COMMIT;
```

### Complete Hook Example
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { logError } from '../lib/error-handler'
import { useAuth } from '../contexts/AuthContext'
import type { Database } from '../types/database'

type UserNote = Database['public']['Tables']['user_notes']['Row']

export function useUserNotes() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['user-notes', user?.id],
    queryFn: async (): Promise<UserNote[]> => {
      if (!user?.id) throw new Error('User not authenticated')
      if (!supabase) throw new Error('Supabase is not configured')

      const { data, error } = await supabase
        .from('user_notes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        logError(error, 'useUserNotes')
        throw error
      }

      return (data || []) as UserNote[]
    },
    enabled: !!user?.id,
    staleTime: 60000, // 1 minute
  })
}

export function useCreateNote() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (note: { title: string; content?: string }) => {
      if (!user?.id) throw new Error('User not authenticated')
      if (!supabase) throw new Error('Supabase is not configured')

      const { data, error } = await supabase
        .from('user_notes')
        .insert({
          user_id: user.id,
          title: note.title,
          content: note.content,
        })
        .select()
        .single()

      if (error) {
        logError(error, 'useCreateNote')
        throw error
      }

      return data as UserNote
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-notes', user?.id] })
    },
  })
}
```

---

## 🎯 SUCCESS CRITERIA

A database schema/RLS implementation is complete when:

1. ✅ **Schema**: Tables created with proper constraints and indexes
2. ✅ **RLS**: All tables have RLS enabled with appropriate policies
3. ✅ **Security**: WITH CHECK clauses on all UPDATE/INSERT policies
4. ✅ **Queries**: Type-safe queries with error handling
5. ✅ **Performance**: Indexes created for frequently queried columns
6. ✅ **Real-time**: Realtime enabled where needed
7. ✅ **Types**: TypeScript types generated and used
8. ✅ **Testing**: RLS policies tested with different users
9. ✅ **Documentation**: Comments added to tables and policies
10. ✅ **Migration**: Migration file created and tested

---

## 🚨 COMMON PITFALLS

### ❌ Don't:
- Disable RLS in production
- Accept user_id as parameter
- Skip WITH CHECK clauses
- Forget to index foreign keys
- Ignore error handling
- Use SELECT * when specific columns needed
- Create policies that allow users to modify other users' data
- Skip testing RLS policies

### ✅ Do:
- Always enable RLS
- Use user.id from auth context
- Include WITH CHECK clauses
- Create indexes for performance
- Handle all errors
- Select only needed columns
- Test policies thoroughly
- Document policies with comments

---

**This master prompt should be followed for ALL Supabase database and RLS development work.**

