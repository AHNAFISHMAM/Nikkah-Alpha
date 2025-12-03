-- =============================================
-- Partner Disconnection Support
-- =============================================
-- Allows users to disconnect from partners
-- Uses soft delete to preserve history

-- Ensure couples table exists (create if it doesn't)
CREATE TABLE IF NOT EXISTS public.couples (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user2_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  relationship_status TEXT CHECK (relationship_status IN ('engaged', 'married', 'preparing')) DEFAULT 'preparing',
  connected_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Ensure unique pairing and no self-pairing
  CONSTRAINT different_users CHECK (user1_id != user2_id),
  CONSTRAINT unique_couple UNIQUE (user1_id, user2_id)
);

-- Add status field to couples table (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'couples' 
    AND column_name = 'status'
  ) THEN
    ALTER TABLE public.couples
    ADD COLUMN status TEXT CHECK (status IN ('active', 'disconnected', 'archived')) DEFAULT 'active';
  END IF;
END $$;

-- Add disconnected_at timestamp (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'couples' 
    AND column_name = 'disconnected_at'
  ) THEN
    ALTER TABLE public.couples
    ADD COLUMN disconnected_at TIMESTAMPTZ;
  END IF;
END $$;

-- Update existing couples to have 'active' status
UPDATE public.couples
SET status = 'active'
WHERE status IS NULL;

-- Function to disconnect partners
CREATE OR REPLACE FUNCTION disconnect_partner(
  p_user_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_couple_id UUID;
  v_partner_id UUID;
BEGIN
  -- Find the couple relationship
  SELECT id, 
         CASE WHEN user1_id = p_user_id THEN user2_id ELSE user1_id END
  INTO v_couple_id, v_partner_id
  FROM public.couples
  WHERE (user1_id = p_user_id OR user2_id = p_user_id)
    AND status = 'active'
  LIMIT 1;

  IF v_couple_id IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Update status to disconnected
  UPDATE public.couples
  SET status = 'disconnected',
      disconnected_at = NOW(),
      updated_at = NOW()
  WHERE id = v_couple_id;

  -- Create audit log (if function exists)
  BEGIN
    PERFORM create_audit_log(
      p_user_id,
      'partner_disconnected',
      'couple',
      v_couple_id,
      jsonb_build_object('couple_id', v_couple_id, 'partner_id', v_partner_id)
    );
  EXCEPTION WHEN OTHERS THEN
    -- Audit log function might not exist yet, ignore error
    NULL;
  END;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION disconnect_partner(UUID) TO authenticated;

-- Update get_partner_id to only return active partners
CREATE OR REPLACE FUNCTION get_partner_id(current_user_id UUID)
RETURNS UUID AS $$
DECLARE
  partner_id UUID;
BEGIN
  -- Check if user is user1
  SELECT user2_id INTO partner_id
  FROM public.couples
  WHERE user1_id = current_user_id
    AND status = 'active'
  LIMIT 1;

  -- If not found, check if user is user2
  IF partner_id IS NULL THEN
    SELECT user1_id INTO partner_id
    FROM public.couples
    WHERE user2_id = current_user_id
      AND status = 'active'
    LIMIT 1;
  END IF;

  RETURN partner_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

