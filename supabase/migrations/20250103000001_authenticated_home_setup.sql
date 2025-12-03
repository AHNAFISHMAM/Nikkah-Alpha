-- =============================================
-- AuthenticatedHome Page Database Setup
-- =============================================
-- This migration ensures all database structures
-- required for the AuthenticatedHome page are in place.
--
-- Page: /home (AuthenticatedHome.tsx)
-- Dependencies:
--   - profiles table with first_name field
--   - RLS policies for profile access
--   - Indexes for performance
-- =============================================
-- Safe to run multiple times (idempotent)

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 1. PROFILES TABLE
-- =============================================
-- The AuthenticatedHome page displays a personalized
-- welcome message using the user's first_name from profiles.
-- This table structure matches the complete profile migration
-- to ensure consistency across the application.

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  first_name TEXT,
  last_name TEXT,
  date_of_birth DATE,
  age INTEGER,
  gender TEXT CHECK (gender IN ('male', 'female', 'prefer_not_to_say')),
  marital_status TEXT CHECK (marital_status IN ('Single', 'Engaged', 'Researching')),
  country TEXT,
  city TEXT,
  partner_name TEXT,
  partner_using_app BOOLEAN DEFAULT FALSE,
  partner_email TEXT,
  partner_status TEXT CHECK (partner_status IN ('searching', 'engaged', 'planning')),
  wedding_date DATE,
  avatar_url TEXT,
  profile_visibility TEXT DEFAULT 'public' CHECK (profile_visibility IN ('public', 'private')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 2. ADD MISSING COLUMNS (IF NOT EXISTS)
-- =============================================
-- Safely add all required columns if they don't exist

-- Add email if missing (REQUIRED field)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'email'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN email TEXT NOT NULL DEFAULT '';
    -- Update existing rows with user email from auth.users
    UPDATE public.profiles p
    SET email = COALESCE(
      (SELECT email FROM auth.users WHERE id = p.id),
      ''
    )
    WHERE email = '' OR email IS NULL;
  END IF;
END $$;

-- Add full_name if missing
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'full_name'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN full_name TEXT;
  END IF;
END $$;

-- Add avatar_url if missing
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'avatar_url'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN avatar_url TEXT;
  END IF;
END $$;

-- Add partner_status if missing
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'partner_status'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN partner_status TEXT;
    -- Add check constraint
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint 
      WHERE conname = 'profiles_partner_status_check'
    ) THEN
      ALTER TABLE public.profiles ADD CONSTRAINT profiles_partner_status_check 
        CHECK (partner_status IS NULL OR partner_status IN ('searching', 'engaged', 'planning'));
    END IF;
  END IF;
END $$;

-- Add first_name if missing
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'first_name'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN first_name TEXT;
  END IF;
END $$;

-- Add last_name if missing
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'last_name'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN last_name TEXT;
  END IF;
END $$;

-- Add partner_name if missing
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'partner_name'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN partner_name TEXT;
  END IF;
END $$;

-- Add wedding_date if missing
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'wedding_date'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN wedding_date DATE;
  END IF;
END $$;

-- Add date_of_birth if missing
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'date_of_birth'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN date_of_birth DATE;
  END IF;
END $$;

-- Add age if missing
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'age'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN age INTEGER;
  END IF;
END $$;

-- Add gender if missing
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'gender'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN gender TEXT;
    -- Add check constraint if it doesn't exist
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint 
      WHERE conname = 'profiles_gender_check'
    ) THEN
      ALTER TABLE public.profiles ADD CONSTRAINT profiles_gender_check 
        CHECK (gender IS NULL OR gender IN ('male', 'female', 'prefer_not_to_say'));
    END IF;
  END IF;
END $$;

-- Add marital_status if missing
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'marital_status'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN marital_status TEXT;
    -- Add check constraint if it doesn't exist
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint 
      WHERE conname = 'profiles_marital_status_check'
    ) THEN
      ALTER TABLE public.profiles ADD CONSTRAINT profiles_marital_status_check 
        CHECK (marital_status IS NULL OR marital_status IN ('Single', 'Engaged', 'Researching'));
    END IF;
  END IF;
END $$;

-- Add country if missing
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'country'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN country TEXT;
  END IF;
END $$;

-- Add city if missing
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'city'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN city TEXT;
  END IF;
END $$;

-- Add partner_using_app if missing
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'partner_using_app'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN partner_using_app BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- Add partner_email if missing
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'partner_email'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN partner_email TEXT;
  END IF;
END $$;

