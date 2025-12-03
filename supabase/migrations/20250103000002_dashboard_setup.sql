-- =============================================
-- Dashboard Page Database Setup
-- =============================================
-- This migration ensures all database structures
-- required for the Dashboard page are in place.
--
-- Page: /dashboard (Dashboard.tsx)
-- Dependencies:
--   - profiles table (for user data, wedding date)
--   - checklist_categories, checklist_items, user_checklist_progress (for readiness score)
--   - user_financial_data (for budget summary)
--   - modules, lessons, user_module_progress (for learning progress)
--   - discussion_prompts, user_discussion_notes (for recent activity)
--   - RLS policies for secure access
--   - Indexes for optimal query performance
-- =============================================
-- Safe to run multiple times (idempotent)

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 1. PROFILES TABLE (Required for Dashboard)
-- =============================================
-- Dashboard uses: full_name, wedding_date
-- Note: This may already exist from previous migrations

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  first_name TEXT,
  last_name TEXT,
  date_of_birth DATE,
  age INTEGER,
  gender TEXT CHECK (gender IN ('male', 'female', 'prefer_not_to_say')),
  marital_status TEXT CHECK (marital_status IN ('Single', 'Engaged', 'Researching')),
  country TEXT,
  city TEXT,
  partner_name TEXT,
  partner_using_app BOOLEAN DEFAULT FALSE,
  partner_email TEXT,
  partner_status TEXT CHECK (partner_status IN ('searching', 'engaged', 'planning')),
  wedding_date DATE,
  avatar_url TEXT,
  profile_visibility TEXT DEFAULT 'public' CHECK (profile_visibility IN ('public', 'private')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure wedding_date column exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'wedding_date'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN wedding_date DATE;
  END IF;
END $$;

-- =============================================
-- 2. CHECKLIST CATEGORIES
-- =============================================
-- Dashboard uses: id, name, sort_order (for ordering)
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
-- 3. CHECKLIST ITEMS
-- =============================================
-- Dashboard uses: id, category_id, title (for recent activity)
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
-- 4. USER CHECKLIST PROGRESS
-- =============================================
-- Dashboard uses: user_id, item_id, is_completed, completed_at
-- Critical for: Readiness score calculation, recent activity feed
-- Note: Table name is user_checklist_progress (not user_checklist_status)

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
-- 5. USER FINANCIAL DATA
-- =============================================
-- Dashboard uses: user_id, data_type, data, updated_at
-- Critical for: Budget summary card, surplus calculation, recent activity
-- Note: Table name is user_financial_data (not budgets), uses JSONB data field

CREATE TABLE IF NOT EXISTS public.user_financial_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  data_type TEXT NOT NULL CHECK (data_type IN ('mahr', 'budget', 'savings', 'cost_split')),
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- 6. MODULES TABLE
-- =============================================
-- Dashboard uses: id, title, is_published (for recent activity, total count)
-- Note: id is TEXT, not UUID

CREATE TABLE IF NOT EXISTS public.modules (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  estimated_duration INTEGER,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- 7. LESSONS TABLE
-- =============================================
-- Dashboard uses: id, module_id (for learning progress calculation)

CREATE TABLE IF NOT EXISTS public.lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  module_id TEXT NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  video_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- 8. USER MODULE PROGRESS
-- =============================================
-- Dashboard uses: user_id, module_id, lesson_id, is_completed, completed_at
-- Critical for: Learning progress, recent activity feed
-- Note: Table name is user_module_progress (not module_notes)

CREATE TABLE IF NOT EXISTS public.user_module_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  module_id TEXT NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  quiz_score INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- 9. DISCUSSION PROMPTS
-- =============================================
-- Dashboard uses: id, title (for recent activity feed)
-- Note: id is UUID

CREATE TABLE IF NOT EXISTS public.discussion_prompts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  questions JSONB DEFAULT '[]'::jsonb,
  tips TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- 10. USER DISCUSSION NOTES
-- =============================================
-- Dashboard uses: user_id, prompt_id, updated_at
-- Critical for: Recent activity feed
-- Note: Table name is user_discussion_notes (not user_discussion_answers)
-- Note: Field is discussed_at (not completed_at)

CREATE TABLE IF NOT EXISTS public.user_discussion_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  prompt_id UUID NOT NULL REFERENCES public.discussion_prompts(id) ON DELETE CASCADE,
  notes TEXT,
  is_discussed BOOLEAN NOT NULL DEFAULT false,
  discussed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, prompt_id)
);

