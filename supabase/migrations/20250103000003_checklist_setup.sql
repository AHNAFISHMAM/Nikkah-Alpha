-- =============================================
-- Checklist Page Database Setup
-- =============================================
-- This migration ensures all database structures
-- required for the Checklist page are in place.
--
-- Page: /dashboard/checklist (Checklist.tsx)
-- Dependencies:
--   - checklist_categories table (for organizing items)
--   - checklist_items table (individual checklist tasks)
--   - user_checklist_progress table (user progress tracking)
--   - RLS policies for secure access
--   - Indexes for optimal query performance
--   - Triggers for automatic completed_at timestamp
--   - Sample seed data for categories and items
-- =============================================
-- Safe to run multiple times (idempotent)

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 1. CHECKLIST CATEGORIES TABLE
-- =============================================
-- Stores categories that group checklist items
-- Note: id is TEXT, not UUID

CREATE TABLE IF NOT EXISTS public.checklist_categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- 2. CHECKLIST ITEMS TABLE
-- =============================================
-- Stores individual checklist items/tasks
-- Note: id is UUID, category_id is TEXT

CREATE TABLE IF NOT EXISTS public.checklist_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id TEXT NOT NULL REFERENCES public.checklist_categories(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  is_required BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- 3. USER CHECKLIST PROGRESS TABLE
-- =============================================
-- Tracks user's completion status for each checklist item
-- Critical for: Progress calculation, completion tracking, recent activity
-- Note: Table name is user_checklist_progress (not user_checklist_status)
-- Note: Field is item_id (not checklist_item_id)
-- Note: user_id is UUID (references profiles.id), item_id is UUID (references checklist_items.id)

CREATE TABLE IF NOT EXISTS public.user_checklist_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES public.checklist_items(id) ON DELETE CASCADE,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, item_id)
);

-- =============================================
-- 4. PERFORMANCE INDEXES
-- =============================================
-- Critical indexes for Checklist page queries

-- Categories: Ordering queries
CREATE INDEX IF NOT EXISTS idx_checklist_categories_sort_order 
ON public.checklist_categories(sort_order);

-- Checklist Items: Category lookup and ordering
CREATE INDEX IF NOT EXISTS idx_checklist_items_category 
ON public.checklist_items(category_id);

CREATE INDEX IF NOT EXISTS idx_checklist_items_sort_order 
ON public.checklist_items(category_id, sort_order);

-- User Checklist Progress: User lookup
CREATE INDEX IF NOT EXISTS idx_user_checklist_progress_user 
ON public.user_checklist_progress(user_id);

-- User Checklist Progress: User + completion status (for progress calculation)
CREATE INDEX IF NOT EXISTS idx_user_checklist_progress_user_completed 
ON public.user_checklist_progress(user_id, is_completed) 
WHERE is_completed = true;

-- User Checklist Progress: Unique constraint index (for upsert performance)
CREATE INDEX IF NOT EXISTS idx_user_checklist_progress_unique 
ON public.user_checklist_progress(user_id, item_id);

-- User Checklist Progress: Recent completions (for activity feed)
CREATE INDEX IF NOT EXISTS idx_user_checklist_progress_recent_completions 
ON public.user_checklist_progress(user_id, completed_at) 
WHERE is_completed = true AND completed_at IS NOT NULL;

-- =============================================
-- 5. ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS on all tables
ALTER TABLE public.checklist_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_checklist_progress ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Anyone can view checklist categories" ON public.checklist_categories;
DROP POLICY IF EXISTS "Anyone can view checklist items" ON public.checklist_items;
DROP POLICY IF EXISTS "Users can view own checklist progress" ON public.user_checklist_progress;
DROP POLICY IF EXISTS "Users can insert own checklist progress" ON public.user_checklist_progress;
DROP POLICY IF EXISTS "Users can update own checklist progress" ON public.user_checklist_progress;
DROP POLICY IF EXISTS "Users can delete own checklist progress" ON public.user_checklist_progress;

-- Checklist categories: Public read access (all users can view)
CREATE POLICY "Anyone can view checklist categories"
  ON public.checklist_categories FOR SELECT
  USING (true);

-- Checklist items: Public read access
CREATE POLICY "Anyone can view checklist items"
  ON public.checklist_items FOR SELECT
  USING (true);

-- User checklist progress: Users can only access their own status
CREATE POLICY "Users can view own checklist progress"
  ON public.user_checklist_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own checklist progress"
  ON public.user_checklist_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own checklist progress"
  ON public.user_checklist_progress FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own checklist progress"
  ON public.user_checklist_progress FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================
-- 6. AUTOMATIC UPDATED_AT TRIGGER
-- =============================================

-- Create function to update updated_at timestamp (in public schema for consistency)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to user_checklist_progress
DROP TRIGGER IF EXISTS update_user_checklist_progress_updated_at ON public.user_checklist_progress;
CREATE TRIGGER update_user_checklist_progress_updated_at
  BEFORE UPDATE ON public.user_checklist_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- 7. AUTO-COMPLETE TRIGGER
