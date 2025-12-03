-- =====================================================
-- COMPLETE DATABASE SETUP - NIKAH PREP
-- Everything in ONE file - run this on a fresh database
-- =====================================================

BEGIN;

-- =====================================================
-- 1. ENABLE EXTENSIONS
-- =====================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 2. DROP EXISTING TABLES (if re-running)
-- =====================================================

DROP TABLE IF EXISTS user_saved_resources CASCADE;
DROP TABLE IF EXISTS user_financial_data CASCADE;
DROP TABLE IF EXISTS user_preferences CASCADE;
DROP TABLE IF EXISTS app_settings CASCADE;
DROP TABLE IF EXISTS user_discussion_notes CASCADE;
DROP TABLE IF EXISTS discussion_prompts CASCADE;
DROP TABLE IF EXISTS user_module_progress CASCADE;
DROP TABLE IF EXISTS lessons CASCADE;
DROP TABLE IF EXISTS modules CASCADE;
DROP TABLE IF EXISTS user_checklist_progress CASCADE;
DROP TABLE IF EXISTS checklist_items CASCADE;
DROP TABLE IF EXISTS checklist_categories CASCADE;
DROP TABLE IF EXISTS resources CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- =====================================================
-- 3. CREATE TABLES
-- =====================================================

-- Profiles table (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  partner_status TEXT CHECK (partner_status IN ('searching', 'engaged', 'planning')),
  wedding_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Checklist Categories
CREATE TABLE checklist_categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Checklist Items
CREATE TABLE checklist_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id TEXT NOT NULL REFERENCES checklist_categories(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  is_required BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User Checklist Progress
CREATE TABLE user_checklist_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES checklist_items(id) ON DELETE CASCADE,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, item_id)
);

-- Modules
CREATE TABLE modules (
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

-- Lessons
CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  module_id TEXT NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  video_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User Module Progress
CREATE TABLE user_module_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  module_id TEXT NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  quiz_score INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Discussion Prompts
CREATE TABLE discussion_prompts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  questions JSONB DEFAULT '[]'::jsonb,
  tips TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User Discussion Notes
CREATE TABLE user_discussion_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  prompt_id UUID NOT NULL REFERENCES discussion_prompts(id) ON DELETE CASCADE,
  notes TEXT,
  is_discussed BOOLEAN NOT NULL DEFAULT false,
  discussed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, prompt_id)
);

-- Resources
CREATE TABLE resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  content_type TEXT NOT NULL CHECK (content_type IN ('article', 'video', 'audio', 'pdf', 'link')),
  url TEXT,
  content TEXT,
  author TEXT,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User Saved Resources
CREATE TABLE user_saved_resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, resource_id)
);

-- User Financial Data
CREATE TABLE user_financial_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  data_type TEXT NOT NULL CHECK (data_type IN ('mahr', 'budget', 'savings', 'cost_split')),
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User Preferences
CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  theme TEXT NOT NULL DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
  notifications_enabled BOOLEAN NOT NULL DEFAULT true,
  email_updates BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

-- App Settings
CREATE TABLE app_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- 4. CREATE INDEXES
-- =====================================================

CREATE INDEX idx_checklist_items_category ON checklist_items(category_id);
CREATE INDEX idx_user_checklist_progress_user ON user_checklist_progress(user_id);
CREATE INDEX idx_lessons_module ON lessons(module_id);
CREATE INDEX idx_user_module_progress_user ON user_module_progress(user_id);
CREATE INDEX idx_user_discussion_notes_user ON user_discussion_notes(user_id);
CREATE INDEX idx_user_saved_resources_user ON user_saved_resources(user_id);
CREATE INDEX idx_user_financial_data_user ON user_financial_data(user_id);

-- =====================================================
-- 5. ENABLE ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_checklist_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_module_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE discussion_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_discussion_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_saved_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_financial_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 6. CREATE RLS POLICIES (For Authenticated Users)
-- =====================================================

-- PROFILES
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

-- CHECKLIST CATEGORIES
CREATE POLICY "Authenticated users can view categories"
  ON checklist_categories FOR SELECT TO authenticated
  USING (true);

-- CHECKLIST ITEMS
CREATE POLICY "Authenticated users can view items"
  ON checklist_items FOR SELECT TO authenticated
  USING (true);

-- USER CHECKLIST PROGRESS
CREATE POLICY "Users can view own progress"
  ON user_checklist_progress FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own progress"
  ON user_checklist_progress FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- MODULES
CREATE POLICY "Authenticated users can view modules"
  ON modules FOR SELECT TO authenticated
  USING (true);

-- LESSONS
CREATE POLICY "Authenticated users can view lessons"
  ON lessons FOR SELECT TO authenticated
  USING (true);

-- USER MODULE PROGRESS
CREATE POLICY "Users can view own module progress"
  ON user_module_progress FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own module progress"
  ON user_module_progress FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- DISCUSSION PROMPTS
CREATE POLICY "Authenticated users can view prompts"
  ON discussion_prompts FOR SELECT TO authenticated
  USING (true);

-- USER DISCUSSION NOTES
CREATE POLICY "Users can view own notes"
  ON user_discussion_notes FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own notes"
  ON user_discussion_notes FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RESOURCES
CREATE POLICY "Authenticated users can view resources"
  ON resources FOR SELECT TO authenticated
  USING (true);

