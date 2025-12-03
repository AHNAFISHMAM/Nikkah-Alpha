-- =====================================================
-- ADMIN ROLE-BASED ACCESS CONTROL (RBAC) MIGRATION
-- Implements secure role-based access following best practices:
-- 1. Principle of Least Privilege
-- 2. Server-side authorization checks
-- 3. Clear role hierarchies
-- 4. Separation of duties
-- =====================================================

BEGIN;

-- =====================================================
-- 1. ENSURE ROLE COLUMN EXISTS
-- =====================================================
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'role'
  ) THEN
    ALTER TABLE public.profiles
    ADD COLUMN role text DEFAULT 'user' CHECK (role IN ('user', 'admin'));
    
    -- Add comment for documentation
    COMMENT ON COLUMN public.profiles.role IS 'User role: user (default) or admin (full access)';
  END IF;
END $$;

-- =====================================================
-- 2. SET ADMIN USER
-- =====================================================
-- Set kinderahnaf@gmail.com as admin
-- This uses a secure approach: find user by email and update role
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'kinderahnaf@gmail.com'
AND role IS DISTINCT FROM 'admin';

-- Log the update (for verification)
DO $$
DECLARE
  updated_count INTEGER;
BEGIN
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  IF updated_count > 0 THEN
    RAISE NOTICE 'Admin role assigned to kinderahnaf@gmail.com';
  ELSE
    RAISE NOTICE 'User kinderahnaf@gmail.com not found or already admin';
  END IF;
END $$;

-- =====================================================
-- 3. CREATE HELPER FUNCTION FOR ADMIN CHECK
-- =====================================================
-- This function checks if the current user is an admin
-- Used in RLS policies for secure server-side checks
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  );
$$;

-- Add comment
COMMENT ON FUNCTION public.is_admin() IS 'Returns true if current authenticated user has admin role';

-- =====================================================
-- 4. UPDATE RLS POLICIES FOR ADMIN-ONLY OPERATIONS
-- =====================================================

-- APP SETTINGS: Admins can manage, everyone can read
DROP POLICY IF EXISTS "Admins can manage app settings" ON public.app_settings;
CREATE POLICY "Admins can manage app settings"
  ON public.app_settings
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- CHECKLIST CATEGORIES: Admins can manage, everyone can read
-- Drop existing policies first
DROP POLICY IF EXISTS "Anyone can view checklist categories" ON public.checklist_categories;
DROP POLICY IF EXISTS "Admins can insert checklist categories" ON public.checklist_categories;
DROP POLICY IF EXISTS "Admins can update checklist categories" ON public.checklist_categories;
DROP POLICY IF EXISTS "Admins can delete checklist categories" ON public.checklist_categories;

-- Read: everyone authenticated
CREATE POLICY "Anyone can view checklist categories"
  ON public.checklist_categories
  FOR SELECT
  TO authenticated
  USING (true);

-- Write: admins only
CREATE POLICY "Admins can insert checklist categories"
  ON public.checklist_categories
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update checklist categories"
  ON public.checklist_categories
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete checklist categories"
  ON public.checklist_categories
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- CHECKLIST ITEMS: Admins can manage, everyone can read
DROP POLICY IF EXISTS "Anyone can view checklist items" ON public.checklist_items;
DROP POLICY IF EXISTS "Admins can insert checklist items" ON public.checklist_items;
DROP POLICY IF EXISTS "Admins can update checklist items" ON public.checklist_items;
DROP POLICY IF EXISTS "Admins can delete checklist items" ON public.checklist_items;

-- Read: everyone authenticated
CREATE POLICY "Anyone can view checklist items"
  ON public.checklist_items
  FOR SELECT
  TO authenticated
  USING (true);

-- Write: admins only
CREATE POLICY "Admins can insert checklist items"
  ON public.checklist_items
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update checklist items"
  ON public.checklist_items
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete checklist items"
  ON public.checklist_items
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- MODULES: Admins can manage, everyone can read
DROP POLICY IF EXISTS "Anyone can view modules" ON public.modules;
DROP POLICY IF EXISTS "Admins can insert modules" ON public.modules;
DROP POLICY IF EXISTS "Admins can update modules" ON public.modules;
DROP POLICY IF EXISTS "Admins can delete modules" ON public.modules;

