-- Drop view if exists (for idempotency)
DROP VIEW IF EXISTS public.user_stats_summary;

-- Ensure user_discussion_answers table exists (create if missing)
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
  UNIQUE(user_id, prompt_id)
);

-- Create optimized view for user progress statistics
CREATE VIEW public.user_stats_summary AS
SELECT
  u.id as user_id,
  -- Checklist stats
  COUNT(DISTINCT ci.id) as checklist_total,
  COUNT(DISTINCT ucp.item_id) FILTER (WHERE ucp.is_completed = true) as checklist_completed,
  -- Module stats (count all modules)
  COUNT(DISTINCT m.id) as modules_total,
  -- Discussion stats
  COUNT(DISTINCT dp.id) as discussions_total,
  COUNT(DISTINCT uda.prompt_id) FILTER (WHERE uda.is_discussed = true) as discussions_completed,
  -- Wedding date from profile (may be NULL)
  u.wedding_date
FROM public.profiles u
CROSS JOIN public.checklist_items ci
CROSS JOIN public.modules m
CROSS JOIN public.discussion_prompts dp
LEFT JOIN public.user_checklist_progress ucp ON ucp.user_id = u.id AND ucp.item_id = ci.id
LEFT JOIN public.user_discussion_answers uda ON uda.user_id = u.id AND uda.prompt_id = dp.id
GROUP BY u.id, u.wedding_date;

-- Grant access to authenticated users
GRANT SELECT ON public.user_stats_summary TO authenticated;

-- Add RLS policy
ALTER VIEW public.user_stats_summary SET (security_invoker = true);