-- =============================================
-- 11. PERFORMANCE INDEXES
-- =============================================
-- Critical indexes for Dashboard page queries

-- Profiles: Wedding date queries
CREATE INDEX IF NOT EXISTS idx_profiles_wedding_date 
ON public.profiles(wedding_date) 
WHERE wedding_date IS NOT NULL;

-- Checklist: Category ordering
CREATE INDEX IF NOT EXISTS idx_checklist_categories_sort_order 
ON public.checklist_categories(sort_order);

-- Checklist Items: Category lookup
CREATE INDEX IF NOT EXISTS idx_checklist_items_category 
ON public.checklist_items(category_id);

-- User Checklist Progress: User + completion status (for readiness score)
CREATE INDEX IF NOT EXISTS idx_user_checklist_progress_user_completed 
ON public.user_checklist_progress(user_id, is_completed) 
WHERE is_completed = true;

-- User Checklist Progress: Recent completions (last 7 days)
CREATE INDEX IF NOT EXISTS idx_user_checklist_progress_recent_completions 
ON public.user_checklist_progress(user_id, completed_at) 
WHERE is_completed = true AND completed_at IS NOT NULL;

-- User Checklist Progress: User lookup
CREATE INDEX IF NOT EXISTS idx_user_checklist_progress_user 
ON public.user_checklist_progress(user_id);

-- User Financial Data: User lookup
CREATE INDEX IF NOT EXISTS idx_user_financial_data_user 
ON public.user_financial_data(user_id);

-- User Financial Data: Recent updates (for activity feed)
CREATE INDEX IF NOT EXISTS idx_user_financial_data_updated_at 
ON public.user_financial_data(user_id, updated_at);

-- Modules: Ordering and published status
CREATE INDEX IF NOT EXISTS idx_modules_sort_order 
ON public.modules(sort_order);

CREATE INDEX IF NOT EXISTS idx_modules_published 
ON public.modules(is_published) 
WHERE is_published = true;

-- Lessons: Module lookup
CREATE INDEX IF NOT EXISTS idx_lessons_module 
ON public.lessons(module_id);

-- User Module Progress: User + completion status
CREATE INDEX IF NOT EXISTS idx_user_module_progress_user_completed 
ON public.user_module_progress(user_id, is_completed) 
WHERE is_completed = true;

-- User Module Progress: Recent completions (last 7 days)
CREATE INDEX IF NOT EXISTS idx_user_module_progress_recent_completions 
ON public.user_module_progress(user_id, completed_at) 
WHERE is_completed = true AND completed_at IS NOT NULL;

-- User Module Progress: Module lookup
CREATE INDEX IF NOT EXISTS idx_user_module_progress_module 
ON public.user_module_progress(module_id);

-- Discussion Notes: User + recent updates
CREATE INDEX IF NOT EXISTS idx_user_discussion_notes_user_updated 
ON public.user_discussion_notes(user_id, updated_at);

-- Discussion Notes: Prompt lookup
CREATE INDEX IF NOT EXISTS idx_user_discussion_notes_prompt 
ON public.user_discussion_notes(prompt_id);

-- =============================================
-- 12. ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklist_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_checklist_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_financial_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_module_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discussion_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_discussion_notes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

DROP POLICY IF EXISTS "Anyone can view checklist categories" ON public.checklist_categories;
DROP POLICY IF EXISTS "Anyone can view checklist items" ON public.checklist_items;

