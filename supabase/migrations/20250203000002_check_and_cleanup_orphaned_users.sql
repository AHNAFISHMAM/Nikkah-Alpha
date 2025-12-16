-- =============================================
-- Check and Cleanup Orphaned Auth Users
-- =============================================
-- This migration provides queries to find and understand
-- why emails can't be reused for signups

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

-- Function to find orphaned auth users (users in auth.users without active profiles)
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
    au.email,
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

COMMENT ON VIEW v_auth_users_with_profiles IS 
'Shows all users in auth.users with their profile status.
Use this to identify orphaned users that prevent email reuse.';

COMMENT ON FUNCTION find_orphaned_auth_users() IS 
'Returns list of users in auth.users that don''t have active profiles.
These users need to be deleted from auth.users to allow email reuse.';

-- Quick query to check a specific email:
-- SELECT * FROM v_auth_users_with_profiles WHERE auth_email = 'your-email@example.com';

-- Quick query to see all orphaned users:
-- SELECT * FROM find_orphaned_auth_users();

