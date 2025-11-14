import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
})

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { 
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

    // Store only essential cart data (to avoid Stripe 500 char metadata limit)
    const compactCart = cart.map((item: any) => ({
      medication_id: item.medication_id,
      quantity: item.quantity,
      price: item.medication.price,
      name: item.medication.name,
    }))

    // Get the origin from the request
    const origin = req.headers.get('origin') || 'http://localhost:5173'

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/payment-canceled`,
      customer_email: email,
      metadata: {
        shipping_address: shippingAddress || '',
        order_notes: orderNotes || '',
        cart_data: JSON.stringify(compactCart),
      },
    })

    return new Response(
      JSON.stringify({ sessionId: session.id, url: session.url }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error: any) {
    console.error('Error creating checkout session:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to create checkout session' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
