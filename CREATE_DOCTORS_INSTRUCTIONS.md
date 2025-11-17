# Creating Doctor Accounts - Step by Step Guide

## Option 1: Using Supabase Dashboard (Easiest) ✅

### Step 1: Create Auth Users
1. Go to **Supabase Dashboard** → **Authentication** → **Users**
2. Click **"Add User"** for each doctor
3. Fill in the following details:

#### Doctor Accounts to Create:

1. **Dr. Sarah Johnson** (Cardiologist)
   - Email: `sarah.johnson@homedoc.com`
   - Password: `Doctor123!` (temporary - they can change it)
   - ✅ Check "Auto Confirm User" to verify email

2. **Dr. Michael Chen** (Pediatrics)
   - Email: `michael.chen@homedoc.com`
   - Password: `Doctor123!`
   - ✅ Check "Auto Confirm User"

3. **Dr. Emily Rodriguez** (Dermatology)
   - Email: `emily.rodriguez@homedoc.com`
   - Password: `Doctor123!`
   - ✅ Check "Auto Confirm User"

4. **Dr. James Williams** (Orthopedic Surgery)
   - Email: `james.williams@homedoc.com`
   - Password: `Doctor123!`
   - ✅ Check "Auto Confirm User"

5. **Dr. Amanda Foster** (Psychiatry)
   - Email: `amanda.foster@homedoc.com`
   - Password: `Doctor123!`
   - ✅ Check "Auto Confirm User"

6. **Dr. Robert Taylor** (General Practice)
   - Email: `robert.taylor@homedoc.com`
   - Password: `Doctor123!`
   - ✅ Check "Auto Confirm User"

7. **Dr. Lisa Anderson** (Neurology)
   - Email: `lisa.anderson@homedoc.com`
   - Password: `Doctor123!`
   - ✅ Check "Auto Confirm User"

8. **Dr. Patricia Martinez** (OB/GYN)
   - Email: `patricia.martinez@homedoc.com`
   - Password: `Doctor123!`
   - ✅ Check "Auto Confirm User"

9. **Dr. David Kim** (Endocrinology)
   - Email: `david.kim@homedoc.com`
   - Password: `Doctor123!`
   - ✅ Check "Auto Confirm User"

10. **Dr. Jennifer Lee** (Pulmonology)
    - Email: `jennifer.lee@homedoc.com`
    - Password: `Doctor123!`
    - ✅ Check "Auto Confirm User"

