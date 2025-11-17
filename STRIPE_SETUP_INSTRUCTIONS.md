# Stripe Checkout Integration Setup

## Step 1: Deploy the Supabase Edge Function

1. **Install Supabase CLI** (if not already installed):
```powershell
scoop install supabase
# or
npm install -g supabase
```

2. **Login to Supabase**:
```powershell
supabase login
```

3. **Link your project**:
```powershell
supabase link --project-ref vebmeyrvgkifagheaoib
```

4. **Set the Stripe Secret Key as environment variable**:
```powershell
supabase secrets set STRIPE_SECRET_KEY=sk_test_YOUR_STRIPE_SECRET_KEY_HERE
```

5. **Deploy the function**:
```powershell
supabase functions deploy create-checkout-session
```

## Step 2: Test the Integration

1. Add items to cart in the medication store
2. Click "Proceed to Checkout"
3. Enter shipping address
4. Click "Pay with Stripe"
5. You'll be redirected to Stripe's hosted checkout page
6. Use test card: `4242 4242 4242 4242`
7. After successful payment, you'll be redirected back to the store
8. Order will be automatically created in the database

## How It Works

1. **Frontend** → Calls Supabase Edge Function with cart data
2. **Edge Function** → Creates Stripe Checkout Session
3. **Stripe** → Redirects user to hosted checkout page
4. **User** → Enters card details on Stripe's secure page
5. **Stripe** → Processes payment and redirects back
6. **Frontend** → Detects success, creates order in database

## Test Cards

- **Success**: 4242 4242 4242 4242
- **Declined**: 4000 0000 0000 9995
- **3D Secure**: 4000 0027 6000 3184

**Expiry**: Any future date (e.g., 12/34)  
**CVC**: Any 3 digits (e.g., 123)  
**ZIP**: Any 5 digits (e.g., 12345)

## Security

✅ Secret key never exposed in frontend  
✅ Card data never touches your servers  
✅ PCI compliant via Stripe  
✅ Secure HTTPS redirects  

## Troubleshooting

**Error: "Failed to redirect to payment"**
- Make sure the Edge Function is deployed
- Check that STRIPE_SECRET_KEY is set correctly
- Verify your Supabase project is linked

**Checkout session not creating**
- Check browser console for errors
- Verify cart has items
- Ensure shipping address is filled

**Payment succeeds but order not created**
- Check the success URL callback
- Verify localStorage has pending_order
- Check browser console for errors
