-- Allow all authenticated users to view doctor profiles
CREATE POLICY "Anyone can view doctor profiles" ON user_profiles
  FOR SELECT 
  USING (role = 'doctor' AND auth.role() = 'authenticated');
