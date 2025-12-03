-- Add discuss_with_partner column to user_checklist_progress table
-- This column allows users to mark checklist items for discussion with their partner

-- Check if column exists before adding (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'user_checklist_progress'
      AND column_name = 'discuss_with_partner'
  ) THEN
    ALTER TABLE public.user_checklist_progress
    ADD COLUMN discuss_with_partner BOOLEAN NOT NULL DEFAULT false;
    
    -- Add comment for documentation
    COMMENT ON COLUMN public.user_checklist_progress.discuss_with_partner IS 
      'Flag to mark checklist items for discussion with partner';
  END IF;
END $$;

