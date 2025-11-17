# 🎯 How to Access Admin Dashboard - Quick Guide

## ✅ Admin Dashboard is Now Ready!

### Access URL
After logging in as an admin, you can access the admin dashboard at:

```
http://localhost:5173/admin
```

Or simply click the **"Admin Panel"** button in the navbar (purple button with shield icon).

---

## 📍 Access Methods

### Method 1: Navigation Link (Easiest ⭐)
1. **Login** with admin credentials
2. Look at the top navigation bar
3. Click the **purple "Admin Panel"** button (it has a shield icon 🛡️)
4. You'll be redirected to the admin dashboard

### Method 2: Direct URL
1. **Login** with admin credentials
2. Navigate directly to: `/admin`
3. Full URL: `http://localhost:5173/admin`

### Method 3: Dashboard Link
1. **Login** with admin credentials
2. Click **"Dashboard"** in the navbar
3. If you're an admin, the admin dashboard will load

---

## 🔐 First Time Setup

If you haven't created an admin user yet:

### Quick Setup (Use PowerShell Script)
```powershell
cd c:\Users\ihebl\Downloads\homedoc\homedoc
.\setup-admin.ps1
```

### Manual Setup (3 Steps)
1. **Go to Supabase Dashboard** → Authentication → Users → Add User
   - Email: `admin@homedoc.com`
   - Password: (your choice)
   - ✓ Auto Confirm User
   - ✓ Email Confirm

2. **Copy the User UUID** from Supabase Dashboard

3. **Run this SQL in Supabase SQL Editor**:
```sql
INSERT INTO user_profiles (
  id,
  email,
  full_name,
  role,
  is_active
) VALUES (
  'YOUR-UUID-HERE'::uuid,
  'admin@homedoc.com',
  'System Administrator',
  'admin',
  true
);
```

---

## 🎨 What You'll See

### Dashboard View (Default)
- **Statistics Cards**: 
  - Active Patients
  - Active Doctors  
  - Suspended Users
  - New Users This Week
- **Charts**: Most common diagnoses, doctor specializations
- **Insights**: Platform metrics and analytics

### Manage Users View
Click **"Manage Users"** button to:
- 🔍 Search users by name, email, specialization
- 🗂️ Filter by: All / Patients / Doctors / Suspended
- 👤 View detailed user information
- ⏸️ Suspend users (with reason)
- ✅ Activate suspended users
- 🗑️ Delete users (with confirmation)

---

## 🚨 Troubleshooting

### "Access Denied" Message?
✅ **Solution**: Make sure your user has `role = 'admin'` in the database

Check with this SQL:
```sql
SELECT id, email, role FROM user_profiles WHERE email = 'your-email@example.com';
```

### Purple "Admin Panel" Button Not Showing?
✅ **Solution**: Your user role must be 'admin'
- Check your profile role in the database
- Or update an existing user to admin:
```sql
UPDATE user_profiles SET role = 'admin' WHERE email = 'your-email@example.com';
```

### Can't See Users in "Manage Users"?
✅ **Solution**: Database migrations need to be applied
```powershell
cd c:\Users\ihebl\Downloads\homedoc\homedoc
npx supabase db push
```

---

## 📝 Admin Credentials Template

```
URL: http://localhost:5173/admin
Email: admin@homedoc.com
Password: (the one you created)
```

---

## ✨ Features Available

✅ View all platform statistics
✅ Manage all users (patients & doctors)
✅ Search and filter users
✅ Suspend/activate user accounts
✅ View detailed user profiles
✅ Track platform activity
✅ Delete users (with confirmation)

---

## 🔗 Useful Routes

| Route | Description |
|-------|-------------|
| `/admin` | Admin dashboard (main) |
| `/admin-dashboard` | Redirects to `/admin` |
| `/patient-dashboard` | Patient dashboard |
| `/doctor-dashboard` | Doctor dashboard |

---

**You're all set! 🎉**

Just login as admin and click the purple **"Admin Panel"** button in the navbar!
