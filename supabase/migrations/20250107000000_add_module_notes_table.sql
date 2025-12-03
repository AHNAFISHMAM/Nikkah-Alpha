-- =============================================
-- Module Notes Table Migration
-- =============================================
-- This migration creates the module_notes table
-- to store user notes and completion status per module.
-- 
-- Used by: ModuleDetail.tsx
-- =============================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 1. MODULE NOTES TABLE
-- =============================================
-- Stores user notes and completion status for each module.
-- One record per user per module (unique constraint).

CREATE TABLE IF NOT EXISTS public.module_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  module_id TEXT NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  notes TEXT,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, module_id)
);

-- =============================================
-- 2. PERFORMANCE INDEXES
-- =============================================

-- User lookup (for fetching all notes for a user)
CREATE INDEX IF NOT EXISTS idx_module_notes_user 
ON public.module_notes(user_id);

-- Module lookup (for fetching all notes for a module)
CREATE INDEX IF NOT EXISTS idx_module_notes_module 
ON public.module_notes(module_id);

-- User + Module lookup (for the main query pattern)
CREATE INDEX IF NOT EXISTS idx_module_notes_user_module 
ON public.module_notes(user_id, module_id);

-- Completion status (for progress calculations)
CREATE INDEX IF NOT EXISTS idx_module_notes_completed 
ON public.module_notes(user_id, is_completed) 
WHERE is_completed = true;

-- =============================================
-- 3. ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS
ALTER TABLE public.module_notes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own module notes" ON public.module_notes;
DROP POLICY IF EXISTS "Users can insert own module notes" ON public.module_notes;
DROP POLICY IF EXISTS "Users can update own module notes" ON public.module_notes;
DROP POLICY IF EXISTS "Users can delete own module notes" ON public.module_notes;

-- Users can only access their own notes
CREATE POLICY "Users can view own module notes"
  ON public.module_notes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own module notes"
  ON public.module_notes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own module notes"
  ON public.module_notes FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own module notes"
  ON public.module_notes FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================
-- 4. AUTOMATIC UPDATED_AT TRIGGER
-- =============================================

-- Use existing function if available, otherwise create it
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_module_notes_updated_at ON public.module_notes;

-- Create trigger for updated_at
CREATE TRIGGER update_module_notes_updated_at
  BEFORE UPDATE ON public.module_notes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- 5. COMPLETED_AT AUTO-SET TRIGGER
-- =============================================
-- Automatically sets completed_at timestamp when
-- is_completed changes from false to true.

-- Use existing function if available, otherwise create it
CREATE OR REPLACE FUNCTION public.set_module_notes_completed_at()
RETURNS TRIGGER AS $$
BEGIN
  -- Set completed_at when is_completed changes from false to true
  IF NEW.is_completed = true AND (OLD.is_completed = false OR OLD.is_completed IS NULL) THEN
    IF NEW.completed_at IS NULL THEN
      NEW.completed_at = NOW();
    END IF;
  END IF;
  -- Clear completed_at when is_completed becomes false
  IF NEW.is_completed = false THEN
    NEW.completed_at = NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS set_module_notes_completed_at_trigger ON public.module_notes;

-- Create trigger for module_notes
CREATE TRIGGER set_module_notes_completed_at_trigger
  BEFORE UPDATE ON public.module_notes
  FOR EACH ROW
  EXECUTE FUNCTION public.set_module_notes_completed_at();

-- Also handle INSERT case (when creating new notes as completed)
CREATE OR REPLACE FUNCTION public.set_module_notes_completed_at_insert()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_completed = true AND NEW.completed_at IS NULL THEN
    NEW.completed_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_module_notes_completed_at_insert_trigger ON public.module_notes;
CREATE TRIGGER set_module_notes_completed_at_insert_trigger
  BEFORE INSERT ON public.module_notes
  FOR EACH ROW
  EXECUTE FUNCTION public.set_module_notes_completed_at_insert();

-- =============================================
-- 6. GRANT PERMISSIONS
-- =============================================

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.module_notes TO authenticated;

-- =============================================
-- MIGRATION COMPLETE
-- =============================================
-- The module_notes table is now available for:
--   - Storing user notes per module
--   - Tracking module-level completion status
--   - Automatic timestamp management
--   - Secure RLS policies
-- =============================================

