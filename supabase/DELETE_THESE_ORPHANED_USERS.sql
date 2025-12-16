-- =============================================
-- DELETE ORPHANED USERS - Ready to Run
-- =============================================
-- This will delete the 6 orphaned users found
-- Paste this into Supabase SQL Editor and run
-- =============================================

-- Delete all orphaned users by their user IDs
DELETE FROM auth.users 
WHERE id IN (
  '636bed31-d05c-42f5-aafc-b034c9ba881b', -- fahmidas209@gmail.com
  'e25af749-65a7-453b-9de5-e8a9ecbc9277', -- fahmidaome120@gmail.com
  '7c6f4b05-86b4-43a5-8596-5542ada339e2', -- fahmidaome40@gmail.com
  'a37de4f8-0e7c-4182-a104-bc84c28976e5', -- kojackburst@gmail.com
  'ab7c3797-d11e-44a5-9393-bcc637469b2d', -- bolebo8506@elygifts.com
  'b8757cd8-676d-4995-b957-623b52378d28'  -- temowe5312@elygifts.com
);

-- Verify deletion (should return 0 rows)
SELECT * FROM find_orphaned_auth_users()
WHERE user_id IN (
  '636bed31-d05c-42f5-aafc-b034c9ba881b',
  'e25af749-65a7-453b-9de5-e8a9ecbc9277',
  '7c6f4b05-86b4-43a5-8596-5542ada339e2',
  'a37de4f8-0e7c-4182-a104-bc84c28976e5',
  'ab7c3797-d11e-44a5-9393-bcc637469b2d',
  'b8757cd8-676d-4995-b957-623b52378d28'
);

