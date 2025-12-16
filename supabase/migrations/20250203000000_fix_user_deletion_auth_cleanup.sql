-- =============================================
-- Fix User Deletion - Enable Email Reuse
-- =============================================
-- This migration adds helper functions to properly clean up
-- deleted users so their emails can be reused for new signups

-- Function to check if a user email exists in auth.users
CREATE OR REPLACE FUNCTION check_user_exists(p_email TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = p_email
  LIMIT 1;
  
  RETURN v_user_id;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION check_user_exists(TEXT) TO authenticated;

COMMENT ON FUNCTION check_user_exists(TEXT) IS 
'Checks if a user with the given email exists in auth.users. 
Returns the user ID if found, NULL otherwise.';

