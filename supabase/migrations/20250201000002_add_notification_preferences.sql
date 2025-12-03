-- Add notification preferences column to profiles table
-- Stores user preferences for toast notifications with granular category control

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{
  "toasts_enabled": true,
  "categories": {
    "success": true,
    "error": true,
    "reminders": true,
    "milestones": true,
    "auto_save": false,
    "network": true,
    "export": true,
    "copy": false
  }
}'::jsonb;

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.notification_preferences IS 'User notification preferences including toast settings. Controls which types of toast notifications are displayed.';

-- Create index for faster queries (optional, but helpful for filtering)
CREATE INDEX IF NOT EXISTS idx_profiles_notification_preferences 
ON public.profiles USING gin (notification_preferences);

