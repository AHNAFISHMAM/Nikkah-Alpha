-- =============================================
-- FIX PARTNER INVITATIONS TABLE
-- =============================================
-- This script drops and recreates the partner_invitations table
-- with the correct schema
-- =============================================

BEGIN;

-- Drop the old table (with CASCADE to remove dependencies)
DROP TABLE IF EXISTS public.partner_invitations CASCADE;

-- Recreate with correct schema
CREATE TABLE public.partner_invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_email TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'expired')),
  expires_at TIMESTAMPTZ NOT NULL,
  accepted_at TIMESTAMPTZ,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.partner_invitations ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX idx_partner_invitations_token ON public.partner_invitations(token);
CREATE INDEX idx_partner_invitations_sender ON public.partner_invitations(sender_id);
CREATE INDEX idx_partner_invitations_receiver_email ON public.partner_invitations(receiver_email);

-- Create RLS policies
CREATE POLICY "Users can view own invitations"
  ON public.partner_invitations FOR SELECT
  USING (
    auth.uid() = sender_id OR
    receiver_email = (SELECT email FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "Users can create invitations"
  ON public.partner_invitations FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update own invitations"
  ON public.partner_invitations FOR UPDATE
  USING (
    auth.uid() = sender_id OR
    receiver_email = (SELECT email FROM public.profiles WHERE id = auth.uid())
  );

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON public.partner_invitations TO authenticated;

COMMIT;

-- =============================================
-- VERIFICATION
-- =============================================
-- Check the table structure
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_schema = 'public'
-- AND table_name = 'partner_invitations'
-- ORDER BY ordinal_position;
-- =============================================
