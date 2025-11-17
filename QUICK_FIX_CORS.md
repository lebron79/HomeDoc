## 🚀 Quick Fix: Deploy Edge Functions

The CORS error means the Edge Functions aren't deployed yet. Follow these steps:

### Step 1: Deploy the Functions

Open PowerShell in your project directory and run:

```powershell
# Deploy create-checkout-session
supabase functions deploy create-checkout-session

# Deploy verify-payment  
supabase functions deploy verify-payment
```

### Step 2: Set the Stripe Secret Key

```powershell
# Replace with your actual Stripe test key
supabase secrets set STRIPE_SECRET_KEY=sk_test_your_key_here
```

### Step 3: Verify Deployment

```powershell
# List deployed functions
supabase functions list

# You should see:
# - create-checkout-session
# - verify-payment
```

### Step 4: Test Again

1. Refresh your browser (Ctrl+Shift+R to clear cache)
2. Try the checkout flow again
3. The CORS error should be gone!

---

## If You Don't Have Supabase CLI Installed

Install it first:

```powershell
# Using Scoop (recommended for Windows)
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase

# OR using npm
npm install -g supabase
```

## If You're Not Logged In to Supabase CLI

```powershell
# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref
```

Your project ref is in your Supabase URL: `https://YOUR-PROJECT-REF.supabase.co`

---

## Quick Deployment Script

Or just run the deployment script I created:

```powershell
.\deploy-stripe-functions.ps1
```

This will deploy both functions and show you the status!
