-- =============================================
-- Enable Realtime for All Tables
-- =============================================
-- Enables Supabase Realtime subscriptions for all tables that need real-time updates
-- Sets REPLICA IDENTITY FULL and adds tables to supabase_realtime publication
-- Mobile-first: Optimized for efficient updates

-- =============================================
-- 1. USER_RESOURCE_FAVORITES
-- =============================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'user_resource_favorites'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.user_resource_favorites;
  END IF;
END $$;

ALTER TABLE public.user_resource_favorites REPLICA IDENTITY FULL;

-- =============================================
-- 2. BUDGETS
-- =============================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'budgets'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.budgets;
  END IF;
END $$;

ALTER TABLE public.budgets REPLICA IDENTITY FULL;

-- =============================================
-- 3. MAHR
-- =============================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'mahr'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.mahr;
  END IF;
END $$;

ALTER TABLE public.mahr REPLICA IDENTITY FULL;

-- =============================================
-- 4. WEDDING_BUDGETS
-- =============================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'wedding_budgets'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.wedding_budgets;
  END IF;
END $$;

ALTER TABLE public.wedding_budgets REPLICA IDENTITY FULL;

-- =============================================
-- 5. SAVINGS_GOALS
-- =============================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'savings_goals'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.savings_goals;
  END IF;
END $$;

ALTER TABLE public.savings_goals REPLICA IDENTITY FULL;

-- =============================================
-- 6. PARTNER_INVITATIONS
-- =============================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'partner_invitations'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.partner_invitations;
  END IF;
END $$;

ALTER TABLE public.partner_invitations REPLICA IDENTITY FULL;

-- =============================================
-- 7. COUPLES
-- =============================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'couples'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.couples;
  END IF;
END $$;

ALTER TABLE public.couples REPLICA IDENTITY FULL;

-- =============================================
-- 8. MODULE_NOTES
-- =============================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'module_notes'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.module_notes;
  END IF;
END $$;

ALTER TABLE public.module_notes REPLICA IDENTITY FULL;

-- =============================================
-- Comments for Documentation
-- =============================================
COMMENT ON TABLE public.user_resource_favorites IS 'Realtime enabled for instant favorite updates across Resources page';
COMMENT ON TABLE public.budgets IS 'Realtime enabled for instant budget updates in Financial page and Dashboard';
COMMENT ON TABLE public.mahr IS 'Realtime enabled for instant mahr updates in Financial page and Dashboard';
COMMENT ON TABLE public.wedding_budgets IS 'Realtime enabled for instant wedding budget updates in Financial page and Dashboard';
COMMENT ON TABLE public.savings_goals IS 'Realtime enabled for instant savings goals updates in Financial page and Dashboard';
COMMENT ON TABLE public.partner_invitations IS 'Realtime enabled for instant partner invitation status updates';
COMMENT ON TABLE public.couples IS 'Realtime enabled for instant partner connection status updates';
COMMENT ON TABLE public.module_notes IS 'Realtime enabled for instant module notes and completion status updates';

