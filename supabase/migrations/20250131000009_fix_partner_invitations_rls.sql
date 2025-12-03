-- =============================================
-- Fix Partner Invitations RLS Policy
-- =============================================
-- Replace auth.users query with profiles table query
-- Authenticated users cannot directly query auth.users

-- Drop and recreate the SELECT policy to use profiles table
DROP POLICY IF EXISTS "users: select own invitations" ON public.partner_invitations;

CREATE POLICY "users: select own invitations"
  ON public.partner_invitations FOR SELECT
  TO authenticated
  USING (
    inviter_id = auth.uid()
    OR invitee_email = (SELECT email FROM public.profiles WHERE id = auth.uid())
  );