-- =============================================
-- Automatically set completed_at when is_completed becomes true
-- Automatically clear completed_at when is_completed becomes false

CREATE OR REPLACE FUNCTION public.set_completed_at()
RETURNS TRIGGER AS $$
BEGIN
  -- Set completed_at when is_completed changes from false to true
  IF NEW.is_completed = true AND (OLD.is_completed = false OR OLD.is_completed IS NULL) THEN
    IF NEW.completed_at IS NULL THEN
      NEW.completed_at = NOW();
    END IF;
  END IF;
  -- Clear completed_at when is_completed becomes false
  IF NEW.is_completed = false THEN
    NEW.completed_at = NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to user_checklist_progress
DROP TRIGGER IF EXISTS set_checklist_completed_at ON public.user_checklist_progress;
CREATE TRIGGER set_checklist_completed_at
  BEFORE UPDATE ON public.user_checklist_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.set_completed_at();

-- Also handle INSERT case (when creating new status as completed)
CREATE OR REPLACE FUNCTION public.set_checklist_completed_at_insert()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_completed = true AND NEW.completed_at IS NULL THEN
    NEW.completed_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_checklist_completed_at_insert_trigger ON public.user_checklist_progress;
CREATE TRIGGER set_checklist_completed_at_insert_trigger
  BEFORE INSERT ON public.user_checklist_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.set_checklist_completed_at_insert();

-- =============================================
-- 8. GRANT PERMISSIONS
-- =============================================

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON public.checklist_categories TO authenticated;
GRANT SELECT ON public.checklist_items TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_checklist_progress TO authenticated;

