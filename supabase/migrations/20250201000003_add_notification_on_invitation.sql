-- =============================================
-- Automatic Notification Creation for Partner Invitations
-- =============================================
-- Creates notifications automatically when invitations are sent
-- Handles both existing users and new signups

-- Function to get user_id by email (for notifications)
CREATE OR REPLACE FUNCTION get_user_id_by_email(p_email TEXT)
RETURNS UUID AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Look up user in profiles table by email
  SELECT id INTO v_user_id
  FROM public.profiles
  WHERE LOWER(email) = LOWER(p_email)
  LIMIT 1;
  
  RETURN v_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_user_id_by_email(TEXT) TO authenticated;

-- Function to create notification when invitation is created
CREATE OR REPLACE FUNCTION notify_on_partner_invitation()
RETURNS TRIGGER AS $$
DECLARE
  v_invitee_user_id UUID;
  v_inviter_name TEXT;
BEGIN
  -- Only process if invitation is pending
  IF NEW.status != 'pending' THEN
    RETURN NEW;
  END IF;
  
  -- Get invitee's user_id if they have an account
  SELECT get_user_id_by_email(NEW.invitee_email) INTO v_invitee_user_id;
  
  -- Only create notification if invitee has an account
  IF v_invitee_user_id IS NOT NULL THEN
    -- Get inviter's name for personalized message
    SELECT COALESCE(
      NULLIF(TRIM(COALESCE(first_name, '') || ' ' || COALESCE(last_name, '')), ''),
      full_name,
      'Someone'
    )
    INTO v_inviter_name
    FROM public.profiles
    WHERE id = NEW.inviter_id;
    
    -- Create notification for invitee
    PERFORM create_notification(
      v_invitee_user_id,
      'partner_invitation',
      'Partner Invitation Received',
      COALESCE(v_inviter_name, 'Someone') || ' wants to connect with you as their partner on NikahPrep.',
      'partner_invitation',
      NEW.id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on partner_invitations table
DROP TRIGGER IF EXISTS trigger_notify_on_partner_invitation ON public.partner_invitations;
CREATE TRIGGER trigger_notify_on_partner_invitation
  AFTER INSERT ON public.partner_invitations
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_partner_invitation();

-- Function to create notifications for pending invitations when user signs up
CREATE OR REPLACE FUNCTION notify_pending_invitations_on_signup()
RETURNS TRIGGER AS $$
DECLARE
  v_invitation RECORD;
  v_inviter_name TEXT;
BEGIN
  -- Find all pending invitations for this new user's email
  FOR v_invitation IN
    SELECT pi.*
    FROM public.partner_invitations pi
    WHERE LOWER(pi.invitee_email) = LOWER(NEW.email)
      AND pi.status = 'pending'
      AND pi.expires_at > NOW()
  LOOP
    -- Get inviter's name
    SELECT COALESCE(
      NULLIF(TRIM(COALESCE(first_name, '') || ' ' || COALESCE(last_name, '')), ''),
      full_name,
      'Someone'
    )
    INTO v_inviter_name
    FROM public.profiles
    WHERE id = v_invitation.inviter_id;
    
    -- Create notification
    PERFORM create_notification(
      NEW.id,
      'partner_invitation',
      'Partner Invitation Received',
      COALESCE(v_inviter_name, 'Someone') || ' wants to connect with you as their partner on NikahPrep.',
      'partner_invitation',
      v_invitation.id
    );
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to notify about pending invitations when user signs up
DROP TRIGGER IF EXISTS trigger_notify_pending_invitations_on_signup ON public.profiles;
CREATE TRIGGER trigger_notify_pending_invitations_on_signup
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION notify_pending_invitations_on_signup();

-- Set replica identity for Realtime change detection
-- This is REQUIRED for Supabase Realtime to work properly
ALTER TABLE public.notifications REPLICA IDENTITY FULL;

-- Add comment for documentation
COMMENT ON FUNCTION get_user_id_by_email(TEXT) IS 'Looks up user_id by email address for notification purposes';
COMMENT ON FUNCTION notify_on_partner_invitation() IS 'Trigger function that creates a notification when a partner invitation is created';
COMMENT ON FUNCTION notify_pending_invitations_on_signup() IS 'Trigger function that creates notifications for pending invitations when a new user signs up';

