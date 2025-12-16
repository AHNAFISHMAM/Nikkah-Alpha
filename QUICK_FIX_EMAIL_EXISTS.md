# Quick Fix: "Email Already Exists" Error

## The Problem
You see "An account with this email already exists" but the user isn't in your `profiles` table. This happens because:
- The user exists in `auth.users` (Supabase Auth table)
- But NOT in `profiles` table (or profile was deleted)

## Quick Fix (3 Steps)

### Step 1: Check if User Exists in auth.users

Open **Supabase Dashboard → SQL Editor** and run:

```sql
-- Replace 'your-email@example.com' with the actual email
SELECT 
  id,
  email,
  created_at,
  confirmed_at
FROM auth.users
WHERE email = 'your-email@example.com';
```

**If this returns a row**, that's the problem! The user exists in `auth.users` but not in `profiles`.

### Step 2: Delete from auth.users

**Option A: Via Dashboard (Easiest)**
1. Go to **Supabase Dashboard → Authentication → Users**
2. Search for the email
3. Click on the user
4. Click **"Delete User"** button

**Option B: Via SQL (If you have permissions)**
```sql
-- Replace 'your-email@example.com' with the actual email
DELETE FROM auth.users 
WHERE email = 'your-email@example.com';
```

**Note:** You may need to run this with "Run as owner" in the SQL Editor if you get permission errors.

### Step 3: Try Signup Again

After deleting from `auth.users`, try signing up again with the same email. It should work! ✅

## Find ALL Orphaned Users

To see all users that need cleanup, run this query:

```sql
-- First, run the migration to create the view:
-- File: supabase/migrations/20250203000002_check_and_cleanup_orphaned_users.sql

-- Then run this:
SELECT 
  auth_email,
  status,
  auth_user_id
FROM v_auth_users_with_profiles
WHERE status IN ('No Profile', 'Profile Deleted')
ORDER BY auth_created_at DESC;
```

This shows all emails that can't be reused because they exist in `auth.users` but not in `profiles`.

## Why This Happens

When you delete a user:
- ✅ Profile gets deleted/anonymized in `profiles` table
- ❌ User remains in `auth.users` (Supabase Auth table)

Supabase Auth enforces email uniqueness, so the email can't be reused until removed from `auth.users`.

## Prevention

After fixing this, the Edge Function will automatically delete from `auth.users` when users delete their accounts. Make sure:
1. Edge Function is deployed: `supabase functions deploy delete-auth-user`
2. Service role key is set in Edge Function secrets

See `SETUP_EMAIL_REUSE_FIX.md` for full setup instructions.

