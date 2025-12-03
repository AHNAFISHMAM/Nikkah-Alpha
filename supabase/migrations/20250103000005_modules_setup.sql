-- =============================================
-- Modules Page Database Setup
-- =============================================
-- This migration ensures all database structures
-- required for the Modules page are in place.
--
-- Page: /dashboard/modules (Modules.tsx)
-- Detail Page: /dashboard/modules/:id (ModuleDetail.tsx)
-- Dependencies:
--   - modules table (stores module content)
--   - lessons table (stores lesson content within modules)
--   - user_module_progress table (stores user progress and notes)
--   - RLS policies for secure access
--   - Indexes for optimal query performance
--   - Triggers for automatic completed_at timestamp
-- =============================================
-- Safe to run multiple times (idempotent)

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 1. MODULES TABLE
-- =============================================
-- Stores learning module content including title,
-- description, icon, estimated duration, and display order.
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
-- 2. LESSONS TABLE
-- =============================================
-- Stores lesson content within modules
-- Note: id is UUID, module_id is TEXT (references modules.id)

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
-- 3. USER MODULE PROGRESS TABLE
-- =============================================
-- Stores user progress, notes, and completion
-- status for each module/lesson.
-- Note: Table name is user_module_progress (not module_notes)
-- Note: module_id is TEXT (references modules.id), lesson_id is UUID (references lessons.id)

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
-- 4. PERFORMANCE INDEXES
-- =============================================
-- Critical indexes for Modules page queries

-- Modules: Ordering and published status
CREATE INDEX IF NOT EXISTS idx_modules_sort_order 
ON public.modules(sort_order);

CREATE INDEX IF NOT EXISTS idx_modules_published 
ON public.modules(is_published) 
WHERE is_published = true;

-- Lessons: Module lookup and ordering
CREATE INDEX IF NOT EXISTS idx_lessons_module 
ON public.lessons(module_id);

CREATE INDEX IF NOT EXISTS idx_lessons_sort_order 
ON public.lessons(module_id, sort_order);

-- User Module Progress: User lookup
CREATE INDEX IF NOT EXISTS idx_user_module_progress_user 
ON public.user_module_progress(user_id);

-- User Module Progress: Module lookup
CREATE INDEX IF NOT EXISTS idx_user_module_progress_module 
ON public.user_module_progress(module_id);

-- User Module Progress: Lesson lookup
CREATE INDEX IF NOT EXISTS idx_user_module_progress_lesson 
ON public.user_module_progress(lesson_id);

-- User Module Progress: User + completion status (for progress calculation)
CREATE INDEX IF NOT EXISTS idx_user_module_progress_user_completed 
ON public.user_module_progress(user_id, is_completed) 
WHERE is_completed = true;

-- User Module Progress: Recent completions (for activity feed)
CREATE INDEX IF NOT EXISTS idx_user_module_progress_recent_completions 
ON public.user_module_progress(user_id, completed_at) 
WHERE is_completed = true AND completed_at IS NOT NULL;

-- =============================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_module_progress ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Anyone can view modules" ON public.modules;
DROP POLICY IF EXISTS "Anyone can view lessons" ON public.lessons;
DROP POLICY IF EXISTS "Users can view own module progress" ON public.user_module_progress;
DROP POLICY IF EXISTS "Users can insert own module progress" ON public.user_module_progress;
DROP POLICY IF EXISTS "Users can update own module progress" ON public.user_module_progress;
DROP POLICY IF EXISTS "Users can delete own module progress" ON public.user_module_progress;

-- Modules policies: Public read access (all authenticated users can view)
CREATE POLICY "Anyone can view modules"
  ON public.modules FOR SELECT
  USING (true);

-- Lessons policies: Public read access (all authenticated users can view)
CREATE POLICY "Anyone can view lessons"
  ON public.lessons FOR SELECT
  USING (true);

-- User module progress policies: Users can only access their own progress
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

CREATE POLICY "Users can delete own module progress"
  ON public.user_module_progress FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================
-- 6. AUTOMATIC UPDATED_AT TRIGGERS
-- =============================================

-- Create function to update updated_at timestamp (in public schema for consistency)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_modules_updated_at ON public.modules;
DROP TRIGGER IF EXISTS update_lessons_updated_at ON public.lessons;
DROP TRIGGER IF EXISTS update_user_module_progress_updated_at ON public.user_module_progress;

-- Create triggers for updated_at
CREATE TRIGGER update_modules_updated_at
  BEFORE UPDATE ON public.modules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_lessons_updated_at
  BEFORE UPDATE ON public.lessons
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_module_progress_updated_at
  BEFORE UPDATE ON public.user_module_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- 7. COMPLETED_AT AUTO-SET TRIGGER
-- =============================================
-- Automatically sets completed_at timestamp when
-- is_completed changes from false to true.
-- Uses the shared set_completed_at function from Dashboard migration

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

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS set_module_completed_at ON public.user_module_progress;

