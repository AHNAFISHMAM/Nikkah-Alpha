-- =============================================
-- Discussions Page Database Setup
-- =============================================
-- This migration ensures all database structures
-- required for the Discussions page are in place.
--
-- Page: /dashboard/discussions (Discussions.tsx)
-- Dependencies:
--   - discussion_prompts table (stores prompt questions)
--   - user_discussion_answers table (stores user answers)
--   - couples table (for partner relationship)
--   - get_partner_id RPC function (to fetch partner ID)
--   - RLS policies for secure access and partner sharing
--   - Indexes for optimal query performance
--   - Triggers for automatic updated_at and discussed_at timestamps
-- =============================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 1. DISCUSSION_PROMPTS TABLE
-- =============================================
-- Stores discussion prompt questions organized
-- by category for couples to discuss together.

CREATE TABLE IF NOT EXISTS public.discussion_prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for discussion_prompts table
CREATE INDEX IF NOT EXISTS idx_discussion_prompts_category ON public.discussion_prompts(category);
CREATE INDEX IF NOT EXISTS idx_discussion_prompts_order_index ON public.discussion_prompts(order_index);
CREATE INDEX IF NOT EXISTS idx_discussion_prompts_category_order ON public.discussion_prompts(category, order_index);
CREATE INDEX IF NOT EXISTS idx_discussion_prompts_updated_at ON public.discussion_prompts(updated_at DESC);

-- =============================================
-- 2. USER_DISCUSSION_ANSWERS TABLE
-- =============================================
-- Stores user answers to discussion prompts,
-- discussion status, and follow-up notes.

CREATE TABLE IF NOT EXISTS public.user_discussion_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  prompt_id UUID NOT NULL REFERENCES public.discussion_prompts(id) ON DELETE CASCADE,
  answer TEXT,
  is_discussed BOOLEAN DEFAULT FALSE NOT NULL,
  follow_up_notes TEXT,
  discussed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- One answer per user per prompt
  UNIQUE(user_id, prompt_id)
);

-- Indexes for user_discussion_answers table
CREATE INDEX IF NOT EXISTS idx_user_discussion_answers_user_id ON public.user_discussion_answers(user_id);
CREATE INDEX IF NOT EXISTS idx_user_discussion_answers_prompt_id ON public.user_discussion_answers(prompt_id);
CREATE INDEX IF NOT EXISTS idx_user_discussion_answers_user_prompt ON public.user_discussion_answers(user_id, prompt_id);
CREATE INDEX IF NOT EXISTS idx_user_discussion_answers_is_discussed ON public.user_discussion_answers(is_discussed);
CREATE INDEX IF NOT EXISTS idx_user_discussion_answers_discussed_at ON public.user_discussion_answers(discussed_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_discussion_answers_updated_at ON public.user_discussion_answers(updated_at DESC);
-- Index for recent activity queries (last 7 days)
CREATE INDEX IF NOT EXISTS idx_user_discussion_answers_recent ON public.user_discussion_answers(user_id, updated_at DESC) WHERE updated_at >= NOW() - INTERVAL '7 days';

-- =============================================
-- 3. COUPLES TABLE (Partner Relationships)
-- =============================================
-- Links two users as partners for data sharing.
-- This table enables partner answer visibility.

CREATE TABLE IF NOT EXISTS public.couples (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user2_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  relationship_status TEXT CHECK (relationship_status IN ('engaged', 'married', 'preparing')) DEFAULT 'preparing',
  connected_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Ensure unique pairing and no self-pairing
  CONSTRAINT different_users CHECK (user1_id != user2_id),
  CONSTRAINT unique_couple UNIQUE (user1_id, user2_id)
);

-- Indexes for couples table
CREATE INDEX IF NOT EXISTS idx_couples_user1_id ON public.couples(user1_id);
CREATE INDEX IF NOT EXISTS idx_couples_user2_id ON public.couples(user2_id);
CREATE INDEX IF NOT EXISTS idx_couples_updated_at ON public.couples(updated_at DESC);

-- =============================================
-- 4. GET_PARTNER_ID RPC FUNCTION
-- =============================================
-- Returns the partner ID for a given user.
-- Used to fetch partner's discussion answers.

CREATE OR REPLACE FUNCTION public.get_partner_id(current_user_id UUID)
RETURNS UUID AS $$
DECLARE
  partner_id UUID;
BEGIN
  -- Check if user is user1
  SELECT user2_id INTO partner_id
  FROM public.couples
  WHERE user1_id = current_user_id
  LIMIT 1;

  -- If not found, check if user is user2
  IF partner_id IS NULL THEN
    SELECT user1_id INTO partner_id
    FROM public.couples
    WHERE user2_id = current_user_id
    LIMIT 1;
  END IF;

  RETURN partner_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE public.discussion_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_discussion_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.couples ENABLE ROW LEVEL SECURITY;

-- Discussion prompts policies (public read, admin write)
-- All authenticated users can read prompts
DROP POLICY IF EXISTS "users: select all discussion_prompts" ON public.discussion_prompts;
CREATE POLICY "users: select all discussion_prompts"
  ON public.discussion_prompts FOR SELECT
  TO authenticated
  USING (true);

-- Only service role can insert/update/delete prompts (admin operations)
DROP POLICY IF EXISTS "service_role: manage discussion_prompts" ON public.discussion_prompts;
CREATE POLICY "service_role: manage discussion_prompts"
  ON public.discussion_prompts FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- User discussion answers policies
-- Users can read their own answers
DROP POLICY IF EXISTS "users: select own discussion_answers" ON public.user_discussion_answers;
CREATE POLICY "users: select own discussion_answers"
  ON public.user_discussion_answers FOR SELECT
  USING (auth.uid() = user_id);

-- Users can read their partner's answers (if they are partners)
DROP POLICY IF EXISTS "users: select partner discussion_answers" ON public.user_discussion_answers;
CREATE POLICY "users: select partner discussion_answers"
  ON public.user_discussion_answers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.couples
      WHERE (user1_id = auth.uid() AND user2_id = user_discussion_answers.user_id)
         OR (user2_id = auth.uid() AND user1_id = user_discussion_answers.user_id)
    )
  );

