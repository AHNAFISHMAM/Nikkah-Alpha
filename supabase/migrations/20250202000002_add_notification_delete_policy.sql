-- =============================================
-- Add DELETE Policy for Notifications
-- =============================================
-- Allows users to delete their own notifications
-- Enables notification management and cleanup

-- Drop policy if it exists (for idempotency)
DROP POLICY IF EXISTS "users: delete own notifications" ON public.notifications;

-- Add DELETE policy for notifications
CREATE POLICY "users: delete own notifications"
  ON public.notifications FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Grant DELETE permission (if not already granted)
GRANT DELETE ON public.notifications TO authenticated;

-- Add comment for documentation
COMMENT ON POLICY "users: delete own notifications" ON public.notifications IS 
  'Allows authenticated users to delete their own notifications';

