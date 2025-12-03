-- =============================================
-- Backfill Notifications for Existing Pending Invitations
-- =============================================
-- Creates notifications for pending invitations that were created
-- before the automatic notification trigger was in place

-- Function to backfill notifications for existing pending invitations
CREATE OR REPLACE FUNCTION backfill_invitation_notifications()
RETURNS INTEGER AS $$
DECLARE
  v_invitation RECORD;
  v_invitee_user_id UUID;
  v_inviter_name TEXT;
  v_notification_count INTEGER := 0;
  v_existing_notification_id UUID;
BEGIN
  -- Loop through all pending invitations
  FOR v_invitation IN
    SELECT pi.*
    FROM public.partner_invitations pi
    WHERE pi.status = 'pending'
      AND pi.expires_at > NOW()
      AND pi.invitee_email IS NOT NULL
  LOOP
    -- Get invitee's user_id if they have an account
    SELECT get_user_id_by_email(v_invitation.invitee_email) INTO v_invitee_user_id;
    
    -- Only create notification if invitee has an account
    IF v_invitee_user_id IS NOT NULL THEN
      -- Check if notification already exists for this invitation
      SELECT id INTO v_existing_notification_id
      FROM public.notifications
      WHERE user_id = v_invitee_user_id
        AND type = 'partner_invitation'
        AND related_entity_type = 'partner_invitation'
        AND related_entity_id = v_invitation.id
        AND is_read = false
      LIMIT 1;
      
      -- Only create notification if it doesn't already exist
      IF v_existing_notification_id IS NULL THEN
        -- Get inviter's name for personalized message
        SELECT COALESCE(
          NULLIF(TRIM(COALESCE(first_name, '') || ' ' || COALESCE(last_name, '')), ''),
          full_name,
          'Someone'
        )
        INTO v_inviter_name
        FROM public.profiles
        WHERE id = v_invitation.inviter_id;
        
        -- Create notification for invitee
        PERFORM create_notification(
          v_invitee_user_id,
          'partner_invitation',
          'Partner Invitation Received',
          COALESCE(v_inviter_name, 'Someone') || ' wants to connect with you as their partner on NikahPrep.',
          'partner_invitation',
          v_invitation.id
        );
        
        v_notification_count := v_notification_count + 1;
      END IF;
    END IF;
  END LOOP;
  
  RETURN v_notification_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION backfill_invitation_notifications() TO authenticated;

-- Run the backfill function
-- This will create notifications for all existing pending invitations
SELECT backfill_invitation_notifications() AS notifications_created;

-- Add comment for documentation
COMMENT ON FUNCTION backfill_invitation_notifications() IS 'Backfills notifications for existing pending partner invitations. Returns the number of notifications created.';