-- Add profile_visibility if missing
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'profile_visibility'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN profile_visibility TEXT DEFAULT 'public';
    -- Add check constraint if it doesn't exist
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint 
      WHERE conname = 'profiles_visibility_check'
    ) THEN
      ALTER TABLE public.profiles ADD CONSTRAINT profiles_visibility_check 
        CHECK (profile_visibility IS NULL OR profile_visibility IN ('public', 'private'));
    END IF;
  END IF;
END $$;

-- Add created_at if missing
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'created_at'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
END $$;

-- Add updated_at if missing
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
END $$;

-- =============================================
-- 3. ENSURE EMAIL IS NOT NULL (if table exists)
-- =============================================

-- Make email NOT NULL if it's currently nullable
DO $$ 
BEGIN
  -- Check if email column exists and is nullable
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'email'
    AND is_nullable = 'YES'
  ) THEN
    -- First, update any NULL emails
    UPDATE public.profiles p
    SET email = COALESCE(
      (SELECT email FROM auth.users WHERE id = p.id),
      ''
    )
    WHERE email IS NULL;
    
    -- Then make it NOT NULL
    ALTER TABLE public.profiles ALTER COLUMN email SET NOT NULL;
  END IF;
END $$;

-- =============================================
-- 4. INDEXES FOR PERFORMANCE
-- =============================================
-- Index on id (primary key) is automatically created
-- Additional indexes for common queries

-- Index for profile lookups by user id (used by useProfile hook)
CREATE INDEX IF NOT EXISTS idx_profiles_id 
ON public.profiles(id);

-- Index for wedding date queries (if used in future features)
CREATE INDEX IF NOT EXISTS idx_profiles_wedding_date 
ON public.profiles(wedding_date) 
WHERE wedding_date IS NOT NULL;

-- Index on partner_email (for partner linking)
CREATE INDEX IF NOT EXISTS idx_profiles_partner_email 
ON public.profiles(partner_email) 
WHERE partner_email IS NOT NULL;

-- Index on marital_status (for filtering)
CREATE INDEX IF NOT EXISTS idx_profiles_marital_status 
ON public.profiles(marital_status) 
WHERE marital_status IS NOT NULL;

-- Index on partner_status (for filtering)
CREATE INDEX IF NOT EXISTS idx_profiles_partner_status 
ON public.profiles(partner_status) 
WHERE partner_status IS NOT NULL;

-- Index on email (for lookups)
CREATE INDEX IF NOT EXISTS idx_profiles_email 
ON public.profiles(email);

-- =============================================
-- 5. ROW LEVEL SECURITY (RLS)
-- =============================================
-- Enable RLS on profiles table

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

-- Policy: Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policy: Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- =============================================
-- 6. AUTOMATIC UPDATED_AT TRIGGER
-- =============================================
-- Automatically update updated_at timestamp on profile changes

-- Create function to update updated_at (in public schema for consistency)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;

-- Create trigger
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- 7. AUTO-CREATE PROFILE ON USER SIGNUP
-- =============================================
-- Automatically create a profile record when a new user signs up
-- This ensures the AuthenticatedHome page always has profile data

-- Create function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, full_name, created_at, updated_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'first_name', NULL),
    COALESCE(NEW.raw_user_meta_data->>'last_name', NULL),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NULL),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING; -- Prevent errors if profile already exists
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists (using consistent naming)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created_create_profile ON auth.users;

-- Create trigger on auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- 8. GRANT PERMISSIONS
-- =============================================
-- Grant necessary permissions to authenticated users

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;

-- =============================================
-- 9. VERIFICATION QUERIES
-- =============================================
-- Uncomment to verify the setup:

-- Check if profiles table exists
-- SELECT EXISTS (
--   SELECT FROM information_schema.tables 
--   WHERE table_schema = 'public' 
--   AND table_name = 'profiles'
-- );

-- Check if first_name column exists
-- SELECT EXISTS (
--   SELECT FROM information_schema.columns 
--   WHERE table_schema = 'public' 
--   AND table_name = 'profiles' 
--   AND column_name = 'first_name'
-- );

-- Check RLS policies
-- SELECT * FROM pg_policies WHERE tablename = 'profiles';

-- =============================================
-- MIGRATION COMPLETE
-- =============================================
-- The AuthenticatedHome page now has all required database structures:
--
-- ✅ profiles table with first_name field (and all other profile fields)
-- ✅ RLS policies for secure access
-- ✅ Indexes for optimal performance
-- ✅ Auto-update trigger for updated_at
-- ✅ Auto-create profile on user signup
--
-- The page will display:
--   - "Welcome back, [first_name]!" if profile.first_name exists
--   - "Welcome back, there!" if profile.first_name is null
--
-- Next steps:
--   1. Run this migration in Supabase SQL Editor
--   2. Test the /home route with an authenticated user
--   3. Verify the welcome message displays correctly
-- =============================================

