-- Allow doctors to create conversations with patients
-- This fixes the 403 error when doctors try to start conversations with patients

-- Drop the old restrictive policy
DROP POLICY IF EXISTS "Patients can create conversations with doctors" ON conversations;

-- Create new policy that allows both patients and doctors to create conversations
CREATE POLICY "Users can create conversations" ON conversations
  FOR INSERT WITH CHECK (
    (
      -- Patients can create conversations with doctors
      auth.uid() = patient_id AND 
      EXISTS (SELECT 1 FROM user_profiles WHERE id = doctor_id AND role = 'doctor')
    ) OR (
      -- Doctors can create conversations with patients
      auth.uid() = doctor_id AND 
      EXISTS (SELECT 1 FROM user_profiles WHERE id = patient_id AND role = 'patient')
    )
  );
