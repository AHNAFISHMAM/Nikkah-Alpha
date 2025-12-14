# 🗄️ Backend Database Problems - Complete Audit

## Critical Issues

### 1. **Schema Mismatches Between TypeScript Types and Database**

#### Problem: `modules` table column mismatch
- **TypeScript** (`database.ts:207`): Uses `order_index: number`
- **Database** (`complete-setup-with-rls.sql:69`): Uses `sort_order: number`
- **Impact**: Queries will fail when trying to order modules
- **Fix**: Either update TypeScript types to use `sort_order` OR update database to use `order_index`

#### Problem: `discussion_prompts` table column mismatch
- **TypeScript** (`database.ts:305`): Uses `sort_order: number`
- **Database** (`discussions_setup.sql:32`): Uses `order_index: number`
- **Impact**: Queries will fail when trying to order discussion prompts
- **Fix**: Standardize on one naming convention (prefer `sort_order`)

### 2. **Missing Tables in Base Setup Files**

The following tables are referenced in code but NOT in `complete-setup-with-rls.sql`:

#### `user_discussion_answers`
- **Used in**: `NotesEditor.tsx`, `usePartnerDiscussionAnswers.ts`, multiple hooks
- **Defined in**: `20250103000006_discussions_setup.sql`
- **Problem**: Not in base setup, only in migration
- **Impact**: Fresh installs will fail

#### `user_resource_favorites`
- **Used in**: `useFavoriteResources.ts`, `Resources.tsx`
- **Defined in**: TypeScript types only
- **Problem**: Table doesn't exist in any migration
- **Impact**: Favorites feature completely broken

#### `wedding_budgets`, `mahr`, `budgets`, `savings_goals`
- **Used in**: Multiple financial hooks (`useWeddingBudget.ts`, `useMahr.ts`, etc.)
- **Defined in**: `20250201000001_financial_tracking_tables.sql`
- **Problem**: Not in base setup
- **Impact**: Financial features broken on fresh installs

#### `partner_invitations`
- **Used in**: `usePartnerInvitations.ts`, multiple hooks
- **Defined in**: `20250131000001_create_partner_invitations.sql`
- **Problem**: Not in base setup
- **Impact**: Partner features broken on fresh installs

#### `notifications`
- **Used in**: `useNotifications.ts`, notification components
- **Defined in**: `20250131000006_add_notifications.sql`
- **Problem**: Not in base setup
- **Impact**: Notifications feature broken on fresh installs

#### `couples`
- **Used in**: Partner features, discussion answers
- **Defined in**: `20250103000006_discussions_setup.sql`
- **Problem**: Not in base setup
- **Impact**: Partner features broken on fresh installs

#### `module_notes`
- **Referenced in**: TypeScript types (implied)
- **Problem**: Table may not exist
- **Impact**: Module notes feature may be broken

### 3. **Missing RLS Policies**

#### Tables with RLS enabled but missing policies:
- `user_discussion_answers` - Has policies in migration but not in base setup
- `user_resource_favorites` - Table doesn't exist, so no policies
- `wedding_budgets`, `mahr`, `budgets`, `savings_goals` - Policies exist in migration but not in base setup
- `partner_invitations` - Policies exist in migration but not in base setup
- `notifications` - Policies exist in migration but not in base setup
- `couples` - Policies exist in migration but not in base setup

#### Problem: Inconsistent policy coverage
- Base setup file (`complete-setup-with-rls.sql`) only covers old tables
- New tables added via migrations have policies, but base setup doesn't
- **Impact**: Fresh installs will have security holes

### 4. **Missing Indexes**

