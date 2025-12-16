-- =============================================
-- DELETE ORPHANED USER - Quick Fix
-- =============================================
-- Paste this into Supabase SQL Editor
-- Replace 'your-email@example.com' with the actual email
-- =============================================

-- Step 1: Check if user exists in auth.users
SELECT 
  id,
  email,
  created_at,
  confirmed_at
FROM auth.users
WHERE email = 'your-email@example.com';

-- Step 2: If the above query returns a row, delete it:
-- (Uncomment the line below and replace the email)
-- DELETE FROM auth.users WHERE email = 'your-email@example.com';

-- Step 3: Verify deletion (should return no rows):
-- SELECT * FROM auth.users WHERE email = 'your-email@example.com';

