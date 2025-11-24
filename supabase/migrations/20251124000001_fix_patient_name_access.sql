-- First, drop the problematic policy
DROP POLICY IF EXISTS "Doctors can view patients through cases" ON user_profiles;

-- Create a function to get patient info for doctors (bypasses RLS)
CREATE OR REPLACE FUNCTION get_patient_info_for_case(case_patient_id UUID)
RETURNS TABLE (full_name TEXT, age INTEGER) 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT up.full_name, up.age
  FROM user_profiles up
  WHERE up.id = case_patient_id
  AND up.role = 'patient';
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_patient_info_for_case(UUID) TO authenticated;

COMMENT ON FUNCTION get_patient_info_for_case IS 'Allows doctors to retrieve patient name and age for their cases without RLS conflicts';
