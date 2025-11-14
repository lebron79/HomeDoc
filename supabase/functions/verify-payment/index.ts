import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

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
    const { sessionId } = await req.json()

    if (!sessionId) {
      throw new Error('Session ID is required')
    }

    // Retrieve the Stripe session
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (session.payment_status !== 'paid') {
      throw new Error('Payment not completed')
    }

    // Get metadata from session
    const { shipping_address, order_notes, cart_data } = session.metadata || {}
    const cart = cart_data ? JSON.parse(cart_data) : []

    // Calculate total
    const totalAmount = cart.reduce((sum: number, item: any) => 
      sum + (item.price * item.quantity), 0
    )

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get doctor ID from email
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('email', session.customer_email)
      .single()

    if (!profile) {
      throw new Error('Doctor profile not found')
    }

    // Create order in database
    const { data: order, error: orderError } = await supabase
      .from('medication_orders')
      .insert({
        doctor_id: profile.id,
        total_amount: totalAmount,
        status: 'completed',
        shipping_address: shipping_address || '',
        notes: order_notes || '',
        payment_method: 'stripe',
        payment_status: 'paid',
        stripe_session_id: sessionId,
      })
      .select()
      .single()

    if (orderError) {
      console.error('Error creating order:', orderError)
      throw orderError
    }

    // Create order items
    const orderItems = cart.map((item: any) => ({
      order_id: order.id,
      medication_id: item.medication_id,
      quantity: item.quantity,
      price_at_purchase: item.price,
      subtotal: item.price * item.quantity,
    }))

    const { error: itemsError } = await supabase
      .from('medication_order_items')
      .insert(orderItems)

    if (itemsError) {
      console.error('Error creating order items:', itemsError)
      throw itemsError
    }

    // Clear the doctor's cart
    await supabase
      .from('medication_cart')
      .delete()
      .eq('doctor_id', profile.id)

    return new Response(
      JSON.stringify({ 
        success: true, 
        order: {
          id: order.id,
          total_amount: totalAmount,
          status: order.status,
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error: any) {
    console.error('Error verifying payment:', error)
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || 'Failed to verify payment' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
