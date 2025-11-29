-- DEBUG: Check authentication and user setup

-- 1. What is my current auth ID and role?
SELECT 
  auth.uid() as my_auth_id,
  up.id as my_profile_id,
  up.full_name,
  up.role,
  up.email
FROM user_profiles up
WHERE up.id = auth.uid();

-- 2. If the above returns NULL or no rows, check if you have a profile at all
SELECT 
  id,
  full_name,
  email,
  role
FROM user_profiles
ORDER BY created_at DESC
LIMIT 10;

-- 3. Check if the patient exists and their role
SELECT 
  id,
  full_name,
  email,
  role
FROM user_profiles
WHERE id = '1d18a25b-ca30-44d8-b3c7-47ad918f131c';

-- 4. List all existing conversations to see the pattern
SELECT 
  c.id,
  c.patient_id,
  c.doctor_id,
  p.full_name as patient_name,
  d.full_name as doctor_name
FROM conversations c
LEFT JOIN user_profiles p ON c.patient_id = p.id
LEFT JOIN user_profiles d ON c.doctor_id = d.id
LIMIT 5;
