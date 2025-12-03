-- =============================================
-- Verify Notifications Setup
-- =============================================
-- Diagnostic migration to verify notifications system is properly configured
-- This will help identify any issues preventing notifications from working

-- 1. Verify notifications table exists and has correct structure
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'notifications') THEN
    RAISE EXCEPTION 'Notifications table does not exist. Please run the initial notifications migration first.';
  END IF;
  RAISE NOTICE '✓ Notifications table exists';
END $$;

-- 2. Verify RLS is enabled
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'notifications' 
    AND rowsecurity = true
  ) THEN
    RAISE WARNING 'RLS is not enabled on notifications table';
  ELSE
    RAISE NOTICE '✓ RLS is enabled on notifications table';
  END IF;
END $$;

-- 3. Verify RLS policies exist
DO $$
DECLARE
  policy_count INT;
BEGIN
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE schemaname = 'public' 
  AND tablename = 'notifications';
  
  IF policy_count = 0 THEN
    RAISE WARNING 'No RLS policies found on notifications table';
  ELSE
    RAISE NOTICE '✓ Found % RLS policies on notifications table', policy_count;
  END IF;
END $$;

-- 4. Verify REPLICA IDENTITY FULL is set
DO $$
DECLARE
  replica_identity TEXT;
BEGIN
  SELECT relreplident::TEXT INTO replica_identity
  FROM pg_class
  WHERE relname = 'notifications' AND relnamespace = 'public'::regnamespace;
  
  IF replica_identity != 'f' THEN
    RAISE WARNING 'REPLICA IDENTITY is not FULL (current: %). Realtime may not work correctly.', replica_identity;
    -- Fix it
    ALTER TABLE public.notifications REPLICA IDENTITY FULL;
    RAISE NOTICE '✓ Fixed: Set REPLICA IDENTITY to FULL';
  ELSE
    RAISE NOTICE '✓ REPLICA IDENTITY is FULL';
  END IF;
END $$;

-- 5. Verify notifications table is in Realtime publication
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'notifications'
  ) THEN
    RAISE WARNING 'Notifications table is not in supabase_realtime publication';
    -- Fix it
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
    RAISE NOTICE '✓ Fixed: Added notifications table to supabase_realtime publication';
  ELSE
    RAISE NOTICE '✓ Notifications table is in supabase_realtime publication';
  END IF;
END $$;

-- 6. Verify create_notification function exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' 
    AND p.proname = 'create_notification'
  ) THEN
    RAISE WARNING 'create_notification function does not exist';
  ELSE
    RAISE NOTICE '✓ create_notification function exists';
  END IF;
END $$;

-- 7. Show notification count per user (for debugging)
DO $$
DECLARE
  notification_stats RECORD;
BEGIN
  RAISE NOTICE '=== Notification Statistics ===';
  FOR notification_stats IN
    SELECT 
      user_id,
      COUNT(*) as total_count,
      COUNT(*) FILTER (WHERE is_read = false) as unread_count,
      MAX(created_at) as latest_notification
    FROM public.notifications
    GROUP BY user_id
    ORDER BY total_count DESC
    LIMIT 10
  LOOP
    RAISE NOTICE 'User %: % total (% unread), latest: %', 
      notification_stats.user_id, 
      notification_stats.total_count,
      notification_stats.unread_count,
      notification_stats.latest_notification;
  END LOOP;
  
  IF NOT FOUND THEN
    RAISE NOTICE 'No notifications found in database';
  END IF;
END $$;

-- 8. Verify indexes exist
DO $$
DECLARE
  index_count INT;
BEGIN
  SELECT COUNT(*) INTO index_count
  FROM pg_indexes
  WHERE schemaname = 'public' 
  AND tablename = 'notifications';
  
  IF index_count = 0 THEN
    RAISE WARNING 'No indexes found on notifications table';
  ELSE
    RAISE NOTICE '✓ Found % indexes on notifications table', index_count;
  END IF;
  
  RAISE NOTICE '=== Verification Complete ===';
  RAISE NOTICE 'If you see any warnings above, those issues need to be fixed for notifications to work properly.';
END $$;

