-- Create admin users management table for logging admin activities
CREATE TABLE IF NOT EXISTS admin_activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  action_type TEXT NOT NULL, -- 'user_created', 'user_updated', 'user_deleted', 'user_suspended', etc.
  target_user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  action_details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add is_active and suspended fields to user_profiles for admin management
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS suspended_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS suspended_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS suspension_reason TEXT;

-- Enable RLS on admin_activities
ALTER TABLE admin_activities ENABLE ROW LEVEL SECURITY;

-- Create policies for admin_activities (only admins can see)
CREATE POLICY "Admins can view all activities" ON admin_activities
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can insert activities" ON admin_activities
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Note: We DON'T create admin policies on user_profiles to avoid infinite recursion
-- Admin access will be handled through a separate service or SECURITY DEFINER functions

-- Create a helper function to safely check if user is admin
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

-- Create view for admin dashboard statistics
CREATE OR REPLACE VIEW admin_user_statistics AS
SELECT 
  (SELECT COUNT(*) FROM user_profiles WHERE role = 'patient' AND is_active = true) as active_patients,
  (SELECT COUNT(*) FROM user_profiles WHERE role = 'doctor' AND is_active = true) as active_doctors,
  (SELECT COUNT(*) FROM user_profiles WHERE is_active = false) as suspended_users,
  (SELECT COUNT(*) FROM user_profiles WHERE created_at > NOW() - INTERVAL '7 days') as new_users_this_week,
  (SELECT COUNT(*) FROM user_profiles WHERE created_at > NOW() - INTERVAL '30 days') as new_users_this_month;

-- Grant access to admin view
GRANT SELECT ON admin_user_statistics TO authenticated;

-- Create function to log admin activities
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_admin_activities_admin_id ON admin_activities(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_activities_target_user_id ON admin_activities(target_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_activities_created_at ON admin_activities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_is_active ON user_profiles(is_active);
CREATE INDEX IF NOT EXISTS idx_user_profiles_created_at ON user_profiles(created_at DESC);

-- Grant execute permission on the logging function
GRANT EXECUTE ON FUNCTION log_admin_activity TO authenticated;
