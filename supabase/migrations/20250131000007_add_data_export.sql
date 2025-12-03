-- =============================================
-- Data Export Functionality (GDPR Compliance)
-- =============================================
-- Allows users to export all their personal data
-- Required by GDPR Article 15 (Right of Access)

-- Function to export all user data in JSON format
CREATE OR REPLACE FUNCTION export_user_data(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_user_email TEXT;
  v_export JSONB;
BEGIN
  -- Get user email
  SELECT email INTO v_user_email
  FROM auth.users
  WHERE id = p_user_id;
  
  -- Build comprehensive data export
  SELECT jsonb_build_object(
    'export_date', NOW(),
    'user_id', p_user_id,
    'user_email', v_user_email,
    'profile', (
      SELECT row_to_json(p.*)
      FROM public.profiles p
      WHERE p.id = p_user_id
    ),
    'partner_invitations', (
      SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
          'id', pi.id,
          'invitation_type', pi.invitation_type,
          'status', pi.status,
          'created_at', pi.created_at,
          'expires_at', pi.expires_at,
          'accepted_at', pi.accepted_at
          -- Note: invitee_email excluded for privacy (other user's data)
        )
      ), '[]'::jsonb)
      FROM public.partner_invitations pi
      WHERE pi.inviter_id = p_user_id
    ),
    'received_invitations', (
      SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
          'id', pi.id,
          'invitation_type', pi.invitation_type,
          'status', pi.status,
          'created_at', pi.created_at,
          'expires_at', pi.expires_at
        )
      ), '[]'::jsonb)
      FROM public.partner_invitations pi
      WHERE pi.invitee_email = v_user_email
    ),
    'couples', (
      SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
          'id', c.id,
          'relationship_status', c.relationship_status,
          'status', c.status,
          'connected_at', c.connected_at,
          'disconnected_at', c.disconnected_at,
          'created_at', c.created_at
          -- Note: partner_id excluded for privacy
        )
      ), '[]'::jsonb)
      FROM public.couples c
      WHERE c.user1_id = p_user_id OR c.user2_id = p_user_id
    ),
    'audit_logs', (
      SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
          'id', al.id,
          'action', al.action,
          'entity_type', al.entity_type,
          'created_at', al.created_at,
          'metadata', al.metadata
        ) ORDER BY al.created_at DESC
      ), '[]'::jsonb)
      FROM public.audit_logs al
      WHERE al.user_id = p_user_id
    ),
    'notifications', (
      SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
          'id', n.id,
          'type', n.type,
          'title', n.title,
          'message', n.message,
          'is_read', n.is_read,
          'created_at', n.created_at
        ) ORDER BY n.created_at DESC
      ), '[]'::jsonb)
      FROM public.notifications n
      WHERE n.user_id = p_user_id
    ),
    'rate_limits', (
      SELECT jsonb_build_object(
        'invitation_count', irl.invitation_count,
        'last_reset_at', irl.last_reset_at,
        'failed_attempts', irl.failed_attempts
      )
      FROM public.invitation_rate_limits irl
      WHERE irl.user_id = p_user_id
      LIMIT 1
    )
  ) INTO v_export;
  
  -- Create audit log for data export
  BEGIN
    PERFORM create_audit_log(
      p_user_id,
      'data_exported',
      'user',
      p_user_id,
      jsonb_build_object('export_date', NOW())
    );
  EXCEPTION WHEN OTHERS THEN
    -- Non-critical, continue
    NULL;
  END;
  
  RETURN v_export;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION export_user_data(UUID) TO authenticated;

