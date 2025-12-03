-- ========================================
-- MASTER GREEN THEME MIGRATION
-- Complete Database Setup for 5 Green Theme Feature
-- ========================================
-- 
-- PURPOSE:
-- Adds green_theme column to profiles table to store user's preferred
-- green color theme (emerald, forest, mint, sage, or jade)
--
-- REQUIREMENTS:
-- - profiles table must exist
-- - User must have ALTER TABLE permissions
-- - PostgreSQL 9.5+ (for IF NOT EXISTS support)
--
-- USAGE:
-- 1. Run this entire file in your database SQL editor
-- 2. Verify success messages appear
-- 3. Check that column was added: SELECT green_theme FROM profiles LIMIT 1;
--
-- ========================================

-- ========================================
-- STEP 1: Add green_theme column
-- ========================================
-- Adds the column with CHECK constraint to ensure only valid values
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS green_theme TEXT DEFAULT 'emerald' 
  CHECK (green_theme IN ('emerald', 'forest', 'mint', 'sage', 'jade'));

-- ========================================
-- STEP 2: Update existing profiles
-- ========================================
-- Sets default theme for all existing users
UPDATE public.profiles
SET green_theme = 'emerald'
WHERE green_theme IS NULL;

-- ========================================
-- STEP 3: Make column NOT NULL
-- ========================================
-- Ensures data integrity after setting defaults
ALTER TABLE public.profiles
ALTER COLUMN green_theme SET NOT NULL;

-- ========================================
-- STEP 4: Add database comment
-- ========================================
-- Documents the column purpose and valid values
COMMENT ON COLUMN public.profiles.green_theme IS 
  'User preferred green theme color. Valid values: emerald, forest, mint, sage, jade. Defaults to emerald.';

-- ========================================
-- STEP 5: Create index for performance
-- ========================================
-- Improves query performance when filtering by theme
CREATE INDEX IF NOT EXISTS idx_profiles_green_theme 
ON public.profiles(green_theme);

-- ========================================
-- STEP 6: Grant permissions
-- ========================================
-- Allows authenticated users to read and update their own theme
GRANT SELECT, UPDATE ON public.profiles TO authenticated;

-- ========================================
-- STEP 7: RLS Policies (Optional)
-- ========================================
-- Uncomment if you need explicit RLS policies for green_theme
-- Most apps already have UPDATE policies on profiles that cover this

/*
-- Policy: Users can update their own green_theme
CREATE POLICY "Users can update own green_theme"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Policy: Users can read their own green_theme
CREATE POLICY "Users can read own green_theme"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);
*/

-- ========================================
-- VERIFICATION QUERIES
-- ========================================
-- Run these after migration to verify success:

-- Check column exists and has correct type
-- SELECT column_name, data_type, column_default, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'profiles' AND column_name = 'green_theme';

-- Check all users have theme set
-- SELECT green_theme, COUNT(*) 
-- FROM public.profiles 
-- GROUP BY green_theme;

-- Check index was created
-- SELECT indexname, indexdef 
-- FROM pg_indexes 
-- WHERE tablename = 'profiles' AND indexname = 'idx_profiles_green_theme';

-- ========================================
-- ROLLBACK (If needed)
-- ========================================
-- To undo this migration, run:
/*
DROP INDEX IF EXISTS public.idx_profiles_green_theme;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS green_theme;
*/

-- ========================================
-- SUCCESS MESSAGES
-- ========================================
DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ Green theme migration completed!';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ Column green_theme added to profiles table';
  RAISE NOTICE '✅ All existing profiles set to emerald (default)';
  RAISE NOTICE '✅ Index created for performance';
  RAISE NOTICE '✅ Permissions granted to authenticated users';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Verify column: SELECT green_theme FROM profiles LIMIT 1;';
  RAISE NOTICE '2. Update your Profile TypeScript interface';
  RAISE NOTICE '3. Implement ThemeContext with green theme support';
  RAISE NOTICE '4. Add theme selector UI to your Profile page';
  RAISE NOTICE '========================================';
END $$;

