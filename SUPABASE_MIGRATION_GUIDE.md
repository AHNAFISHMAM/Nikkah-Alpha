# Supabase Manual Migration Guide

## Prerequisites

- Supabase account with project created
- Database access via Supabase Dashboard
- SQL Editor access

---

## Migration Strategy

You have **56 migration files** OR **1 consolidated file**. Three approaches:

### Option 1: Single Consolidated File (FASTEST - Recommended)

Run the single `ALL_MIGRATIONS_CONSOLIDATED.sql` file that combines everything. Fastest, easiest, production-ready.

### Option 2: Run All Migrations Sequentially (Complete)

Execute all 56 migrations in chronological order. Safe, reproducible, auditable.

### Option 3: Use Essential Migrations Only (Fast)

Use the key consolidated migrations that include most functionality.

---

## OPTION 1: Single Consolidated File (FASTEST)

### Quick Start

1. **Open Supabase Dashboard**
   - Go to https://app.supabase.com
   - Select your project
   - Navigate to **SQL Editor**

2. **Run the Consolidated Migration**
   - Open the file: `ALL_MIGRATIONS_CONSOLIDATED.sql`
   - Copy the entire contents
   - Paste into Supabase SQL Editor
   - Click **RUN**

3. **Wait for Completion**
   - The migration will run for ~2-3 minutes
   - Watch for any errors in the output
   - If successful, you'll see "COMMIT" at the end

### What This Creates

**Tables** (20+):
- profiles (user accounts)
- checklist_categories, checklist_items, user_checklist_progress
- user_financial_data, wedding_budget, wedding_expenses, savings_goals
- modules, lessons, user_module_progress, user_module_notes
- discussion_prompts, user_discussion_notes
- resources, user_resource_favorites
- partner_invitations, invitation_rate_limits
- notifications, notification_preferences
- app_settings

**Security**:
- Row Level Security (RLS) enabled on all tables
- 30+ RLS policies
- Role-based access control (admin/user)
- Secure functions with SECURITY DEFINER

**Performance**:
- 50+ optimized indexes
- Triggers for auto-updates
- Foreign key constraints
- Unique constraints

**Seed Data**:
- 5 checklist categories
- 27 checklist items

### Post-Migration Steps

1. **Verify Tables Created**
   ```sql
   SELECT table_name
   FROM information_schema.tables
   WHERE table_schema = 'public'
   ORDER BY table_name;
   ```
   Expected: 20+ tables

2. **Set Admin User** (replace with your email)
   ```sql
   UPDATE public.profiles
   SET role = 'admin'
   WHERE email = 'your-email@example.com';
   ```

3. **Enable Realtime** (in Supabase Dashboard)
   - Go to Database → Replication
   - Enable for these tables:
     - profiles
     - user_checklist_progress
     - user_module_progress
     - notifications
     - partner_invitations

4. **Test the App**
   ```bash
   npm run dev
   ```
   - Sign up a new user
   - Verify profile auto-created
   - Check checklist loads (27 items)

### Troubleshooting

**Error: "relation already exists"**
- Your database already has some tables
- Solution: Either drop existing tables or skip to Option 2/3

**Error: "permission denied"**
- Insufficient database permissions
- Solution: Ensure you're logged in as project owner

**Error: "column already exists"**
- Partial migration previously run
- Solution: Use Option 2 (sequential) for better control

### Advantages

✅ **Fast**: Single file, ~2 minutes
✅ **Complete**: All tables, indexes, policies, triggers
✅ **Production-ready**: Includes all optimizations
✅ **Idempotent**: Safe to re-run (uses IF NOT EXISTS)
✅ **Transactional**: Wrapped in BEGIN/COMMIT

### When to Use This Option

- ✅ Fresh Supabase project (no existing tables)
- ✅ Want fastest setup
- ✅ Trust consolidated migrations
- ✅ Don't need step-by-step control

### When NOT to Use This Option

- ❌ Already have tables in your database
- ❌ Want to review each migration individually
- ❌ Need to customize certain tables

---

## OPTION 2: Sequential Execution (Complete)

### Preparation

1. **Open Supabase Dashboard**
   - Go to https://app.supabase.com
   - Select your project
   - Navigate to **SQL Editor**

