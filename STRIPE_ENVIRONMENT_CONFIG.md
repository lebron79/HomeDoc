# Environment Configuration

## Frontend (.env)

Create or update `.env` file in your project root:

```env
# Stripe Publishable Key (safe to expose)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY_HERE

# API Base URL (where your PHP files are)
VITE_API_URL=http://localhost:8080/homedoc/api

# Supabase (if using)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Getting Frontend Keys

1. Go to https://dashboard.stripe.com
2. Click "Developers" → "API Keys"
3. You'll see two keys:
   - **Publishable Key** (starts with `pk_test_` or `pk_live_`) - Can be in frontend code
   - **Secret Key** (starts with `sk_test_` or `sk_live_`) - Keep secret, only backend!

Copy the Publishable Key to `.env`:
```
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51234567890abcdefg
```

## Backend (Environment Variables)

### For Local Development

**Option 1: Set via PowerShell (temporary - only for current session)**
```powershell
$env:STRIPE_SECRET_KEY = "sk_test_YOUR_SECRET_KEY_HERE"
```

**Option 2: Set Permanently (Windows)**
1. Press `Win + X`, click "System"
2. Click "Advanced System Settings"
3. Click "Environment Variables" button
4. Click "New" under "User variables"
5. Variable name: `STRIPE_SECRET_KEY`
6. Variable value: `sk_test_YOUR_SECRET_KEY_HERE`
7. Click OK, restart terminal

**Option 3: Create .env file in `api/` folder**
```bash
# api/.env (not recommended for security)
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE
```

Then modify `api/create-checkout-session.php`:
```php
// Load environment from file (if using .env)
if (file_exists(__DIR__ . '/.env')) {
    $env = parse_ini_file(__DIR__ . '/.env');
    foreach ($env as $key => $value) {
        putenv("$key=$value");
    }
}

$stripe_secret_key = getenv('STRIPE_SECRET_KEY');
```

### For Production/Deployment

Every hosting provider handles environment variables differently:

**Heroku:**
```bash
heroku config:set STRIPE_SECRET_KEY=sk_live_YOUR_KEY
```

**AWS Lambda:**
Add to environment variables in AWS Console

**Vercel:**
Add to "Environment Variables" in project settings

**Traditional Hosting (Cpanel, etc.):**
Usually in control panel under "Environment Variables" or add to PHP config

**Docker:**
```dockerfile
ENV STRIPE_SECRET_KEY=sk_live_YOUR_KEY
```

## Testing Different Scenarios

### Test Mode Keys
```env
# These work in test mode only
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51234567890abcdefg
STRIPE_SECRET_KEY=sk_test_987654321fedcba
```

### Live Mode Keys
```env
# These process REAL PAYMENTS
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_51234567890abcdefg
STRIPE_SECRET_KEY=sk_live_987654321fedcba
```

⚠️ **IMPORTANT**: Only use live keys in production! Test keys won't process real payments.

## Verifying Setup

### Check Frontend Key is Loaded
In your browser console:
```javascript
console.log(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
```
Should output: `pk_test_...` or `pk_live_...`

### Check Backend Key is Set
In PowerShell:
```powershell
$env:STRIPE_SECRET_KEY
```
Should output your secret key

### Test PHP Can Access Key
Run this in `api/test-stripe-key.php`:
```php
<?php
$key = getenv('STRIPE_SECRET_KEY');
if ($key) {
    echo "✓ Key found: " . substr($key, 0, 10) . "...";
} else {
    echo "✗ Key not found!";
}
?>
```

Visit: `http://localhost:8080/homedoc/api/test-stripe-key.php`

## Key Reference

### Stripe Publishable Keys
- **Test**: Starts with `pk_test_`
- **Live**: Starts with `pk_live_`
- **Safe to expose**: Yes (in frontend code)
- **Where to use**: `VITE_STRIPE_PUBLISHABLE_KEY` in .env

### Stripe Secret Keys
- **Test**: Starts with `sk_test_`
- **Live**: Starts with `sk_live_`
- **Safe to expose**: NO - Keep secret!
- **Where to use**: `STRIPE_SECRET_KEY` environment variable (backend only)

## URLs Configuration

### Local Development
```env
VITE_API_URL=http://localhost:8080/homedoc/api
```

### Production Examples

**If on root domain:**
```env
VITE_API_URL=https://yourdomain.com/api
```

**If on subdomain:**
```env
VITE_API_URL=https://api.yourdomain.com
```

**If using Firebase Hosting + PHP backend elsewhere:**
```env
VITE_API_URL=https://your-backend.herokuapp.com/api
```

## Checklist

- [ ] Stripe account created (https://stripe.com)
- [ ] Stripe keys obtained from dashboard
- [ ] `VITE_STRIPE_PUBLISHABLE_KEY` added to `.env`
- [ ] `STRIPE_SECRET_KEY` set as environment variable
- [ ] PHP server can access the key
- [ ] Frontend can access the publishable key
- [ ] `VITE_API_URL` points to your API
- [ ] Test payment works with test card `4242 4242 4242 4242`

## Quick Command Reference

```powershell
# Set env variable (temporary)
$env:STRIPE_SECRET_KEY = "sk_test_..."

# Start PHP server
php -S localhost:8080

# Start Vite dev server
npm run dev

# Test Stripe key is set
Write-Output $env:STRIPE_SECRET_KEY

# View all environment variables
Get-ChildItem env:
```

---

**Need help?** Check `SIMPLE_STRIPE_SETUP.md` or `SIMPLE_STRIPE_SUMMARY.md`
