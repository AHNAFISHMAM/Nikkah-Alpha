-- =============================================
-- Ensure User Data Security
-- =============================================
-- This migration strengthens RLS policies to ensure users can only
-- modify their own data, except for shared/collaborative features
-- where read-only partner access is explicitly allowed.

-- =============================================
-- 1. PROFILES TABLE - Ensure Update Security
-- =============================================
-- Users can only UPDATE their own profile, never their partner's

-- Drop and recreate UPDATE policy with explicit WITH CHECK
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)  -- Can only update if it's their own profile
  WITH CHECK (auth.uid() = id);  -- Must remain their own profile after update

-- Ensure INSERT policy is secure
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);  -- Can only insert their own profile

-- Ensure DELETE is not allowed (or restrict if needed)
-- Profiles should not be deletable via RLS, use soft delete or admin function instead
-- If DELETE is needed, uncomment and adjust:
-- DROP POLICY IF EXISTS "Users can delete own profile" ON public.profiles;
-- CREATE POLICY "Users can delete own profile"
--   ON public.profiles FOR DELETE
--   TO authenticated
--   USING (auth.uid() = id);

-- =============================================
-- 2. USER_CHECKLIST_PROGRESS - Ensure Security
-- =============================================
-- Users can only manage their own checklist progress

DROP POLICY IF EXISTS "Users can update own checklist progress" ON public.user_checklist_progress;
CREATE POLICY "Users can update own checklist progress"
  ON public.user_checklist_progress FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own checklist progress" ON public.user_checklist_progress;
CREATE POLICY "Users can insert own checklist progress"
  ON public.user_checklist_progress FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own checklist progress" ON public.user_checklist_progress;
CREATE POLICY "Users can delete own checklist progress"
  ON public.user_checklist_progress FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- =============================================
-- 3. USER_MODULE_PROGRESS - Ensure Security
-- =============================================
-- Users can only manage their own module progress

DROP POLICY IF EXISTS "Users can update own module progress" ON public.user_module_progress;
CREATE POLICY "Users can update own module progress"
  ON public.user_module_progress FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own module progress" ON public.user_module_progress;
CREATE POLICY "Users can insert own module progress"
  ON public.user_module_progress FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own module progress" ON public.user_module_progress;
CREATE POLICY "Users can delete own module progress"
  ON public.user_module_progress FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- =============================================
-- 4. USER_DISCUSSION_ANSWERS - Ensure Security
-- =============================================
-- Users can only manage their own discussion answers
-- Partners can VIEW but NOT modify

DROP POLICY IF EXISTS "Users can update own discussion_answers" ON public.user_discussion_answers;
CREATE POLICY "Users can update own discussion_answers"
  ON public.user_discussion_answers FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)  -- Can only update own answers
  WITH CHECK (auth.uid() = user_id);  -- Must remain own answers

DROP POLICY IF EXISTS "Users can insert own discussion_answers" ON public.user_discussion_answers;
CREATE POLICY "Users can insert own discussion_answers"
  ON public.user_discussion_answers FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);  -- Can only insert own answers

DROP POLICY IF EXISTS "Users can delete own discussion_answers" ON public.user_discussion_answers;
CREATE POLICY "Users can delete own discussion_answers"
  ON public.user_discussion_answers FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);  -- Can only delete own answers

-- =============================================
-- 5. FINANCIAL TABLES - Ensure Security
-- =============================================
-- Users can only manage their own financial data

-- BUDGETS
DROP POLICY IF EXISTS "Users can update own budgets" ON public.budgets;
CREATE POLICY "Users can update own budgets"
  ON public.budgets FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own budgets" ON public.budgets;
CREATE POLICY "Users can insert own budgets"
  ON public.budgets FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own budgets" ON public.budgets;
CREATE POLICY "Users can delete own budgets"
  ON public.budgets FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- MAHR
DROP POLICY IF EXISTS "Users can update own mahr" ON public.mahr;
CREATE POLICY "Users can update own mahr"
  ON public.mahr FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own mahr" ON public.mahr;
CREATE POLICY "Users can insert own mahr"
  ON public.mahr FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own mahr" ON public.mahr;
CREATE POLICY "Users can delete own mahr"
  ON public.mahr FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- WEDDING_BUDGETS
DROP POLICY IF EXISTS "Users can update own wedding_budgets" ON public.wedding_budgets;
CREATE POLICY "Users can update own wedding_budgets"
  ON public.wedding_budgets FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own wedding_budgets" ON public.wedding_budgets;
