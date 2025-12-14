-- =============================================
-- Add Missing RLS Policies for All Tables
-- =============================================
-- This ensures all tables have proper RLS policies
-- even if they were created in separate migrations
-- 
-- Safe to run multiple times (uses IF NOT EXISTS / DROP IF EXISTS)

BEGIN;

-- =============================================
-- 1. USER_RESOURCE_FAVORITES (if table exists)
-- =============================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_resource_favorites') THEN
    ALTER TABLE public.user_resource_favorites ENABLE ROW LEVEL SECURITY;
    
    -- Policies already created in previous migration, but ensure they exist
    DROP POLICY IF EXISTS "Users can view own favorites" ON public.user_resource_favorites;
    CREATE POLICY "Users can view own favorites"
      ON public.user_resource_favorites FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
    
    DROP POLICY IF EXISTS "Users can insert own favorites" ON public.user_resource_favorites;
    CREATE POLICY "Users can insert own favorites"
      ON public.user_resource_favorites FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
    
    DROP POLICY IF EXISTS "Users can delete own favorites" ON public.user_resource_favorites;
    CREATE POLICY "Users can delete own favorites"
      ON public.user_resource_favorites FOR DELETE
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- =============================================
-- 2. USER_DISCUSSION_ANSWERS
-- =============================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_discussion_answers') THEN
    ALTER TABLE public.user_discussion_answers ENABLE ROW LEVEL SECURITY;
    
    -- Ensure policies exist (may already exist from other migration)
    DROP POLICY IF EXISTS "users: select own discussion_answers" ON public.user_discussion_answers;
    CREATE POLICY "users: select own discussion_answers"
      ON public.user_discussion_answers FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
    
    DROP POLICY IF EXISTS "users: select partner discussion_answers" ON public.user_discussion_answers;
    CREATE POLICY "users: select partner discussion_answers"
      ON public.user_discussion_answers FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.couples
          WHERE (user1_id = auth.uid() AND user2_id = user_discussion_answers.user_id)
             OR (user2_id = auth.uid() AND user1_id = user_discussion_answers.user_id)
        )
      );
    
    DROP POLICY IF EXISTS "users: insert own discussion_answers" ON public.user_discussion_answers;
    CREATE POLICY "users: insert own discussion_answers"
      ON public.user_discussion_answers FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
    
    DROP POLICY IF EXISTS "users: update own discussion_answers" ON public.user_discussion_answers;
    CREATE POLICY "users: update own discussion_answers"
      ON public.user_discussion_answers FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
    
    DROP POLICY IF EXISTS "users: delete own discussion_answers" ON public.user_discussion_answers;
    CREATE POLICY "users: delete own discussion_answers"
      ON public.user_discussion_answers FOR DELETE
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- =============================================
-- 3. COUPLES TABLE
-- =============================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'couples') THEN
    ALTER TABLE public.couples ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "users: select own couple" ON public.couples;
    CREATE POLICY "users: select own couple"
      ON public.couples FOR SELECT
      TO authenticated
      USING (auth.uid() = user1_id OR auth.uid() = user2_id);
    
    DROP POLICY IF EXISTS "users: insert own couple" ON public.couples;
    CREATE POLICY "users: insert own couple"
      ON public.couples FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);
    
    DROP POLICY IF EXISTS "users: update own couple" ON public.couples;
    CREATE POLICY "users: update own couple"
      ON public.couples FOR UPDATE
      TO authenticated
      USING (auth.uid() = user1_id OR auth.uid() = user2_id)
      WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);
    
    DROP POLICY IF EXISTS "users: delete own couple" ON public.couples;
    CREATE POLICY "users: delete own couple"
      ON public.couples FOR DELETE
      TO authenticated
      USING (auth.uid() = user1_id OR auth.uid() = user2_id);
  END IF;
END $$;

-- =============================================
-- 4. PARTNER_INVITATIONS
-- =============================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'partner_invitations') THEN
    ALTER TABLE public.partner_invitations ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "users: select own invitations" ON public.partner_invitations;
    CREATE POLICY "users: select own invitations"
      ON public.partner_invitations FOR SELECT
      TO authenticated
      USING (
        inviter_id = auth.uid()
        OR invitee_email = (SELECT email FROM auth.users WHERE id = auth.uid())
      );
    
    DROP POLICY IF EXISTS "users: insert own invitations" ON public.partner_invitations;
    CREATE POLICY "users: insert own invitations"
      ON public.partner_invitations FOR INSERT
      TO authenticated
      WITH CHECK (inviter_id = auth.uid());
    
    DROP POLICY IF EXISTS "users: update own invitations" ON public.partner_invitations;
    CREATE POLICY "users: update own invitations"
      ON public.partner_invitations FOR UPDATE
      TO authenticated
      USING (inviter_id = auth.uid())
      WITH CHECK (inviter_id = auth.uid());
  END IF;
