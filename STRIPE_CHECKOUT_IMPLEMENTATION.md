# Stripe Checkout Implementation for Medication Store

## Overview
This implementation uses **Supabase Edge Functions** (not local PHP server) to handle Stripe checkout for doctors purchasing medications.

## Flow Diagram

```
Doctor → Cart → Click Pay → Supabase Edge Function → Stripe Hosted Checkout Page
                                                              ↓
                                         [Doctor fills card details on Stripe]
                                                              ↓
                                   Payment Success ← or → Payment Canceled
                                         ↓                        ↓
                              Payment Success Page        Payment Canceled Page
                                         ↓
                          Verify Payment Edge Function
                                         ↓
                              Create Order in Database
                                         ↓
                              Clear Cart & Show Success
```

## Files Modified/Created

### 1. **Supabase Edge Functions**

#### `supabase/functions/create-checkout-session/index.ts`
- Creates Stripe checkout session
- Stores cart data, shipping address, and notes in session metadata
- Returns Stripe checkout URL for redirect

#### `supabase/functions/verify-payment/index.ts` (NEW)
- Verifies payment after Stripe redirect
- Retrieves session from Stripe
- Creates order in database
- Creates order items
- Clears doctor's cart

### 2. **Frontend Pages**

#### `src/pages/MedicationStorePage.tsx`
- Cart management
- Checkout flow with shipping address
- Calls `create-checkout-session` function
- Redirects to Stripe hosted checkout page

#### `src/pages/PaymentSuccessPage.tsx`
- Handles successful payment return
- Calls `verify-payment` function
- Displays order confirmation
- Shows order ID and details

#### `src/pages/PaymentCanceledPage.tsx`
- Handles canceled payment
- Redirects back to medication store
- Cart items remain saved

## Deployment Steps

### Step 1: Deploy Supabase Edge Functions

```powershell
# Navigate to your project
cd c:\Users\yassi\Desktop\homedoc

# Deploy create-checkout-session function
supabase functions deploy create-checkout-session

# Deploy verify-payment function
supabase functions deploy verify-payment
```

### Step 2: Set Supabase Secrets

You need to set these environment variables in Supabase:

```powershell
# Set Stripe Secret Key
supabase secrets set STRIPE_SECRET_KEY=your_stripe_secret_key_here

# Verify secrets are set
supabase secrets list
```

### Step 3: Configure Environment Variables

Create/update your `.env` file:

```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Step 4: Test the Flow

1. **Login as a doctor**
2. **Navigate to Medication Store** (click the green banner on dashboard)
3. **Add medications to cart**
4. **Click the Cart button** (top right)
5. **Fill in shipping address**
6. **Click "Proceed to Payment"**
7. **You'll be redirected to Stripe checkout page**

## Stripe Test Cards

Use these test card numbers on the Stripe checkout page:

### Successful Payment
```
Card Number: 4242 4242 4242 4242
Expiry: Any future date (e.g., 12/25)
CVC: Any 3 digits (e.g., 123)
ZIP: Any 5 digits (e.g., 12345)
```

### Declined Payment
```
Card Number: 4000 0000 0000 0002
Expiry: Any future date
CVC: Any 3 digits
ZIP: Any 5 digits
```

### Requires Authentication
```
Card Number: 4000 0025 0000 3155
Expiry: Any future date
CVC: Any 3 digits
ZIP: Any 5 digits
```

## Database Tables Used

### `medication_orders`
- Stores order information
- Fields: `doctor_id`, `total_amount`, `status`, `shipping_address`, `notes`, `payment_method`, `payment_status`, `stripe_session_id`

### `medication_order_items`
- Stores individual items in each order
- Fields: `order_id`, `medication_id`, `quantity`, `price_at_purchase`, `subtotal`

### `medication_cart`
- Temporary cart storage (cleared after successful payment)
- Fields: `doctor_id`, `medication_id`, `quantity`

## Key Features

✅ **No Local PHP Server** - Everything runs on Supabase Edge Functions
✅ **Stripe Hosted Checkout** - Uses Stripe's secure payment page
✅ **Automatic Order Creation** - Orders created after successful payment
✅ **Cart Persistence** - Cart saved if payment canceled
✅ **Error Handling** - Graceful error messages and recovery
✅ **Payment Verification** - Double-checks payment status with Stripe
✅ **Metadata Storage** - Shipping address and notes saved in Stripe session

## Testing Checklist

- [ ] Edge functions deployed successfully
- [ ] Stripe secret key set in Supabase
- [ ] Environment variables configured
- [ ] Can add items to cart
- [ ] Cart displays correctly with quantities
- [ ] Shipping address required before checkout
- [ ] Redirects to Stripe checkout page
- [ ] Can complete payment with test card
- [ ] Redirects to success page after payment
- [ ] Order created in database
- [ ] Order items created correctly
- [ ] Cart cleared after successful payment
- [ ] Can cancel payment and return to store
- [ ] Cart items preserved after cancellation

## Troubleshooting

### "Failed to create checkout session"
- Check if edge function is deployed: `supabase functions list`
- Verify Stripe secret key is set: `supabase secrets list`
- Check browser console for detailed error

### "Payment verification failed"
- Check if verify-payment function is deployed
- Ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are available in function
- Check Supabase logs: `supabase functions logs verify-payment`

### "No checkout URL returned"
- Check Stripe secret key is valid
- Verify cart has items
- Check function logs for errors

### Order not created after payment
- Check verify-payment function logs
- Verify database permissions for `medication_orders` table
- Check if `stripe_session_id` is unique (can't create duplicate orders)

## URLs Flow

```
1. Medication Store:     /medication-store
2. Stripe Checkout:      https://checkout.stripe.com/... (Stripe hosted)
3. Success Return:       /payment-success?session_id=...
4. Canceled Return:      /payment-canceled
```

## Security Notes

🔒 **Secret Key**: Never expose `STRIPE_SECRET_KEY` in frontend code
🔒 **Edge Functions**: Run on Supabase servers (server-side)
🔒 **Payment Verification**: Always verify payment status server-side
🔒 **Session Metadata**: Limited to 500 characters per key
🔒 **CORS**: Configured to allow frontend access

## Next Steps

After testing, you can:
1. Switch to live Stripe keys for production
2. Add email notifications after successful orders
3. Add order tracking functionality
4. Add order history page for doctors
5. Add webhook handler for additional payment events

---

**Ready to test!** Just deploy the functions and try making a purchase! 🚀