-- Read: everyone authenticated
CREATE POLICY "Anyone can view modules"
  ON public.modules
  FOR SELECT
  TO authenticated
  USING (true);

-- Write: admins only
CREATE POLICY "Admins can insert modules"
  ON public.modules
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update modules"
  ON public.modules
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete modules"
  ON public.modules
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- LESSONS: Admins can manage, everyone can read
DROP POLICY IF EXISTS "Anyone can view lessons" ON public.lessons;
DROP POLICY IF EXISTS "Admins can insert lessons" ON public.lessons;
DROP POLICY IF EXISTS "Admins can update lessons" ON public.lessons;
DROP POLICY IF EXISTS "Admins can delete lessons" ON public.lessons;

-- Read: everyone authenticated
CREATE POLICY "Anyone can view lessons"
  ON public.lessons
  FOR SELECT
  TO authenticated
  USING (true);

-- Write: admins only
CREATE POLICY "Admins can insert lessons"
  ON public.lessons
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update lessons"
  ON public.lessons
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete lessons"
  ON public.lessons
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- DISCUSSION PROMPTS: Admins can manage, everyone can read
DROP POLICY IF EXISTS "Anyone can view discussion prompts" ON public.discussion_prompts;
DROP POLICY IF EXISTS "Admins can insert discussion prompts" ON public.discussion_prompts;
DROP POLICY IF EXISTS "Admins can update discussion prompts" ON public.discussion_prompts;
DROP POLICY IF EXISTS "Admins can delete discussion prompts" ON public.discussion_prompts;

-- Read: everyone authenticated
CREATE POLICY "Anyone can view discussion prompts"
  ON public.discussion_prompts
  FOR SELECT
  TO authenticated
  USING (true);

-- Write: admins only
CREATE POLICY "Admins can insert discussion prompts"
  ON public.discussion_prompts
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update discussion prompts"
  ON public.discussion_prompts
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete discussion prompts"
  ON public.discussion_prompts
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- RESOURCES: Admins can manage, everyone can read
DROP POLICY IF EXISTS "Anyone can view resources" ON public.resources;
DROP POLICY IF EXISTS "Admins can insert resources" ON public.resources;
DROP POLICY IF EXISTS "Admins can update resources" ON public.resources;
DROP POLICY IF EXISTS "Admins can delete resources" ON public.resources;

-- Read: everyone authenticated
CREATE POLICY "Anyone can view resources"
  ON public.resources
  FOR SELECT
  TO authenticated
  USING (true);

-- Write: admins only
CREATE POLICY "Admins can insert resources"
  ON public.resources
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update resources"
  ON public.resources
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete resources"
  ON public.resources
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- =====================================================
-- 5. SECURITY: PREVENT ROLE ELEVATION
-- =====================================================
-- Users cannot change their own role (prevent privilege escalation)
-- Only admins can change roles (via service role or admin operations)
CREATE OR REPLACE FUNCTION public.prevent_role_self_elevation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- If role is being changed
  IF OLD.role IS DISTINCT FROM NEW.role THEN
    -- Check if current user is trying to change their own role
    IF NEW.id = auth.uid() THEN
      RAISE EXCEPTION 'Users cannot change their own role. Contact an administrator.';
    END IF;
    
    -- Only allow admins to change roles
    IF NOT public.is_admin() THEN
      RAISE EXCEPTION 'Only administrators can change user roles.';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to enforce role change restrictions
DROP TRIGGER IF EXISTS prevent_role_self_elevation_trigger ON public.profiles;
CREATE TRIGGER prevent_role_self_elevation_trigger
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_role_self_elevation();

COMMENT ON FUNCTION public.prevent_role_self_elevation() IS 'Prevents users from elevating their own role or changing roles without admin privileges';

COMMIT;

-- =====================================================
-- VERIFICATION QUERIES (Run these to verify setup)
-- =====================================================
-- Check if admin user exists:
-- SELECT id, email, role FROM profiles WHERE email = 'kinderahnaf@gmail.com';
--
-- Check admin function:
-- SELECT public.is_admin();
--
-- List all admins:
-- SELECT id, email, role FROM profiles WHERE role = 'admin';