### Step 2: Get User IDs
After creating all users in Auth:
1. Stay in **Authentication** → **Users**
2. For each doctor, click on their email
3. Copy their **User UID** (it's a UUID like `a1b2c3d4-e5f6-...`)
4. Keep these IDs - you'll need them for the next step

### Step 3: Update the SQL Script
1. Open `supabase/migrations/20251108100000_insert_sample_doctors.sql`
2. Replace the placeholder UUIDs with the actual User UIDs you copied
3. The file has placeholders like `'00000000-0000-0000-0000-000000000001'::uuid`
4. Replace each with the actual UUID from Step 2

### Step 4: Run the Migration
1. Go to **Supabase Dashboard** → **SQL Editor**
2. Click **"New Query"**
3. Copy the content from `20251108100000_insert_sample_doctors.sql` (with updated UUIDs)
4. Click **"Run"**

---

## Option 2: All-in-One SQL Script (Advanced)

Run this script in **SQL Editor** with **service_role** privileges:

```sql
-- This creates both auth users and profiles in one go
-- Note: Requires admin/service_role access

DO $$
DECLARE
  doctor_ids UUID[] := ARRAY[
    gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), 
    gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), 
    gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), 
    gen_random_uuid()
  ];
BEGIN
  -- Insert into auth.users (requires elevated privileges)
  INSERT INTO auth.users (
    id, 
    email, 
    encrypted_password, 
    email_confirmed_at, 
    confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at
  )
  VALUES
    (doctor_ids[1], 'sarah.johnson@homedoc.com', crypt('Doctor123!', gen_salt('bf')), NOW(), NOW(), '{"provider":"email"}', '{"name":"Dr. Sarah Johnson"}', NOW(), NOW()),
    (doctor_ids[2], 'michael.chen@homedoc.com', crypt('Doctor123!', gen_salt('bf')), NOW(), NOW(), '{"provider":"email"}', '{"name":"Dr. Michael Chen"}', NOW(), NOW()),
    (doctor_ids[3], 'emily.rodriguez@homedoc.com', crypt('Doctor123!', gen_salt('bf')), NOW(), NOW(), '{"provider":"email"}', '{"name":"Dr. Emily Rodriguez"}', NOW(), NOW()),
    (doctor_ids[4], 'james.williams@homedoc.com', crypt('Doctor123!', gen_salt('bf')), NOW(), NOW(), '{"provider":"email"}', '{"name":"Dr. James Williams"}', NOW(), NOW()),
    (doctor_ids[5], 'amanda.foster@homedoc.com', crypt('Doctor123!', gen_salt('bf')), NOW(), NOW(), '{"provider":"email"}', '{"name":"Dr. Amanda Foster"}', NOW(), NOW()),
    (doctor_ids[6], 'robert.taylor@homedoc.com', crypt('Doctor123!', gen_salt('bf')), NOW(), NOW(), '{"provider":"email"}', '{"name":"Dr. Robert Taylor"}', NOW(), NOW()),
    (doctor_ids[7], 'lisa.anderson@homedoc.com', crypt('Doctor123!', gen_salt('bf')), NOW(), NOW(), '{"provider":"email"}', '{"name":"Dr. Lisa Anderson"}', NOW(), NOW()),
    (doctor_ids[8], 'patricia.martinez@homedoc.com', crypt('Doctor123!', gen_salt('bf')), NOW(), NOW(), '{"provider":"email"}', '{"name":"Dr. Patricia Martinez"}', NOW(), NOW()),
    (doctor_ids[9], 'david.kim@homedoc.com', crypt('Doctor123!', gen_salt('bf')), NOW(), NOW(), '{"provider":"email"}', '{"name":"Dr. David Kim"}', NOW(), NOW()),
    (doctor_ids[10], 'jennifer.lee@homedoc.com', crypt('Doctor123!', gen_salt('bf')), NOW(), NOW(), '{"provider":"email"}', '{"name":"Dr. Jennifer Lee"}', NOW(), NOW())
  ON CONFLICT (email) DO NOTHING;

  -- Insert profiles
  INSERT INTO user_profiles (id, full_name, email, role, specialization, years_of_experience, education, bio, consultation_fee, phone)
  VALUES
    (doctor_ids[1], 'Dr. Sarah Johnson', 'sarah.johnson@homedoc.com', 'doctor', 'Cardiology', 15, 'MD, Harvard Medical School; Board Certified Cardiologist', 'Experienced cardiologist with over 15 years specializing in heart disease prevention, diagnosis, and treatment. Expert in managing hypertension, heart failure, and cardiovascular risk assessment.', 150, '+1-555-0101'),
    (doctor_ids[2], 'Dr. Michael Chen', 'michael.chen@homedoc.com', 'doctor', 'Pediatrics', 12, 'MD, Johns Hopkins University; Pediatric Board Certification', 'Dedicated pediatrician providing comprehensive care for children from newborns to adolescents. Specializes in developmental assessments, vaccinations, and childhood illnesses.', 120, '+1-555-0102'),
    (doctor_ids[3], 'Dr. Emily Rodriguez', 'emily.rodriguez@homedoc.com', 'doctor', 'Dermatology', 10, 'MD, Stanford University; Dermatology Residency, UCSF', 'Board-certified dermatologist specializing in medical and cosmetic dermatology. Expert in treating skin conditions, acne, eczema, and skin cancer prevention.', 130, '+1-555-0103'),
    (doctor_ids[4], 'Dr. James Williams', 'james.williams@homedoc.com', 'doctor', 'Orthopedic Surgery', 18, 'MD, Yale School of Medicine; Fellowship in Sports Medicine', 'Orthopedic surgeon with extensive experience in treating musculoskeletal conditions, sports injuries, and joint replacements. Specializes in minimally invasive procedures.', 180, '+1-555-0104'),
    (doctor_ids[5], 'Dr. Amanda Foster', 'amanda.foster@homedoc.com', 'doctor', 'Psychiatry', 8, 'MD, Columbia University; Psychiatry Residency, Mayo Clinic', 'Compassionate psychiatrist specializing in anxiety disorders, depression, and stress management. Offers both medication management and therapeutic counseling.', 140, '+1-555-0105'),
    (doctor_ids[6], 'Dr. Robert Taylor', 'robert.taylor@homedoc.com', 'doctor', 'General Practice', 20, 'MD, University of Pennsylvania; Family Medicine Board Certified', 'Experienced family physician providing comprehensive primary care for patients of all ages. Expert in preventive medicine, chronic disease management, and health screenings.', 100, '+1-555-0106'),
    (doctor_ids[7], 'Dr. Lisa Anderson', 'lisa.anderson@homedoc.com', 'doctor', 'Neurology', 13, 'MD, Duke University; Neurology Fellowship, Cleveland Clinic', 'Board-certified neurologist specializing in headaches, migraines, epilepsy, and neurological disorders. Expertise in diagnosis and management of complex neurological conditions.', 160, '+1-555-0107'),
    (doctor_ids[8], 'Dr. Patricia Martinez', 'patricia.martinez@homedoc.com', 'doctor', 'Obstetrics & Gynecology', 14, 'MD, Northwestern University; OB/GYN Residency, Mass General', 'Experienced OB/GYN providing comprehensive women\'s healthcare including prenatal care, gynecological exams, and reproductive health services.', 145, '+1-555-0108'),
    (doctor_ids[9], 'Dr. David Kim', 'david.kim@homedoc.com', 'doctor', 'Endocrinology', 11, 'MD, University of Michigan; Endocrinology Fellowship, UCLA', 'Endocrinologist specializing in diabetes management, thyroid disorders, and hormonal imbalances. Expert in metabolic conditions and endocrine system disorders.', 155, '+1-555-0109'),
    (doctor_ids[10], 'Dr. Jennifer Lee', 'jennifer.lee@homedoc.com', 'doctor', 'Pulmonology', 9, 'MD, Boston University; Pulmonary Disease Fellowship, Johns Hopkins', 'Pulmonologist specializing in respiratory conditions including asthma, COPD, sleep apnea, and lung diseases. Expert in breathing disorders and critical care.', 165, '+1-555-0110')
  ON CONFLICT (id) DO NOTHING;
END $$;
```

---

## Quick Summary

**✅ EASIEST METHOD:**
1. Create 10 users in **Supabase Dashboard → Authentication**
2. Check "Auto Confirm User" for each
3. Copy their User UIDs
4. Update the SQL script with real UUIDs
5. Run the script in SQL Editor

**Default Password for All:** `Doctor123!`

**Specialties Included:**
- Cardiology
- Pediatrics  
- Dermatology
- Orthopedic Surgery
- Psychiatry
- General Practice
- Neurology
- OB/GYN
- Endocrinology
- Pulmonology