-- Users can insert their own answers
DROP POLICY IF EXISTS "users: insert own discussion_answers" ON public.user_discussion_answers;
CREATE POLICY "users: insert own discussion_answers"
  ON public.user_discussion_answers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own answers
DROP POLICY IF EXISTS "users: update own discussion_answers" ON public.user_discussion_answers;
CREATE POLICY "users: update own discussion_answers"
  ON public.user_discussion_answers FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own answers
DROP POLICY IF EXISTS "users: delete own discussion_answers" ON public.user_discussion_answers;
CREATE POLICY "users: delete own discussion_answers"
  ON public.user_discussion_answers FOR DELETE
  USING (auth.uid() = user_id);

-- Couples policies
-- Users can view their own couple relationship
DROP POLICY IF EXISTS "users: select own couple" ON public.couples;
CREATE POLICY "users: select own couple"
  ON public.couples FOR SELECT
  USING (
    auth.uid() = user1_id
    OR auth.uid() = user2_id
  );

-- Users can create couple relationship
DROP POLICY IF EXISTS "users: insert own couple" ON public.couples;
CREATE POLICY "users: insert own couple"
  ON public.couples FOR INSERT
  WITH CHECK (
    auth.uid() = user1_id
    OR auth.uid() = user2_id
  );

-- Users can update their own couple relationship
DROP POLICY IF EXISTS "users: update own couple" ON public.couples;
CREATE POLICY "users: update own couple"
  ON public.couples FOR UPDATE
  USING (
    auth.uid() = user1_id
    OR auth.uid() = user2_id
  )
  WITH CHECK (
    auth.uid() = user1_id
    OR auth.uid() = user2_id
  );

-- Users can delete their own couple relationship
DROP POLICY IF EXISTS "users: delete own couple" ON public.couples;
CREATE POLICY "users: delete own couple"
  ON public.couples FOR DELETE
  USING (
    auth.uid() = user1_id
    OR auth.uid() = user2_id
  );

-- =============================================
-- 6. AUTOMATIC UPDATED_AT TRIGGERS
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_discussion_prompts_updated_at ON public.discussion_prompts;
CREATE TRIGGER update_discussion_prompts_updated_at
  BEFORE UPDATE ON public.discussion_prompts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_discussion_answers_updated_at ON public.user_discussion_answers;
CREATE TRIGGER update_user_discussion_answers_updated_at
  BEFORE UPDATE ON public.user_discussion_answers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_couples_updated_at ON public.couples;
CREATE TRIGGER update_couples_updated_at
  BEFORE UPDATE ON public.couples
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- 7. DISCUSSED_AT AUTO-SET TRIGGER
-- =============================================
-- Automatically sets discussed_at timestamp when
-- is_discussed changes from false to true.

