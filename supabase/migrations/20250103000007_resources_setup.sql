-- =============================================
-- Resources Page Database Setup
-- =============================================
-- This migration ensures all database structures
-- required for the Resources page are in place.
--
-- Page: /dashboard/resources (Resources.tsx)
-- Dependencies:
--   - resources table (stores resource library items)
--   - user_resource_favorites table (stores user favorites)
--   - RLS policies for secure access
--   - Indexes for optimal query performance
--   - Category validation (Books, Scholarly, Counseling, Finance, Duas, Courses)
-- =============================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 1. RESOURCES TABLE
-- =============================================
-- Stores curated Islamic resources including books,
-- scholarly articles, counseling, finance, duas, and courses.

CREATE TABLE IF NOT EXISTS public.resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  url TEXT NOT NULL,
  category TEXT NOT NULL,
  is_featured BOOLEAN DEFAULT FALSE NOT NULL,
  order_index INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Add category constraint if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_schema = 'public' 
    AND table_name = 'resources' 
    AND constraint_name LIKE '%category%'
  ) THEN
    ALTER TABLE public.resources 
    ADD CONSTRAINT resources_category_check 
    CHECK (category IN ('Books', 'Scholarly', 'Counseling', 'Finance', 'Duas', 'Courses'));
  END IF;
END $$;

-- Rename sort_order to order_index if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'resources' 
    AND column_name = 'sort_order'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'resources' 
    AND column_name = 'order_index'
  ) THEN
    ALTER TABLE public.resources RENAME COLUMN sort_order TO order_index;
  END IF;
END $$;

-- Add order_index column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'resources' 
    AND column_name = 'order_index'
  ) THEN
    ALTER TABLE public.resources ADD COLUMN order_index INTEGER;
  END IF;
END $$;

-- Ensure url column exists and is NOT NULL
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'resources' 
    AND column_name = 'url'
  ) THEN
    ALTER TABLE public.resources ADD COLUMN url TEXT NOT NULL DEFAULT '';
  ELSIF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'resources' 
    AND column_name = 'url'
    AND is_nullable = 'YES'
  ) THEN
    -- Update existing NULL values to empty string, then make NOT NULL
    UPDATE public.resources SET url = '' WHERE url IS NULL;
    ALTER TABLE public.resources ALTER COLUMN url SET NOT NULL;
  END IF;
END $$;

-- Indexes for resources table (create after column migration)
CREATE INDEX IF NOT EXISTS idx_resources_category ON public.resources(category);
CREATE INDEX IF NOT EXISTS idx_resources_is_featured ON public.resources(is_featured);
CREATE INDEX IF NOT EXISTS idx_resources_updated_at ON public.resources(updated_at DESC);

-- Create order_index indexes only if column exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'resources' 
    AND column_name = 'order_index'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_resources_order_index ON public.resources(order_index);
    CREATE INDEX IF NOT EXISTS idx_resources_category_order ON public.resources(category, order_index);
  END IF;
END $$;

-- =============================================
-- 2. USER_RESOURCE_FAVORITES TABLE
-- =============================================
-- Stores user's favorited resources for quick access.

CREATE TABLE IF NOT EXISTS public.user_resource_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resource_id UUID NOT NULL REFERENCES public.resources(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- One favorite record per user per resource
  UNIQUE(user_id, resource_id)
);

-- Indexes for user_resource_favorites table
CREATE INDEX IF NOT EXISTS idx_user_resource_favorites_user_id ON public.user_resource_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_resource_favorites_resource_id ON public.user_resource_favorites(resource_id);
CREATE INDEX IF NOT EXISTS idx_user_resource_favorites_user_resource ON public.user_resource_favorites(user_id, resource_id);
CREATE INDEX IF NOT EXISTS idx_user_resource_favorites_created_at ON public.user_resource_favorites(created_at DESC);

-- =============================================
-- 3. ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_resource_favorites ENABLE ROW LEVEL SECURITY;

-- Resources policies (public read, admin write)
-- All authenticated users can read resources
DROP POLICY IF EXISTS "users: select all resources" ON public.resources;
CREATE POLICY "users: select all resources"
  ON public.resources FOR SELECT
  TO authenticated
  USING (true);

-- Only service role can insert/update/delete resources (admin operations)
DROP POLICY IF EXISTS "service_role: manage resources" ON public.resources;
CREATE POLICY "service_role: manage resources"
  ON public.resources FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- User resource favorites policies
-- Users can read their own favorites
DROP POLICY IF EXISTS "users: select own resource_favorites" ON public.user_resource_favorites;
CREATE POLICY "users: select own resource_favorites"
  ON public.user_resource_favorites FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own favorites
