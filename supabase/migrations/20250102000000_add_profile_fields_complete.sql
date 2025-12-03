-- Add new profile fields for comprehensive profile setup
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS date_of_birth DATE,
  ADD COLUMN IF NOT EXISTS age INTEGER,
  ADD COLUMN IF NOT EXISTS gender TEXT CHECK (gender IN ('male', 'female', 'prefer_not_to_say')),
  ADD COLUMN IF NOT EXISTS marital_status TEXT CHECK (marital_status IN ('Single', 'Engaged', 'Researching')),
  ADD COLUMN IF NOT EXISTS country TEXT,
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS partner_using_app BOOLEAN,
  ADD COLUMN IF NOT EXISTS profile_visibility TEXT DEFAULT 'public' CHECK (profile_visibility IN ('public', 'private'));

-- Create index on country for faster queries
CREATE INDEX IF NOT EXISTS idx_profiles_country ON profiles(country);

-- Update existing profiles to have default visibility
UPDATE profiles
SET profile_visibility = 'public'
WHERE profile_visibility IS NULL;

