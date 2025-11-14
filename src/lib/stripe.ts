import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe with your publishable key from environment variables
const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_51SOP9wQ0KOHRkcYXX1nE9swuI7ebRpdUEdpxQAS66DJYDWnqqv363uh1ANOg9M98U2LETOYGqecR0dvp5tMhS2nY00c2Sas7sH';

if (!stripeKey) {
  throw new Error('Missing Stripe publishable key. Please add VITE_STRIPE_PUBLISHABLE_KEY to your .env file');
}

export const stripePromise = loadStripe(stripeKey);
