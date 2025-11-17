# 🚀 Deploy Stripe Checkout Function - Step by Step

## Follow These Exact Steps:

### Step 1: Open Supabase Dashboard
1. Go to: https://supabase.com/dashboard/project/vebmeyrvgkifagheaoib
2. Log in if needed

### Step 2: Navigate to Edge Functions
1. Click **"Edge Functions"** in the left sidebar menu
2. Click **"Create a new function"** button

### Step 3: Create the Function
1. **Function name**: `create-checkout-session`
2. **Copy the entire code** from this file:
   `supabase/functions/create-checkout-session/index.ts`

3. **Paste it** into the code editor in the dashboard

4. Click **"Deploy function"**

### Step 4: Set Environment Variable (IMPORTANT!)
1. In the Edge Functions page, find **"Function secrets"** or **"Manage secrets"**
2. Click **"Add new secret"**
3. Enter:
   - **Name**: `STRIPE_SECRET_KEY`
   - **Value**: `sk_test_YOUR_STRIPE_SECRET_KEY_HERE`
4. Click **"Save"**

### Step 5: Test It! 🎉
1. Go back to your medication store: http://localhost:5173/medication-store
2. Add items to cart
3. Click "Proceed to Checkout"
4. Enter a shipping address
5. Click **"Pay with Stripe"**
6. You should be redirected to Stripe's checkout page!

## Test Card Details
Use these on Stripe's page:
- **Card Number**: `4242 4242 4242 4242`
- **Expiry**: `12/34` (any future date)
- **CVC**: `123` (any 3 digits)
- **ZIP**: `12345` (any 5 digits)

---

## Troubleshooting

**Still getting CORS error?**
- Make sure you clicked "Deploy function" after pasting the code
- Wait 10-20 seconds after deployment for it to go live
- Refresh your browser page

**Function not found?**
- Check the function name is exactly: `create-checkout-session` (no spaces)
- Verify it shows as "Active" in the dashboard

**Need help?**
Let me know and I'll guide you through it! 🙂

---

## Alternative: Quick Copy-Paste

Here's the EXACT code to paste (copy from below):

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
})

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Max-Age': '86400',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 204,
      headers: corsHeaders 
    })
  }

  try {
    const { cart, shippingAddress, orderNotes, email } = await req.json()

    // Create line items for Stripe
    const lineItems = cart.map((item: any) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.medication.name,
          description: `${item.medication.strength} - ${item.medication.dosage_form}`,
        },
        unit_amount: Math.round(item.medication.price * 100), // Convert to cents
      },
      quantity: item.quantity,
    }))

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${req.headers.get('origin')}/medication-store?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get('origin')}/medication-store?canceled=true`,
      customer_email: email,
      metadata: {
        shipping_address: shippingAddress,
        order_notes: orderNotes,
      },
    })

    return new Response(
      JSON.stringify({ sessionId: session.id, url: session.url }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
```

Just copy everything above (including the backticks is fine - the dashboard will understand it).
