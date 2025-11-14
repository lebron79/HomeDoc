-- Insert a verified admin user
-- NOTE: You'll need to create this user in Supabase Auth first, then update this migration with the actual UUID

-- This is a template migration. Follow these steps:
-- 1. Go to your Supabase Dashboard > Authentication > Users
-- 2. Click "Add user" or "Invite user"
-- 3. Create a user with:
--    Email: admin@homedoc.com (or your preferred admin email)
--    Password: (set a strong password)
--    Auto Confirm User: YES (check this box)
-- 4. After creating the user, copy their UUID from the dashboard
-- 5. Run this migration or manually insert the profile

-- Example: If your admin user UUID is 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
-- Uncomment and update the UUID below:

/*
INSERT INTO user_profiles (
  id,
  email,
  full_name,
  role,
  is_active
) VALUES (
  'YOUR-ADMIN-USER-UUID-HERE'::uuid,
  'admin@homedoc.com',
  'System Administrator',
  'admin',
  true
)
ON CONFLICT (id) DO UPDATE SET
  role = 'admin',
  is_active = true;
*/

-- Alternative: Update an existing user to admin role
-- If you already have a user account and want to make it admin:
-- UPDATE user_profiles 
-- SET role = 'admin', is_active = true 
-- WHERE email = 'your-email@example.com';

-- Note: After running this, you can log in with the admin credentials
-- and access the admin dashboard at /admin
