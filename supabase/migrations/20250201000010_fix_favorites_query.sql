-- =============================================
-- Fix Favorites Query and Verify Constraints
-- =============================================
-- Ensures UNIQUE constraint exists to prevent duplicate favorites
-- This migration verifies the constraint and adds it if missing

-- Verify UNIQUE constraint exists (should already exist from initial migration)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'user_resource_favorites_user_id_resource_id_key'
    AND conrelid = 'public.user_resource_favorites'::regclass
  ) THEN
    -- Add UNIQUE constraint if it doesn't exist
    ALTER TABLE public.user_resource_favorites
    ADD CONSTRAINT user_resource_favorites_user_id_resource_id_key 
    UNIQUE (user_id, resource_id);
    
    RAISE NOTICE 'Added UNIQUE constraint on user_resource_favorites (user_id, resource_id)';
  ELSE
    RAISE NOTICE 'UNIQUE constraint already exists on user_resource_favorites (user_id, resource_id)';
  END IF;
END $$;

-- Add comment for documentation
COMMENT ON CONSTRAINT user_resource_favorites_user_id_resource_id_key 
ON public.user_resource_favorites IS 
'Prevents duplicate favorites for the same user and resource. Ensures each user can only favorite a resource once.';

-- Verify indexes exist for performance
DO $$
BEGIN
  -- Index on user_id for fast lookups
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE schemaname = 'public' 
    AND tablename = 'user_resource_favorites' 
    AND indexname = 'idx_user_resource_favorites_user_id'
  ) THEN
    CREATE INDEX idx_user_resource_favorites_user_id 
    ON public.user_resource_favorites(user_id);
    RAISE NOTICE 'Created index on user_resource_favorites.user_id';
  END IF;

  -- Composite index on (user_id, resource_id) for fast favorite checks
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE schemaname = 'public' 
    AND tablename = 'user_resource_favorites' 
    AND indexname = 'idx_user_resource_favorites_user_resource'
  ) THEN
    CREATE INDEX idx_user_resource_favorites_user_resource 
    ON public.user_resource_favorites(user_id, resource_id);
    RAISE NOTICE 'Created composite index on user_resource_favorites(user_id, resource_id)';
  END IF;
END $$;

-- Clean up any duplicate favorites (if they exist due to previous bug)
-- This is safe to run multiple times
DO $$
DECLARE
  duplicate_count INTEGER;
BEGIN
  -- Count duplicates
  SELECT COUNT(*) INTO duplicate_count
  FROM (
    SELECT user_id, resource_id, COUNT(*) as cnt
    FROM public.user_resource_favorites
    GROUP BY user_id, resource_id
    HAVING COUNT(*) > 1
  ) duplicates;

  IF duplicate_count > 0 THEN
    -- Remove duplicates, keeping only the oldest one (first favorited)
    DELETE FROM public.user_resource_favorites
    WHERE id IN (
      SELECT id
      FROM (
        SELECT id,
               ROW_NUMBER() OVER (
                 PARTITION BY user_id, resource_id 
                 ORDER BY created_at ASC
               ) as rn
        FROM public.user_resource_favorites
      ) ranked
      WHERE rn > 1
    );
    
    RAISE NOTICE 'Removed % duplicate favorite entries', duplicate_count;
  ELSE
    RAISE NOTICE 'No duplicate favorites found';
  END IF;
END $$;

