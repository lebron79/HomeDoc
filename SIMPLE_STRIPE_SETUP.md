# Simple Stripe Payment Setup Guide

## Overview
This guide explains how to set up the simple Stripe payment flow. No products need to be created in Stripe, no edge functions, no Node.js server required. Just PHP!

## Step 1: Install Stripe PHP SDK

You need to install the Stripe PHP library using Composer.

### Option A: If you have Composer installed locally
```bash
cd c:\Users\yassi\Desktop\homedoc\api
composer require stripe/stripe-php
```

### Option B: Without Composer (Manual Installation)
1. Download the Stripe PHP SDK from: https://github.com/stripe/stripe-php/releases
2. Extract it to `api/vendor/stripe/`
3. Ensure `api/vendor/autoload.php` exists

## Step 2: Configure Environment Variables

Add your Stripe keys to your environment:

### For Local Testing with PHP's Built-in Server:
```bash
# On Windows PowerShell
$env:STRIPE_SECRET_KEY = "sk_test_your_actual_secret_key_here"
```

### For Production/Deployment:
Add these to your hosting provider's environment variables:
- `STRIPE_SECRET_KEY`: Your Stripe secret key (starts with `sk_test_` or `sk_live_`)

### To find your keys:
1. Log in to Stripe Dashboard: https://dashboard.stripe.com
2. Go to Developers → API Keys
3. Copy your "Secret key"

## Step 3: Configure Frontend

Update your `.env` file or environment variables:

```env
VITE_API_URL=http://localhost:8080/homedoc/api
```

For production, change this to your actual API endpoint.

## Step 4: Test the Payment Flow

### Option A: Using PHP's Built-in Server (Simplest)

1. Open PowerShell in the `c:\Users\yassi\Desktop\homedoc` directory
2. Set the Stripe key:
```powershell
$env:STRIPE_SECRET_KEY = "sk_test_your_key"
```

3. Start the PHP server:
```powershell
php -S localhost:8080
```

4. In another PowerShell window, start your frontend:
```powershell
npm run dev
```

5. Test the payment by using the `SimplePayment` component in your app

### Option B: Using Your Existing Web Server

If you already have a web server (Apache, Nginx, etc.), just ensure:
1. The `api/` folder is accessible from your server
2. The Stripe secret key is in your environment
3. Update `VITE_API_URL` to point to your server

## Step 5: Use the Payment Component in Your App

### Example: Buy Votes

```tsx
import { SimplePayment } from './components/Payment/SimplePayment';

export function BuyVotesPage() {
  const handlePaymentComplete = (paymentData: any) => {
    console.log('Payment verified:', paymentData);
    // Now add votes to user's account
    // Call your database to update vote count
  };

  return (
    <div>
      <h1>Buy Votes</h1>
      <SimplePayment
        amount={1999} // $19.99 in cents
        itemName="10 Votes Package"
        itemDescription="Boost your profile with 10 premium votes"
        onPaymentComplete={handlePaymentComplete}
      />
    </div>
  );
}
```

## How It Works

### The 3-Step Flow:

**Step 1: User Clicks "Pay"**
```
SimplePayment component → calls redirectToStripeCheckout()
→ POST to create-checkout-session.php
→ PHP creates Stripe session (no product needed!)
→ User redirected to Stripe's secure payment page
```

**Step 2: User Pays on Stripe**
```
User enters card details on Stripe's site
→ Stripe processes payment
→ Stripe redirects back to your site with session_id in URL
```

**Step 3: Verify and Process**
```
Frontend detects session_id in URL
→ Calls verifyPayment() 
→ POST to verify-payment.php
→ PHP confirms with Stripe that payment was successful
→ Returns payment data to frontend
→ Frontend triggers onPaymentComplete callback
→ You can now update database (add votes, record order, etc.)
```

## API Endpoints

### POST `/api/create-checkout-session.php`

**Request:**
```json
{
  "amount": 1999,
  "email": "user@example.com",
  "userId": "user-123",
  "itemName": "10 Votes",
  "itemDescription": "Boost your profile"
}
```

**Response:**
```json
{
  "success": true,
  "sessionId": "cs_test_...",
  "url": "https://checkout.stripe.com/pay/cs_test_..."
}
```

### POST `/api/verify-payment.php`

**Request:**
```json
{
  "sessionId": "cs_test_..."
}
```

**Response:**
```json
{
  "success": true,
  "verified": true,
  "sessionId": "cs_test_...",
  "paymentIntentId": "pi_...",
  "amount": 1999,
  "email": "user@example.com",
  "userId": "user-123",
  "itemName": "10 Votes",
  "status": "paid",
  "created": 1699000000
}
```

## Database Integration

After payment verification, you'll want to record it in your database. Example:

```tsx
const handlePaymentComplete = async (paymentData: any) => {
  // Save to Supabase
  const { error } = await supabase
    .from('payments')
    .insert({
      user_id: paymentData.userId,
      amount: paymentData.amount,
      session_id: paymentData.sessionId,
      payment_intent_id: paymentData.paymentIntentId,
      item_name: paymentData.itemName,
      status: 'completed',
      created_at: new Date(paymentData.created * 1000),
    });

  if (!error) {
    // Add votes to user
    await supabase
      .from('user_votes')
      .insert({
        user_id: paymentData.userId,
        votes_purchased: 10,
        session_id: paymentData.sessionId,
      });
  }
};
```

## Troubleshooting

### Issue: "Stripe key not configured"
**Solution:** Make sure `STRIPE_SECRET_KEY` is set as an environment variable before running the PHP server.

### Issue: "CORS error"
**Solution:** The PHP files already have CORS headers set. If you still get errors, check that your frontend is on a different port than the PHP server.

### Issue: "composer.json not found"
**Solution:** You don't need Composer if you install the SDK manually or upload the `vendor` folder to your hosting.

### Issue: Payment redirects but doesn't verify
**Solution:** Check that:
1. Your Stripe key is correct
2. The `verify-payment.php` endpoint is accessible
3. The session ID in the URL matches

## Security Notes

1. **Secret Key**: Never expose your `STRIPE_SECRET_KEY` in frontend code
2. **HTTPS**: Use HTTPS in production (Stripe won't work with HTTP in production)
3. **Verification**: Always verify payment on the backend (never trust frontend)
4. **Idempotency**: The verify endpoint is safe to call multiple times

## Next Steps

1. Test with Stripe test cards: https://stripe.com/docs/testing
2. Set up a database table to track payments
3. Create page routes for success/canceled states
4. Go live with real Stripe keys when ready
