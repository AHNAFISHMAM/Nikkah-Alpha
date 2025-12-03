-- =============================================
-- Fix Notifications Realtime Configuration
-- =============================================
-- Ensures notifications table has proper Realtime configuration
-- This fixes real-time updates not working

-- Set replica identity for Realtime change detection
-- This is REQUIRED for Supabase Realtime to work properly
-- Without this, Realtime cannot detect INSERT/UPDATE/DELETE changes
ALTER TABLE public.notifications REPLICA IDENTITY FULL;

-- Ensure notifications table is in Realtime publication
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'notifications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
  END IF;
END $$;

-- Add comment for documentation
COMMENT ON TABLE public.notifications IS 'Realtime enabled for instant notification updates. REPLICA IDENTITY FULL is required for change detection.';

