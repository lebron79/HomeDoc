# Quick Admin Setup Script for HomeDoc
# This script helps you create an admin user step by step

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   HomeDoc Admin User Setup Wizard" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "This wizard will guide you through creating an admin user." -ForegroundColor Yellow
Write-Host ""

# Step 1: Instructions for Supabase Dashboard
Write-Host "STEP 1: Create Auth User in Supabase Dashboard" -ForegroundColor Green
Write-Host "-----------------------------------------------"
Write-Host "1. Open your Supabase Dashboard in a browser"
Write-Host "2. Go to: Authentication > Users"
Write-Host "3. Click 'Add user' or 'Invite user'"
Write-Host "4. Enter the following details:"
Write-Host "   - Email: admin@homedoc.com (or your choice)"
Write-Host "   - Password: (create a strong password)"
Write-Host "   - Auto Confirm User: CHECK THIS BOX ✓"
Write-Host "   - Email Confirm: CHECK THIS BOX ✓"
Write-Host "5. Click 'Create user'"
Write-Host ""

$continue = Read-Host "Have you created the user in Supabase Dashboard? (y/n)"
if ($continue -ne "y") {
    Write-Host "Please create the user first, then run this script again." -ForegroundColor Red
    exit
}

Write-Host ""
Write-Host "STEP 2: Get User UUID" -ForegroundColor Green
Write-Host "----------------------"
Write-Host "1. In Supabase Dashboard, you should see your new user in the list"
Write-Host "2. Click on the user to view details"
Write-Host "3. Copy the UUID (looks like: a1b2c3d4-e5f6-7890-abcd-ef1234567890)"
Write-Host ""

$uuid = Read-Host "Paste the User UUID here"

if ([string]::IsNullOrWhiteSpace($uuid)) {
    Write-Host "UUID is required. Please run the script again." -ForegroundColor Red
    exit
}

Write-Host ""
$email = Read-Host "Enter the admin email (press Enter for default: admin@homedoc.com)"
if ([string]::IsNullOrWhiteSpace($email)) {
    $email = "admin@homedoc.com"
}

$fullName = Read-Host "Enter the admin full name (press Enter for default: System Administrator)"
if ([string]::IsNullOrWhiteSpace($fullName)) {
    $fullName = "System Administrator"
}

Write-Host ""
Write-Host "STEP 3: Generate SQL Query" -ForegroundColor Green
Write-Host "---------------------------"

$sqlQuery = @"
-- Insert Admin User Profile
INSERT INTO user_profiles (
  id,
  email,
  full_name,
  role,
  is_active
) VALUES (
  '$uuid'::uuid,
  '$email',
  '$fullName',
  'admin',
  true
)
ON CONFLICT (id) DO UPDATE SET
  role = 'admin',
  is_active = true;

-- Verify admin user
SELECT id, email, full_name, role, is_active, created_at 
FROM user_profiles 
WHERE role = 'admin';
"@

Write-Host ""
Write-Host "Copy the SQL query below and run it in Supabase SQL Editor:" -ForegroundColor Yellow
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host $sqlQuery -ForegroundColor White
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# Save to file
$sqlFileName = "admin_user_setup_$(Get-Date -Format 'yyyyMMdd_HHmmss').sql"
$sqlQuery | Out-File -FilePath $sqlFileName -Encoding UTF8

Write-Host "✓ SQL query saved to: $sqlFileName" -ForegroundColor Green
Write-Host ""
Write-Host "NEXT STEPS:" -ForegroundColor Green
Write-Host "1. Copy the SQL query above"
Write-Host "2. Go to Supabase Dashboard > SQL Editor"
Write-Host "3. Create a new query"
Write-Host "4. Paste and run the SQL"
Write-Host "5. Login to your app with:"
Write-Host "   Email: $email"
Write-Host "   Password: (the password you created)"
Write-Host "6. Navigate to /admin to access the admin dashboard"
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Setup Complete! 🎉" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "For detailed instructions, see: ADMIN_SETUP_GUIDE.md" -ForegroundColor Yellow
