-- Add additional doctor fields to user_profiles
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS license_number TEXT,
ADD COLUMN IF NOT EXISTS years_of_experience INTEGER,
ADD COLUMN IF NOT EXISTS education TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS consultation_fee DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS available_days TEXT[], -- Array of days: ['Monday', 'Tuesday', etc.]
ADD COLUMN IF NOT EXISTS available_hours TEXT; -- e.g., "9:00 AM - 5:00 PM"

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (
    id,
    email,
    full_name,
    role,
    specialization,
    age,
    phone,
    gender,
    address,
    license_number,
    years_of_experience,
    education,
    bio,
    consultation_fee,
    available_days,
    available_hours
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'patient'),
    NEW.raw_user_meta_data->>'specialization',
    (NEW.raw_user_meta_data->>'age')::INTEGER,
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'gender',
    NEW.raw_user_meta_data->>'address',
    NEW.raw_user_meta_data->>'license_number',
    (NEW.raw_user_meta_data->>'years_of_experience')::INTEGER,
    NEW.raw_user_meta_data->>'education',
    NEW.raw_user_meta_data->>'bio',
    (NEW.raw_user_meta_data->>'consultation_fee')::DECIMAL,
    CASE 
      WHEN NEW.raw_user_meta_data->>'available_days' IS NOT NULL 
      THEN ARRAY(SELECT jsonb_array_elements_text((NEW.raw_user_meta_data->>'available_days')::jsonb))
      ELSE NULL 
    END,
    NEW.raw_user_meta_data->>'available_hours'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Drop ALL existing SELECT policies to start fresh
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Patients can view doctor profiles" ON user_profiles;
DROP POLICY IF EXISTS "Doctors can view patient profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Anyone can view doctor profiles" ON user_profiles;
DROP POLICY IF EXISTS "Doctors can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "View doctor profiles" ON user_profiles;

-- Simple, non-recursive policy: Users can view their own profile
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

-- Simple, non-recursive policy: Anyone authenticated can view doctor profiles
-- (Doctors are public information for patients to find them)
CREATE POLICY "View doctor profiles" ON user_profiles
  FOR SELECT USING (role = 'doctor' AND auth.uid() IS NOT NULL);

-- Allow doctors to view patient profiles if they have a conversation together
CREATE POLICY "Doctors can view their patients" ON user_profiles
  FOR SELECT USING (
    role = 'patient' AND
    EXISTS (
      SELECT 1 FROM conversations
      WHERE (patient_id = user_profiles.id AND doctor_id = auth.uid())
    )
  );

-- Allow patients to view their doctors' profiles through conversations
CREATE POLICY "Patients can view their doctors" ON user_profiles
  FOR SELECT USING (
    role = 'doctor' AND
    EXISTS (
      SELECT 1 FROM conversations
      WHERE (doctor_id = user_profiles.id AND patient_id = auth.uid())
    )
  );