-- USER SAVED RESOURCES
CREATE POLICY "Users can manage saved resources"
  ON user_saved_resources FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- USER FINANCIAL DATA
CREATE POLICY "Users can manage financial data"
  ON user_financial_data FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- USER PREFERENCES
CREATE POLICY "Users can manage preferences"
  ON user_preferences FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- APP SETTINGS
CREATE POLICY "Authenticated users can view settings"
  ON app_settings FOR SELECT TO authenticated
  USING (true);

-- =====================================================
-- 7. ADD SEED DATA
-- =====================================================

-- Checklist Categories
INSERT INTO checklist_categories (id, name, description, icon, sort_order) VALUES
  ('cat_spiritual', 'Spiritual Preparation', 'Strengthen your faith and Islamic foundation', '🤲', 1),
  ('cat_financial', 'Financial Planning', 'Ensure financial clarity and agreements', '💰', 2),
  ('cat_family', 'Family & Relationships', 'Build healthy family dynamics', '👨‍👩‍👧', 3),
  ('cat_personal', 'Personal Development', 'Grow individually for a stronger partnership', '🌱', 4),
  ('cat_future', 'Future Planning', 'Discuss and align on future goals', '🎯', 5);

-- Checklist Items (31 total across 5 categories)
INSERT INTO checklist_items (category_id, title, description, is_required, sort_order) VALUES
  -- Spiritual Preparation (6 items)
  ('cat_spiritual', 'Complete Islamic Marriage Course', 'Take a pre-marriage course from qualified scholars', true, 1),
  ('cat_spiritual', 'Study Rights & Responsibilities', 'Learn about spousal rights in Islam', true, 2),
  ('cat_spiritual', 'Discuss Religious Practice Level', 'Talk about prayer, fasting, and religious observances', true, 3),
  ('cat_spiritual', 'Learn Marriage Duas', 'Memorize important duas for marriage', false, 4),
  ('cat_spiritual', 'Seek Family Blessings', 'Get parental approval and blessings', true, 5),
  ('cat_spiritual', 'Perform Istikhara Prayer', 'Seek Allah''s guidance before proceeding', true, 6),

  -- Financial Planning (7 items)
  ('cat_financial', 'Agree on Mahr Amount', 'Discuss and finalize the mahr amount', true, 1),
  ('cat_financial', 'Disclose Financial Situation', 'Share income, debts, and savings information', true, 2),
  ('cat_financial', 'Create Wedding Budget', 'Plan a realistic wedding budget', true, 3),
  ('cat_financial', 'Discuss Financial Goals', 'Align on saving and spending habits', true, 4),
  ('cat_financial', 'Plan Living Arrangements', 'Decide on housing situation', true, 5),
  ('cat_financial', 'Set Up Banking Arrangements', 'Decide on joint or separate accounts', false, 6),
  ('cat_financial', 'Clarify Financial Responsibilities', 'Discuss who pays for what', true, 7),

  -- Family & Relationships (6 items)
  ('cat_family', 'Meet Both Families', 'Ensure families have met and connected', true, 1),
  ('cat_family', 'Discuss In-Law Boundaries', 'Establish healthy family boundaries', true, 2),
  ('cat_family', 'Plan Family Visit Frequency', 'Agree on family visit expectations', false, 3),
  ('cat_family', 'Discuss Children Timeline', 'Talk about when to have children', true, 4),
  ('cat_family', 'Align on Parenting Values', 'Discuss parenting approaches', true, 5),
  ('cat_family', 'Address Cultural Differences', 'Navigate cultural traditions', false, 6),

  -- Personal Development (6 items)
  ('cat_personal', 'Complete Health Check-Up', 'Get pre-marital health screening', true, 1),
  ('cat_personal', 'Discuss Communication Styles', 'Learn each other''s communication preferences', true, 2),
  ('cat_personal', 'Identify Conflict Resolution Strategy', 'Agree on handling disagreements', true, 3),
  ('cat_personal', 'Share Personal Goals', 'Discuss individual aspirations', true, 4),
  ('cat_personal', 'Discuss Lifestyle Preferences', 'Talk about daily routines and habits', false, 5),
  ('cat_personal', 'Learn Love Languages', 'Understand how to show and receive love', false, 6),

  -- Future Planning (6 items)
  ('cat_future', 'Discuss Career Ambitions', 'Share professional goals', true, 1),
  ('cat_future', 'Plan Living Location', 'Decide where to live long-term', true, 2),
  ('cat_future', 'Align on Work-Life Balance', 'Discuss work expectations', true, 3),
  ('cat_future', 'Set 5-Year Goals', 'Create shared vision for 5 years', false, 4),
  ('cat_future', 'Discuss Further Education', 'Talk about education plans', false, 5),
  ('cat_future', 'Plan for Emergencies', 'Discuss insurance and emergency funds', false, 6);

COMMIT;

-- =====================================================
-- SETUP COMPLETE!
--
-- Your NikahPrep database is ready with:
-- ✅ All tables created
-- ✅ RLS policies enabled for authenticated users
-- ✅ Indexes for performance
-- ✅ 5 checklist categories
-- ✅ 31 checklist items
--
-- Next steps:
-- 1. Go to your app and sign up
-- 2. Start using the checklist!
-- =====================================================
