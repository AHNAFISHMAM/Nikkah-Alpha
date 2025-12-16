-- =============================================
-- FIX ORPHANED USERS - Complete SQL Script
-- =============================================
-- Paste this entire file into Supabase SQL Editor
-- This will help you find and fix users that exist in auth.users
-- but not in profiles table (preventing email reuse)
-- =============================================

-- =============================================
-- STEP 1: Create helper views and functions
-- =============================================

-- View to see all users in auth.users with their profile status
CREATE OR REPLACE VIEW v_auth_users_with_profiles AS
SELECT 
  au.id as auth_user_id,
  au.email as auth_email,
  au.created_at as auth_created_at,
  au.confirmed_at,
  au.deleted_at,
  p.id as profile_id,
  p.email as profile_email,
  p.full_name as profile_name,
  CASE 
    WHEN p.id IS NULL THEN 'No Profile'
    WHEN p.email LIKE 'deleted_%@deleted.local' THEN 'Profile Deleted'
    WHEN p.email = au.email THEN 'Profile Active'
    ELSE 'Profile Email Mismatch'
  END as status
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
ORDER BY au.created_at DESC;

-- Grant view access
GRANT SELECT ON v_auth_users_with_profiles TO authenticated;

-- Function to find orphaned auth users
CREATE OR REPLACE FUNCTION find_orphaned_auth_users()
RETURNS TABLE (
  user_id UUID,
  email TEXT,
  auth_created_at TIMESTAMPTZ,
  profile_status TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    au.id,
    au.email::TEXT,
    au.created_at,
    CASE 
      WHEN p.id IS NULL THEN 'No Profile'
      WHEN p.email LIKE 'deleted_%@deleted.local' THEN 'Profile Deleted'
      ELSE 'Other'
    END as status
  FROM auth.users au
  LEFT JOIN public.profiles p ON au.id = p.id
  WHERE p.id IS NULL 
     OR p.email LIKE 'deleted_%@deleted.local'
  ORDER BY au.created_at DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION find_orphaned_auth_users() TO authenticated;

-- =============================================
-- STEP 2: Check for orphaned users
-- =============================================

-- See ALL orphaned users (users in auth.users without active profiles)
SELECT 
  email,
  profile_status,
  auth_created_at,
  user_id
FROM find_orphaned_auth_users();

-- =============================================
-- STEP 3: Check a specific email
-- =============================================
-- Uncomment and replace 'your-email@example.com' with the actual email:

-- SELECT * FROM v_auth_users_with_profiles 
-- WHERE auth_email = 'your-email@example.com';

-- =============================================
-- STEP 4: Delete orphaned users
-- =============================================
-- WARNING: This will delete users from auth.users
-- Only run this if you're sure you want to delete these users
-- 
-- Option A: Delete a specific email (replace with actual email):
-- DELETE FROM auth.users WHERE email = 'your-email@example.com';
--
-- Option B: Delete ALL orphaned users (be careful!):
-- DELETE FROM auth.users 
-- WHERE id IN (
--   SELECT user_id FROM find_orphaned_auth_users()
-- );

-- =============================================
-- STEP 5: Verify deletion
-- =============================================
-- After deleting, run this to verify:
-- SELECT * FROM find_orphaned_auth_users();
-- Should return no rows (or fewer rows) if deletion worked

-- =============================================
-- QUICK REFERENCE QUERIES
-- =============================================

-- See all users and their status:
-- SELECT * FROM v_auth_users_with_profiles;

-- Count orphaned users:
-- SELECT COUNT(*) as orphaned_count FROM find_orphaned_auth_users();

-- See only users with "No Profile" status:
-- SELECT * FROM v_auth_users_with_profiles WHERE status = 'No Profile';

-- See only users with "Profile Deleted" status:
-- SELECT * FROM v_auth_users_with_profiles WHERE status = 'Profile Deleted';

-- =============================================
-- NOTES
-- =============================================
-- 1. If you get permission errors, click "Run as owner" in SQL Editor
-- 2. Always verify with SELECT queries before running DELETE
-- 3. After deleting from auth.users, emails can be reused for signups
-- 4. The views and functions created above will persist for future use

