-- Theme Settings Migration - All authenticated users can manage
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard)

-- 1. Add role column to profiles (if it doesn't exist)
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
  END IF;
END $$;

-- 2. Create app_settings table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.app_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  updated_at timestamptz DEFAULT now()
);

-- 3. Enable RLS on app_settings
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- 4. Drop existing policies if they exist, then create new ones
DROP POLICY IF EXISTS "Anyone can read app settings" ON public.app_settings;
CREATE POLICY "Anyone can read app settings" ON public.app_settings
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can update app settings" ON public.app_settings;
CREATE POLICY "Authenticated users can update app settings" ON public.app_settings
  FOR ALL USING (auth.uid() IS NOT NULL);

-- 5. Seed default theme (only if it doesn't exist)
INSERT INTO public.app_settings (key, value)
VALUES ('theme', '{"themeKey": "classic"}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- Note: All authenticated users can now manage app settings
