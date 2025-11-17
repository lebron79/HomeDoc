-- Update existing patient profiles to be doctors
-- This script updates the profiles that were auto-created when doctors signed up

-- Doctor 1: Cardiologist
UPDATE user_profiles 
SET 
  full_name = 'Dr. Sarah Johnson',
  role = 'doctor',
  specialization = 'Cardiology',
  years_of_experience = 15,
  education = 'MD, Harvard Medical School; Board Certified Cardiologist',
  bio = 'Experienced cardiologist with over 15 years specializing in heart disease prevention, diagnosis, and treatment. Expert in managing hypertension, heart failure, and cardiovascular risk assessment.',
  consultation_fee = 150,
  phone = '+1-555-0101'
WHERE id = '0ff18d87-ca9b-4d6a-b3ae-4293dfdd8977'::uuid;

-- Doctor 2: Pediatrician
UPDATE user_profiles 
SET 
  full_name = 'Dr. Michael Chen',
  role = 'doctor',
  specialization = 'Pediatrics',
  years_of_experience = 12,
  education = 'MD, Johns Hopkins University; Pediatric Board Certification',
  bio = 'Dedicated pediatrician providing comprehensive care for children from newborns to adolescents. Specializes in developmental assessments, vaccinations, and childhood illnesses.',
  consultation_fee = 120,
  phone = '+1-555-0102'
WHERE id = 'ae02681a-bb59-48a1-a238-b5b1bc0deb99'::uuid;

-- Doctor 3: Dermatologist
UPDATE user_profiles 
SET 
  full_name = 'Dr. Emily Rodriguez',
  role = 'doctor',
  specialization = 'Dermatology',
  years_of_experience = 10,
  education = 'MD, Stanford University; Dermatology Residency, UCSF',
  bio = 'Board-certified dermatologist specializing in medical and cosmetic dermatology. Expert in treating skin conditions, acne, eczema, and skin cancer prevention.',
  consultation_fee = 130,
  phone = '+1-555-0103'
WHERE id = '0f6ee283-916d-452a-8bf2-cead8ba34af2'::uuid;

-- Doctor 4: Orthopedic Surgeon
UPDATE user_profiles 
SET 
  full_name = 'Dr. James Williams',
  role = 'doctor',
  specialization = 'Orthopedic Surgery',
  years_of_experience = 18,
  education = 'MD, Yale School of Medicine; Fellowship in Sports Medicine',
  bio = 'Orthopedic surgeon with extensive experience in treating musculoskeletal conditions, sports injuries, and joint replacements. Specializes in minimally invasive procedures.',
  consultation_fee = 180,
  phone = '+1-555-0104'
WHERE id = '8234eb64-b0bb-4b8b-af36-a5b39b9a9bd0'::uuid;

-- Doctor 5: Psychiatrist
UPDATE user_profiles 
SET 
  full_name = 'Dr. Amanda Foster',
  role = 'doctor',
  specialization = 'Psychiatry',
  years_of_experience = 8,
  education = 'MD, Columbia University; Psychiatry Residency, Mayo Clinic',
  bio = 'Compassionate psychiatrist specializing in anxiety disorders, depression, and stress management. Offers both medication management and therapeutic counseling.',
  consultation_fee = 140,
  phone = '+1-555-0105'
WHERE id = 'f813e978-10b2-48de-b079-5491e4124075'::uuid;

-- Doctor 6: General Practitioner
UPDATE user_profiles 
SET 
  full_name = 'Dr. Robert Taylor',
  role = 'doctor',
  specialization = 'General Practice',
  years_of_experience = 20,
  education = 'MD, University of Pennsylvania; Family Medicine Board Certified',
  bio = 'Experienced family physician providing comprehensive primary care for patients of all ages. Expert in preventive medicine, chronic disease management, and health screenings.',
  consultation_fee = 100,
  phone = '+1-555-0106'
WHERE id = '5f0b2680-753e-4cc8-94e5-a4ac8e213e16'::uuid;

-- Doctor 7: Neurologist
UPDATE user_profiles 
SET 
  full_name = 'Dr. Lisa Anderson',
  role = 'doctor',
  specialization = 'Neurology',
  years_of_experience = 13,
  education = 'MD, Duke University; Neurology Fellowship, Cleveland Clinic',
  bio = 'Board-certified neurologist specializing in headaches, migraines, epilepsy, and neurological disorders. Expertise in diagnosis and management of complex neurological conditions.',
  consultation_fee = 160,
  phone = '+1-555-0107'
WHERE id = 'a834bbf7-227e-434a-b5da-e7b92befa621'::uuid;

-- Doctor 8: Gynecologist
UPDATE user_profiles 
SET 
  full_name = 'Dr. Patricia Martinez',
  role = 'doctor',
  specialization = 'Obstetrics & Gynecology',
  years_of_experience = 14,
  education = 'MD, Northwestern University; OB/GYN Residency, Mass General',
  bio = 'Experienced OB/GYN providing comprehensive women''s healthcare including prenatal care, gynecological exams, and reproductive health services.',
  consultation_fee = 145,
  phone = '+1-555-0108'
WHERE id = '3e5e5f4f-5765-4874-92d9-c80a10f05aac'::uuid;

-- Doctor 9: Endocrinologist
UPDATE user_profiles 
SET 
  full_name = 'Dr. David Kim',
  role = 'doctor',
  specialization = 'Endocrinology',
  years_of_experience = 11,
  education = 'MD, University of Michigan; Endocrinology Fellowship, UCLA',
  bio = 'Endocrinologist specializing in diabetes management, thyroid disorders, and hormonal imbalances. Expert in metabolic conditions and endocrine system disorders.',
  consultation_fee = 155,
  phone = '+1-555-0109'
WHERE id = 'cac93538-ca5f-48f4-8df7-3d7c612f2aae'::uuid;

-- Doctor 10: Pulmonologist
UPDATE user_profiles 
SET 
  full_name = 'Dr. Jennifer Lee',
  role = 'doctor',
  specialization = 'Pulmonology',
  years_of_experience = 9,
  education = 'MD, Boston University; Pulmonary Disease Fellowship, Johns Hopkins',
  bio = 'Pulmonologist specializing in respiratory conditions including asthma, COPD, sleep apnea, and lung diseases. Expert in breathing disorders and critical care.',
  consultation_fee = 165,
  phone = '+1-555-0110'
WHERE id = 'c64bd7d9-a5cc-4ee3-93c6-20554ff38321'::uuid;

-- Verification: Check if all doctors were updated successfully
-- SELECT full_name, email, role, specialization FROM user_profiles WHERE role = 'doctor';
