# Migration Error Fix Guide

## Common Error Messages
```
ERROR: 42703: column "token" does not exist
ERROR: 42703: column "sender_id" does not exist
ERROR: 42703: column "theme_mode" does not exist
```

## What Happened?
You previously ran some migrations that created tables with old schemas. Those tables are missing newer columns or have different column names. When running the consolidated migration:
1. It skips creating tables that already exist (`CREATE TABLE IF NOT EXISTS`)
2. Then fails when trying to use columns that don't exist in the old schema

**Root cause**: Your database has a partial/old migration state that conflicts with the consolidated migration.

---

## Solution 1: Fresh Start (FASTEST - Recommended if you have no important data)

### Step 1: Drop All Tables
1. Open Supabase Dashboard → SQL Editor
2. Open the file: `DROP_ALL_TABLES.sql` (UPDATED - more thorough)
3. Copy entire contents
4. Paste and click **RUN**
5. Wait for completion (~5 seconds)
6. You should see: "CREATE SCHEMA" success messages

### Step 2: Run Consolidated Migration
1. Open the file: `ALL_MIGRATIONS_CONSOLIDATED.sql`
2. Copy entire contents
3. Paste and click **RUN**
4. Wait for completion (~2-3 minutes)

### Step 3: Verify
```sql
-- Check tables created
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Should see 20+ tables
```

**Pros:**
- ✅ Clean slate
- ✅ Fastest solution (~3 minutes total)
- ✅ No compatibility issues

**Cons:**
- ❌ Deletes all existing data
- ❌ Need to recreate test users

---

## Solution 2: Update Existing Tables (If you have data to preserve)

### The Fix
I've updated `ALL_MIGRATIONS_CONSOLIDATED.sql` to handle existing tables. It now:
- Checks if columns exist before creating them
- Adds missing columns to existing tables
- Generates default values for new required columns

### How to Run
1. Open Supabase Dashboard → SQL Editor
2. Open the **UPDATED** file: `ALL_MIGRATIONS_CONSOLIDATED.sql`
3. Copy entire contents
4. Paste and click **RUN**
5. Wait for completion

### What It Does
```sql
-- Example: Adds token column if missing
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns ...) THEN
    ALTER TABLE partner_invitations ADD COLUMN token TEXT;
    -- Generate tokens for existing rows
    UPDATE partner_invitations SET token = gen_random_uuid()::text;
    -- Make it NOT NULL
    ALTER TABLE partner_invitations ALTER COLUMN token SET NOT NULL;
  END IF;
END $$;
```

**Pros:**
- ✅ Preserves existing data
- ✅ Handles partial migrations
- ✅ Safe for production

**Cons:**
- ⚠️ Slightly slower
- ⚠️ May have data inconsistencies from partial migrations

---

## Solution 3: Fix Partner Invitations Table

### For "sender_id does not exist" Error

Your `partner_invitations` table has the wrong schema entirely. Best to drop and recreate it.

**Use the provided script:**
1. Open Supabase SQL Editor
2. Run: `FIX_PARTNER_INVITATIONS.sql`
3. Then re-run: `ALL_MIGRATIONS_CONSOLIDATED.sql`

**Or manual fix:**
```sql
DROP TABLE IF EXISTS public.partner_invitations CASCADE;

CREATE TABLE public.partner_invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_email TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  status TEXT DEFAULT 'pending',
  expires_at TIMESTAMPTZ NOT NULL,
  accepted_at TIMESTAMPTZ,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.partner_invitations ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_partner_invitations_token ON public.partner_invitations(token);
CREATE INDEX idx_partner_invitations_sender ON public.partner_invitations(sender_id);
```

---

## Solution 4: Manual Column Fix (If you only want to fix specific errors)

