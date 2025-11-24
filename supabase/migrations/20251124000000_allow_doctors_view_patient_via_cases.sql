-- Allow doctors to view patient profiles through medical cases
-- This enables doctors to see patient names in the cases list

CREATE POLICY "Doctors can view patients through cases" ON user_profiles
  FOR SELECT USING (
    role = 'patient' AND
    EXISTS (
      SELECT 1 FROM medical_cases
      WHERE medical_cases.patient_id = user_profiles.id 
      AND (
        medical_cases.status = 'pending' 
        OR medical_cases.doctor_id = auth.uid()
      )
    )
  );

COMMENT ON POLICY "Doctors can view patients through cases" ON user_profiles IS 
  'Allows doctors to view patient profile data (name, age) for pending cases and their assigned cases';
