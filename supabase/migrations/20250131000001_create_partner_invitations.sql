-- =============================================
-- Partner Invitations System
-- =============================================
-- Stores pending partner connection requests
-- Supports both email and code-based invitations

CREATE TABLE IF NOT EXISTS public.partner_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inviter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invitee_email TEXT, -- For email invitations
  invitation_code TEXT UNIQUE, -- For code-based invitations (e.g., "NIKAH-ABC123")
  status TEXT CHECK (status IN ('pending', 'accepted', 'declined', 'expired')) DEFAULT 'pending',
  invitation_type TEXT CHECK (invitation_type IN ('email', 'code')) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_partner_invitations_inviter_id ON public.partner_invitations(inviter_id);
CREATE INDEX IF NOT EXISTS idx_partner_invitations_invitee_email ON public.partner_invitations(invitee_email) WHERE invitee_email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_partner_invitations_code ON public.partner_invitations(invitation_code) WHERE invitation_code IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_partner_invitations_status ON public.partner_invitations(status);
CREATE INDEX IF NOT EXISTS idx_partner_invitations_expires_at ON public.partner_invitations(expires_at);

-- Unique partial index: Ensure one active invitation per inviter
-- This prevents users from having multiple pending invitations at once
CREATE UNIQUE INDEX IF NOT EXISTS idx_partner_invitations_one_active_per_user 
  ON public.partner_invitations(inviter_id) 
  WHERE status = 'pending';

-- RLS Policies
ALTER TABLE public.partner_invitations ENABLE ROW LEVEL SECURITY;

-- Users can view their own invitations (sent or received)
DROP POLICY IF EXISTS "users: select own invitations" ON public.partner_invitations;
CREATE POLICY "users: select own invitations"
  ON public.partner_invitations FOR SELECT
  TO authenticated
  USING (
    inviter_id = auth.uid()
    OR invitee_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- Users can create invitations
DROP POLICY IF EXISTS "users: insert own invitations" ON public.partner_invitations;
CREATE POLICY "users: insert own invitations"
  ON public.partner_invitations FOR INSERT
  TO authenticated
  WITH CHECK (inviter_id = auth.uid());

-- Users can update their own invitations
DROP POLICY IF EXISTS "users: update own invitations" ON public.partner_invitations;
CREATE POLICY "users: update own invitations"
  ON public.partner_invitations FOR UPDATE
  TO authenticated
  USING (inviter_id = auth.uid())
  WITH CHECK (inviter_id = auth.uid());

-- Function to generate unique invitation code
CREATE OR REPLACE FUNCTION generate_invitation_code()
RETURNS TEXT AS $$
DECLARE
  code TEXT;
  exists_check BOOLEAN;
BEGIN
  LOOP
    -- Generate code: NIKAH-XXXXXX (6 random alphanumeric)
    code := 'NIKAH-' || upper(substring(md5(random()::text) from 1 for 6));
    
    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM public.partner_invitations WHERE invitation_code = code) INTO exists_check;
    
    -- Exit loop if code is unique
    EXIT WHEN NOT exists_check;
  END LOOP;
  
  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Function to accept invitation and create couple relationship
CREATE OR REPLACE FUNCTION accept_partner_invitation(
  invitation_id_param UUID,
  current_user_id_param UUID
)
RETURNS UUID AS $$
DECLARE
  invitation_record RECORD;
  partner_id_result UUID;
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
  
  -- Create notification for inviter (if notification function exists)
  BEGIN
    PERFORM create_notification(
      invitation_record.inviter_id,
      'invitation_accepted',
      'Partner Connected!',
      'Your partner has accepted your invitation. You are now connected!',
      'couple',
      partner_id_result
    );
  EXCEPTION WHEN OTHERS THEN
    -- Notification function might not exist yet, ignore error
    NULL;
  END;
  
  -- Return the partner ID
  SELECT get_partner_id(current_user_id_param) INTO partner_id_result;
  RETURN partner_id_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION generate_invitation_code() TO authenticated;
GRANT EXECUTE ON FUNCTION accept_partner_invitation(UUID, UUID) TO authenticated;

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_partner_invitations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_partner_invitations_updated_at ON public.partner_invitations;
CREATE TRIGGER trigger_update_partner_invitations_updated_at
  BEFORE UPDATE ON public.partner_invitations
  FOR EACH ROW
  EXECUTE FUNCTION update_partner_invitations_updated_at();

