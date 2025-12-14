-- =====================================================
-- COMPLETE DATABASE SETUP WITH RLS POLICIES (CONSOLIDATED)
-- This is the ONLY file you need to run for a fresh setup
-- Includes ALL tables, indexes, policies, and functions
-- Run this in Supabase SQL Editor
-- =====================================================

BEGIN;

-- =====================================================
-- 1. ENABLE EXTENSIONS
-- =====================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 2. CREATE ALL TABLES
-- =====================================================

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
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
CREATE TABLE IF NOT EXISTS checklist_categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Checklist Items
CREATE TABLE IF NOT EXISTS checklist_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id TEXT NOT NULL REFERENCES checklist_categories(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  is_required BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User Checklist Progress
CREATE TABLE IF NOT EXISTS user_checklist_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES checklist_items(id) ON DELETE CASCADE,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  notes TEXT,
  discuss_with_partner BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, item_id)
);

-- Modules
CREATE TABLE IF NOT EXISTS modules (
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
CREATE TABLE IF NOT EXISTS lessons (
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
CREATE TABLE IF NOT EXISTS user_module_progress (
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
CREATE TABLE IF NOT EXISTS discussion_prompts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  questions JSONB DEFAULT '[]'::jsonb,
  tips TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User Discussion Answers (NEW - replaces user_discussion_notes)
CREATE TABLE IF NOT EXISTS user_discussion_answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  prompt_id UUID NOT NULL REFERENCES discussion_prompts(id) ON DELETE CASCADE,
  answer TEXT,
  is_discussed BOOLEAN DEFAULT FALSE NOT NULL,
  follow_up_notes TEXT,
  discussed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, prompt_id)
);

-- User Discussion Notes (OLD - kept for backward compatibility)
CREATE TABLE IF NOT EXISTS user_discussion_notes (
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
CREATE TABLE IF NOT EXISTS resources (
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
CREATE TABLE IF NOT EXISTS user_saved_resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, resource_id)
);

-- User Resource Favorites (NEW)
CREATE TABLE IF NOT EXISTS user_resource_favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, resource_id)
);