CREATE OR REPLACE FUNCTION set_discussion_discussed_at()
RETURNS TRIGGER AS $$
BEGIN
  -- Set discussed_at when marking as discussed
  IF NEW.is_discussed = true AND (OLD.is_discussed = false OR OLD.is_discussed IS NULL) THEN
    NEW.discussed_at = NOW();
  END IF;
  
  -- Clear discussed_at when marking as not discussed
  IF NEW.is_discussed = false THEN
    NEW.discussed_at = NULL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_discussion_discussed_at_trigger ON public.user_discussion_answers;
CREATE TRIGGER set_discussion_discussed_at_trigger
  BEFORE INSERT OR UPDATE ON public.user_discussion_answers
  FOR EACH ROW
  EXECUTE FUNCTION set_discussion_discussed_at();

-- =============================================
-- 8. GRANTS FOR AUTHENTICATED USERS
-- =============================================

-- Discussion prompts: read-only for authenticated users
GRANT SELECT ON public.discussion_prompts TO authenticated;

-- User discussion answers: full access for authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_discussion_answers TO authenticated;

-- Couples: full access for authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON public.couples TO authenticated;

-- Grant execute permission on RPC function
GRANT EXECUTE ON FUNCTION public.get_partner_id(UUID) TO authenticated;

-- =============================================
-- 9. SAMPLE DISCUSSION PROMPTS (Optional Seed)
-- =============================================
-- Uncomment and modify these INSERT statements
-- to seed initial discussion prompt data.

/*
-- Sample prompts organized by category
INSERT INTO public.discussion_prompts (title, description, category, order_index) VALUES
-- Communication Category
(
  'How do you prefer to communicate when you''re upset?',
  'Understanding each other''s communication styles during difficult moments is crucial for a healthy relationship.',
  'Communication',
  1
),
(
  'What are your expectations for daily check-ins?',
  'Discuss how often you want to connect and what level of communication feels right for both of you.',
  'Communication',
  2
),
-- Values & Goals Category
(
  'What are your top 3 life goals for the next 5 years?',
  'Share your aspirations and see how they align with your partner''s vision for the future.',
  'Values & Goals',
  1
),
(
  'How important is religion in your daily life?',
  'Discuss the role of faith and Islamic practices in your relationship and future family.',
  'Values & Goals',
  2
),
-- Family & Relationships Category
(
  'How do you envision balancing time with family and friends?',
  'Talk about maintaining relationships while prioritizing your marriage.',
  'Family & Relationships',
  1
),
(
  'What are your thoughts on living with in-laws?',
  'Discuss living arrangements and boundaries with extended family.',
  'Family & Relationships',
  2
),
-- Finances Category
(
  'How should we handle joint vs separate finances?',
  'Discuss financial management, budgeting, and spending habits.',
  'Finances',
  1
),
(
  'What are your financial goals as a couple?',
  'Talk about savings, investments, and long-term financial planning.',
  'Finances',
  2
),
-- Intimacy & Family Planning Category
(
  'What are your expectations regarding intimacy in marriage?',
  'Have an open and respectful conversation about physical intimacy and boundaries.',
  'Intimacy & Family Planning',
  1
),
(
  'When do you want to start a family?',
  'Discuss family planning, children, and parenting approaches.',
  'Intimacy & Family Planning',
  2
)
ON CONFLICT DO NOTHING;
*/

-- =============================================
-- 10. VERIFICATION QUERIES
-- =============================================

-- Verify tables exist
DO $$
BEGIN
  ASSERT (SELECT COUNT(*) FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN ('discussion_prompts', 'user_discussion_answers', 'couples')) = 3,
    'Not all discussion tables were created';
END $$;

-- Verify RLS is enabled
DO $$
BEGIN
  ASSERT (SELECT COUNT(*) FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename IN ('discussion_prompts', 'user_discussion_answers', 'couples')
    AND rowsecurity = true) = 3,
    'RLS is not enabled on all discussion tables';
END $$;

-- Verify RPC function exists
DO $$
BEGIN
  ASSERT EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public'
    AND p.proname = 'get_partner_id'
  ),
    'get_partner_id RPC function was not created';
END $$;

-- =============================================
-- Migration Complete
-- =============================================
-- All tables, indexes, policies, triggers, and
-- RPC functions for the Discussions page are now in place.
-- =============================================