-- =============================================
-- 9. SEED DATA (Sample Categories and Items)
-- =============================================
-- Insert categories (only if they don't exist)
-- Note: Using TEXT IDs (not UUIDs)

INSERT INTO public.checklist_categories (id, name, description, sort_order)
SELECT * FROM (VALUES
  ('spiritual', 'Spiritual Preparation', 'Strengthen your faith and Islamic knowledge together', 1),
  ('financial', 'Financial Preparation', 'Plan your financial future as a couple', 2),
  ('family', 'Family & Social', 'Navigate family relationships and social expectations', 3),
  ('personal', 'Personal Development', 'Grow individually and as a couple', 4),
  ('future', 'Future Planning', 'Set goals and plan for your life together', 5)
) AS v(id, name, description, sort_order)
WHERE NOT EXISTS (
  SELECT 1 FROM public.checklist_categories WHERE id = v.id
);

-- Insert Spiritual Preparation items
INSERT INTO public.checklist_items (id, category_id, title, description, sort_order, is_required)
SELECT 
  uuid_generate_v4(),
  'spiritual',
  * 
FROM (VALUES
  ('Learn Islamic marriage rights and responsibilities', 'Understand the rights and duties of spouses in Islam', 1, false),
  ('Study basic intimacy rulings in Islam', 'Learn about halal intimacy, family planning from Islamic perspective', 2, false),
  ('Discuss prayer and worship habits', 'Share and align on daily prayers, Quran reading, and dhikr routines', 3, false),
  ('Study Quranic guidance about marriage', 'Read and reflect on verses about love, mercy, and partnership', 4, false),
  ('Understand spouse rights in Islam', 'Learn about mutual respect, kindness, and Islamic boundaries', 5, false)
) AS v(title, description, sort_order, is_required)
WHERE NOT EXISTS (
  SELECT 1 FROM public.checklist_items 
  WHERE title = v.title 
  AND category_id = 'spiritual'
);

-- Insert Financial Preparation items
INSERT INTO public.checklist_items (id, category_id, title, description, sort_order, is_required)
SELECT 
  uuid_generate_v4(),
  'financial',
  * 
FROM (VALUES
  ('Agree on Mahr amount and payment', 'Discuss and finalize the mahr (dowry) according to Islamic principles', 1, false),
  ('Create housing plan and budget', 'Decide where to live and calculate housing costs', 2, false),
  ('Plan monthly expenses together', 'Create a realistic monthly budget covering all expenses', 3, false),
  ('Disclose and plan for existing debts', 'Be transparent about any debts and create repayment plan', 4, false),
  ('Set emergency fund goals', 'Plan to save 3-6 months of expenses for emergencies', 5, false),
  ('Assess career stability and income', 'Discuss job security, career goals, and income expectations', 6, false)
) AS v(title, description, sort_order, is_required)
WHERE NOT EXISTS (
  SELECT 1 FROM public.checklist_items 
  WHERE title = v.title 
  AND category_id = 'financial'
);

-- Insert Family & Social items
INSERT INTO public.checklist_items (id, category_id, title, description, sort_order, is_required)
SELECT 
  uuid_generate_v4(),
  'family',
  * 
FROM (VALUES
  ('Obtain Wali approval and involvement', 'Ensure proper Islamic process with guardian involvement', 1, false),
  ('Complete family introductions', 'Both families should meet and get to know each other', 2, false),
  ('Discuss cultural expectations', 'Talk about cultural practices, traditions, and boundaries', 3, false),
  ('Decide on living arrangements', 'Clarify if living independently, with family, or other arrangement', 4, false),
  ('Set in-laws relationship boundaries', 'Discuss healthy relationships with extended family', 5, false)
) AS v(title, description, sort_order, is_required)
WHERE NOT EXISTS (
  SELECT 1 FROM public.checklist_items 
  WHERE title = v.title 
  AND category_id = 'family'
);

-- Insert Personal Development items
INSERT INTO public.checklist_items (id, category_id, title, description, sort_order, is_required)
SELECT 
  uuid_generate_v4(),
  'personal',
  * 
FROM (VALUES
  ('Develop anger management skills', 'Learn to control anger and communicate calmly', 1, false),
  ('Practice communication and conflict resolution', 'Learn healthy ways to disagree and resolve issues', 2, false),
  ('Discuss household responsibilities division', 'Talk about cooking, cleaning, and home management', 3, false),
  ('Share daily habits and routines', 'Understand each other''s schedules, sleep patterns, and preferences', 4, false),
  ('Set health and fitness goals', 'Discuss healthy lifestyle, exercise, and wellness plans', 5, false),
  ('Mental health check and awareness', 'Be open about mental health history and support needs', 6, false)
) AS v(title, description, sort_order, is_required)
WHERE NOT EXISTS (
  SELECT 1 FROM public.checklist_items 
  WHERE title = v.title 
  AND category_id = 'personal'
);

-- Insert Future Planning items
INSERT INTO public.checklist_items (id, category_id, title, description, sort_order, is_required)
SELECT 
  uuid_generate_v4(),
  'future',
  * 
FROM (VALUES
  ('Discuss children and family planning', 'Talk about when/if to have children and family size preferences', 1, false),
  ('Align on education and career goals', 'Share individual goals and how to support each other', 2, false),
  ('Create long-term living plan', 'Discuss where you want to live in 5-10 years', 3, false),
  ('Set 5-year financial goals', 'Plan for major purchases, savings, investments', 4, false),
  ('Plan for children''s Islamic education', 'Discuss Islamic school, homeschooling, or weekend programs', 5, false)
) AS v(title, description, sort_order, is_required)
WHERE NOT EXISTS (
  SELECT 1 FROM public.checklist_items 
  WHERE title = v.title 
  AND category_id = 'future'
);

-- =============================================
-- 10. VERIFICATION QUERIES
-- =============================================
-- Uncomment to verify the setup:

-- Check tables exist
-- SELECT table_name 
-- FROM information_schema.tables 
-- WHERE table_schema = 'public' 
-- AND table_name IN ('checklist_categories', 'checklist_items', 'user_checklist_progress');

-- Check categories count
-- SELECT COUNT(*) as category_count FROM public.checklist_categories;

-- Check items count
-- SELECT COUNT(*) as item_count FROM public.checklist_items;

-- Check items per category
-- SELECT 
--   c.name as category,
--   COUNT(i.id) as item_count
-- FROM public.checklist_categories c
-- LEFT JOIN public.checklist_items i ON i.category_id = c.id
-- GROUP BY c.id, c.name
-- ORDER BY c.sort_order;

-- Check indexes exist
-- SELECT indexname, tablename 
-- FROM pg_indexes 
-- WHERE schemaname = 'public' 
-- AND tablename IN ('checklist_categories', 'checklist_items', 'user_checklist_progress');

-- Check RLS is enabled
-- SELECT tablename, rowsecurity 
-- FROM pg_tables 
-- WHERE schemaname = 'public' 
-- AND tablename IN ('checklist_categories', 'checklist_items', 'user_checklist_progress');

-- =============================================
-- MIGRATION COMPLETE
-- =============================================
-- The Checklist page now has all required database structures:
--
-- ✅ All tables created with correct schema (matching database.ts types)
-- ✅ Performance indexes for fast queries
-- ✅ RLS policies for secure access
-- ✅ Auto-update trigger for updated_at timestamp
-- ✅ Auto-complete trigger for completed_at timestamp
-- ✅ Sample seed data (5 categories, 27 items)
-- ✅ Proper foreign key relationships
-- ✅ Unique constraints to prevent duplicates
--
-- The Checklist page will now be able to:
--   - Display categories and items in proper order
--   - Track user completion status
--   - Calculate progress (completed/total)
--   - Update completion status with upsert
--   - Show recent completions in activity feed
--   - Handle duplicate items gracefully
--
-- Next steps:
--   1. Run this migration in Supabase SQL Editor
--   2. Verify seed data was inserted (run verification queries)
--   3. Test the /dashboard/checklist route with an authenticated user
--   4. Verify items can be checked/unchecked
--   5. Check progress calculation works correctly
--   6. Test print functionality
-- =============================================

