-- Fix infinite recursion in user_profiles RLS policies
-- This migration fixes the conflicting policies that cause infinite recursion

-- First, drop the conflicting admin policies we just created
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON user_profiles;

-- Recreate the admin policies with proper checks that don't cause recursion
-- These policies check auth.uid() directly without querying user_profiles again

-- Allow admins to view all profiles (check role from auth.jwt())
CREATE POLICY "Admins can view all profiles" ON user_profiles
  FOR SELECT USING (
    -- Users can see their own profile OR user is an admin
    auth.uid() = id 
    OR 
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

-- Allow admins to update all profiles
CREATE POLICY "Admins can update all profiles" ON user_profiles
  FOR UPDATE USING (
    -- Users can update their own profile OR user is an admin  
    auth.uid() = id 
    OR 
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

-- Allow admins to delete profiles
CREATE POLICY "Admins can delete profiles" ON user_profiles
  FOR DELETE USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

-- Alternative approach: Create a helper function that caches the role check
CREATE OR REPLACE FUNCTION auth.user_role()
RETURNS TEXT
LANGUAGE SQL
STABLE
AS $$
  SELECT COALESCE(
    (auth.jwt() -> 'user_metadata' ->> 'role'),
    (SELECT role FROM public.user_profiles WHERE id = auth.uid() LIMIT 1),
    'patient'
  )::TEXT;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION auth.user_role TO authenticated;

-- Now recreate policies using the helper function (alternative approach)
-- Comment out if using the jwt approach above
/*
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON user_profiles;

CREATE POLICY "Admins can view all profiles" ON user_profiles
  FOR SELECT USING (
    auth.uid() = id OR auth.user_role() = 'admin'
  );

CREATE POLICY "Admins can update all profiles" ON user_profiles
  FOR UPDATE USING (
    auth.uid() = id OR auth.user_role() = 'admin'
  );

CREATE POLICY "Admins can delete profiles" ON user_profiles
  FOR DELETE USING (
    auth.user_role() = 'admin'
  );
*/
