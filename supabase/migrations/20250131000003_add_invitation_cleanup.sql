-- =============================================
-- Expired Invitation Cleanup
-- =============================================
-- Automatically marks expired invitations
-- Can be run manually or via pg_cron (if available)

-- Function to mark expired invitations
CREATE OR REPLACE FUNCTION cleanup_expired_invitations()
RETURNS INTEGER AS $$
DECLARE
  v_updated_count INTEGER;
BEGIN
  UPDATE public.partner_invitations
  SET status = 'expired',
      updated_at = NOW()
  WHERE status = 'pending'
    AND expires_at < NOW();
  
  GET DIAGNOSTICS v_updated_count = ROW_COUNT;
  RETURN v_updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION cleanup_expired_invitations() TO authenticated;

-- If pg_cron extension is available, uncomment to schedule daily cleanup at 2 AM UTC
-- This requires pg_cron extension to be enabled in Supabase
-- SELECT cron.schedule(
--   'cleanup-expired-invitations',
--   '0 2 * * *',
--   $$SELECT cleanup_expired_invitations();$$
-- );

