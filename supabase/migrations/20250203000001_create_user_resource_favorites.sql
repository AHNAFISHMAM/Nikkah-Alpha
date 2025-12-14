-- =============================================
-- Create Missing user_resource_favorites Table
-- =============================================
-- This table was referenced in TypeScript types and code
-- but never created in the database.
-- CRITICAL FIX: Favorites feature is completely broken without this.

BEGIN;

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 1. CREATE user_resource_favorites TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS public.user_resource_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  resource_id UUID NOT NULL REFERENCES public.resources(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Prevent duplicate favorites
  UNIQUE(user_id, resource_id)
);

-- =============================================
-- 2. CREATE INDEXES FOR PERFORMANCE
-- =============================================

CREATE INDEX IF NOT EXISTS idx_user_resource_favorites_user_id 
  ON public.user_resource_favorites(user_id);

CREATE INDEX IF NOT EXISTS idx_user_resource_favorites_resource_id 
  ON public.user_resource_favorites(resource_id);

CREATE INDEX IF NOT EXISTS idx_user_resource_favorites_user_resource 
  ON public.user_resource_favorites(user_id, resource_id);

CREATE INDEX IF NOT EXISTS idx_user_resource_favorites_created_at 
  ON public.user_resource_favorites(created_at DESC);

-- =============================================
-- 3. ENABLE ROW LEVEL SECURITY
-- =============================================

ALTER TABLE public.user_resource_favorites ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 4. CREATE RLS POLICIES
-- =============================================

-- Users can view their own favorites
DROP POLICY IF EXISTS "Users can view own favorites" ON public.user_resource_favorites;
CREATE POLICY "Users can view own favorites"
  ON public.user_resource_favorites FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can insert their own favorites
DROP POLICY IF EXISTS "Users can insert own favorites" ON public.user_resource_favorites;
CREATE POLICY "Users can insert own favorites"
  ON public.user_resource_favorites FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own favorites
DROP POLICY IF EXISTS "Users can delete own favorites" ON public.user_resource_favorites;
CREATE POLICY "Users can delete own favorites"
  ON public.user_resource_favorites FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- =============================================
-- 5. GRANT PERMISSIONS
-- =============================================

GRANT SELECT, INSERT, DELETE ON public.user_resource_favorites TO authenticated;

COMMIT;

-- =============================================
-- MIGRATION COMPLETE
-- =============================================
-- ✅ user_resource_favorites table created
-- ✅ Performance indexes added
-- ✅ RLS policies enabled
-- ✅ Unique constraint prevents duplicates
-- 
-- The favorites feature should now work correctly.
-- =============================================

