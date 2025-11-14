# Admin User Setup Guide

## Overview
This guide will help you create and set up an admin user for the HomeDoc platform.

## Prerequisites
- Access to your Supabase Dashboard
- The admin management migration has been applied to your database

## Step-by-Step Instructions

### Method 1: Create Admin via Supabase Dashboard (Recommended)

#### Step 1: Create Auth User
1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **Users**
3. Click **"Add user"** or **"Invite user"**
4. Fill in the following:
   - **Email**: `admin@homedoc.com` (or your preferred admin email)
   - **Password**: Create a strong password (save it securely!)
   - **Auto Confirm User**: ✅ **Check this box** (important!)
   - **Email Confirm**: ✅ **Check this box**
5. Click **"Create user"** or **"Send invitation"**

#### Step 2: Note the User UUID
1. After creating the user, you'll see them in the users list
2. Click on the user to view details
3. **Copy the UUID** (it looks like: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`)

#### Step 3: Create Admin Profile
1. Go to **SQL Editor** in Supabase Dashboard
2. Create a new query
3. Paste the following SQL, **replacing `PASTE-UUID-HERE` with the UUID you copied**:

```sql
INSERT INTO user_profiles (
  id,
  email,
  full_name,
  role,
  is_active
) VALUES (
  'PASTE-UUID-HERE'::uuid,
  'admin@homedoc.com',
  'System Administrator',
  'admin',
  true
)
ON CONFLICT (id) DO UPDATE SET
  role = 'admin',
  is_active = true;
```

4. Click **"Run"** to execute the query

#### Step 4: Verify Admin User
Run this query to verify:
```sql
SELECT id, email, full_name, role, is_active, created_at 
FROM user_profiles 
WHERE role = 'admin';
```

You should see your admin user listed!

---

### Method 2: Promote Existing User to Admin

If you already have a user account and want to make it an admin:

1. Go to **SQL Editor** in Supabase Dashboard
2. Run this query (replace the email):

```sql
UPDATE user_profiles 
SET 
  role = 'admin',
  is_active = true
WHERE email = 'your-existing-email@example.com';
```

---

## Testing Admin Access

### 1. Login to Application
- Navigate to your HomeDoc application
- Click **"Sign In"**
- Use the admin credentials:
  - Email: `admin@homedoc.com` (or the email you used)
  - Password: (the password you set)

### 2. Access Admin Dashboard
- After logging in, navigate to `/admin` route
- Or look for the Admin Dashboard link in your navigation
- You should see:
  - ✅ Dashboard statistics
  - ✅ "Manage Users" button
  - ✅ User management interface

### 3. Test Admin Features
- **View Dashboard**: See platform statistics, user counts, etc.
- **Manage Users**: Click "Manage Users" to see the user management interface
- **Search Users**: Use the search bar to find users by name, email, or specialization
- **Filter Users**: Filter by "All Users", "Patients", "Doctors", or "Suspended"
- **Suspend User**: Click the suspend icon, provide a reason
- **Activate User**: Reactivate suspended users
- **View Details**: Expand user rows to see detailed information

---

## Admin Capabilities

### What Admins Can Do:
✅ View all users (patients, doctors, admins)
✅ Search and filter users
✅ View detailed user information
✅ Suspend users with reason
✅ Reactivate suspended users
✅ Delete users (with confirmation)
✅ View platform statistics
✅ Track new users and activity
✅ View admin activity logs

### Admin Security Features:
🔒 Only users with `role = 'admin'` can access admin dashboard
🔒 Row-level security policies protect admin functions
🔒 All admin actions are logged in `admin_activities` table
🔒 Suspended users cannot be deleted by mistake
🔒 Confirmation required for destructive actions

---

## Troubleshooting

### Issue: "Access Denied" when visiting admin dashboard
**Solution**: Verify your user profile has `role = 'admin'`:
```sql
SELECT id, email, role FROM user_profiles WHERE email = 'your-email@example.com';
```

### Issue: User profile not created automatically
**Solution**: Manually create the profile using Method 1, Step 3

### Issue: Can't see other users in "Manage Users"
**Solution**: Check RLS policies are properly applied:
```sql
-- Run the admin management migration again if needed
```

### Issue: Admin activities not logging
**Solution**: Verify the `log_admin_activity` function exists:
```sql
SELECT * FROM pg_proc WHERE proname = 'log_admin_activity';
```

---

## Default Admin Credentials (If You Used Recommended Values)

```
Email: admin@homedoc.com
Password: (the password you set during creation)
Role: admin
```

⚠️ **Important Security Notes:**
- Change the default admin email if desired
- Use a **strong, unique password**
- Store credentials securely (password manager recommended)
- Consider enabling 2FA in Supabase Auth settings
- Regularly review admin activity logs

---

## Next Steps

After creating your admin user:

1. ✅ **Login** with admin credentials
2. ✅ **Test** the admin dashboard features
3. ✅ **Create** additional admin users if needed (use Method 2)
4. ✅ **Review** existing users and clean up test accounts
5. ✅ **Monitor** admin activities regularly

---

## Admin Activity Logging

All admin actions are automatically logged in the `admin_activities` table. To view logs:

```sql
SELECT 
  aa.action_type,
  aa.created_at,
  admin.full_name as admin_name,
  target.full_name as target_user,
  aa.action_details
FROM admin_activities aa
LEFT JOIN user_profiles admin ON aa.admin_id = admin.id
LEFT JOIN user_profiles target ON aa.target_user_id = target.id
ORDER BY aa.created_at DESC
LIMIT 50;
```

---

## Support

If you encounter any issues:
1. Check the browser console for errors
2. Verify database migrations are applied
3. Check Supabase logs in the Dashboard
4. Review RLS policies are active

---

**You're all set! 🎉**

Your admin user is ready to manage the HomeDoc platform!
