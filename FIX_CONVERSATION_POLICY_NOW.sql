-- EMERGENCY FIX - RUN THIS IN SUPABASE SQL EDITOR
-- This completely recreates the conversations INSERT policy

-- Drop ALL insert policies on conversations
DROP POLICY IF EXISTS "Patients can create conversations with doctors" ON conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON conversations;

-- Create a simple policy that allows both doctors and patients to create conversations
CREATE POLICY "Allow conversation creation" ON conversations
  FOR INSERT 
  WITH CHECK (
    -- The user must be either the patient or the doctor in the conversation
    (auth.uid() = patient_id OR auth.uid() = doctor_id)
    AND
    -- Ensure both users exist and have the right roles
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = patient_id 
      AND role = 'patient'
    )
    AND
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = doctor_id 
      AND role = 'doctor'
    )
  );
