-- =============================================
-- Enable Realtime for Dashboard Updates
-- =============================================
-- Enables Supabase Realtime subscriptions for dashboard data
-- Mobile-first: Optimized for efficient updates and battery life

-- Enable Realtime for user_checklist_progress
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'user_checklist_progress'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.user_checklist_progress;
  END IF;
END $$;

-- Set replica identity for change detection
ALTER TABLE public.user_checklist_progress REPLICA IDENTITY FULL;

-- Enable Realtime for user_module_progress
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'user_module_progress'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.user_module_progress;
  END IF;
END $$;

-- Set replica identity for change detection
ALTER TABLE public.user_module_progress REPLICA IDENTITY FULL;

-- Enable Realtime for user_discussion_answers
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'user_discussion_answers'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.user_discussion_answers;
  END IF;
END $$;

-- Set replica identity for change detection
ALTER TABLE public.user_discussion_answers REPLICA IDENTITY FULL;

-- Enable Realtime for user_financial_data
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'user_financial_data'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.user_financial_data;
  END IF;
END $$;

-- Set replica identity for change detection
ALTER TABLE public.user_financial_data REPLICA IDENTITY FULL;

-- Enable Realtime for profiles (selective - only for dashboard-relevant fields)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'profiles'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
  END IF;
END $$;

-- Set replica identity for change detection
ALTER TABLE public.profiles REPLICA IDENTITY FULL;

-- Add indexes for performance (if they don't exist)
CREATE INDEX IF NOT EXISTS idx_user_checklist_progress_user_completed 
  ON public.user_checklist_progress(user_id, is_completed) 
  WHERE is_completed = true;

CREATE INDEX IF NOT EXISTS idx_user_module_progress_user_completed 
  ON public.user_module_progress(user_id, is_completed) 
  WHERE is_completed = true;

CREATE INDEX IF NOT EXISTS idx_user_discussion_answers_user_discussed 
  ON public.user_discussion_answers(user_id, is_discussed) 
  WHERE is_discussed = true;

CREATE INDEX IF NOT EXISTS idx_user_financial_data_user_type 
  ON public.user_financial_data(user_id, data_type);

-- Comments for documentation
COMMENT ON TABLE public.user_checklist_progress IS 'Realtime enabled for dashboard progress tracking';
COMMENT ON TABLE public.user_module_progress IS 'Realtime enabled for dashboard module completion tracking';
COMMENT ON TABLE public.user_discussion_answers IS 'Realtime enabled for dashboard discussion tracking';
COMMENT ON TABLE public.user_financial_data IS 'Realtime enabled for dashboard budget tracking';
COMMENT ON TABLE public.profiles IS 'Realtime enabled for dashboard profile updates (wedding date, partner)';

