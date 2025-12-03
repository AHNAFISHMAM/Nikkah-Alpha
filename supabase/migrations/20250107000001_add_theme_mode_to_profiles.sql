-- =============================================
-- Add Theme Mode Preference to Profiles
-- =============================================
-- This migration adds theme_mode field to profiles table
-- to store user's dark/light mode preference.
-- 
-- Best Practices:
-- - Syncs with database for authenticated users
-- - Falls back to localStorage for unauthenticated
-- - Respects system preferences as default
-- =============================================

-- Add theme_mode column to profiles table
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS theme_mode TEXT CHECK (theme_mode IN ('light', 'dark', 'system')) DEFAULT 'system';

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_profiles_theme_mode ON profiles(theme_mode);

-- Update existing profiles to use 'system' as default
UPDATE profiles
SET theme_mode = 'system'
WHERE theme_mode IS NULL;

-- =============================================
-- MIGRATION COMPLETE
-- =============================================
-- The theme_mode field is now available for:
--   - Storing user's preferred theme (light/dark/system)
--   - Syncing across devices for authenticated users
--   - Respecting system preferences when set to 'system'
-- =============================================

