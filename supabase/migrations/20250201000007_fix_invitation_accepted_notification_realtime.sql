-- =============================================
-- Fix Invitation Accepted Notification (Real-time)
-- =============================================
-- Removes silent exception handler and adds personalization
-- Ensures notifications are created and delivered in real-time

-- Update accept_partner_invitation function
CREATE OR REPLACE FUNCTION accept_partner_invitation(
  invitation_id_param UUID,
  current_user_id_param UUID
)
RETURNS UUID AS $$
DECLARE
  invitation_record RECORD;
  partner_id_result UUID;
  v_invitee_name TEXT;
  v_notification_id UUID;
BEGIN
  -- Get invitation details
  SELECT * INTO invitation_record
  FROM public.partner_invitations
  WHERE id = invitation_id_param
    AND status = 'pending'
    AND expires_at > NOW();
  
  -- Check if invitation exists and is valid
  IF invitation_record IS NULL THEN
    RAISE EXCEPTION 'Invalid or expired invitation';
  END IF;
  
  -- Verify user is the intended recipient
  IF invitation_record.invitation_type = 'email' THEN
    -- Check if current user's email matches invitee_email
    IF (SELECT email FROM auth.users WHERE id = current_user_id_param) != invitation_record.invitee_email THEN
      RAISE EXCEPTION 'Email does not match invitation';
    END IF;
  END IF;
  
  -- Check if users are already partners
  SELECT get_partner_id(invitation_record.inviter_id) INTO partner_id_result;
  IF partner_id_result IS NOT NULL THEN
    RAISE EXCEPTION 'Inviter already has a partner';
  END IF;
  
  SELECT get_partner_id(current_user_id_param) INTO partner_id_result;
  IF partner_id_result IS NOT NULL THEN
    RAISE EXCEPTION 'You already have a partner';
  END IF;
  
  -- Create couple relationship
  INSERT INTO public.couples (user1_id, user2_id, relationship_status)
  VALUES (invitation_record.inviter_id, current_user_id_param, 'preparing')
  ON CONFLICT (user1_id, user2_id) DO NOTHING;
  
  -- Update invitation status
  UPDATE public.partner_invitations
  SET status = 'accepted',
      accepted_at = NOW(),
      updated_at = NOW()
  WHERE id = invitation_id_param;
  
  -- Expire any other pending invitations from either user
  UPDATE public.partner_invitations
  SET status = 'expired',
      updated_at = NOW()
  WHERE (inviter_id = invitation_record.inviter_id OR inviter_id = current_user_id_param)
    AND status = 'pending'
    AND id != invitation_id_param;
  
  -- Get the couple ID for notifications
  SELECT id INTO partner_id_result
  FROM public.couples
  WHERE (user1_id = invitation_record.inviter_id AND user2_id = current_user_id_param)
     OR (user2_id = invitation_record.inviter_id AND user1_id = current_user_id_param)
  LIMIT 1;
  
  -- Create audit log
  PERFORM create_audit_log(
    current_user_id_param,
    'invitation_accepted',
    'partner_invitation',
    invitation_id_param,
    jsonb_build_object('inviter_id', invitation_record.inviter_id, 'invitation_type', invitation_record.invitation_type)
  );
  
  -- Get invitee's (accepter's) name for personalized message
  SELECT COALESCE(
    NULLIF(TRIM(COALESCE(first_name, '') || ' ' || COALESCE(last_name, '')), ''),
    full_name,
    'Your partner'
  )
  INTO v_invitee_name
  FROM public.profiles
  WHERE id = current_user_id_param;
  
  -- Create notification for inviter (REMOVED silent exception handler)
  -- This ensures notification is always created and triggers real-time update
  SELECT create_notification(
    invitation_record.inviter_id,
    'invitation_accepted',
    'Partner Connected! 🎉',
    COALESCE(v_invitee_name, 'Your partner') || ' has accepted your invitation! You are now connected and can start collaborating together.',
    'couple',
    partner_id_result
  ) INTO v_notification_id;
  
  -- Return the partner ID
  SELECT get_partner_id(current_user_id_param) INTO partner_id_result;
  RETURN partner_id_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission (if not already granted)
GRANT EXECUTE ON FUNCTION accept_partner_invitation(UUID, UUID) TO authenticated;

-- Add comment for documentation
COMMENT ON FUNCTION accept_partner_invitation(UUID, UUID) IS 'Accepts a partner invitation and creates a personalized real-time notification for the inviter. Notification is guaranteed to be created (no silent failures).';

