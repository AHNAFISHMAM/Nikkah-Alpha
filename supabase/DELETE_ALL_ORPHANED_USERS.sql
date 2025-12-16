-- =============================================
-- DELETE ALL ORPHANED USERS - One Command
-- =============================================
-- This will delete ALL orphaned users at once
-- Use this if you want to clean up everything
-- =============================================

-- Delete all orphaned users (users without active profiles)
DELETE FROM auth.users 
WHERE id IN (
  SELECT user_id FROM find_orphaned_auth_users()
);

-- Verify deletion (should return 0 rows or fewer)
SELECT COUNT(*) as remaining_orphaned_users 
FROM find_orphaned_auth_users();