END $$;

-- =============================================
-- 5. NOTIFICATIONS
-- =============================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'notifications') THEN
    ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "users: select own notifications" ON public.notifications;
    CREATE POLICY "users: select own notifications"
      ON public.notifications FOR SELECT
      TO authenticated
      USING (user_id = auth.uid());
    
    DROP POLICY IF EXISTS "users: update own notifications" ON public.notifications;
    CREATE POLICY "users: update own notifications"
      ON public.notifications FOR UPDATE
      TO authenticated
      USING (user_id = auth.uid())
      WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

-- =============================================
-- 6. FINANCIAL TABLES (budgets, mahr, wedding_budgets, savings_goals)
-- =============================================

DO $$
BEGIN
  -- budgets
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'budgets') THEN
    ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "Users can view own budgets" ON public.budgets;
    CREATE POLICY "Users can view own budgets"
      ON public.budgets FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
    
    DROP POLICY IF EXISTS "Users can insert own budgets" ON public.budgets;
    CREATE POLICY "Users can insert own budgets"
      ON public.budgets FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
    
    DROP POLICY IF EXISTS "Users can update own budgets" ON public.budgets;
    CREATE POLICY "Users can update own budgets"
      ON public.budgets FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
    
    DROP POLICY IF EXISTS "Users can delete own budgets" ON public.budgets;
    CREATE POLICY "Users can delete own budgets"
      ON public.budgets FOR DELETE
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
  
  -- mahr
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'mahr') THEN
    ALTER TABLE public.mahr ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "Users can view own mahr" ON public.mahr;
    CREATE POLICY "Users can view own mahr"
      ON public.mahr FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
    
    DROP POLICY IF EXISTS "Users can insert own mahr" ON public.mahr;
    CREATE POLICY "Users can insert own mahr"
      ON public.mahr FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
    
    DROP POLICY IF EXISTS "Users can update own mahr" ON public.mahr;
    CREATE POLICY "Users can update own mahr"
      ON public.mahr FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
    
    DROP POLICY IF EXISTS "Users can delete own mahr" ON public.mahr;
    CREATE POLICY "Users can delete own mahr"
      ON public.mahr FOR DELETE
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
  
  -- wedding_budgets
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'wedding_budgets') THEN
    ALTER TABLE public.wedding_budgets ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "Users can view own wedding_budgets" ON public.wedding_budgets;
    CREATE POLICY "Users can view own wedding_budgets"
      ON public.wedding_budgets FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
    
    DROP POLICY IF EXISTS "Users can insert own wedding_budgets" ON public.wedding_budgets;
    CREATE POLICY "Users can insert own wedding_budgets"
      ON public.wedding_budgets FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
    
    DROP POLICY IF EXISTS "Users can update own wedding_budgets" ON public.wedding_budgets;
    CREATE POLICY "Users can update own wedding_budgets"
      ON public.wedding_budgets FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
    
    DROP POLICY IF EXISTS "Users can delete own wedding_budgets" ON public.wedding_budgets;
    CREATE POLICY "Users can delete own wedding_budgets"
      ON public.wedding_budgets FOR DELETE
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
  
  -- savings_goals
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'savings_goals') THEN
    ALTER TABLE public.savings_goals ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "Users can view own savings_goals" ON public.savings_goals;
    CREATE POLICY "Users can view own savings_goals"
      ON public.savings_goals FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
    
    DROP POLICY IF EXISTS "Users can insert own savings_goals" ON public.savings_goals;
    CREATE POLICY "Users can insert own savings_goals"
      ON public.savings_goals FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
    
    DROP POLICY IF EXISTS "Users can update own savings_goals" ON public.savings_goals;
    CREATE POLICY "Users can update own savings_goals"
      ON public.savings_goals FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
    
    DROP POLICY IF EXISTS "Users can delete own savings_goals" ON public.savings_goals;
    CREATE POLICY "Users can delete own savings_goals"
      ON public.savings_goals FOR DELETE
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;

COMMIT;

-- =============================================
-- MIGRATION COMPLETE
-- =============================================
-- ✅ All tables now have proper RLS policies
-- ✅ Policies are idempotent (safe to run multiple times)
-- ✅ Only creates policies for tables that exist
-- =============================================

