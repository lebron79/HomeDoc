# Database Setup Instructions

## IMPORTANT: You need to apply TWO new migrations to your Supabase database!

### Migration 1: User Profiles and Doctor Fields
File: `supabase/migrations/20251031000000_add_profile_trigger_and_doctor_fields.sql`

### Migration 2: Messaging System
File: `supabase/migrations/20251031100000_create_messaging_system.sql`

## What Migration 1 does (User Profiles):

1. **Adds new doctor-specific fields** to the `user_profiles` table:
   - `license_number` - Doctor's medical license number
   - `years_of_experience` - Years practicing medicine
   - `education` - Medical education background
   - `bio` - Professional biography
   - `consultation_fee` - Fee per consultation session
   - `available_days` - Array of available days
   - `available_hours` - Available consultation hours

2. **Creates an automatic profile creation trigger** that:
   - Automatically creates a user profile when someone signs up
   - Saves all the registration data (patient and doctor fields) from the signup form
   - This fixes the issue where patient fields (phone, address, etc.) weren't being saved

3. **Fixes the RLS policies** so that:
   - Patients can view all doctor profiles (so they can see available doctors)
   - Doctors can view patient profiles (for consultations)
   - Admins can view all profiles
   - Users can still only edit their own profiles

## What Migration 2 does (Messaging System):

1. **Creates `conversations` table** to track patient-doctor conversations:
   - Links patient and doctor
   - Tracks last message time
   - Ensures unique conversation per patient-doctor pair

2. **Creates `messages` table** to store all messages:
   - Stores message text
   - Tracks sender and receiver
   - Marks messages as read/unread
   - Timestamps for sorting

3. **Creates indexes** for fast queries on:
   - Finding conversations by patient or doctor
   - Loading messages for a conversation
   - Counting unread messages

4. **Sets up RLS policies** so:
   - Users can only see their own conversations
   - Users can only see messages they sent or received
   - Patients can create conversations with doctors
   - Users can mark their received messages as read

5. **Adds automatic triggers**:
   - Updates conversation timestamp when new message sent
   - Keeps conversation list sorted by most recent

## How to apply these migrations:

### Option 1: Using Supabase Dashboard (EASIEST)
1. Go to your Supabase project dashboard
2. Click on "SQL Editor" in the left sidebar
3. Click "New Query"
4. **First**, copy and paste the entire contents of `20251031000000_add_profile_trigger_and_doctor_fields.sql`
5. Click "Run" to execute it
6. **Then**, copy and paste the entire contents of `20251031100000_create_messaging_system.sql`
7. Click "Run" to execute it

### Option 2: Using Supabase CLI
If you have Supabase CLI installed:
```bash
supabase db push
```

### Option 3: Manual SQL Execution
1. Open each migration file
2. Copy its contents
3. In your Supabase project, go to SQL Editor
4. Paste and run the SQL (run both migrations in order)

## After applying the migration:

1. **Test patient registration**: Register as a patient and verify phone, address, age, and gender are saved
2. **Test doctor registration**: Register as a doctor and verify all doctor fields are saved
3. **Test viewing doctors**: Log in as a patient and click "Contact a Doctor" - you should see all registered doctors with their details

## What was changed in the code:

### Registration & Profile Features:
✅ **RegisterForm.tsx** - Added fields for doctors (license, experience, education, bio, consultation fee)
✅ **LoginForm.tsx** - Added "Remember Me" and "Show/Hide Password" features
✅ **AuthContext.tsx** - Updated to save all patient and doctor fields during registration
✅ **AvailableDoctors.tsx** - Updated to display doctor info and start conversations
✅ **UserProfile interface** - Added new doctor fields to the TypeScript interface

### Messaging System Features:
✅ **DoctorMessaging.tsx** - NEW: Complete messaging interface with:
   - Conversation list with unread counts
   - Real-time message updates
   - Message history
   - Call doctor functionality
   - Responsive design

✅ **PatientDashboard.tsx** - Updated with:
   - Unread message notification badge
   - Quick access to messaging
   - Real-time notification updates
   
✅ **AvailableDoctors.tsx** - Updated with:
   - "Message" button to start conversations
   - "Call" button for phone calls
   - Integration with messaging system

## Need Help?

If you encounter any errors, check:
1. Database connection is working
2. You have admin access to your Supabase project
3. The migration runs without errors
4. RLS policies are properly configured
