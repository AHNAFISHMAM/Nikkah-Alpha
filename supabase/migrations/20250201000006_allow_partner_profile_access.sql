-- =============================================
-- Allow Partner Profile Access
-- =============================================
-- Adds RLS policy to allow users to view their partner's profile
-- This enables displaying partner email and other basic info

-- Drop existing policy if it exists (to avoid conflicts)
DROP POLICY IF EXISTS "users: select partner profile" ON public.profiles;

-- Create policy to allow users to view their partner's profile
-- Users can view profiles where they are connected as partners in the couples table
CREATE POLICY "users: select partner profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (
    -- Allow if viewing own profile (existing behavior)
    auth.uid() = id
    OR
    -- Allow if viewing partner's profile (new behavior)
    EXISTS (
      SELECT 1 FROM public.couples
      WHERE status = 'active'
        AND (
          (user1_id = auth.uid() AND user2_id = profiles.id)
          OR
          (user2_id = auth.uid() AND user1_id = profiles.id)
        )
    )
  );

-- Add comment for documentation
COMMENT ON POLICY "users: select partner profile" ON public.profiles IS 
  'Allows users to view their own profile and their active partner''s profile. Enables displaying partner email and basic information.';

