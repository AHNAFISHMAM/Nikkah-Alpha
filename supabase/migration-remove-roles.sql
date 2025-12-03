-- =====================================================
-- MIGRATION: Remove role column from profiles table
-- This migration removes admin/user role distinction
-- Run this if you already have an existing database
-- =====================================================

BEGIN;

-- First, drop all policies that depend on the role column
DROP POLICY IF EXISTS "Admins can update app settings" ON app_settings;
DROP POLICY IF EXISTS "Admin full access to resources" ON resources;
DROP POLICY IF EXISTS "Admin full access to modules" ON modules;
DROP POLICY IF EXISTS "Admin full access to lessons" ON lessons;
DROP POLICY IF EXISTS "Admin full access to discussion prompts" ON discussion_prompts;
DROP POLICY IF EXISTS "Admin full access to checklist categories" ON checklist_categories;
DROP POLICY IF EXISTS "Admin full access to checklist items" ON checklist_items;

-- Drop any other admin-related policies that might exist
DROP POLICY IF EXISTS "Admins can insert app settings" ON app_settings;
DROP POLICY IF EXISTS "Admins can delete app settings" ON app_settings;
DROP POLICY IF EXISTS "Only admins can manage settings" ON app_settings;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Now drop the role column from profiles table
ALTER TABLE profiles DROP COLUMN IF EXISTS role CASCADE;

-- Recreate basic policies without role checks (all authenticated users have access)

-- Profiles: Users can view and update their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- App Settings: All authenticated users can view settings
CREATE POLICY "Authenticated users can view settings"
  ON app_settings FOR SELECT
  TO authenticated
  USING (true);

-- Resources: All authenticated users can view resources
CREATE POLICY "Authenticated users can view resources"
  ON resources FOR SELECT
  TO authenticated
  USING (true);

-- Modules: All authenticated users can view modules
CREATE POLICY "Authenticated users can view modules"
  ON modules FOR SELECT
  TO authenticated
  USING (true);

-- Lessons: All authenticated users can view lessons
CREATE POLICY "Authenticated users can view lessons"
  ON lessons FOR SELECT
  TO authenticated
  USING (true);

-- Discussion Prompts: All authenticated users can view discussion prompts
CREATE POLICY "Authenticated users can view discussion prompts"
  ON discussion_prompts FOR SELECT
  TO authenticated
  USING (true);

-- Checklist Categories: All authenticated users can view categories
CREATE POLICY "Authenticated users can view checklist categories"
  ON checklist_categories FOR SELECT
  TO authenticated
  USING (true);

-- Checklist Items: All authenticated users can view items
CREATE POLICY "Authenticated users can view checklist items"
  ON checklist_items FOR SELECT
  TO authenticated
  USING (true);

COMMIT;

-- =====================================================
-- NOTE: After running this migration:
-- - All users will have equal access to view content
-- - No admin privileges exist
-- - The app treats all authenticated users the same
-- - Users can still only modify their own data
-- =====================================================
