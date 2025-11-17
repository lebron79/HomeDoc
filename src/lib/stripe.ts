import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe with your publishable key from environment variables
const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

if (!stripeKey) {
  throw new Error('Missing Stripe publishable key. Please add VITE_STRIPE_PUBLISHABLE_KEY to your .env file');
}

export const stripePromise = loadStripe(stripeKey);
