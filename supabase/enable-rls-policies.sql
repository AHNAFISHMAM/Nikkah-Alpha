-- =====================================================
-- ENABLE RLS AND CREATE POLICIES FOR AUTHENTICATED USERS
-- This allows all authenticated users to access the app
-- Run this after creating tables
-- =====================================================

BEGIN;

-- =====================================================
-- ENABLE ROW LEVEL SECURITY ON ALL TABLES
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
-- DROP EXISTING POLICIES (IF ANY)
-- =====================================================

DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

DROP POLICY IF EXISTS "Anyone can view checklist categories" ON checklist_categories;
DROP POLICY IF EXISTS "Anyone can view checklist items" ON checklist_items;
DROP POLICY IF EXISTS "Users can view own progress" ON user_checklist_progress;
DROP POLICY IF EXISTS "Users can update own progress" ON user_checklist_progress;
DROP POLICY IF EXISTS "Users can insert own progress" ON user_checklist_progress;
DROP POLICY IF EXISTS "Users can delete own progress" ON user_checklist_progress;

DROP POLICY IF EXISTS "Anyone can view modules" ON modules;
DROP POLICY IF EXISTS "Anyone can view lessons" ON lessons;
DROP POLICY IF EXISTS "Users can view own module progress" ON user_module_progress;
DROP POLICY IF EXISTS "Users can update own module progress" ON user_module_progress;
DROP POLICY IF EXISTS "Users can insert own module progress" ON user_module_progress;

DROP POLICY IF EXISTS "Anyone can view discussion prompts" ON discussion_prompts;
DROP POLICY IF EXISTS "Users can view own discussion notes" ON user_discussion_notes;
DROP POLICY IF EXISTS "Users can update own discussion notes" ON user_discussion_notes;
DROP POLICY IF EXISTS "Users can insert own discussion notes" ON user_discussion_notes;
DROP POLICY IF EXISTS "Users can delete own discussion notes" ON user_discussion_notes;

DROP POLICY IF EXISTS "Anyone can view resources" ON resources;
DROP POLICY IF EXISTS "Users can view own saved resources" ON user_saved_resources;
DROP POLICY IF EXISTS "Users can insert own saved resources" ON user_saved_resources;
DROP POLICY IF EXISTS "Users can delete own saved resources" ON user_saved_resources;

DROP POLICY IF EXISTS "Users can view own financial data" ON user_financial_data;
DROP POLICY IF EXISTS "Users can update own financial data" ON user_financial_data;
DROP POLICY IF EXISTS "Users can insert own financial data" ON user_financial_data;
DROP POLICY IF EXISTS "Users can delete own financial data" ON user_financial_data;

DROP POLICY IF EXISTS "Users can view own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can update own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can insert own preferences" ON user_preferences;

DROP POLICY IF EXISTS "Anyone can view app settings" ON app_settings;

-- =====================================================
-- CREATE POLICIES FOR AUTHENTICATED USERS
-- =====================================================

-- PROFILES: Users can view and update their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- CHECKLIST CATEGORIES: All authenticated users can view
CREATE POLICY "Anyone can view checklist categories"
  ON checklist_categories FOR SELECT
  TO authenticated
  USING (true);

-- CHECKLIST ITEMS: All authenticated users can view
CREATE POLICY "Anyone can view checklist items"
  ON checklist_items FOR SELECT
  TO authenticated
  USING (true);

-- USER CHECKLIST PROGRESS: Users manage their own progress
CREATE POLICY "Users can view own progress"
  ON user_checklist_progress FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
  ON user_checklist_progress FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress"
  ON user_checklist_progress FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own progress"
  ON user_checklist_progress FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- MODULES: All authenticated users can view
CREATE POLICY "Anyone can view modules"
  ON modules FOR SELECT
  TO authenticated
  USING (true);

-- LESSONS: All authenticated users can view
CREATE POLICY "Anyone can view lessons"
  ON lessons FOR SELECT
  TO authenticated
  USING (true);

-- USER MODULE PROGRESS: Users manage their own progress
CREATE POLICY "Users can view own module progress"
  ON user_module_progress FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own module progress"
  ON user_module_progress FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own module progress"
  ON user_module_progress FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- DISCUSSION PROMPTS: All authenticated users can view
CREATE POLICY "Anyone can view discussion prompts"
  ON discussion_prompts FOR SELECT
  TO authenticated
  USING (true);

-- USER DISCUSSION NOTES: Users manage their own notes
CREATE POLICY "Users can view own discussion notes"
  ON user_discussion_notes FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own discussion notes"
  ON user_discussion_notes FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own discussion notes"
  ON user_discussion_notes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own discussion notes"
  ON user_discussion_notes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RESOURCES: All authenticated users can view
CREATE POLICY "Anyone can view resources"
  ON resources FOR SELECT
  TO authenticated
  USING (true);

-- USER SAVED RESOURCES: Users manage their own saved resources
CREATE POLICY "Users can view own saved resources"
  ON user_saved_resources FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own saved resources"
  ON user_saved_resources FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved resources"
  ON user_saved_resources FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- USER FINANCIAL DATA: Users manage their own financial data
CREATE POLICY "Users can view own financial data"
  ON user_financial_data FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own financial data"
  ON user_financial_data FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own financial data"
  ON user_financial_data FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own financial data"
  ON user_financial_data FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- USER PREFERENCES: Users manage their own preferences
CREATE POLICY "Users can view own preferences"
  ON user_preferences FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
  ON user_preferences FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
  ON user_preferences FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- APP SETTINGS: All authenticated users can view
CREATE POLICY "Anyone can view app settings"
  ON app_settings FOR SELECT
  TO authenticated
  USING (true);

COMMIT;

-- =====================================================
-- SUCCESS! All tables now have RLS policies.
-- All authenticated users can:
-- - View all content (categories, items, modules, lessons, etc.)
-- - Manage their own data (progress, notes, preferences)
-- =====================================================
