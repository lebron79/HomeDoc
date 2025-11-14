# Quick Stripe Setup Guide

## Method 1: Deploy via Supabase Dashboard (Easiest)

1. **Go to Supabase Dashboard**:
   - Visit: https://supabase.com/dashboard/project/vebmeyrvgkifagheaoib
   - Click on "Edge Functions" in the left sidebar

2. **Create New Function**:
   - Click "Create a new function"
   - Name: `create-checkout-session`
   - Copy the code from: `supabase/functions/create-checkout-session/index.ts`
   - Paste it into the editor
   - Click "Deploy"

3. **Set Environment Variable**:
   - In Edge Functions page, click on "Manage secrets"
   - Add new secret:
     - Name: `STRIPE_SECRET_KEY`
     - Value: `YOUR_STRIPE_SECRET_KEY_HERE` (Get from https://dashboard.stripe.com/test/apikeys)
   - Click "Save"

4. **Test It**:
   - Go to medication store
   - Add items to cart
   - Enter shipping address
   - Click "Pay with Stripe"
   - You'll be redirected to Stripe's checkout page! 🎉

## Method 2: Using Supabase CLI

If you prefer command line:

```powershell
# Install via Scoop (Windows package manager)
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase

# Or download from: https://github.com/supabase/cli/releases

# Then deploy
supabase login
supabase link --project-ref vebmeyrvgkifagheaoib
supabase secrets set STRIPE_SECRET_KEY=YOUR_STRIPE_SECRET_KEY_HERE
supabase functions deploy create-checkout-session
```

## What Happens Next?

Once deployed:
1. ✅ Cart → Checkout → Enter address → Click "Pay with Stripe"
2. ✅ **Redirects to Stripe's hosted payment page**
3. ✅ Enter card details on Stripe (not our site)
4. ✅ After payment, redirects back to our site
5. ✅ Order automatically created in database

## Test Cards

Use these on Stripe's checkout page:
- **Success**: `4242 4242 4242 4242`
- **Declined**: `4000 0000 0000 9995`

Expiry: `12/34` | CVC: `123` | ZIP: `12345`

---

**Need help?** Just let me know! The dashboard method is super easy! 🚀
