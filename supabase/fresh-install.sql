-- =====================================================
-- FRESH INSTALL - DROPS EXISTING TABLES AND RECREATES
-- ⚠️ WARNING: This will DELETE all existing data!
-- Only use this for a fresh database setup
-- Run this in Supabase SQL Editor
-- =====================================================

BEGIN;

-- =====================================================
-- DROP EXISTING TABLES (in reverse dependency order)
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
-- CREATE TABLES
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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

-- Checklist Categories (using TEXT id for custom IDs)
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

-- Modules (using TEXT id for custom IDs like 'mod_foundations')
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
-- CREATE INDEXES
-- =====================================================

CREATE INDEX idx_checklist_items_category ON checklist_items(category_id);
CREATE INDEX idx_user_checklist_progress_user ON user_checklist_progress(user_id);
CREATE INDEX idx_lessons_module ON lessons(module_id);
CREATE INDEX idx_user_module_progress_user ON user_module_progress(user_id);
CREATE INDEX idx_user_discussion_notes_user ON user_discussion_notes(user_id);
CREATE INDEX idx_user_saved_resources_user ON user_saved_resources(user_id);
CREATE INDEX idx_user_financial_data_user ON user_financial_data(user_id);

-- =====================================================
-- SEED DATA - CHECKLIST ITEMS
-- =====================================================

-- Checklist Categories
INSERT INTO checklist_categories (id, name, description, icon, sort_order) VALUES
  ('cat_spiritual', 'Spiritual Preparation', 'Strengthen your faith and Islamic foundation', '🤲', 1),
  ('cat_financial', 'Financial Planning', 'Ensure financial clarity and agreements', '💰', 2),
  ('cat_family', 'Family & Relationships', 'Build healthy family dynamics', '👨‍👩‍👧', 3),
  ('cat_personal', 'Personal Development', 'Grow individually for a stronger partnership', '🌱', 4),
  ('cat_future', 'Future Planning', 'Discuss and align on future goals', '🎯', 5);

-- Spiritual Preparation Items
INSERT INTO checklist_items (category_id, title, description, is_required, sort_order) VALUES
  ('cat_spiritual', 'Complete Islamic Marriage Course', 'Take a pre-marriage course from qualified scholars to understand Islamic marriage principles', true, 1),
  ('cat_spiritual', 'Study Rights & Responsibilities', 'Learn about the rights and responsibilities of spouses in Islam from authentic sources', true, 2),
  ('cat_spiritual', 'Discuss Religious Practice Level', 'Openly discuss your levels of prayer, fasting, hijab, and other religious observances', true, 3),
  ('cat_spiritual', 'Learn Marriage Duas', 'Memorize important duas for marriage, including the wedding night dua', false, 4),
  ('cat_spiritual', 'Seek Family Blessings', 'Get parental approval and blessings from both families', true, 5),
  ('cat_spiritual', 'Perform Istikhara Prayer', 'Pray Salat al-Istikhara seeking Allah''s guidance before proceeding', true, 6);

-- Financial Planning Items
INSERT INTO checklist_items (category_id, title, description, is_required, sort_order) VALUES
  ('cat_financial', 'Agree on Mahr Amount', 'Discuss and finalize the mahr (dowry) amount with transparency and fairness', true, 1),
  ('cat_financial', 'Disclose Financial Situation', 'Share complete information about income, debts, savings, and financial obligations', true, 2),
  ('cat_financial', 'Create Wedding Budget', 'Plan a realistic budget for the wedding ceremony that honors Islamic simplicity', true, 3),
  ('cat_financial', 'Discuss Financial Goals', 'Align on saving, investing, spending habits, and long-term financial objectives', true, 4),
  ('cat_financial', 'Plan Living Arrangements', 'Decide on housing situation, location, and whether to rent or buy', true, 5),
  ('cat_financial', 'Set Up Banking Arrangements', 'Decide on joint accounts, separate accounts, or a combination approach', false, 6),
  ('cat_financial', 'Clarify Financial Responsibilities', 'Discuss who will pay for what and how household expenses will be managed', true, 7);

-- Family & Relationships Items
INSERT INTO checklist_items (category_id, title, description, is_required, sort_order) VALUES
  ('cat_family', 'Meet Both Families', 'Ensure both families have met, connected, and built a relationship', true, 1),
  ('cat_family', 'Discuss In-Law Boundaries', 'Establish healthy boundaries with extended family while maintaining Islamic respect', true, 2),
  ('cat_family', 'Plan Family Visit Frequency', 'Agree on how often you''ll visit both families and expectations around holidays', false, 3),
  ('cat_family', 'Discuss Children Timeline', 'Talk openly about when or if you want to have children', true, 4),
  ('cat_family', 'Align on Parenting Values', 'Discuss parenting styles, discipline approaches, and children''s education plans', true, 5),
  ('cat_family', 'Address Cultural Differences', 'Navigate any cultural or family tradition differences with wisdom and compromise', false, 6);

-- Personal Development Items
INSERT INTO checklist_items (category_id, title, description, is_required, sort_order) VALUES
  ('cat_personal', 'Medical Checkups', 'Complete comprehensive medical checkups and share results openly', true, 1),
  ('cat_personal', 'Discuss Communication Styles', 'Understand how you each prefer to communicate, especially during disagreements', true, 2),
  ('cat_personal', 'Learn Conflict Resolution', 'Study Islamic and practical methods for resolving conflicts constructively', true, 3),
  ('cat_personal', 'Build Individual Skills', 'Work on personal development areas that will strengthen the marriage', false, 4),
  ('cat_personal', 'Establish Personal Goals', 'Maintain individual goals for career, education, and personal growth', false, 5),
  ('cat_personal', 'Practice Active Listening', 'Develop skills to truly listen and understand each other''s perspectives', true, 6);

-- Future Planning Items
INSERT INTO checklist_items (category_id, title, description, is_required, sort_order) VALUES
  ('cat_future', 'Discuss Career Aspirations', 'Share your career goals and how they might affect your marriage and family', true, 1),
  ('cat_future', 'Plan for Education', 'Decide if either of you plans to pursue further education and how to support that', false, 2),
  ('cat_future', 'Align on Lifestyle Preferences', 'Discuss expectations about daily routines, social life, and lifestyle choices', true, 3),
  ('cat_future', 'Set Joint Goals', 'Create shared goals for your life together (spiritual, financial, personal)', true, 4),
  ('cat_future', 'Discuss Potential Challenges', 'Identify and plan for potential obstacles like long-distance, job changes, health issues', true, 5),
  ('cat_future', 'Create Vision for Marriage', 'Develop a shared vision of what you want your marriage to look like in 5, 10, 20 years', true, 6);

COMMIT;

-- =====================================================
-- NEXT STEPS:
-- =====================================================
-- 1. Run the module/lesson/discussion/resource inserts from seed.sql
-- 2. Set yourself as admin:
--    UPDATE profiles SET role = 'admin' WHERE email = 'your-email@example.com';
