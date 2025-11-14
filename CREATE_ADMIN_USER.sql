-- Script to create a verified admin user in Supabase
-- Run this in Supabase SQL Editor after you've created the auth user

-- Step 1: First, create the auth user in Supabase Dashboard
-- Go to: Authentication > Users > Add User
-- Email: admin@homedoc.com (or your choice)
-- Password: (set a strong password)
-- Auto Confirm User: ✓ (check this)
-- Email Confirm: ✓ (check this)

-- Step 2: After creating the user, find their UUID in the Users list
-- Then run the commands below, replacing the UUID

-- Option A: If you know the admin user's UUID (recommended)
-- Replace 'PASTE-UUID-HERE' with the actual UUID from Supabase Dashboard
INSERT INTO user_profiles (
  id,
  email,
  full_name,
  role,
  is_active
) VALUES (
  'PASTE-UUID-HERE'::uuid,
  'admin@homedoc.com',
  'System Administrator',
  'admin',
  true
)
ON CONFLICT (id) DO UPDATE SET
  role = 'admin',
  is_active = true;

-- Option B: If you want to promote an existing user to admin by email
-- Uncomment and update the email below:
/*
UPDATE user_profiles 
SET 
  role = 'admin',
  is_active = true,
  full_name = COALESCE(full_name, 'System Administrator')
WHERE email = 'your-existing-email@example.com';
*/

-- Option C: Create admin directly through Auth API (most complete method)
-- You can also use this SQL function to help:
CREATE OR REPLACE FUNCTION create_admin_user(
  admin_email TEXT,
  admin_password TEXT,
  admin_full_name TEXT
)
RETURNS TEXT AS $$
DECLARE
  result TEXT;
BEGIN
  -- Note: This function is a template. Actual user creation must be done through Supabase Auth
  result := 'Please create the user through Supabase Dashboard first, then update their profile';
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verify admin user was created successfully:
-- SELECT id, email, full_name, role, is_active, created_at 
-- FROM user_profiles 
-- WHERE role = 'admin';