DROP POLICY IF EXISTS "Users can view own checklist progress" ON public.user_checklist_progress;
DROP POLICY IF EXISTS "Users can insert own checklist progress" ON public.user_checklist_progress;
DROP POLICY IF EXISTS "Users can update own checklist progress" ON public.user_checklist_progress;
DROP POLICY IF EXISTS "Users can delete own checklist progress" ON public.user_checklist_progress;

DROP POLICY IF EXISTS "Users can view own financial data" ON public.user_financial_data;
DROP POLICY IF EXISTS "Users can insert own financial data" ON public.user_financial_data;
DROP POLICY IF EXISTS "Users can update own financial data" ON public.user_financial_data;

DROP POLICY IF EXISTS "Anyone can view modules" ON public.modules;
DROP POLICY IF EXISTS "Anyone can view lessons" ON public.lessons;

DROP POLICY IF EXISTS "Users can view own module progress" ON public.user_module_progress;
DROP POLICY IF EXISTS "Users can insert own module progress" ON public.user_module_progress;
DROP POLICY IF EXISTS "Users can update own module progress" ON public.user_module_progress;

DROP POLICY IF EXISTS "Anyone can view discussion prompts" ON public.discussion_prompts;

DROP POLICY IF EXISTS "Users can view own discussion notes" ON public.user_discussion_notes;
DROP POLICY IF EXISTS "Users can insert own discussion notes" ON public.user_discussion_notes;
DROP POLICY IF EXISTS "Users can update own discussion notes" ON public.user_discussion_notes;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Checklist categories: Public read access
CREATE POLICY "Anyone can view checklist categories"
  ON public.checklist_categories FOR SELECT
  USING (true);

-- Checklist items: Public read access
CREATE POLICY "Anyone can view checklist items"
  ON public.checklist_items FOR SELECT
  USING (true);

-- User checklist progress: Users can only access their own
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

-- User financial data: Users can only access their own
CREATE POLICY "Users can view own financial data"
  ON public.user_financial_data FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own financial data"
  ON public.user_financial_data FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own financial data"
  ON public.user_financial_data FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Modules: Public read access
CREATE POLICY "Anyone can view modules"
  ON public.modules FOR SELECT
  USING (true);

-- Lessons: Public read access
CREATE POLICY "Anyone can view lessons"
  ON public.lessons FOR SELECT
  USING (true);

-- User module progress: Users can only access their own
CREATE POLICY "Users can view own module progress"
  ON public.user_module_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own module progress"
  ON public.user_module_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own module progress"
  ON public.user_module_progress FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Discussion prompts: Public read access
CREATE POLICY "Anyone can view discussion prompts"
  ON public.discussion_prompts FOR SELECT
  USING (true);

-- User discussion notes: Users can only access their own
CREATE POLICY "Users can view own discussion notes"
  ON public.user_discussion_notes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own discussion notes"
  ON public.user_discussion_notes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own discussion notes"
  ON public.user_discussion_notes FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =============================================
-- 13. AUTOMATIC UPDATED_AT TRIGGERS
-- =============================================

-- Create function to update updated_at timestamp (in public schema for consistency)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to tables with updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_checklist_progress_updated_at ON public.user_checklist_progress;
CREATE TRIGGER update_user_checklist_progress_updated_at
  BEFORE UPDATE ON public.user_checklist_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_financial_data_updated_at ON public.user_financial_data;
CREATE TRIGGER update_user_financial_data_updated_at
  BEFORE UPDATE ON public.user_financial_data
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_modules_updated_at ON public.modules;
CREATE TRIGGER update_modules_updated_at
  BEFORE UPDATE ON public.modules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_lessons_updated_at ON public.lessons;
CREATE TRIGGER update_lessons_updated_at
  BEFORE UPDATE ON public.lessons
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_module_progress_updated_at ON public.user_module_progress;
CREATE TRIGGER update_user_module_progress_updated_at
  BEFORE UPDATE ON public.user_module_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_discussion_notes_updated_at ON public.user_discussion_notes;
