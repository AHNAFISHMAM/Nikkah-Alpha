-- =============================================
-- PERMANENT FIX: Auto-Delete from auth.users
-- =============================================
-- This migration ensures that when users are deleted,
-- they are automatically removed from auth.users
-- so emails can be reused immediately
-- =============================================

-- Function to delete user from auth.users
-- This uses SECURITY DEFINER to bypass RLS and delete from auth schema
CREATE OR REPLACE FUNCTION delete_auth_user_by_id(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_deleted_count INTEGER;
BEGIN
  -- Delete from auth.users
  DELETE FROM auth.users
  WHERE id = p_user_id;
  
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  
  -- Return true if deletion was successful
  RETURN v_deleted_count > 0;
EXCEPTION
  WHEN insufficient_privilege THEN
    -- If we don't have permission, return false
    -- The Edge Function will handle it instead
    RAISE WARNING 'Insufficient privileges to delete from auth.users. User ID: %', p_user_id;
    RETURN FALSE;
  WHEN OTHERS THEN
    RAISE WARNING 'Error deleting from auth.users: %. User ID: %', SQLERRM, p_user_id;
    RETURN FALSE;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION delete_auth_user_by_id(UUID) TO authenticated;

COMMENT ON FUNCTION delete_auth_user_by_id(UUID) IS 
'Deletes a user from auth.users by user ID.
Returns true if successful, false otherwise.
Uses SECURITY DEFINER to access auth schema.';

-- Update the delete_user_data function to automatically delete from auth.users
CREATE OR REPLACE FUNCTION delete_user_data(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_user_email TEXT;
  v_deleted_count INTEGER := 0;
  v_auth_deleted BOOLEAN := FALSE;
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
  
  -- 4. Remove personal data from invitations
  UPDATE public.partner_invitations
  SET invitee_email = NULL
  WHERE invitee_email = v_user_email;
  
  -- 5. Delete all notifications
  DELETE FROM public.notifications
  WHERE user_id = p_user_id;
  
  -- 6. Delete rate limit records
  DELETE FROM public.invitation_rate_limits
  WHERE user_id = p_user_id;
  
  -- 7. Anonymize audit logs
  UPDATE public.audit_logs
  SET 
    user_id = NULL,
    metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object(
      'user_deleted', true,
      'deleted_at', NOW(),
      'original_user_id', p_user_id::text
    )
  WHERE user_id = p_user_id;
  
  -- 8. Create final audit log entry
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
    NULL;
  END;
  
  -- 9. AUTOMATICALLY DELETE FROM auth.users
  -- This is the permanent fix - always try to delete from auth.users
  BEGIN
    v_auth_deleted := delete_auth_user_by_id(p_user_id);
  EXCEPTION WHEN OTHERS THEN
    -- If deletion fails, log but continue
    v_auth_deleted := FALSE;
    RAISE WARNING 'Failed to delete from auth.users: %. User ID: %', SQLERRM, p_user_id;
  END;
  
  RETURN jsonb_build_object(
    'success', true,
    'message', CASE 
      WHEN v_auth_deleted THEN 'User data and auth account deleted successfully'
      ELSE 'User data deleted. Auth account deletion may require Edge Function.'
    END,
    'auth_deleted', v_auth_deleted,
    'invitations_cancelled', v_deleted_count,
    'deleted_at', NOW()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update comment
COMMENT ON FUNCTION delete_user_data(UUID) IS 
'Deletes and anonymizes all user data (GDPR Article 17).
NOW AUTOMATICALLY DELETES FROM auth.users to allow email reuse.
If database deletion fails, Edge Function will handle it.';

-- =============================================
-- BONUS: Function to clean up all orphaned users
-- =============================================

CREATE OR REPLACE FUNCTION cleanup_all_orphaned_auth_users()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_user RECORD;
  v_deleted_count INTEGER := 0;
  v_failed_count INTEGER := 0;
BEGIN
  -- Find and delete all orphaned users
  FOR v_user IN
    SELECT au.id, au.email
    FROM auth.users au
    LEFT JOIN public.profiles p ON au.id = p.id
    WHERE p.id IS NULL 
       OR p.email LIKE 'deleted_%@deleted.local'
  LOOP
    BEGIN
      IF delete_auth_user_by_id(v_user.id) THEN
        v_deleted_count := v_deleted_count + 1;
      ELSE
        v_failed_count := v_failed_count + 1;
      END IF;
    EXCEPTION WHEN OTHERS THEN
      v_failed_count := v_failed_count + 1;
    END;
  END LOOP;
  
  RETURN jsonb_build_object(
    'success', true,
    'deleted', v_deleted_count,
    'failed', v_failed_count,
    'message', format('Cleaned up %s orphaned users. %s failed.', v_deleted_count, v_failed_count)
  );
END;
$$;

GRANT EXECUTE ON FUNCTION cleanup_all_orphaned_auth_users() TO authenticated;

COMMENT ON FUNCTION cleanup_all_orphaned_auth_users() IS 
'Cleans up all orphaned auth users (users without active profiles).
Use this to clean up existing orphaned users.';