### Quick Fix for Token Column
```sql
-- Add token column to partner_invitations
ALTER TABLE public.partner_invitations
ADD COLUMN IF NOT EXISTS token TEXT;

-- Generate tokens for existing rows
UPDATE public.partner_invitations
SET token = gen_random_uuid()::text
WHERE token IS NULL;

-- Make it NOT NULL and UNIQUE
ALTER TABLE public.partner_invitations
ALTER COLUMN token SET NOT NULL;

ALTER TABLE public.partner_invitations
ADD CONSTRAINT partner_invitations_token_unique UNIQUE (token);

-- Now you can create the index
CREATE INDEX IF NOT EXISTS idx_partner_invitations_token
ON public.partner_invitations(token);
```

### Quick Fix for Version Column
```sql
ALTER TABLE public.partner_invitations
ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1;
```

### Quick Fix for Theme Mode (profiles)
```sql
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS theme_mode TEXT DEFAULT 'system'
CHECK (theme_mode IN ('light', 'dark', 'system'));
```

### Quick Fix for Role (profiles)
```sql
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user'
CHECK (role IN ('user', 'admin'));
```

**Pros:**
- ✅ Targeted fix
- ✅ Fast
- ✅ Minimal changes

**Cons:**
- ❌ May need multiple fixes
- ❌ Doesn't guarantee all columns are added
- ❌ Tedious for many missing columns

---

## Recommended Approach

### If you just started and have NO important data:
→ **Use Solution 1** (Fresh Start)
- Drop all tables
- Run consolidated migration
- Total time: 3 minutes

### If you have data to preserve:
→ **Use Solution 2** (Updated Consolidated Migration)
- Run the updated `ALL_MIGRATIONS_CONSOLIDATED.sql`
- It automatically handles missing columns
- Total time: 3-5 minutes

### If you want minimal changes:
→ **Use Solution 3** (Manual Fix)
- Run each ALTER TABLE command as needed
- Then retry the consolidated migration

---

## Post-Fix Verification

After running any solution, verify with:

```sql
-- 1. Check all tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- 2. Check partner_invitations has token column
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'partner_invitations'
ORDER BY ordinal_position;

-- 3. Check profiles has theme_mode and role
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'profiles'
ORDER BY ordinal_position;

-- 4. Verify RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

---

## Common Errors After Fix

### "duplicate key value violates unique constraint"
- Means you have duplicate data
- Solution: Clean up duplicates before adding UNIQUE constraint

### "column already exists"
- Migration trying to add column that's already there
- Solution: Safe to ignore, or use IF NOT EXISTS

### "relation does not exist"
- Table hasn't been created yet
- Solution: Ensure tables are created in dependency order

---

## Need More Help?

If you continue to see errors:

1. **Check existing tables:**
   ```sql
   SELECT table_name FROM information_schema.tables
   WHERE table_schema = 'public';
   ```

2. **Check existing columns:**
   ```sql
   SELECT table_name, column_name
   FROM information_schema.columns
   WHERE table_schema = 'public'
   ORDER BY table_name, ordinal_position;
   ```

3. **Share the error message** with:
   - Full error text
   - Which migration file you're running
   - List of existing tables

---

## Success Indicators

Migration successful when you see:
- ✅ COMMIT (at end of output)
- ✅ No error messages in red
- ✅ 20+ tables created
- ✅ Seed data inserted (27 checklist items)

Test the app:
```bash
npm run dev
# Sign up → Profile auto-created ✅
# View checklist → 27 items loaded ✅
```

---

**Quick Command Reference:**

```bash
# Solution 1 (Fresh Start)
# 1. Run DROP_ALL_TABLES.sql
# 2. Run ALL_MIGRATIONS_CONSOLIDATED.sql

# Solution 2 (Update Existing)
# 1. Run ALL_MIGRATIONS_CONSOLIDATED.sql (updated version)

# Solution 3 (Manual Fix)
# 1. Run ALTER TABLE commands above
# 2. Run ALL_MIGRATIONS_CONSOLIDATED.sql
```