2. **Create Tracking Table** (Optional but recommended)
   ```sql
   CREATE TABLE IF NOT EXISTS migration_log (
     id SERIAL PRIMARY KEY,
     migration_file TEXT NOT NULL,
     executed_at TIMESTAMPTZ DEFAULT NOW(),
     success BOOLEAN DEFAULT TRUE
   );
   ```

### Migration Execution Order

**Copy and paste each migration file's content into SQL Editor, then click RUN.**

#### Phase 1: Profile Setup (Migrations 1-10)

```sql
-- 1. Run: 20250101000000_add_profile_fields.sql
-- Purpose: Adds initial profile fields (first_name, last_name, etc.)

-- 2. Run: 20250102000000_add_profile_fields_complete.sql
-- Purpose: Adds comprehensive profile fields (date_of_birth, gender, etc.)

-- 3. Run: 20250103000000_profile_page_complete_migration.sql ⭐ CRITICAL
-- Purpose: Complete profiles table (27 columns), RLS policies, triggers, indexes

-- 4. Run: 20250103000001_authenticated_home_setup.sql
-- Purpose: Ensures profiles match AuthenticatedHome requirements

-- 5. Run: 20250103000002_dashboard_setup.sql ⭐ CRITICAL
-- Purpose: Creates 10 tables (checklists, modules, discussions, financial)

-- 6. Run: 20250103000003_checklist_setup.sql ⭐ CRITICAL
-- Purpose: Creates checklist tables + seeds 27 checklist items

-- 7. Run: 20250103000004_financial_setup.sql
-- Purpose: Creates user_financial_data table

-- 8. Run: 20250103000005_modules_setup.sql ⭐ CRITICAL
-- Purpose: Creates modules and lessons tables

-- 9. Run: 20250103000006_discussions_setup.sql ⭐ CRITICAL
-- Purpose: Creates discussion_prompts and answers tables

-- 10. Run: 20250103000007_resources_setup.sql ⭐ CRITICAL
-- Purpose: Creates resources and favorites tables
```

**Verify Phase 1**:
```sql
-- Check tables created
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Should see: profiles, checklist_categories, checklist_items, modules,
-- lessons, discussion_prompts, resources, user_financial_data, etc.
```

#### Phase 2: RBAC & Content (Migrations 11-16)

```sql
-- 11. Run: 20250104000000_add_admin_role_and_policies.sql ⭐ CRITICAL
-- Purpose: Adds admin role, sets kinderahnaf@gmail.com as admin

-- 12. Run: 20250105000000_insert_all_discussion_prompts.sql ⭐ DATA
-- Purpose: Seeds 16 discussion prompts

-- 13. Run: 20250106000000_insert_all_modules_and_lessons.sql ⭐ DATA
-- Purpose: Seeds 5 modules with 20 lessons

-- 14. Run: 20250106000001_remove_foundations_lessons.sql
-- Purpose: Cleanup migration

-- 15. Run: 20250107000000_add_module_notes_table.sql
-- Purpose: Creates user_module_notes table

-- 16. Run: 20250107000001_add_theme_mode_to_profiles.sql
-- Purpose: Adds theme_mode column to profiles
```

**Verify Phase 2**:
```sql
-- Check admin role
SELECT email, role FROM profiles WHERE role = 'admin';

-- Check discussion prompts seeded
SELECT COUNT(*) FROM discussion_prompts;
-- Should return: 16

-- Check modules seeded
SELECT COUNT(*) FROM modules;
-- Should return: 5
```

#### Phase 3: Partner System (Migrations 17-31)

