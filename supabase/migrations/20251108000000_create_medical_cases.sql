-- Create medical_cases table
CREATE TABLE IF NOT EXISTS medical_cases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  case_reason TEXT NOT NULL,
  emergency_level TEXT NOT NULL CHECK (emergency_level IN ('low', 'medium', 'high', 'critical')),
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'in_progress', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_medical_cases_patient_id ON medical_cases(patient_id);
CREATE INDEX idx_medical_cases_doctor_id ON medical_cases(doctor_id);
CREATE INDEX idx_medical_cases_status ON medical_cases(status);
CREATE INDEX idx_medical_cases_emergency_level ON medical_cases(emergency_level);
CREATE INDEX idx_medical_cases_created_at ON medical_cases(created_at DESC);

-- Enable RLS
ALTER TABLE medical_cases ENABLE ROW LEVEL SECURITY;

-- Policies for medical_cases
-- Patients can view their own cases
CREATE POLICY "Patients can view their own cases"
  ON medical_cases
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM user_profiles WHERE id = patient_id
    )
  );

-- Patients can create their own cases
CREATE POLICY "Patients can create cases"
  ON medical_cases
  FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM user_profiles WHERE id = patient_id AND role = 'patient'
    )
  );

-- Patients can update their own pending cases
CREATE POLICY "Patients can update their pending cases"
  ON medical_cases
  FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT id FROM user_profiles WHERE id = patient_id
    ) AND status = 'pending'
  );

-- Doctors can view all pending cases and their assigned cases
CREATE POLICY "Doctors can view cases"
  ON medical_cases
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM user_profiles WHERE role = 'doctor'
    )
  );

-- Doctors can update cases assigned to them or accept pending cases
CREATE POLICY "Doctors can update cases"
  ON medical_cases
  FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT id FROM user_profiles WHERE role = 'doctor'
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_medical_cases_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_medical_cases_updated_at
  BEFORE UPDATE ON medical_cases
  FOR EACH ROW
  EXECUTE FUNCTION update_medical_cases_updated_at();

-- Function to set accepted_at when status changes to accepted
CREATE OR REPLACE FUNCTION set_medical_case_accepted_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'accepted' AND OLD.status = 'pending' THEN
    NEW.accepted_at = NOW();
  END IF;
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    NEW.completed_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to set accepted_at
CREATE TRIGGER set_medical_case_accepted_at
  BEFORE UPDATE ON medical_cases
  FOR EACH ROW
  EXECUTE FUNCTION set_medical_case_accepted_at();

-- Update messages table to link to cases
ALTER TABLE messages ADD COLUMN IF NOT EXISTS case_id UUID REFERENCES medical_cases(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_messages_case_id ON messages(case_id);

COMMENT ON TABLE medical_cases IS 'Medical cases created by patients to contact doctors';
COMMENT ON COLUMN medical_cases.emergency_level IS 'Emergency level: low, medium, high, critical';
COMMENT ON COLUMN medical_cases.status IS 'Case status: pending, accepted, in_progress, completed, cancelled';
