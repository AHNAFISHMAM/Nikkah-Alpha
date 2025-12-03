-- =============================================
-- Rate Limiting for Partner Invitations
-- =============================================
-- Prevents abuse of invitation system
-- Database-only solution (no external APIs)

CREATE TABLE IF NOT EXISTS public.invitation_rate_limits (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  invitation_count INTEGER DEFAULT 0 NOT NULL,
  last_reset_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  failed_attempts INTEGER DEFAULT 0 NOT NULL,
  last_failed_attempt_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_invitation_rate_limits_last_reset_at ON public.invitation_rate_limits(last_reset_at);

-- RLS Policies
ALTER TABLE public.invitation_rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users: select own rate limits"
  ON public.invitation_rate_limits FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Function to check and update rate limits
CREATE OR REPLACE FUNCTION check_invitation_rate_limit(
  p_user_id UUID,
  p_max_per_day INTEGER DEFAULT 10,
  p_max_failed_attempts INTEGER DEFAULT 5
)
RETURNS JSONB AS $$
DECLARE
  v_rate_limit RECORD;
  v_hours_since_reset NUMERIC;
  v_allowed BOOLEAN := TRUE;
  v_message TEXT := 'Allowed';
BEGIN
  -- Get or create rate limit record
  SELECT * INTO v_rate_limit
  FROM public.invitation_rate_limits
  WHERE user_id = p_user_id;

  -- If no record exists, create one
  IF v_rate_limit IS NULL THEN
    INSERT INTO public.invitation_rate_limits (user_id)
    VALUES (p_user_id)
    RETURNING * INTO v_rate_limit;
  END IF;

  -- Check if 24 hours have passed since last reset
  v_hours_since_reset := EXTRACT(EPOCH FROM (NOW() - v_rate_limit.last_reset_at)) / 3600;
  
  IF v_hours_since_reset >= 24 THEN
    -- Reset counters
    UPDATE public.invitation_rate_limits
    SET invitation_count = 0,
        failed_attempts = 0,
        last_reset_at = NOW(),
        updated_at = NOW()
    WHERE user_id = p_user_id;
    
    v_rate_limit.invitation_count := 0;
    v_rate_limit.failed_attempts := 0;
  END IF;

  -- Check if user has exceeded daily limit
  IF v_rate_limit.invitation_count >= p_max_per_day THEN
    v_allowed := FALSE;
    v_message := format('Daily limit reached. You can send %s invitations per day.', p_max_per_day);
  END IF;

  -- Check if user has too many failed attempts (brute force protection)
  IF v_rate_limit.failed_attempts >= p_max_failed_attempts THEN
    -- Check if 1 hour has passed since last failed attempt
    IF v_rate_limit.last_failed_attempt_at IS NOT NULL AND
       EXTRACT(EPOCH FROM (NOW() - v_rate_limit.last_failed_attempt_at)) / 3600 < 1 THEN
      v_allowed := FALSE;
      v_message := 'Too many failed attempts. Please try again in 1 hour.';
    ELSE
      -- Reset failed attempts after 1 hour
      UPDATE public.invitation_rate_limits
      SET failed_attempts = 0,
          updated_at = NOW()
      WHERE user_id = p_user_id;
    END IF;
  END IF;

  -- Increment invitation count if allowed
  IF v_allowed THEN
    UPDATE public.invitation_rate_limits
    SET invitation_count = invitation_count + 1,
        updated_at = NOW()
    WHERE user_id = p_user_id;
  END IF;

  RETURN jsonb_build_object(
    'allowed', v_allowed,
    'message', v_message,
    'remaining', GREATEST(0, p_max_per_day - v_rate_limit.invitation_count - CASE WHEN v_allowed THEN 1 ELSE 0 END)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to record failed attempt
CREATE OR REPLACE FUNCTION record_failed_invitation_attempt(p_user_id UUID)
RETURNS void AS $$
BEGIN
  INSERT INTO public.invitation_rate_limits (user_id, failed_attempts, last_failed_attempt_at)
  VALUES (p_user_id, 1, NOW())
  ON CONFLICT (user_id) DO UPDATE
  SET failed_attempts = invitation_rate_limits.failed_attempts + 1,
      last_failed_attempt_at = NOW(),
      updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION check_invitation_rate_limit(UUID, INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION record_failed_invitation_attempt(UUID) TO authenticated;

