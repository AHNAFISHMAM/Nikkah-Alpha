-- =============================================
-- Add Missing Performance Indexes
-- =============================================
-- This adds indexes that may be missing for optimal query performance
-- Safe to run multiple times (uses IF NOT EXISTS)

BEGIN;

-- =============================================
-- 1. USER_RESOURCE_FAVORITES INDEXES
-- =============================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_resource_favorites') THEN
    CREATE INDEX IF NOT EXISTS idx_user_resource_favorites_user_id 
      ON public.user_resource_favorites(user_id);
    
    CREATE INDEX IF NOT EXISTS idx_user_resource_favorites_resource_id 
      ON public.user_resource_favorites(resource_id);
    
    CREATE INDEX IF NOT EXISTS idx_user_resource_favorites_user_resource 
      ON public.user_resource_favorites(user_id, resource_id);
    
    CREATE INDEX IF NOT EXISTS idx_user_resource_favorites_created_at 
      ON public.user_resource_favorites(created_at DESC);
  END IF;
END $$;

-- =============================================
-- 2. USER_DISCUSSION_ANSWERS INDEXES
-- =============================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_discussion_answers') THEN
    CREATE INDEX IF NOT EXISTS idx_user_discussion_answers_user_id 
      ON public.user_discussion_answers(user_id);
    
    CREATE INDEX IF NOT EXISTS idx_user_discussion_answers_prompt_id 
      ON public.user_discussion_answers(prompt_id);
    
    CREATE INDEX IF NOT EXISTS idx_user_discussion_answers_user_prompt 
      ON public.user_discussion_answers(user_id, prompt_id);
    
    CREATE INDEX IF NOT EXISTS idx_user_discussion_answers_is_discussed 
      ON public.user_discussion_answers(is_discussed);
    
    CREATE INDEX IF NOT EXISTS idx_user_discussion_answers_discussed_at 
      ON public.user_discussion_answers(discussed_at DESC) WHERE discussed_at IS NOT NULL;
    
    CREATE INDEX IF NOT EXISTS idx_user_discussion_answers_updated_at 
      ON public.user_discussion_answers(updated_at DESC);
  END IF;
END $$;

-- =============================================
-- 3. COUPLES TABLE INDEXES
-- =============================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'couples') THEN
    CREATE INDEX IF NOT EXISTS idx_couples_user1_id 
      ON public.couples(user1_id);
    
    CREATE INDEX IF NOT EXISTS idx_couples_user2_id 
      ON public.couples(user2_id);
    
    CREATE INDEX IF NOT EXISTS idx_couples_updated_at 
      ON public.couples(updated_at DESC);
    
    -- Composite index for partner lookup (most common query)
    CREATE INDEX IF NOT EXISTS idx_couples_user_lookup 
      ON public.couples(user1_id, user2_id);
  END IF;
END $$;

-- =============================================
-- 4. PARTNER_INVITATIONS INDEXES
-- =============================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'partner_invitations') THEN
    CREATE INDEX IF NOT EXISTS idx_partner_invitations_inviter_id 
      ON public.partner_invitations(inviter_id);
    
    CREATE INDEX IF NOT EXISTS idx_partner_invitations_invitee_email 
      ON public.partner_invitations(invitee_email) WHERE invitee_email IS NOT NULL;
    
    CREATE INDEX IF NOT EXISTS idx_partner_invitations_code 
      ON public.partner_invitations(invitation_code) WHERE invitation_code IS NOT NULL;
    
    CREATE INDEX IF NOT EXISTS idx_partner_invitations_status 
      ON public.partner_invitations(status);
    
    CREATE INDEX IF NOT EXISTS idx_partner_invitations_expires_at 
      ON public.partner_invitations(expires_at);
  END IF;
END $$;

-- =============================================
-- 5. NOTIFICATIONS INDEXES
-- =============================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'notifications') THEN
    CREATE INDEX IF NOT EXISTS idx_notifications_user_id 
      ON public.notifications(user_id);
    
    CREATE INDEX IF NOT EXISTS idx_notifications_is_read 
      ON public.notifications(is_read);
    
    CREATE INDEX IF NOT EXISTS idx_notifications_created_at 
      ON public.notifications(created_at DESC);
    
    -- Composite index for common query: unread notifications for user
    CREATE INDEX IF NOT EXISTS idx_notifications_user_unread 
      ON public.notifications(user_id, is_read, created_at DESC) WHERE is_read = false;
  END IF;
END $$;

-- =============================================
-- 6. FINANCIAL TABLES INDEXES
-- =============================================

DO $$
BEGIN
  -- budgets
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'budgets') THEN
    CREATE INDEX IF NOT EXISTS idx_budgets_user 
      ON public.budgets(user_id);
  END IF;
  
  -- mahr
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'mahr') THEN
    CREATE INDEX IF NOT EXISTS idx_mahr_user 
      ON public.mahr(user_id);
  END IF;
  
  -- wedding_budgets
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'wedding_budgets') THEN
    CREATE INDEX IF NOT EXISTS idx_wedding_budgets_user 
      ON public.wedding_budgets(user_id);
  END IF;
  
  -- savings_goals
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'savings_goals') THEN
    CREATE INDEX IF NOT EXISTS idx_savings_goals_user 
      ON public.savings_goals(user_id);
  END IF;
END $$;

-- =============================================
-- 7. DISCUSSION_PROMPTS INDEXES (if sort_order exists)
-- =============================================

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'discussion_prompts' 
    AND column_name = 'sort_order'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_discussion_prompts_sort_order 
      ON public.discussion_prompts(sort_order);
    
    CREATE INDEX IF NOT EXISTS idx_discussion_prompts_category_sort 
      ON public.discussion_prompts(category, sort_order);
  END IF;
END $$;

COMMIT;

-- =============================================
-- MIGRATION COMPLETE
-- =============================================
-- ✅ All performance-critical indexes added
-- ✅ Indexes only created for existing tables
-- ✅ Safe to run multiple times
-- =============================================