```sql
-- 17. Run: 20250130000000_add_discuss_with_partner_column.sql
-- 18. Run: 20250130120000_pdf_generation_database_setup.sql
-- 19. Run: 20250131000000_remove_duplicate_discussion_prompts.sql

-- 20. Run: 20250131000001_create_partner_invitations.sql ⭐ CRITICAL
-- Purpose: Creates partner invitation system

-- 21. Run: 20250131000001_remove_all_checklist_data.sql
-- 22. Run: 20250131000002_add_rate_limiting.sql
-- 23. Run: 20250131000002_reset_checklist_to_spec.sql
-- 24. Run: 20250131000003_add_invitation_cleanup.sql
-- 25. Run: 20250131000004_add_audit_logging.sql
-- 26. Run: 20250131000005_add_partner_disconnection.sql
-- 27. Run: 20250131000006_add_notifications.sql ⭐ IMPORTANT
-- 28. Run: 20250131000007_add_data_export.sql
-- 29. Run: 20250131000008_add_data_deletion.sql

-- 30. Run: 20250131000009_enable_dashboard_realtime.sql ⭐ REALTIME
-- Purpose: Enables real-time subscriptions

-- 31. Run: 20250131000009_fix_partner_invitations_rls.sql
```

**Verify Phase 3**:
```sql
-- Check partner invitations table exists
SELECT * FROM information_schema.tables
WHERE table_name = 'partner_invitations';

-- Check notifications table exists
SELECT * FROM information_schema.tables
WHERE table_name = 'notifications';
```

#### Phase 4: Notifications & Improvements (Migrations 32-52)

```sql
-- 32-42: Financial tracking, notifications, RLS fixes
-- Run each in order:
-- 20250201000001_financial_tracking_tables.sql
-- 20250201000002_add_notification_preferences.sql
-- 20250201000003_add_notification_on_invitation.sql
-- 20250201000004_fix_notifications_realtime.sql
-- 20250201000005_backfill_invitation_notifications.sql
-- 20250201000006_allow_partner_profile_access.sql
-- 20250201000007_fix_invitation_accepted_notification_realtime.sql
-- 20250201000008_verify_notifications_setup.sql
-- 20250201000009_ensure_user_data_security.sql
-- 20250201000010_fix_favorites_query.sql

-- 20250201000011_enable_realtime_for_all_tables.sql ⭐ REALTIME

-- 43-52: Version tracking, cleanup, fixes
-- 20250202000001_add_invitation_version_tracking.sql
-- 20250202000002_add_notification_delete_policy.sql
-- 20250203000000_fix_user_deletion_auth_cleanup.sql ⭐ CRITICAL FIX
-- 20250203000001_cleanup_orphaned_auth_users.sql
-- 20250203000001_create_user_resource_favorites.sql
-- 20250203000002_check_and_cleanup_orphaned_users.sql
-- 20250203000002_fix_column_name_mismatches.sql
-- 20250203000003_add_missing_rls_policies.sql
-- 20250203000003_permanent_fix_auto_delete_auth_users.sql ⭐ CRITICAL
-- 20250203000004_add_missing_indexes.sql
```

#### Phase 5: Recent Updates (Migrations 53-56)

```sql
-- 53. Run: 20251129081043_add_admin_theme_settings.sql
-- 54. Run: 20251129131024_remote_schema.sql
-- 55. Run: 20251129131430_create_user_stats_view.sql
-- 56. Run: 20251129131431_add_performance_indexes.sql
```

---

## OPTION 3: Essential Migrations Only (Faster)

If you want faster setup without the full consolidated file, run only these **16 essential migrations**:

```sql
-- ESSENTIAL MIGRATIONS ONLY

-- 1. Profiles
20250103000000_profile_page_complete_migration.sql

-- 2. Core Tables
20250103000002_dashboard_setup.sql

-- 3. Checklists
20250103000003_checklist_setup.sql

-- 4. Financial
20250103000004_financial_setup.sql

-- 5. Modules
20250103000005_modules_setup.sql

-- 6. Discussions
20250103000006_discussions_setup.sql

-- 7. Resources
20250103000007_resources_setup.sql

-- 8. Admin RBAC
20250104000000_add_admin_role_and_policies.sql

-- 9. Discussion Prompts Data
20250105000000_insert_all_discussion_prompts.sql

-- 10. Modules & Lessons Data
20250106000000_insert_all_modules_and_lessons.sql

-- 11. Module Notes
20250107000000_add_module_notes_table.sql

-- 12. Theme Mode
20250107000001_add_theme_mode_to_profiles.sql

-- 13. Partner Invitations
20250131000001_create_partner_invitations.sql

-- 14. Notifications
20250131000006_add_notifications.sql

-- 15. Realtime
20250201000011_enable_realtime_for_all_tables.sql

-- 16. Performance Indexes
20250203000004_add_missing_indexes.sql
```