CREATE TRIGGER update_user_discussion_notes_updated_at
  BEFORE UPDATE ON public.user_discussion_notes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- 14. AUTO-COMPLETE TRIGGERS
-- =============================================
-- Automatically set completed_at when is_completed becomes true

-- Function to set completed_at timestamp
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

-- Apply to user_checklist_progress
DROP TRIGGER IF EXISTS set_checklist_completed_at ON public.user_checklist_progress;
CREATE TRIGGER set_checklist_completed_at
  BEFORE UPDATE ON public.user_checklist_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.set_completed_at();

-- Apply to user_module_progress
DROP TRIGGER IF EXISTS set_module_completed_at ON public.user_module_progress;
CREATE TRIGGER set_module_completed_at
  BEFORE UPDATE ON public.user_module_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.set_completed_at();

-- =============================================
-- 15. GRANT PERMISSIONS
-- =============================================

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT ON public.checklist_categories TO authenticated;
GRANT SELECT ON public.checklist_items TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_checklist_progress TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.user_financial_data TO authenticated;
GRANT SELECT ON public.modules TO authenticated;
GRANT SELECT ON public.lessons TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.user_module_progress TO authenticated;
GRANT SELECT ON public.discussion_prompts TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.user_discussion_notes TO authenticated;

-- =============================================
-- 16. VERIFICATION QUERIES
-- =============================================
-- Uncomment to verify the setup:

-- Check all tables exist
-- SELECT table_name 
-- FROM information_schema.tables 
-- WHERE table_schema = 'public' 
-- AND table_name IN (
--   'profiles', 'checklist_categories', 'checklist_items', 
--   'user_checklist_progress', 'user_financial_data', 'modules', 
--   'lessons', 'user_module_progress', 'discussion_prompts', 'user_discussion_notes'
-- );

-- Check indexes exist
-- SELECT indexname, tablename 
-- FROM pg_indexes 
-- WHERE schemaname = 'public' 
-- AND tablename IN (
--   'profiles', 'checklist_categories', 'checklist_items', 
--   'user_checklist_progress', 'user_financial_data', 'modules', 
--   'lessons', 'user_module_progress', 'discussion_prompts', 'user_discussion_notes'
-- );

-- Check RLS is enabled
-- SELECT tablename, rowsecurity 
-- FROM pg_tables 
-- WHERE schemaname = 'public' 
-- AND table_name IN (
--   'profiles', 'checklist_categories', 'checklist_items', 
--   'user_checklist_progress', 'user_financial_data', 'modules', 
--   'lessons', 'user_module_progress', 'discussion_prompts', 'user_discussion_notes'
-- );

-- =============================================
-- MIGRATION COMPLETE
-- =============================================
-- The Dashboard page now has all required database structures:
--
-- ✅ All tables created with correct schema (matching database.ts types)
-- ✅ Performance indexes for fast queries
-- ✅ RLS policies for secure access
-- ✅ Auto-update triggers for updated_at timestamps
-- ✅ Auto-complete triggers for completed_at timestamps
-- ✅ Proper foreign key relationships
-- ✅ Unique constraints to prevent duplicates
--
-- The Dashboard page will now be able to:
--   - Calculate readiness score (completed checklist items / total)
--   - Display wedding countdown (from profiles.wedding_date)
--   - Show budget summary (from user_financial_data with data_type='budget')
--   - Track learning progress (completed modules / total)
--   - Display recent activity feed (last 7 days)
--   - Generate contextual reminders
--
-- Next steps:
--   1. Run this migration in Supabase SQL Editor
--   2. Seed initial data (checklist categories, items, modules, prompts)
--   3. Test the /dashboard route with an authenticated user
--   4. Verify all stats cards display correctly
--   5. Check recent activity feed populates
-- =============================================