-- Create trigger for user_module_progress
CREATE TRIGGER set_module_completed_at
  BEFORE UPDATE ON public.user_module_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.set_completed_at();

-- Also handle INSERT case (when creating new progress as completed)
CREATE OR REPLACE FUNCTION public.set_module_completed_at_insert()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_completed = true AND NEW.completed_at IS NULL THEN
    NEW.completed_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_module_completed_at_insert_trigger ON public.user_module_progress;
CREATE TRIGGER set_module_completed_at_insert_trigger
  BEFORE INSERT ON public.user_module_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.set_module_completed_at_insert();

-- =============================================
-- 8. GRANT PERMISSIONS
-- =============================================

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON public.modules TO authenticated;
GRANT SELECT ON public.lessons TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_module_progress TO authenticated;

-- =============================================
-- 9. SAMPLE MODULE DATA (Optional Seed)
-- =============================================
-- Uncomment and modify these INSERT statements
-- to seed initial module data.
-- Note: IDs should be TEXT (not UUID)

/*
-- Insert sample modules
INSERT INTO public.modules (id, title, description, icon, estimated_duration, sort_order, is_published) VALUES
(
  'understanding-islamic-marriage',
  'Understanding Islamic Marriage (Nikah)',
  'Learn the foundations of marriage in Islam, including the pillars, conditions, and rights of both spouses.',
  'book',
  60,
  1,
  true
),
(
  'communication-in-marriage',
  'Communication in Marriage',
  'Develop effective communication strategies and learn Islamic etiquette for resolving conflicts.',
  'message-circle',
  45,
  2,
  true
),
(
  'intimacy-and-family-planning',
  'Intimacy and Family Planning',
  'Understand Islamic rulings on intimacy, permissible contraception, and family planning.',
  'heart',
  50,
  3,
  true
),
(
  'financial-management',
  'Financial Management in Marriage',
  'Learn Islamic principles of financial management, Zakat obligations, and avoiding interest.',
  'wallet',
  40,
  4,
  true
),
(
  'family-relationships',
  'Family Relationships and Boundaries',
  'Understand the rights of parents and in-laws, and learn to balance relationships with family and spouse.',
  'users',
  35,
  5,
  true
)
ON CONFLICT (id) DO NOTHING;

-- Insert sample lessons for first module
INSERT INTO public.lessons (module_id, title, content, sort_order) VALUES
(
  'understanding-islamic-marriage',
  'Introduction to Nikah',
  '<h2>What is Nikah?</h2><p>Nikah is the Islamic marriage contract...</p>',
  1
),
(
  'understanding-islamic-marriage',
  'Pillars of Marriage',
  '<h2>The Four Pillars</h2><p>There are four essential pillars...</p>',
  2
)
ON CONFLICT DO NOTHING;
*/

-- =============================================
-- 10. VERIFICATION QUERIES
-- =============================================
-- Uncomment to verify the setup:

-- Check tables exist
-- SELECT table_name 
-- FROM information_schema.tables 
-- WHERE table_schema = 'public' 
-- AND table_name IN ('modules', 'lessons', 'user_module_progress');

-- Check table structure
-- SELECT column_name, data_type, is_nullable, column_default
-- FROM information_schema.columns
-- WHERE table_schema = 'public' 
-- AND table_name = 'modules'
-- ORDER BY ordinal_position;

-- Check indexes exist
-- SELECT indexname, tablename 
-- FROM pg_indexes 
-- WHERE schemaname = 'public' 
-- AND tablename IN ('modules', 'lessons', 'user_module_progress');

-- Check RLS is enabled
-- SELECT tablename, rowsecurity 
-- FROM pg_tables 
-- WHERE schemaname = 'public' 
-- AND tablename IN ('modules', 'lessons', 'user_module_progress');

-- Check RLS policies
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
-- FROM pg_policies
-- WHERE tablename IN ('modules', 'lessons', 'user_module_progress');

-- =============================================
-- MIGRATION COMPLETE
-- =============================================
-- The Modules page now has all required database structures:
--
-- ✅ All tables created with correct schema (matching database.ts types)
-- ✅ Performance indexes for fast queries
-- ✅ RLS policies for secure access
-- ✅ Auto-update trigger for updated_at timestamp
-- ✅ Auto-complete trigger for completed_at timestamp
-- ✅ Proper foreign key relationships
--
-- The Modules page will now be able to:
--   - Display modules in proper order (sort_order)
--   - Filter by published status (is_published)
--   - Show lessons within each module
--   - Track user progress per lesson
--   - Calculate completion percentage (completed lessons / total lessons)
--   - Store quiz scores for lessons
--   - Show recent completions in activity feed
--
-- Next steps:
--   1. Run this migration in Supabase SQL Editor
--   2. Seed initial module and lesson data (uncomment seed section)
--   3. Test the /dashboard/modules route with an authenticated user
--   4. Test the /dashboard/modules/:id route for module details
--   5. Verify progress tracking works correctly
--   6. Test lesson completion and quiz score storage
-- =============================================