#### Performance-critical indexes missing:
- `user_resource_favorites` - No indexes (table doesn't exist)
- `user_discussion_answers` - Has indexes in migration but not in base setup
- `couples` - Has indexes in migration but not in base setup
- `partner_invitations` - Has indexes in migration but not in base setup
- `notifications` - Has indexes in migration but not in base setup

#### Problem: Query performance degradation
- **Impact**: Slow queries on user favorites, partner lookups, notifications

### 5. **Missing Foreign Key Constraints**

#### `user_resource_favorites`
- Should reference `profiles(id)` and `resources(id)`
- **Problem**: Table doesn't exist
- **Impact**: Data integrity issues

#### `user_discussion_answers`
- References `auth.users(id)` instead of `profiles(id)`
- **Problem**: Inconsistent with other tables that reference `profiles(id)`
- **Impact**: Potential orphaned records if user deleted from auth but profile remains

### 6. **Missing Unique Constraints**

#### `user_resource_favorites`
- Should have `UNIQUE(user_id, resource_id)` to prevent duplicates
- **Problem**: Table doesn't exist
- **Impact**: Duplicate favorites possible

### 7. **Schema Inconsistencies**

#### Column naming inconsistencies:
- `modules.sort_order` vs `discussion_prompts.order_index` vs `modules.order_index` (in TypeScript)
- **Problem**: No consistent naming convention
- **Impact**: Developer confusion, bugs

#### Table naming inconsistencies:
- `user_discussion_notes` (old) vs `user_discussion_answers` (new)
- **Problem**: Two different tables for same purpose?
- **Impact**: Confusion, potential data loss

### 8. **Missing Triggers**

#### Auto-update `updated_at` triggers missing for:
- `user_resource_favorites` (table doesn't exist)
- Some financial tables have triggers in migration but not in base setup

### 9. **Missing Database Functions**

#### Functions referenced but may not exist:
- `get_partner_id()` - Defined in migration but not in base setup
- `create_notification()` - Defined in migration but not in base setup
- `generate_invitation_code()` - Defined in migration but not in base setup
- `accept_partner_invitation()` - Defined in migration but not in base setup

**Impact**: Partner features, notifications, invitations will fail on fresh installs

### 10. **TypeScript Type Mismatches**

#### Tables in TypeScript types but not in database:
- `user_resource_favorites` - Full type definition exists but table doesn't exist
- `user_discussion_answers` - Type may not match actual schema

#### Columns in database but not in TypeScript:
- Check `modules` table - may have `sort_order` but TypeScript expects `order_index`
- Check `discussion_prompts` - may have `order_index` but TypeScript expects `sort_order`

### 11. **Missing Admin Policies**

#### Tables that need admin write access:
- `checklist_categories`, `checklist_items` - Admin policies exist in RBAC migration but not in base setup
- `modules`, `lessons` - Admin policies exist in RBAC migration but not in base setup
- `discussion_prompts` - Admin policies exist in migration but not in base setup
- `resources` - Admin policies may be missing

**Impact**: Admin features broken on fresh installs

### 12. **Realtime Not Enabled**

#### Tables that need Realtime but may not have it:
- `notifications` - Has realtime in migration but not in base setup
- `partner_invitations` - May need realtime
- `user_discussion_answers` - May need realtime for partner sync

**Impact**: Real-time features won't work on fresh installs

### 13. **Missing Data Validation**

#### Missing CHECK constraints:
- `user_resource_favorites` - No validation (table doesn't exist)
- Some financial tables may be missing validation

### 14. **Migration Order Issues**

#### Problem: Dependencies not clear
- Some migrations depend on tables/functions from other migrations
- Base setup doesn't include all dependencies
- **Impact**: Running migrations out of order may fail

### 15. **Missing Seed Data**

#### Tables that need seed data but don't have it in base setup:
- `checklist_categories` - Has seed in base setup ✅
- `checklist_items` - Has seed in base setup ✅
- `discussion_prompts` - No seed in base setup
- `modules` - No seed in base setup
- `lessons` - No seed in base setup
- `resources` - No seed in base setup

**Impact**: Empty app on fresh installs

## Summary by Severity

### 🔴 Critical (Breaks Core Features)
1. Missing `user_resource_favorites` table
2. Missing `user_discussion_answers` table in base setup
3. Missing financial tables in base setup
4. Missing `partner_invitations` table in base setup
5. Missing `notifications` table in base setup
6. Missing `couples` table in base setup
7. Schema column name mismatches (`order_index` vs `sort_order`)

### 🟡 High (Security/Performance Issues)
8. Missing RLS policies for new tables in base setup
9. Missing indexes for performance
10. Missing admin policies in base setup
11. Missing database functions in base setup
12. Realtime not enabled in base setup

### 🟢 Medium (Data Integrity/Consistency)
13. Foreign key inconsistencies
14. Missing unique constraints
15. Missing triggers
16. Missing seed data
17. TypeScript type mismatches

## Recommended Fix Priority

1. **Immediate**: Create missing `user_resource_favorites` table
2. **Immediate**: Fix column name mismatches (`order_index` vs `sort_order`)
3. **High**: Add all missing tables to base setup file
4. **High**: Add all missing RLS policies to base setup
5. **High**: Add all missing indexes to base setup
6. **Medium**: Standardize naming conventions
7. **Medium**: Add missing seed data
8. **Low**: Add missing triggers and functions to base setup

