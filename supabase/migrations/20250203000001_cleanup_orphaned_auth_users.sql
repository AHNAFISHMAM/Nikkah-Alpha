-- =============================================
-- Cleanup Orphaned Auth Users
-- =============================================
-- This script helps identify and clean up users in auth.users
-- whose profiles have been deleted/anonymized
-- 
-- Run this manually in Supabase SQL Editor to clean up existing deleted users
-- =============================================

-- View orphaned auth users (users in auth.users with deleted profiles)
CREATE OR REPLACE VIEW v_orphaned_auth_users AS
SELECT 
  au.id,
  au.email,
  au.created_at as auth_created_at,
  p.email as profile_email,
  CASE 
    WHEN p.email LIKE 'deleted_%@deleted.local' THEN 'Profile deleted'
    WHEN p.id IS NULL THEN 'No profile exists'
    ELSE 'Active'
  END as status
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.email LIKE 'deleted_%@deleted.local'
   OR (p.id IS NULL AND au.email IS NOT NULL);

-- Grant view access
GRANT SELECT ON v_orphaned_auth_users TO authenticated;

COMMENT ON VIEW v_orphaned_auth_users IS 
'Shows users in auth.users whose profiles are deleted or missing.
These users need to be deleted from auth.users via the Edge Function
to allow email reuse.';

-- Query to see orphaned users:
-- SELECT * FROM v_orphaned_auth_users;

-- To delete these users, use the Edge Function:
-- POST /functions/v1/delete-auth-user with { "userId": "<user_id>" }

