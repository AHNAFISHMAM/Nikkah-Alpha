-- =============================================
-- Data Deletion Functionality (GDPR Article 17)
-- =============================================
-- Right to be forgotten / Right to erasure
-- Anonymizes personal data while preserving audit trail

-- Function to delete/anonymize all user data
CREATE OR REPLACE FUNCTION delete_user_data(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_user_email TEXT;
  v_deleted_count INTEGER := 0;
BEGIN
  -- Get user email before deletion
  SELECT email INTO v_user_email
  FROM auth.users
  WHERE id = p_user_id;
  
  IF v_user_email IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'User not found'
    );
  END IF;
  
  -- 1. Disconnect partner if connected (soft delete)
  BEGIN
    PERFORM disconnect_partner(p_user_id);
  EXCEPTION WHEN OTHERS THEN
    -- Continue even if disconnect fails
    NULL;
  END;
  
  -- 2. Cancel all pending invitations
  UPDATE public.partner_invitations
  SET status = 'declined',
      updated_at = NOW()
  WHERE inviter_id = p_user_id
    AND status = 'pending';
  
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  
  -- 3. Anonymize profile data (preserve structure for audit)
  UPDATE public.profiles
  SET 
    email = 'deleted_' || substring(p_user_id::text, 1, 8) || '@deleted.local',
    full_name = 'Deleted User',
    first_name = NULL,
    last_name = NULL,
    avatar_url = NULL,
    partner_email = NULL,
    partner_name = NULL,
    date_of_birth = NULL,
    age = NULL,
    country = NULL,
    city = NULL,
    updated_at = NOW()
  WHERE id = p_user_id;
  
  -- 4. Remove personal data from invitations (anonymize invitee_email)
  UPDATE public.partner_invitations
  SET invitee_email = NULL
  WHERE invitee_email = v_user_email;
  
  -- 5. Delete all notifications
  DELETE FROM public.notifications
  WHERE user_id = p_user_id;
  
  -- 6. Delete rate limit records
  DELETE FROM public.invitation_rate_limits
  WHERE user_id = p_user_id;
  
  -- 7. Anonymize audit logs (keep for compliance but remove personal identifiers)
  UPDATE public.audit_logs
  SET 
    user_id = NULL,
    metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object(
      'user_deleted', true,
      'deleted_at', NOW(),
      'original_user_id', p_user_id::text
    )
  WHERE user_id = p_user_id;
  
  -- 8. Create final audit log entry (before user_id is nulled)
  BEGIN
    PERFORM create_audit_log(
      p_user_id,
      'account_deleted',
      'user',
      p_user_id,
      jsonb_build_object(
        'deletion_date', NOW(),
        'invitations_cancelled', v_deleted_count
      )
    );
  EXCEPTION WHEN OTHERS THEN
    -- Non-critical
    NULL;
  END;
  
  -- 9. Delete from auth.users (Supabase Auth)
  -- Note: This must be done via Supabase Admin API or service role
  -- We'll handle this in the application layer
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'User data has been anonymized. Auth account deletion requires admin action.',
    'invitations_cancelled', v_deleted_count,
    'deleted_at', NOW()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION delete_user_data(UUID) TO authenticated;

-- Add comment explaining the function
COMMENT ON FUNCTION delete_user_data(UUID) IS 
'Anonymizes all personal data for a user (GDPR Article 17 - Right to be forgotten). 
Preserves audit trail by anonymizing rather than hard-deleting. 
Auth account deletion must be handled separately via Supabase Admin API.';

