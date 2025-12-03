-- =============================================
-- Remove Duplicate Discussion Prompts
-- =============================================
-- This migration identifies and removes duplicate
-- discussion prompts based on title and category.
-- 
-- Strategy:
-- 1. Identify duplicates by (title, category)
-- 2. Keep the prompt with the lowest ID (earliest created)
-- 3. Migrate user_discussion_answers from duplicates to kept prompt
-- 4. Delete duplicate prompts (cascades to answers)
-- =============================================

-- Step 1: Create a temporary table to identify duplicates and which ones to keep
CREATE TEMP TABLE IF NOT EXISTS duplicate_prompts_analysis AS
WITH ranked_prompts AS (
  SELECT 
    id,
    title,
    category,
    created_at,
    ROW_NUMBER() OVER (
      PARTITION BY LOWER(TRIM(title)), LOWER(TRIM(category))
      ORDER BY created_at ASC, id ASC
    ) as rn
  FROM public.discussion_prompts
)
SELECT 
  id,
  title,
  category,
  created_at,
  rn,
  CASE WHEN rn = 1 THEN true ELSE false END as keep_prompt
FROM ranked_prompts;

-- Step 2: Show duplicates that will be removed (for review)
-- This is just for information - you can run this separately to see what will be deleted
-- SELECT * FROM duplicate_prompts_analysis WHERE keep_prompt = false ORDER BY title, category;

-- Step 3: Migrate user_discussion_answers from duplicate prompts to kept prompts
-- For each duplicate, find the corresponding kept prompt and migrate answers
DO $$
DECLARE
  dup_record RECORD;
  kept_prompt_id UUID;
  answer_record RECORD;
  migrated_count INTEGER := 0;
  deleted_count INTEGER := 0;
BEGIN
  -- Loop through all duplicate prompts
  FOR dup_record IN 
    SELECT dp.id as duplicate_id, dp.title, dp.category
    FROM duplicate_prompts_analysis dpa
    JOIN public.discussion_prompts dp ON dp.id = dpa.id
    WHERE dpa.keep_prompt = false
  LOOP
    -- Find the kept prompt with the same title and category
    SELECT dp.id INTO kept_prompt_id
    FROM duplicate_prompts_analysis dpa
    JOIN public.discussion_prompts dp ON dp.id = dpa.id
    WHERE dpa.keep_prompt = true
      AND LOWER(TRIM(dp.title)) = LOWER(TRIM(dup_record.title))
      AND LOWER(TRIM(dp.category)) = LOWER(TRIM(dup_record.category))
    LIMIT 1;

    -- If we found a kept prompt, migrate answers
    IF kept_prompt_id IS NOT NULL THEN
      -- Migrate answers that don't already exist for the kept prompt
      FOR answer_record IN
        SELECT uda.*
        FROM public.user_discussion_answers uda
        WHERE uda.prompt_id = dup_record.duplicate_id
      LOOP
        -- Check if answer already exists for this user and kept prompt
        IF NOT EXISTS (
          SELECT 1 
          FROM public.user_discussion_answers 
          WHERE user_id = answer_record.user_id 
            AND prompt_id = kept_prompt_id
        ) THEN
          -- Migrate the answer to the kept prompt
          UPDATE public.user_discussion_answers
          SET prompt_id = kept_prompt_id,
              updated_at = NOW()
          WHERE id = answer_record.id;
          
          migrated_count := migrated_count + 1;
        ELSE
          -- Answer already exists for kept prompt, delete the duplicate answer
          DELETE FROM public.user_discussion_answers
          WHERE id = answer_record.id;
          
          deleted_count := deleted_count + 1;
        END IF;
      END LOOP;
    END IF;
  END LOOP;

  RAISE NOTICE 'Migrated % answers, deleted % duplicate answers', migrated_count, deleted_count;
END $$;

-- Step 4: Delete duplicate prompts (this will cascade delete any remaining answers)
DELETE FROM public.discussion_prompts
WHERE id IN (
  SELECT id 
  FROM duplicate_prompts_analysis 
  WHERE keep_prompt = false
);

-- Step 5: Clean up temporary table
DROP TABLE IF EXISTS duplicate_prompts_analysis;

-- Step 6: Verify no duplicates remain
-- You can run this query separately to verify:
-- SELECT title, category, COUNT(*) as count
-- FROM public.discussion_prompts
-- GROUP BY LOWER(TRIM(title)), LOWER(TRIM(category))
-- HAVING COUNT(*) > 1;

-- =============================================
-- Summary:
-- This migration will:
-- 1. Identify duplicates by (title, category) - case-insensitive
-- 2. Keep the earliest created prompt (by created_at, then id)
-- 3. Migrate user answers from duplicates to the kept prompt
-- 4. Delete duplicate prompts (cascades to any remaining answers)
-- =============================================

