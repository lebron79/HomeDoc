# 🎯 Simple Stripe Payment Flow - Complete Setup

Your simple Stripe payment flow is ready! No Edge Functions, no server.js complications, just pure PHP and React.

## 📁 What Was Created

### Backend (PHP)
- ✅ `api/create-checkout-session.php` - Creates Stripe checkout sessions (no products needed!)
- ✅ `api/verify-payment.php` - Verifies payment with Stripe after user returns
- ✅ `api/composer.json` - Composer config for managing Stripe SDK

### Frontend (React/TypeScript)
- ✅ `src/lib/payment.ts` - Simple payment helper functions
- ✅ `src/components/Payment/SimplePayment.tsx` - Payment component (plug & play!)
- ✅ `src/pages/PaymentSuccessPage.tsx` - Success page after payment
- ✅ `src/pages/PaymentCanceledPage.tsx` - Canceled payment page

### Documentation & Setup
- ✅ `SIMPLE_STRIPE_SETUP.md` - Complete setup guide
- ✅ `STRIPE_EXAMPLE_BUY_VOTES.md` - Real-world example implementation
- ✅ `setup-stripe.bat` & `setup-stripe.ps1` - Automated setup scripts

## ⚡ Quick Start (5 minutes)

### 1️⃣ Get Your Stripe Key
1. Go to https://dashboard.stripe.com
2. Click "Developers" (top right corner)
3. Click "API Keys"
4. Copy your "Secret Key" (starts with `sk_test_`)

### 2️⃣ Run Setup Script

**PowerShell:**
```powershell
.\setup-stripe.ps1 -StripeSecretKey "sk_test_YOUR_KEY_HERE"
```

**Or Batch:**
```batch
setup-stripe.bat sk_test_YOUR_KEY_HERE
```

### 3️⃣ Install PHP Dependencies

In `api/` folder:
```bash
composer require stripe/stripe-php
```

(If Composer not installed, see `SIMPLE_STRIPE_SETUP.md`)

### 4️⃣ Start Development

**Terminal 1 - Frontend:**
```bash
npm run dev
```

**Terminal 2 - PHP Backend:**
```bash
php -S localhost:8080
```

## 🔄 The Payment Flow (3 Steps)

```
┌─────────────────────────────────────────────────────────────┐
│ USER CLICKS "PAY"                                           │
│ SimplePayment component triggers                            │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ STEP 1: CREATE CHECKOUT SESSION                            │
│ POST /api/create-checkout-session.php                      │
│ ├─ Send: amount, email, userId, itemName                  │
│ ├─ PHP creates Stripe session (NO products needed!)       │
│ └─ Return: sessionId, checkout URL                        │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ STEP 2: USER PAYS ON STRIPE                               │
│ Browser redirects to Stripe's secure payment page          │
│ ├─ User enters card details (4242 4242 4242 4242)        │
│ ├─ Stripe processes payment                               │
│ └─ Stripe redirects back with session_id in URL          │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ STEP 3: VERIFY & PROCESS                                  │
│ Frontend detects session_id in URL                        │
│ POST /api/verify-payment.php                              │
│ ├─ Send: sessionId                                        │
│ ├─ PHP verifies with Stripe that payment is real        │
│ ├─ Return: payment data, userId, amount                 │
│ └─ Frontend triggers onPaymentComplete callback          │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ STEP 4: UPDATE YOUR DATABASE                              │
│ onPaymentComplete handler receives verified payment       │
│ ├─ Save payment record to Supabase                       │
│ ├─ Add votes/credits to user account                     │
│ ├─ Send confirmation email (optional)                    │
│ └─ Redirect to success page                              │
└─────────────────────────────────────────────────────────────┘
```

## 📝 API Reference

### Create Checkout Session
```typescript
// Frontend
const { sessionId, url } = await createCheckoutSession({
  amount: 1999,           // Amount in cents ($19.99)
  email: 'user@example.com',
  userId: 'user-123',
  itemName: '10 Votes',
  itemDescription: 'Boost your profile'
});

// Redirects to: url (Stripe checkout page)
```

### Verify Payment
```typescript
// Frontend
const paymentData = await verifyPayment({
  sessionId: 'cs_test_...'
});

// Returns:
{
  success: true,
  verified: true,
  sessionId: 'cs_test_...',
  paymentIntentId: 'pi_...',
  amount: 1999,
  email: 'user@example.com',
  userId: 'user-123',
  itemName: '10 Votes',
  status: 'paid'
}
```

## 🎨 Using SimplePayment Component

