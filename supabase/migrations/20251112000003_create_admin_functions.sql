-- Create secure admin functions to bypass RLS
-- These functions run with elevated privileges (SECURITY DEFINER)

-- Function to get all users (admin only)
CREATE OR REPLACE FUNCTION public.admin_get_all_users()
RETURNS TABLE (
  id UUID,
  email TEXT,
  full_name TEXT,
  role TEXT,
  specialization TEXT,
  age INTEGER,
  phone TEXT,
  gender TEXT,
  address TEXT,
  is_active BOOLEAN,
  suspended_at TIMESTAMP WITH TIME ZONE,
  suspended_by UUID,
  suspension_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if caller is admin
  IF NOT EXISTS (SELECT 1 FROM public.user_profiles WHERE user_profiles.id = auth.uid() AND user_profiles.role = 'admin') THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;
  
  -- Return all users
  RETURN QUERY
  SELECT 
    p.id, p.email, p.full_name, p.role, p.specialization,
    p.age, p.phone, p.gender, p.address, p.is_active,
    p.suspended_at, p.suspended_by, p.suspension_reason,
    p.created_at, p.updated_at
  FROM public.user_profiles p
  ORDER BY p.created_at DESC;
END;
$$;

-- Function to suspend a user (admin only)
CREATE OR REPLACE FUNCTION public.admin_suspend_user(
  p_user_id UUID,
  p_reason TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if caller is admin
  IF NOT EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role = 'admin') THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;
  
  -- Suspend the user
  UPDATE public.user_profiles
  SET 
    is_active = false,
    suspended_at = NOW(),
    suspended_by = auth.uid(),
    suspension_reason = p_reason
  WHERE id = p_user_id;
  
  -- Log the activity
  PERFORM log_admin_activity('user_suspended', p_user_id, jsonb_build_object('reason', p_reason));
END;
$$;

-- Function to activate a user (admin only)
CREATE OR REPLACE FUNCTION public.admin_activate_user(
  p_user_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if caller is admin
  IF NOT EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role = 'admin') THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;
  
  -- Activate the user
  UPDATE public.user_profiles
  SET 
    is_active = true,
    suspended_at = NULL,
    suspended_by = NULL,
    suspension_reason = NULL
  WHERE id = p_user_id;
  
  -- Log the activity
  PERFORM log_admin_activity('user_activated', p_user_id, '{}'::jsonb);
END;
$$;

-- Function to delete a user (admin only)
CREATE OR REPLACE FUNCTION public.admin_delete_user(
  p_user_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_email TEXT;
  v_user_name TEXT;
BEGIN
  -- Check if caller is admin
  IF NOT EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role = 'admin') THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;
  
  -- Get user details for logging
  SELECT email, full_name INTO v_user_email, v_user_name
  FROM public.user_profiles
  WHERE id = p_user_id;
  
  -- Log the activity before deletion
  PERFORM log_admin_activity(
    'user_deleted', 
    p_user_id, 
    jsonb_build_object('email', v_user_email, 'full_name', v_user_name)
  );
  
  -- Delete the user
  DELETE FROM public.user_profiles WHERE id = p_user_id;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.admin_get_all_users TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_suspend_user TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_activate_user TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_delete_user TO authenticated;