---

## Post-Migration Verification

### Verify All Tables Exist

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

**Expected Tables** (at minimum):
- profiles
- checklist_categories
- checklist_items
- user_checklist_progress
- modules
- lessons
- user_module_progress
- discussion_prompts
- user_discussion_answers
- resources
- user_resource_favorites
- user_financial_data
- partner_invitations
- notifications

### Verify RLS Enabled

```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

**All tables should show** `rowsecurity = true`

### Verify Admin User

```sql
SELECT email, role
FROM profiles
WHERE role = 'admin';
```

**Expected**: kinderahnaf@gmail.com with role='admin'

### Verify Seed Data

```sql
-- Check checklist items
SELECT COUNT(*) FROM checklist_items;
-- Expected: 27+

-- Check discussion prompts
SELECT COUNT(*) FROM discussion_prompts;
-- Expected: 16

-- Check modules
SELECT COUNT(*) FROM modules;
-- Expected: 5

-- Check lessons
SELECT COUNT(*) FROM lessons;
-- Expected: 20
```

### Verify Indexes

```sql
SELECT tablename, indexname
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
```

**Expected**: 50+ indexes for performance

### Verify Triggers

```sql
SELECT trigger_name, event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public';
```

**Expected triggers**:
- `on_auth_user_created` (auto-create profile)
- `update_updated_at` (timestamp updates)
- Various completion tracking triggers

---

## Troubleshooting

### Error: "relation already exists"

**Cause**: Migration already run or duplicate
**Solution**: Skip to next migration

### Error: "column already exists"

**Cause**: Partial migration or duplicate
**Solution**: Comment out the ADD COLUMN line and re-run

### Error: "permission denied"

**Cause**: Insufficient database permissions
**Solution**: Ensure you're using the service role key in migrations

### Error: "violates foreign key constraint"

**Cause**: Migrations out of order
**Solution**: Check which table is missing, run its migration first

---

## After Migrations: Enable Realtime

1. Go to **Database** → **Replication**
2. Enable replication for these tables:
   - profiles
   - checklist_items
   - user_checklist_progress
   - modules
   - user_module_progress
   - discussion_prompts
   - user_discussion_answers
   - resources
   - user_resource_favorites
   - partner_invitations
   - notifications

---

## After Migrations: Test the App

1. **Start the app**:
   ```bash
   npm run dev
   ```

2. **Test key flows**:
   - Sign up new user → Profile auto-created ✅
   - View checklist → Items loaded ✅
   - View modules → 5 modules loaded ✅
   - View discussions → 16 prompts loaded ✅
   - Toggle theme → Theme persisted ✅

3. **Check Realtime**:
   - Open app in two browsers
   - Update checklist in one → See update in other ✅

---

## Summary

### Migration Options Comparison

| Option | Files | Time | Completeness | Recommended For |
|--------|-------|------|--------------|-----------------|
| **Option 1: Consolidated** | 1 file | ~2 min | Complete | ✅ Fresh projects |
| **Option 2: Sequential** | 56 files | ~30 min | Complete | Historical tracking |
| **Option 3: Essential** | 16 files | ~10 min | Core features | Quick setup |

### What You Get

**Database Size**: ~50 MB
**Tables Created**: 20+
**Seed Data**: 32 items (5 categories + 27 checklist items)
**Indexes**: 50+
**RLS Policies**: 30+
**Functions**: 6
**Triggers**: 10+

### Recommended Approach

🎯 **For Fresh Deployment**: Use **Option 1** (Consolidated File)
- Fastest setup (~2 minutes)
- Everything in one file
- Production-ready immediately

🎯 **For Existing Database**: Use **Option 2** (Sequential)
- Step-by-step control
- Review each migration
- Best for partial updates

🎯 **For Quick Test**: Use **Option 3** (Essential)
- Core features only
- Faster than sequential
- Good for development

---

Your database is now production-ready! 🎉

**Next Steps:**
1. Enable Realtime subscriptions (see post-migration steps)
2. Set your admin user email
3. Test the application with `npm run dev`
4. Follow DEPLOYMENT.md for production deployment
