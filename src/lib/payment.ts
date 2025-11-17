/**
 * Simple Stripe Payment Helper
 * No complex setup required - just send requests to PHP endpoints
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost/homedoc/api';

interface CreateCheckoutParams {
  amount: number; // Amount in cents (e.g., 1999 for $19.99)
  email: string;
  userId: string;
  itemName: string;
  itemDescription?: string;
}

interface VerifyPaymentParams {
  sessionId: string;
}

export interface PaymentVerification {
  success: boolean;
  verified: boolean;
  sessionId: string;
  paymentIntentId: string;
  amount: number;
  email: string;
  userId: string;
  itemName: string;
  status: string;
  created: number;
}

/**
 * Step 1: Create a checkout session
 * This returns a Stripe redirect URL
 */
export async function createCheckoutSession(params: CreateCheckoutParams): Promise<{
  sessionId: string;
  url: string;
}> {
  try {
    const response = await fetch(`${API_BASE_URL}/create-checkout-session.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: params.amount,
        email: params.email,
        userId: params.userId,
        itemName: params.itemName,
        itemDescription: params.itemDescription || '',
      }),
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Failed to create checkout session');
    }

    return {
      sessionId: data.sessionId,
      url: data.url,
    };
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
}

/**
 * Step 2: Verify payment was completed
 * Call this after user returns from Stripe
 */
export async function verifyPayment(params: VerifyPaymentParams): Promise<PaymentVerification> {
  try {
    const response = await fetch(`${API_BASE_URL}/verify-payment.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId: params.sessionId,
      }),
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Failed to verify payment');
    }

    return data;
  } catch (error) {
    console.error('Error verifying payment:', error);
    throw error;
  }
}

/**
 * Helper: Redirect user to Stripe checkout
 */
export async function redirectToStripeCheckout(params: CreateCheckoutParams): Promise<void> {
  try {
    const { url } = await createCheckoutSession(params);
    if (url) {
      window.location.href = url;
    }
  } catch (error) {
    console.error('Error redirecting to checkout:', error);
    throw error;
  }
}
