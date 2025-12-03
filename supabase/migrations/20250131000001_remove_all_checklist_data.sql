-- =============================================
-- Remove ALL Checklist Data (Complete Deletion)
-- =============================================
-- This migration removes ALL checklist categories, items, and user progress
-- No conditions, no filters - deletes EVERYTHING
-- Safe to run multiple times (idempotent)
-- =============================================

DO $$
BEGIN
  -- Step 1: Delete ALL user checklist progress (no WHERE clause = delete everything)
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_checklist_progress') THEN
    TRUNCATE TABLE public.user_checklist_progress CASCADE;
  END IF;

  -- Step 2: Delete ALL checklist items (no WHERE clause = delete everything)
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'checklist_items') THEN
    TRUNCATE TABLE public.checklist_items CASCADE;
  END IF;

  -- Step 3: Delete ALL checklist categories (no WHERE clause = delete everything)
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'checklist_categories') THEN
    TRUNCATE TABLE public.checklist_categories CASCADE;
  END IF;
END $$;

-- =============================================
-- VERIFICATION
-- =============================================
-- Verify all data is deleted (should return 0 for all):
SELECT 
  (SELECT COUNT(*) FROM public.checklist_categories) as remaining_categories,
  (SELECT COUNT(*) FROM public.checklist_items) as remaining_items,
  (SELECT COUNT(*) FROM public.user_checklist_progress) as remaining_progress;
-- =============================================

