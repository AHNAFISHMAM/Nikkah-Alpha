-- =============================================
-- Fix Column Name Mismatches
-- =============================================
-- CRITICAL FIX: Standardize column names across tables
-- Problem: Some tables use 'order_index', others use 'sort_order'
-- Solution: Standardize on 'sort_order' (more common convention)
-- 
-- This migration:
-- 1. Renames 'order_index' to 'sort_order' in discussion_prompts
-- 2. Updates TypeScript types will need manual update after this

BEGIN;

-- =============================================
-- 1. FIX discussion_prompts TABLE
-- =============================================
-- Current: order_index
-- Target: sort_order

-- Check if column exists and rename it
DO $$
BEGIN
  -- Check if order_index exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'discussion_prompts' 
    AND column_name = 'order_index'
  ) THEN
    -- Rename the column
    ALTER TABLE public.discussion_prompts 
    RENAME COLUMN order_index TO sort_order;
    
    RAISE NOTICE 'Renamed discussion_prompts.order_index to sort_order';
  ELSE
    RAISE NOTICE 'discussion_prompts.order_index does not exist, skipping rename';
  END IF;
END $$;

-- =============================================
-- 2. FIX modules TABLE (if needed)
-- =============================================
-- Check if modules has order_index instead of sort_order

DO $$
BEGIN
  -- Check if order_index exists in modules
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'modules' 
    AND column_name = 'order_index'
  ) THEN
    -- Check if sort_order also exists (shouldn't happen, but be safe)
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'modules' 
      AND column_name = 'sort_order'
    ) THEN
      -- Rename order_index to sort_order
      ALTER TABLE public.modules 
      RENAME COLUMN order_index TO sort_order;
      
      RAISE NOTICE 'Renamed modules.order_index to sort_order';
    ELSE
      RAISE NOTICE 'modules has both order_index and sort_order - manual intervention needed';
    END IF;
  ELSE
    RAISE NOTICE 'modules.order_index does not exist, skipping rename';
  END IF;
END $$;

-- =============================================
-- 3. UPDATE INDEXES (if they reference old column name)
-- =============================================

-- Drop old index if it exists
DROP INDEX IF EXISTS idx_discussion_prompts_order_index;

-- Recreate with new name (if sort_order exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'discussion_prompts' 
    AND column_name = 'sort_order'
  ) THEN
    -- Create index if it doesn't exist
    IF NOT EXISTS (
      SELECT 1 FROM pg_indexes 
      WHERE schemaname = 'public' 
      AND tablename = 'discussion_prompts' 
      AND indexname = 'idx_discussion_prompts_sort_order'
    ) THEN
      CREATE INDEX idx_discussion_prompts_sort_order 
      ON public.discussion_prompts(sort_order);
    END IF;
    
    -- Update composite index if it exists
    DROP INDEX IF EXISTS idx_discussion_prompts_category_order;
    CREATE INDEX IF NOT EXISTS idx_discussion_prompts_category_sort 
    ON public.discussion_prompts(category, sort_order);
  END IF;
END $$;

COMMIT;

-- =============================================
-- MIGRATION COMPLETE
-- =============================================
-- ✅ Standardized on 'sort_order' column name
-- ✅ Updated indexes to use new column name
-- 
-- NEXT STEP: Update TypeScript types in src/types/database.ts:
-- - Change discussion_prompts.order_index to sort_order
-- - Verify modules.sort_order is correct
-- =============================================