CREATE POLICY "Users can insert own wedding_budgets"
  ON public.wedding_budgets FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own wedding_budgets" ON public.wedding_budgets;
CREATE POLICY "Users can delete own wedding_budgets"
  ON public.wedding_budgets FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- SAVINGS_GOALS
DROP POLICY IF EXISTS "Users can update own savings_goals" ON public.savings_goals;
CREATE POLICY "Users can update own savings_goals"
  ON public.savings_goals FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own savings_goals" ON public.savings_goals;
CREATE POLICY "Users can insert own savings_goals"
  ON public.savings_goals FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own savings_goals" ON public.savings_goals;
CREATE POLICY "Users can delete own savings_goals"
  ON public.savings_goals FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- =============================================
-- 6. MODULE_NOTES - Ensure Security
-- =============================================
-- Users can only manage their own module notes

DROP POLICY IF EXISTS "Users can update own module notes" ON public.module_notes;
CREATE POLICY "Users can update own module notes"
  ON public.module_notes FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own module notes" ON public.module_notes;
CREATE POLICY "Users can insert own module notes"
  ON public.module_notes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own module notes" ON public.module_notes;
CREATE POLICY "Users can delete own module notes"
  ON public.module_notes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- =============================================
-- 7. USER_RESOURCE_FAVORITES - Ensure Security
-- =============================================
-- Users can only manage their own favorites

DROP POLICY IF EXISTS "users: insert own resource_favorites" ON public.user_resource_favorites;
CREATE POLICY "users: insert own resource_favorites"
  ON public.user_resource_favorites FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "users: delete own resource_favorites" ON public.user_resource_favorites;
CREATE POLICY "users: delete own resource_favorites"
  ON public.user_resource_favorites FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- =============================================
-- 8. NOTIFICATIONS - Ensure Security
-- =============================================
-- Users can only update their own notifications (mark as read)

DROP POLICY IF EXISTS "users: update own notifications" ON public.notifications;
CREATE POLICY "users: update own notifications"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)  -- Can only update own notifications
  WITH CHECK (auth.uid() = user_id);  -- Must remain own notifications

-- =============================================
-- 9. PARTNER_INVITATIONS - Ensure Security
-- =============================================
-- Users can only manage invitations they sent or received

DROP POLICY IF EXISTS "users: update own invitations" ON public.partner_invitations;
CREATE POLICY "users: update own invitations"
  ON public.partner_invitations FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = inviter_id  -- Can update if they sent it
    OR 
    (SELECT email FROM public.profiles WHERE id = auth.uid()) = invitee_email  -- Or if they received it
  )
  WITH CHECK (
    auth.uid() = inviter_id  -- Must remain the inviter
    OR 
    (SELECT email FROM public.profiles WHERE id = auth.uid()) = invitee_email  -- Or remain the invitee
  );

-- =============================================
-- 10. COUPLES - Ensure Security
-- =============================================
-- Users can only update couples they are part of

DROP POLICY IF EXISTS "users: update own couple" ON public.couples;
CREATE POLICY "users: update own couple"
  ON public.couples FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user1_id OR auth.uid() = user2_id  -- Can update if part of couple
  )
  WITH CHECK (
    auth.uid() = user1_id OR auth.uid() = user2_id  -- Must remain part of couple
  );

-- =============================================
-- 11. VERIFY PARTNER ACCESS IS READ-ONLY
-- =============================================
-- Ensure partner profile access policy does NOT allow updates
-- This is already handled above, but let's verify the SELECT policy exists

-- The partner profile SELECT policy should already exist from migration 20250201000006
-- It only allows SELECT, not UPDATE/INSERT/DELETE, which is correct

-- =============================================
-- 12. DOCUMENTATION
-- =============================================

COMMENT ON POLICY "Users can update own profile" ON public.profiles IS 
  'Users can only update their own profile. Partner access is read-only via separate SELECT policy.';

COMMENT ON POLICY "Users can update own discussion_answers" ON public.user_discussion_answers IS 
  'Users can only update their own discussion answers. Partners can view but not modify via separate SELECT policy.';

-- =============================================
-- SECURITY SUMMARY
-- =============================================
-- ✅ All UPDATE policies have WITH CHECK clauses
-- ✅ All INSERT policies have WITH CHECK clauses  
-- ✅ All DELETE policies have USING clauses
-- ✅ Partner access is READ-ONLY (SELECT only)
-- ✅ Users can only modify their own data
-- ✅ Shared/collaborative features (discussions) allow VIEW but not MODIFY for partners

