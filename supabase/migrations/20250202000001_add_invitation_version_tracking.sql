-- =============================================
-- Add Version Tracking for Partner Invitations
-- =============================================
-- Enables conflict detection by tracking version numbers
-- Prevents race conditions and duplicate processing

-- Add version column if it doesn't exist
ALTER TABLE public.partner_invitations 
ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1;

-- Create index on version for faster conflict checks
CREATE INDEX IF NOT EXISTS idx_partner_invitations_version 
ON public.partner_invitations(version) 
WHERE status = 'pending';

-- Function to increment version on update
CREATE OR REPLACE FUNCTION increment_invitation_version()
RETURNS TRIGGER AS $$
BEGIN
  -- Only increment if status or other important fields changed
  IF (OLD.status IS DISTINCT FROM NEW.status) OR
     (OLD.invitee_email IS DISTINCT FROM NEW.invitee_email) OR
     (OLD.invitation_code IS DISTINCT FROM NEW.invitation_code) OR
     (OLD.expires_at IS DISTINCT FROM NEW.expires_at) THEN
    NEW.version = OLD.version + 1;
  END IF;
  
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS invitation_version_trigger ON public.partner_invitations;

CREATE TRIGGER invitation_version_trigger
BEFORE UPDATE ON public.partner_invitations
FOR EACH ROW
EXECUTE FUNCTION increment_invitation_version();

-- Add comment for documentation
COMMENT ON COLUMN public.partner_invitations.version IS 'Version number for conflict detection. Increments on status or key field changes.';

-- Update existing records to have version 1
UPDATE public.partner_invitations 
SET version = 1 
WHERE version IS NULL;

