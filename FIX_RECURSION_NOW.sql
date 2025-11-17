-- IMMEDIATE FIX FOR INFINITE RECURSION
-- Run this in Supabase SQL Editor NOW to fix the error

-- Step 1: Drop the problematic admin policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON user_profiles;  
DROP POLICY IF EXISTS "Admins can delete profiles" ON user_profiles;

-- Step 2: Verify existing policies still work
-- List all policies to see what we have:
-- SELECT * FROM pg_policies WHERE tablename = 'user_profiles';

-- Step 3: The recursion was caused because the admin policies
-- were checking user_profiles table while executing a query on user_profiles
-- This creates an infinite loop

-- Solution: Don't add admin policies to user_profiles table
-- Instead, we'll handle admin permissions differently

-- For now, the original policies should work:
-- "Users can view their own profile"
-- "Users can update their own profile"  
-- "Users can insert their own profile"

-- To allow admins to manage users, we'll use service_role key in the admin dashboard
-- OR we can use a simpler approach with SECURITY DEFINER functions

-- Step 4: Create a safe admin check function
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

-- Note: For admin dashboard queries, we'll modify the code to use
-- service role key or handle permissions differently
