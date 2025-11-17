-- ============================================
-- COMPLETE ADMIN SYSTEM MIGRATION
-- Copy and paste this entire file into Supabase SQL Editor and run it
-- ============================================

-- STEP 1: Create admin activities table
CREATE TABLE IF NOT EXISTS admin_activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  action_type TEXT NOT NULL,
  target_user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  action_details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- STEP 2: Add suspension fields to user_profiles
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS suspended_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS suspended_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS suspension_reason TEXT;

-- STEP 3: Enable RLS on admin_activities
ALTER TABLE admin_activities ENABLE ROW LEVEL SECURITY;

-- STEP 4: Remove problematic policies that cause infinite recursion
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON user_profiles;

-- STEP 5: Create policies for admin_activities (only admins can see)
DROP POLICY IF EXISTS "Admins can view all activities" ON admin_activities;
CREATE POLICY "Admins can view all activities" ON admin_activities
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can insert activities" ON admin_activities;
CREATE POLICY "Admins can insert activities" ON admin_activities
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- STEP 6: Create helper function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.user_profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_admin TO authenticated;

-- STEP 7: Create function to log admin activities
CREATE OR REPLACE FUNCTION log_admin_activity(
  p_action_type TEXT,
  p_target_user_id UUID,
  p_action_details JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID AS $$
DECLARE
  v_activity_id UUID;
BEGIN
  INSERT INTO admin_activities (admin_id, action_type, target_user_id, action_details)
  VALUES (auth.uid(), p_action_type, p_target_user_id, p_action_details)
  RETURNING id INTO v_activity_id;
  
  RETURN v_activity_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION log_admin_activity TO authenticated;

-- STEP 8: Create admin functions (SECURITY DEFINER to bypass RLS)

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

-- STEP 9: Grant execute permissions on all admin functions
GRANT EXECUTE ON FUNCTION public.admin_get_all_users TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_suspend_user TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_activate_user TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_delete_user TO authenticated;

-- STEP 10: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_admin_activities_admin_id ON admin_activities(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_activities_target_user_id ON admin_activities(target_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_activities_created_at ON admin_activities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_is_active ON user_profiles(is_active);
CREATE INDEX IF NOT EXISTS idx_user_profiles_created_at ON user_profiles(created_at DESC);

-- STEP 11: Create view for admin dashboard statistics
CREATE OR REPLACE VIEW admin_user_statistics AS
SELECT 
  (SELECT COUNT(*) FROM user_profiles WHERE role = 'patient' AND is_active = true) as active_patients,
  (SELECT COUNT(*) FROM user_profiles WHERE role = 'doctor' AND is_active = true) as active_doctors,
  (SELECT COUNT(*) FROM user_profiles WHERE is_active = false) as suspended_users,
  (SELECT COUNT(*) FROM user_profiles WHERE created_at > NOW() - INTERVAL '7 days') as new_users_this_week,
  (SELECT COUNT(*) FROM user_profiles WHERE created_at > NOW() - INTERVAL '30 days') as new_users_this_month;

GRANT SELECT ON admin_user_statistics TO authenticated;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check that problematic policies are gone
SELECT 'Checking for problematic policies...' as status;
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename = 'user_profiles' 
AND policyname LIKE '%Admin%';
-- Should return empty result set

-- Check that admin functions exist
SELECT 'Checking admin functions...' as status;
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name LIKE 'admin_%';
-- Should show: admin_get_all_users, admin_suspend_user, admin_activate_user, admin_delete_user

-- Check that admin_activities table exists
SELECT 'Checking admin_activities table...' as status;
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'admin_activities';

SELECT '✅ Admin system migration completed successfully!' as status;
