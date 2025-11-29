-- RUN THIS IN SUPABASE SQL EDITOR TO DEBUG THE ISSUE

-- First, let's see all policies on conversations table
SELECT 
  policyname, 
  cmd,
  with_check::text
FROM pg_policies 
WHERE tablename = 'conversations';

-- Check the current user's ID and role
SELECT 
  auth.uid() as current_user_id,
  role
FROM user_profiles
WHERE id = auth.uid();

-- Test what happens when we try to insert
-- Replace these IDs with actual values from the error log:
-- doctor_id should be the logged-in doctor's ID
-- patient_id should be: 1d18a25b-ca30-44d8-b3c7-47ad918f131c

SELECT 
  auth.uid() as my_id,
  '1d18a25b-ca30-44d8-b3c7-47ad918f131c'::uuid as patient_id,
  auth.uid() = '1d18a25b-ca30-44d8-b3c7-47ad918f131c'::uuid as "am_i_patient",
  EXISTS (SELECT 1 FROM user_profiles WHERE id = '1d18a25b-ca30-44d8-b3c7-47ad918f131c' AND role = 'patient') as "patient_exists",
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'doctor') as "am_i_doctor";