DROP POLICY IF EXISTS "users: insert own resource_favorites" ON public.user_resource_favorites;
CREATE POLICY "users: insert own resource_favorites"
  ON public.user_resource_favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own favorites
DROP POLICY IF EXISTS "users: delete own resource_favorites" ON public.user_resource_favorites;
CREATE POLICY "users: delete own resource_favorites"
  ON public.user_resource_favorites FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================
-- 4. AUTOMATIC UPDATED_AT TRIGGERS
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for resources updated_at
DROP TRIGGER IF EXISTS update_resources_updated_at ON public.resources;
CREATE TRIGGER update_resources_updated_at
  BEFORE UPDATE ON public.resources
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- 5. GRANTS FOR AUTHENTICATED USERS
-- =============================================

-- Resources: read-only for authenticated users
GRANT SELECT ON public.resources TO authenticated;

-- User resource favorites: full access for authenticated users
GRANT SELECT, INSERT, DELETE ON public.user_resource_favorites TO authenticated;

-- =============================================
-- 6. SAMPLE RESOURCE DATA (Optional Seed)
-- =============================================
-- Uncomment and modify these INSERT statements
-- to seed initial resource data.

/*
-- Sample resources organized by category
INSERT INTO public.resources (title, description, url, category, is_featured, order_index) VALUES
-- Books Category
(
  'The Ideal Muslimah',
  'A comprehensive guide for Muslim women on Islamic character and conduct.',
  'https://example.com/ideal-muslimah',
  'Books',
  true,
  1
),
(
  'Men and Women Around the Messenger',
  'Biographical accounts of the companions of Prophet Muhammad (peace be upon him).',
  'https://example.com/men-women-messenger',
  'Books',
  false,
  2
),
-- Scholarly Category
(
  'Marriage in Islam: A Comprehensive Guide',
  'Scholarly article on the Islamic perspective of marriage and its requirements.',
  'https://example.com/marriage-islam-guide',
  'Scholarly',
  true,
  1
),
(
  'Rights and Responsibilities in Marriage',
  'Detailed explanation of spousal rights and duties according to Islamic teachings.',
  'https://example.com/rights-responsibilities',
  'Scholarly',
  false,
  2
),
-- Counseling Category
(
  'Islamic Marriage Counseling Services',
  'Professional counseling services for Muslim couples based on Islamic principles.',
  'https://example.com/counseling-services',
  'Counseling',
  false,
  1
),
-- Finance Category
(
  'Islamic Finance for Couples',
  'Guide to managing finances according to Islamic principles, avoiding interest.',
  'https://example.com/islamic-finance',
  'Finance',
  true,
  1
),
(
  'Zakat Calculator and Guide',
  'Calculate and understand your Zakat obligations as a married couple.',
  'https://example.com/zakat-calculator',
  'Finance',
  false,
  2
),
-- Duas Category
(
  'Duas for Finding a Righteous Spouse',
  'Collection of authentic duas from Quran and Sunnah for finding a good spouse.',
  'https://example.com/duas-spouse',
  'Duas',
  true,
  1
),
(
  'Duas for a Blessed Marriage',
  'Prayers and duas to strengthen your marriage and seek Allah''s blessings.',
  'https://example.com/duas-marriage',
  'Duas',
  false,
  2
),
-- Courses Category
(
  'Pre-Marriage Course: Islamic Perspective',
  'Comprehensive online course covering all aspects of marriage in Islam.',
  'https://example.com/pre-marriage-course',
  'Courses',
  true,
  1
),
(
  'Communication Skills for Muslim Couples',
  'Learn effective communication strategies based on Islamic teachings.',
  'https://example.com/communication-course',
  'Courses',
  false,
  2
)
ON CONFLICT DO NOTHING;
*/

-- =============================================
-- 7. VERIFICATION QUERIES
-- =============================================

-- Verify tables exist
DO $$
BEGIN
  ASSERT (SELECT COUNT(*) FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN ('resources', 'user_resource_favorites')) = 2,
    'Not all resource tables were created';
END $$;

-- Verify RLS is enabled
DO $$
BEGIN
  ASSERT (SELECT COUNT(*) FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename IN ('resources', 'user_resource_favorites')
    AND rowsecurity = true) = 2,
    'RLS is not enabled on all resource tables';
END $$;

-- Verify category constraint
DO $$
BEGIN
  ASSERT EXISTS (
    SELECT 1 FROM information_schema.check_constraints
    WHERE constraint_schema = 'public'
    AND constraint_name LIKE '%resources_category%'
  ),
    'Category CHECK constraint was not created';
END $$;

-- =============================================
-- Migration Complete
-- =============================================
-- All tables, indexes, policies, and triggers
-- for the Resources page are now in place.
-- =============================================