-- User Financial Data (legacy - kept for backward compatibility)
CREATE TABLE IF NOT EXISTS user_financial_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  data_type TEXT NOT NULL CHECK (data_type IN ('mahr', 'budget', 'savings', 'cost_split')),
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Budgets (NEW - dedicated table)
CREATE TABLE IF NOT EXISTS budgets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  income_his DECIMAL(12, 2) NOT NULL DEFAULT 0,
  income_hers DECIMAL(12, 2) NOT NULL DEFAULT 0,
  expense_housing DECIMAL(12, 2) NOT NULL DEFAULT 0,
  expense_utilities DECIMAL(12, 2) NOT NULL DEFAULT 0,
  expense_transportation DECIMAL(12, 2) NOT NULL DEFAULT 0,
  expense_food DECIMAL(12, 2) NOT NULL DEFAULT 0,
  expense_insurance DECIMAL(12, 2) NOT NULL DEFAULT 0,
  expense_debt DECIMAL(12, 2) NOT NULL DEFAULT 0,
  expense_entertainment DECIMAL(12, 2) NOT NULL DEFAULT 0,
  expense_dining DECIMAL(12, 2) NOT NULL DEFAULT 0,
  expense_clothing DECIMAL(12, 2) NOT NULL DEFAULT 0,
  expense_gifts DECIMAL(12, 2) NOT NULL DEFAULT 0,
  expense_charity DECIMAL(12, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Mahr (NEW - dedicated table)
CREATE TABLE IF NOT EXISTS mahr (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
  amount_paid DECIMAL(12, 2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Paid', 'Pending', 'Partial')),
  deferred_schedule TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Wedding Budgets (NEW - dedicated table)
CREATE TABLE IF NOT EXISTS wedding_budgets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  venue_planned DECIMAL(12, 2) NOT NULL DEFAULT 0,
  venue_spent DECIMAL(12, 2) NOT NULL DEFAULT 0,
  catering_planned DECIMAL(12, 2) NOT NULL DEFAULT 0,
  catering_spent DECIMAL(12, 2) NOT NULL DEFAULT 0,
  photography_planned DECIMAL(12, 2) NOT NULL DEFAULT 0,
  photography_spent DECIMAL(12, 2) NOT NULL DEFAULT 0,
  clothing_planned DECIMAL(12, 2) NOT NULL DEFAULT 0,
  clothing_spent DECIMAL(12, 2) NOT NULL DEFAULT 0,
  decor_planned DECIMAL(12, 2) NOT NULL DEFAULT 0,
  decor_spent DECIMAL(12, 2) NOT NULL DEFAULT 0,
  invitations_planned DECIMAL(12, 2) NOT NULL DEFAULT 0,
  invitations_spent DECIMAL(12, 2) NOT NULL DEFAULT 0,
  other_planned DECIMAL(12, 2) NOT NULL DEFAULT 0,
  other_spent DECIMAL(12, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Savings Goals (NEW - dedicated table)
CREATE TABLE IF NOT EXISTS savings_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  emergency_fund_goal DECIMAL(12, 2) NOT NULL DEFAULT 0,
  emergency_fund_current DECIMAL(12, 2) NOT NULL DEFAULT 0,
  house_goal DECIMAL(12, 2) NOT NULL DEFAULT 0,
  house_current DECIMAL(12, 2) NOT NULL DEFAULT 0,
  other_goal_name TEXT,
  other_goal_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
  other_goal_current DECIMAL(12, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Couples (NEW - partner relationships)
CREATE TABLE IF NOT EXISTS couples (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user1_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user2_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  relationship_status TEXT CHECK (relationship_status IN ('engaged', 'married', 'preparing')) DEFAULT 'preparing',
  connected_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT different_users CHECK (user1_id != user2_id),
  CONSTRAINT unique_couple UNIQUE (user1_id, user2_id)
);

-- Partner Invitations (NEW)
CREATE TABLE IF NOT EXISTS partner_invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  inviter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invitee_email TEXT,
  invitation_code TEXT UNIQUE,
  status TEXT CHECK (status IN ('pending', 'accepted', 'declined', 'expired')) DEFAULT 'pending',
  invitation_type TEXT CHECK (invitation_type IN ('email', 'code')) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Notifications (NEW)
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  related_entity_type TEXT,
  related_entity_id UUID,
  is_read BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- User Preferences
CREATE TABLE IF NOT EXISTS user_preferences (
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
CREATE TABLE IF NOT EXISTS app_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- 3. CREATE ALL INDEXES
-- =====================================================

-- Checklist indexes
CREATE INDEX IF NOT EXISTS idx_checklist_items_category ON checklist_items(category_id);
CREATE INDEX IF NOT EXISTS idx_user_checklist_progress_user ON user_checklist_progress(user_id);

-- Module indexes
CREATE INDEX IF NOT EXISTS idx_lessons_module ON lessons(module_id);
CREATE INDEX IF NOT EXISTS idx_user_module_progress_user ON user_module_progress(user_id);

-- Discussion indexes
CREATE INDEX IF NOT EXISTS idx_discussion_prompts_category ON discussion_prompts(category);
CREATE INDEX IF NOT EXISTS idx_discussion_prompts_sort_order ON discussion_prompts(sort_order);
CREATE INDEX IF NOT EXISTS idx_discussion_prompts_category_sort ON discussion_prompts(category, sort_order);
CREATE INDEX IF NOT EXISTS idx_user_discussion_answers_user_id ON user_discussion_answers(user_id);
CREATE INDEX IF NOT EXISTS idx_user_discussion_answers_prompt_id ON user_discussion_answers(prompt_id);
CREATE INDEX IF NOT EXISTS idx_user_discussion_answers_user_prompt ON user_discussion_answers(user_id, prompt_id);
CREATE INDEX IF NOT EXISTS idx_user_discussion_answers_is_discussed ON user_discussion_answers(is_discussed);
CREATE INDEX IF NOT EXISTS idx_user_discussion_answers_discussed_at ON user_discussion_answers(discussed_at DESC) WHERE discussed_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_user_discussion_answers_updated_at ON user_discussion_answers(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_discussion_notes_user ON user_discussion_notes(user_id);

-- Resource indexes
CREATE INDEX IF NOT EXISTS idx_user_saved_resources_user ON user_saved_resources(user_id);
CREATE INDEX IF NOT EXISTS idx_user_resource_favorites_user_id ON user_resource_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_resource_favorites_resource_id ON user_resource_favorites(resource_id);
CREATE INDEX IF NOT EXISTS idx_user_resource_favorites_user_resource ON user_resource_favorites(user_id, resource_id);
CREATE INDEX IF NOT EXISTS idx_user_resource_favorites_created_at ON user_resource_favorites(created_at DESC);

-- Financial indexes
CREATE INDEX IF NOT EXISTS idx_user_financial_data_user ON user_financial_data(user_id);
CREATE INDEX IF NOT EXISTS idx_budgets_user ON budgets(user_id);
CREATE INDEX IF NOT EXISTS idx_mahr_user ON mahr(user_id);
CREATE INDEX IF NOT EXISTS idx_wedding_budgets_user ON wedding_budgets(user_id);
CREATE INDEX IF NOT EXISTS idx_savings_goals_user ON savings_goals(user_id);

-- Partner indexes
CREATE INDEX IF NOT EXISTS idx_couples_user1_id ON couples(user1_id);
CREATE INDEX IF NOT EXISTS idx_couples_user2_id ON couples(user2_id);
CREATE INDEX IF NOT EXISTS idx_couples_user_lookup ON couples(user1_id, user2_id);
CREATE INDEX IF NOT EXISTS idx_couples_updated_at ON couples(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_partner_invitations_inviter_id ON partner_invitations(inviter_id);
CREATE INDEX IF NOT EXISTS idx_partner_invitations_invitee_email ON partner_invitations(invitee_email) WHERE invitee_email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_partner_invitations_code ON partner_invitations(invitation_code) WHERE invitation_code IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_partner_invitations_status ON partner_invitations(status);
CREATE INDEX IF NOT EXISTS idx_partner_invitations_expires_at ON partner_invitations(expires_at);

-- Notification indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read, created_at DESC) WHERE is_read = false;

-- =====================================================
-- 4. CREATE HELPER FUNCTIONS
-- =====================================================

-- Function to get partner ID
CREATE OR REPLACE FUNCTION get_partner_id(current_user_id UUID)
RETURNS UUID AS $$
DECLARE
  partner_id UUID;
BEGIN
  SELECT user2_id INTO partner_id
  FROM couples
  WHERE user1_id = current_user_id
  LIMIT 1;

  IF partner_id IS NULL THEN
    SELECT user1_id INTO partner_id
    FROM couples
    WHERE user2_id = current_user_id
    LIMIT 1;
  END IF;

  RETURN partner_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create notification
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT,
  p_related_entity_type TEXT DEFAULT NULL,
  p_related_entity_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO notifications (user_id, type, title, message, related_entity_type, related_entity_id)
  VALUES (p_user_id, p_type, p_title, p_message, p_related_entity_type, p_related_entity_id)
  RETURNING id INTO v_notification_id;
  
  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate invitation code
CREATE OR REPLACE FUNCTION generate_invitation_code()
RETURNS TEXT AS $$
DECLARE
  code TEXT;
  exists_check BOOLEAN;
BEGIN
  LOOP
    code := 'NIKAH-' || upper(substring(md5(random()::text) from 1 for 6));
    SELECT EXISTS(SELECT 1 FROM partner_invitations WHERE invitation_code = code) INTO exists_check;
    EXIT WHEN NOT exists_check;
  END LOOP;
  
  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to set discussed_at timestamp
CREATE OR REPLACE FUNCTION set_discussion_discussed_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_discussed = true AND (OLD.is_discussed = false OR OLD.is_discussed IS NULL) THEN
    NEW.discussed_at = NOW();
  END IF;
  
  IF NEW.is_discussed = false THEN
    NEW.discussed_at = NULL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 5. CREATE TRIGGERS
-- =====================================================

-- Updated_at triggers for all tables
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_checklist_progress_updated_at ON user_checklist_progress;
CREATE TRIGGER update_user_checklist_progress_updated_at BEFORE UPDATE ON user_checklist_progress FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_modules_updated_at ON modules;
CREATE TRIGGER update_modules_updated_at BEFORE UPDATE ON modules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_lessons_updated_at ON lessons;
CREATE TRIGGER update_lessons_updated_at BEFORE UPDATE ON lessons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_module_progress_updated_at ON user_module_progress;
CREATE TRIGGER update_user_module_progress_updated_at BEFORE UPDATE ON user_module_progress FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_discussion_prompts_updated_at ON discussion_prompts;
CREATE TRIGGER update_discussion_prompts_updated_at BEFORE UPDATE ON discussion_prompts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_discussion_answers_updated_at ON user_discussion_answers;
CREATE TRIGGER update_user_discussion_answers_updated_at BEFORE UPDATE ON user_discussion_answers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_discussion_notes_updated_at ON user_discussion_notes;
CREATE TRIGGER update_user_discussion_notes_updated_at BEFORE UPDATE ON user_discussion_notes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_resources_updated_at ON resources;
CREATE TRIGGER update_resources_updated_at BEFORE UPDATE ON resources FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_budgets_updated_at ON budgets;
CREATE TRIGGER update_budgets_updated_at BEFORE UPDATE ON budgets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_mahr_updated_at ON mahr;
CREATE TRIGGER update_mahr_updated_at BEFORE UPDATE ON mahr FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_wedding_budgets_updated_at ON wedding_budgets;
CREATE TRIGGER update_wedding_budgets_updated_at BEFORE UPDATE ON wedding_budgets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_savings_goals_updated_at ON savings_goals;
CREATE TRIGGER update_savings_goals_updated_at BEFORE UPDATE ON savings_goals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_couples_updated_at ON couples;
CREATE TRIGGER update_couples_updated_at BEFORE UPDATE ON couples FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_partner_invitations_updated_at ON partner_invitations;
CREATE TRIGGER update_partner_invitations_updated_at BEFORE UPDATE ON partner_invitations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON user_preferences;
CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Discussed_at trigger
DROP TRIGGER IF EXISTS set_discussion_discussed_at_trigger ON user_discussion_answers;
CREATE TRIGGER set_discussion_discussed_at_trigger BEFORE INSERT OR UPDATE ON user_discussion_answers FOR EACH ROW EXECUTE FUNCTION set_discussion_discussed_at();

-- =====================================================
-- 6. ENABLE ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_checklist_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_module_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE discussion_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_discussion_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_discussion_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_saved_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_resource_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_financial_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE mahr ENABLE ROW LEVEL SECURITY;
ALTER TABLE wedding_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE couples ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 7. CREATE RLS POLICIES
-- =====================================================

-- PROFILES
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- CHECKLIST
DROP POLICY IF EXISTS "Authenticated users can view categories" ON checklist_categories;
CREATE POLICY "Authenticated users can view categories" ON checklist_categories FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Authenticated users can view items" ON checklist_items;
CREATE POLICY "Authenticated users can view items" ON checklist_items FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Users can view own progress" ON user_checklist_progress;
CREATE POLICY "Users can view own progress" ON user_checklist_progress FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own progress" ON user_checklist_progress;
CREATE POLICY "Users can manage own progress" ON user_checklist_progress FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- MODULES
DROP POLICY IF EXISTS "Authenticated users can view modules" ON modules;
CREATE POLICY "Authenticated users can view modules" ON modules FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Authenticated users can view lessons" ON lessons;
CREATE POLICY "Authenticated users can view lessons" ON lessons FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Users can view own module progress" ON user_module_progress;
CREATE POLICY "Users can view own module progress" ON user_module_progress FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own module progress" ON user_module_progress;
CREATE POLICY "Users can manage own module progress" ON user_module_progress FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- DISCUSSIONS
DROP POLICY IF EXISTS "Authenticated users can view prompts" ON discussion_prompts;
CREATE POLICY "Authenticated users can view prompts" ON discussion_prompts FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "users: select own discussion_answers" ON user_discussion_answers;
CREATE POLICY "users: select own discussion_answers" ON user_discussion_answers FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "users: select partner discussion_answers" ON user_discussion_answers;
CREATE POLICY "users: select partner discussion_answers" ON user_discussion_answers FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM couples WHERE (user1_id = auth.uid() AND user2_id = user_discussion_answers.user_id) OR (user2_id = auth.uid() AND user1_id = user_discussion_answers.user_id))
);

DROP POLICY IF EXISTS "users: insert own discussion_answers" ON user_discussion_answers;
CREATE POLICY "users: insert own discussion_answers" ON user_discussion_answers FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "users: update own discussion_answers" ON user_discussion_answers;
CREATE POLICY "users: update own discussion_answers" ON user_discussion_answers FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "users: delete own discussion_answers" ON user_discussion_answers;
CREATE POLICY "users: delete own discussion_answers" ON user_discussion_answers FOR DELETE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own notes" ON user_discussion_notes;
CREATE POLICY "Users can view own notes" ON user_discussion_notes FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own notes" ON user_discussion_notes;
CREATE POLICY "Users can manage own notes" ON user_discussion_notes FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- RESOURCES
DROP POLICY IF EXISTS "Authenticated users can view resources" ON resources;
CREATE POLICY "Authenticated users can view resources" ON resources FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Users can manage saved resources" ON user_saved_resources;
CREATE POLICY "Users can manage saved resources" ON user_saved_resources FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own favorites" ON user_resource_favorites;
CREATE POLICY "Users can view own favorites" ON user_resource_favorites FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own favorites" ON user_resource_favorites;
CREATE POLICY "Users can insert own favorites" ON user_resource_favorites FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own favorites" ON user_resource_favorites;
CREATE POLICY "Users can delete own favorites" ON user_resource_favorites FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- FINANCIAL
DROP POLICY IF EXISTS "Users can manage financial data" ON user_financial_data;
CREATE POLICY "Users can manage financial data" ON user_financial_data FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own budgets" ON budgets;
CREATE POLICY "Users can view own budgets" ON budgets FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own budgets" ON budgets;
CREATE POLICY "Users can insert own budgets" ON budgets FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own budgets" ON budgets;
CREATE POLICY "Users can update own budgets" ON budgets FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own budgets" ON budgets;
CREATE POLICY "Users can delete own budgets" ON budgets FOR DELETE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own mahr" ON mahr;
CREATE POLICY "Users can view own mahr" ON mahr FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own mahr" ON mahr;
CREATE POLICY "Users can insert own mahr" ON mahr FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own mahr" ON mahr;
CREATE POLICY "Users can update own mahr" ON mahr FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own mahr" ON mahr;
CREATE POLICY "Users can delete own mahr" ON mahr FOR DELETE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own wedding_budgets" ON wedding_budgets;
CREATE POLICY "Users can view own wedding_budgets" ON wedding_budgets FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own wedding_budgets" ON wedding_budgets;
CREATE POLICY "Users can insert own wedding_budgets" ON wedding_budgets FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own wedding_budgets" ON wedding_budgets;
CREATE POLICY "Users can update own wedding_budgets" ON wedding_budgets FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own wedding_budgets" ON wedding_budgets;
CREATE POLICY "Users can delete own wedding_budgets" ON wedding_budgets FOR DELETE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own savings_goals" ON savings_goals;
CREATE POLICY "Users can view own savings_goals" ON savings_goals FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own savings_goals" ON savings_goals;
CREATE POLICY "Users can insert own savings_goals" ON savings_goals FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own savings_goals" ON savings_goals;
CREATE POLICY "Users can update own savings_goals" ON savings_goals FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own savings_goals" ON savings_goals;
CREATE POLICY "Users can delete own savings_goals" ON savings_goals FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- PARTNERS
DROP POLICY IF EXISTS "users: select own couple" ON couples;
CREATE POLICY "users: select own couple" ON couples FOR SELECT TO authenticated USING (auth.uid() = user1_id OR auth.uid() = user2_id);

DROP POLICY IF EXISTS "users: insert own couple" ON couples;
CREATE POLICY "users: insert own couple" ON couples FOR INSERT TO authenticated WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);

DROP POLICY IF EXISTS "users: update own couple" ON couples;
CREATE POLICY "users: update own couple" ON couples FOR UPDATE TO authenticated USING (auth.uid() = user1_id OR auth.uid() = user2_id) WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);

DROP POLICY IF EXISTS "users: delete own couple" ON couples;
CREATE POLICY "users: delete own couple" ON couples FOR DELETE TO authenticated USING (auth.uid() = user1_id OR auth.uid() = user2_id);

DROP POLICY IF EXISTS "users: select own invitations" ON partner_invitations;
CREATE POLICY "users: select own invitations" ON partner_invitations FOR SELECT TO authenticated USING (
  inviter_id = auth.uid() OR invitee_email = (SELECT email FROM auth.users WHERE id = auth.uid())
);

DROP POLICY IF EXISTS "users: insert own invitations" ON partner_invitations;
CREATE POLICY "users: insert own invitations" ON partner_invitations FOR INSERT TO authenticated WITH CHECK (inviter_id = auth.uid());

DROP POLICY IF EXISTS "users: update own invitations" ON partner_invitations;
CREATE POLICY "users: update own invitations" ON partner_invitations FOR UPDATE TO authenticated USING (inviter_id = auth.uid()) WITH CHECK (inviter_id = auth.uid());

-- NOTIFICATIONS
DROP POLICY IF EXISTS "users: select own notifications" ON notifications;
CREATE POLICY "users: select own notifications" ON notifications FOR SELECT TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "users: update own notifications" ON notifications;
CREATE POLICY "users: update own notifications" ON notifications FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- PREFERENCES & SETTINGS
DROP POLICY IF EXISTS "Users can manage preferences" ON user_preferences;
CREATE POLICY "Users can manage preferences" ON user_preferences FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Authenticated users can view settings" ON app_settings;
CREATE POLICY "Authenticated users can view settings" ON app_settings FOR SELECT TO authenticated USING (true);

-- =====================================================
-- 8. GRANT PERMISSIONS
-- =====================================================

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_partner_id(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION create_notification(UUID, TEXT, TEXT, TEXT, TEXT, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION generate_invitation_code() TO authenticated;

-- =====================================================
-- 9. ENABLE REALTIME (if needed)
-- =====================================================

-- Enable realtime for notifications
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'notifications') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
  END IF;
END $$;

-- =====================================================
-- 10. SEED DATA
-- =====================================================

-- Checklist Categories
INSERT INTO checklist_categories (id, name, description, icon, sort_order) VALUES
  ('cat_spiritual', 'Spiritual Preparation', 'Strengthen your faith and Islamic foundation', '🤲', 1),
  ('cat_financial', 'Financial Planning', 'Ensure financial clarity and agreements', '💰', 2),
  ('cat_family', 'Family & Relationships', 'Build healthy family dynamics', '👨‍👩‍👧', 3),
  ('cat_personal', 'Personal Development', 'Grow individually for a stronger partnership', '🌱', 4),
  ('cat_future', 'Future Planning', 'Discuss and align on future goals', '🎯', 5)
ON CONFLICT (id) DO NOTHING;

-- Checklist Items
INSERT INTO checklist_items (category_id, title, description, is_required, sort_order) VALUES
  -- Spiritual Preparation
  ('cat_spiritual', 'Complete Islamic Marriage Course', 'Take a pre-marriage course from qualified scholars', true, 1),
  ('cat_spiritual', 'Study Rights & Responsibilities', 'Learn about spousal rights in Islam', true, 2),
  ('cat_spiritual', 'Discuss Religious Practice Level', 'Talk about prayer, fasting, and religious observances', true, 3),
  ('cat_spiritual', 'Learn Marriage Duas', 'Memorize important duas for marriage', false, 4),
  ('cat_spiritual', 'Seek Family Blessings', 'Get parental approval and blessings', true, 5),
  ('cat_spiritual', 'Perform Istikhara Prayer', 'Seek Allah''s guidance before proceeding', true, 6),

  -- Financial Planning
  ('cat_financial', 'Agree on Mahr Amount', 'Discuss and finalize the mahr amount', true, 1),
  ('cat_financial', 'Disclose Financial Situation', 'Share income, debts, and savings information', true, 2),
  ('cat_financial', 'Create Wedding Budget', 'Plan a realistic wedding budget', true, 3),
  ('cat_financial', 'Discuss Financial Goals', 'Align on saving and spending habits', true, 4),
  ('cat_financial', 'Plan Living Arrangements', 'Decide on housing situation', true, 5),
  ('cat_financial', 'Set Up Banking Arrangements', 'Decide on joint or separate accounts', false, 6),
  ('cat_financial', 'Clarify Financial Responsibilities', 'Discuss who pays for what', true, 7),

  -- Family & Relationships
  ('cat_family', 'Meet Both Families', 'Ensure families have met and connected', true, 1),
  ('cat_family', 'Discuss In-Law Boundaries', 'Establish healthy family boundaries', true, 2),
  ('cat_family', 'Plan Family Visit Frequency', 'Agree on family visit expectations', false, 3),
  ('cat_family', 'Discuss Children Timeline', 'Talk about when to have children', true, 4),
  ('cat_family', 'Align on Parenting Values', 'Discuss parenting approaches', true, 5),
  ('cat_family', 'Address Cultural Differences', 'Navigate cultural traditions', false, 6),

  -- Personal Development
  ('cat_personal', 'Complete Health Check-Up', 'Get pre-marital health screening', true, 1),
  ('cat_personal', 'Discuss Communication Styles', 'Learn each other''s communication preferences', true, 2),
  ('cat_personal', 'Identify Conflict Resolution Strategy', 'Agree on handling disagreements', true, 3),
  ('cat_personal', 'Share Personal Goals', 'Discuss individual aspirations', true, 4),
  ('cat_personal', 'Discuss Lifestyle Preferences', 'Talk about daily routines and habits', false, 5),
  ('cat_personal', 'Learn Love Languages', 'Understand how to show and receive love', false, 6),

  -- Future Planning
  ('cat_future', 'Discuss Career Ambitions', 'Share professional goals', true, 1),
  ('cat_future', 'Plan Living Location', 'Decide where to live long-term', true, 2),
  ('cat_future', 'Align on Work-Life Balance', 'Discuss work expectations', true, 3),
  ('cat_future', 'Set 5-Year Goals', 'Create shared vision for 5 years', false, 4),
  ('cat_future', 'Discuss Further Education', 'Talk about education plans', false, 5),
  ('cat_future', 'Plan for Emergencies', 'Discuss insurance and emergency funds', false, 6)
ON CONFLICT DO NOTHING;

COMMIT;

-- =====================================================
-- SETUP COMPLETE!
-- =====================================================
-- ✅ All tables created (including new ones)
-- ✅ All indexes created for performance
-- ✅ All RLS policies enabled and configured
-- ✅ All helper functions created
-- ✅ All triggers set up for auto-updates
-- ✅ Seed data inserted (checklist categories & items)
-- 
-- Your database is now fully set up and ready to use!
-- All features (favorites, partners, financial tracking, notifications) are ready.
-- =====================================================