### Basic Usage
```tsx
import { SimplePayment } from './components/Payment/SimplePayment';

export function ShopPage() {
  const handlePaymentComplete = (paymentData) => {
    console.log('Payment verified!', paymentData);
    // Add votes/credits to user here
  };

  return (
    <SimplePayment
      amount={4999}  // $49.99
      itemName="Premium Package"
      itemDescription="50 votes + special badge"
      onPaymentComplete={handlePaymentComplete}
    />
  );
}
```

### With Error Handling
```tsx
const handlePaymentComplete = async (paymentData) => {
  try {
    // Save to database
    await supabase
      .from('user_purchases')
      .insert({
        user_id: paymentData.userId,
        payment_id: paymentData.paymentIntentId,
        amount: paymentData.amount,
      });

    // Add votes
    await addVotesToUser(paymentData.userId, 50);

    console.log('✓ All done!');
  } catch (error) {
    console.error('Error:', error);
    // Show error to user
  }
};
```

## 🧪 Testing

### Test Cards (Stripe Test Mode)
| Card | CVC | Expiration | Result |
|------|-----|------------|--------|
| 4242 4242 4242 4242 | Any | Any future | ✅ Success |
| 4000 0000 0000 9995 | Any | Any future | ❌ Decline |
| 4000 0025 0000 3155 | Any | Any future | ⚠️ Requires auth |

### Test Flow
1. Navigate to your payment page
2. Click "Pay with Stripe"
3. Enter: `4242 4242 4242 4242` (or any test card)
4. Any future expiration date
5. Any 3-digit CVC
6. Click Pay
7. You should see success page

## 🔐 Security Checklist

- ✅ Never expose `STRIPE_SECRET_KEY` in frontend code
- ✅ Always verify payment on backend (never trust frontend)
- ✅ Use HTTPS in production (required by Stripe)
- ✅ Verify `sessionId` matches expected amount before processing
- ✅ Never retry verification more than necessary
- ✅ Log all payments for audit trail

## 🚀 Going Live

When you're ready for real money:

1. Get live Stripe keys from https://dashboard.stripe.com (Live Mode)
2. Replace test key with live key (starts with `sk_live_`)
3. Update environment variable: `STRIPE_SECRET_KEY=sk_live_...`
4. Make sure your site uses HTTPS
5. Test with real card (or keep testing with test card)

## 📚 File Locations Quick Reference

```
Frontend:
- src/lib/payment.ts                 ← Helper functions
- src/components/Payment/SimplePayment.tsx  ← Main component
- src/pages/PaymentSuccessPage.tsx   ← Success page
- src/pages/PaymentCanceledPage.tsx  ← Canceled page

Backend:
- api/create-checkout-session.php    ← Create session
- api/verify-payment.php             ← Verify payment
- api/composer.json                  ← Dependencies

Documentation:
- SIMPLE_STRIPE_SETUP.md             ← Setup guide
- STRIPE_EXAMPLE_BUY_VOTES.md        ← Full example
- SIMPLE_STRIPE_SUMMARY.md           ← This file!
```

## ❓ Common Questions

### Q: Do I need to create products in Stripe?
**A:** No! You can send any amount directly. Perfect for dynamic pricing.

### Q: Can I run this without a local server?
**A:** You need a PHP server to run the backend. Use `php -S localhost:8080`.

### Q: What if the user closes their browser during payment?
**A:** Stripe will redirect them. If they come back with the session_id in the URL, it will verify.

### Q: Can I use this with my existing API?
**A:** Yes! Just point `VITE_API_URL` to your API server instead of localhost.

### Q: Do I need Supabase for payments?
**A:** No, but it's recommended to store payment records for audit trail.

### Q: How do I handle duplicate payments?
**A:** Always verify `sessionId` is unique before processing. The backend does this automatically.

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| "Stripe key not configured" | Set `STRIPE_SECRET_KEY` environment variable |
| CORS errors | PHP files have CORS headers enabled, should work |
| "Invalid JSON" | Make sure Content-Type is `application/json` |
| Payment doesn't verify | Check `sessionId` in URL matches what you're verifying |
| "Composer not found" | Download Stripe SDK manually to `api/vendor/` |

## 📞 Support

- **Stripe Docs**: https://stripe.com/docs
- **Stripe API Reference**: https://stripe.com/docs/api
- **Test Cards**: https://stripe.com/docs/testing
- **Dashboard**: https://dashboard.stripe.com

## ✨ What's Next?

1. ✅ Read `SIMPLE_STRIPE_SETUP.md` for detailed setup
2. ✅ See `STRIPE_EXAMPLE_BUY_VOTES.md` for full implementation
3. ✅ Create your payment page using `SimplePayment` component
4. ✅ Add database tables to store payments
5. ✅ Test with Stripe test cards
6. ✅ Go live when ready!

---

**Made Simple. No Edge Functions. No Complexity. Just PHP & React.** ✨
