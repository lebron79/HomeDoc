# Example: Buy Votes Implementation

This guide shows how to implement a "Buy Votes" feature using the simple Stripe payment flow.

## Step 1: Create the BuyVotes Page

Create `src/pages/BuyVotesPage.tsx`:

```tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SimplePayment } from '../components/Payment/SimplePayment';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export function BuyVotesPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const votePackages = [
    { id: '5', votes: 5, price: 499, name: '5 Votes', description: 'Perfect for getting started' },
    { id: '10', votes: 10, price: 899, name: '10 Votes', description: 'Most popular' },
    { id: '50', votes: 50, price: 3999, name: '50 Votes', description: 'Best value' },
    { id: '100', votes: 100, price: 7999, name: '100 Votes', description: 'Super booster' },
  ];

  const handlePaymentComplete = async (paymentData: any) => {
    try {
      setProcessing(true);

      const selectedVotes = votePackages.find(p => p.id === selectedPackage);
      if (!selectedVotes) throw new Error('Package not found');

      // Step 1: Record payment in database
      const { error: paymentError } = await supabase
        .from('payments')
        .insert({
          user_id: user?.id,
          amount: paymentData.amount,
          session_id: paymentData.sessionId,
          payment_intent_id: paymentData.paymentIntentId,
          item_name: paymentData.itemName,
          status: 'completed',
          created_at: new Date(),
        });

      if (paymentError) throw paymentError;

      // Step 2: Add votes to user's account
      const { data: userVotes, error: fetchError } = await supabase
        .from('user_votes')
        .select('total_votes')
        .eq('user_id', user?.id)
        .single();

      if (!fetchError && userVotes) {
        // Update existing record
        await supabase
          .from('user_votes')
          .update({ total_votes: userVotes.total_votes + selectedVotes.votes })
          .eq('user_id', user?.id);
      } else {
        // Create new record
        await supabase
          .from('user_votes')
          .insert({
            user_id: user?.id,
            total_votes: selectedVotes.votes,
          });
      }

      // Step 3: Log the purchase
      console.log('✓ Payment verified and votes added!');
      console.log('Payment Data:', paymentData);

      // Navigate to success page
      navigate('/payment-success?session_id=' + paymentData.sessionId);
    } catch (error) {
      console.error('Error processing payment:', error);
      alert('Error processing payment. Please contact support.');
    } finally {
      setProcessing(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please log in to buy votes</h1>
          <button
            onClick={() => navigate('/auth')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Boost Your Profile</h1>
          <p className="text-xl text-gray-600">Purchase votes to increase your visibility</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {votePackages.map((pkg) => (
            <div
              key={pkg.id}
              onClick={() => setSelectedPackage(pkg.id)}
              className={`p-6 rounded-lg cursor-pointer transition-all transform hover:scale-105 ${
                selectedPackage === pkg.id
                  ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-xl scale-105'
                  : 'bg-white text-gray-900 shadow-md hover:shadow-lg'
              }`}
            >
              <div className="text-3xl font-bold mb-2">{pkg.votes}</div>
              <div className="text-sm font-semibold opacity-75 mb-2">Votes</div>
              <div className={`text-lg font-bold mb-2 ${
                selectedPackage === pkg.id ? 'text-white' : 'text-green-600'
              }`}>
                ${(pkg.price / 100).toFixed(2)}
              </div>
              <div className="text-xs opacity-75">{pkg.description}</div>
            </div>
          ))}
        </div>

        {selectedPackage && (
          <div className="max-w-2xl mx-auto">
            <SimplePayment
              amount={parseInt(votePackages.find(p => p.id === selectedPackage)?.price || '0')}
              itemName={votePackages.find(p => p.id === selectedPackage)?.name || ''}
              itemDescription={`Get ${votePackages.find(p => p.id === selectedPackage)?.votes} votes to boost your profile visibility`}
              onPaymentComplete={handlePaymentComplete}
            />
          </div>
        )}

        {!selectedPackage && (
          <div className="text-center">
            <p className="text-gray-600">← Select a package to get started</p>
          </div>
        )}
      </div>
    </div>
  );
}
```

## Step 2: Add Routes to Your App

Update `src/App.tsx`:

```tsx
import { BuyVotesPage } from './pages/BuyVotesPage';
import { PaymentSuccessPage } from './pages/PaymentSuccessPage';
import { PaymentCanceledPage } from './pages/PaymentCanceledPage';

// In your router configuration:
{
  path: '/buy-votes',
  element: <BuyVotesPage />,
},
{
  path: '/payment-success',
  element: <PaymentSuccessPage />,
},
{
  path: '/payment-canceled',
  element: <PaymentCanceledPage />,
},
```

## Step 3: Create Database Table

Run this SQL in Supabase:

```sql
-- Payments table
CREATE TABLE payments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  amount INTEGER NOT NULL,
  session_id TEXT UNIQUE NOT NULL,
  payment_intent_id TEXT NOT NULL,
  item_name TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- User votes table
CREATE TABLE user_votes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL UNIQUE,
  total_votes INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_votes ENABLE ROW LEVEL SECURITY;

-- Policies for payments (users can only see their own)
CREATE POLICY "Users can view own payments" ON payments
  FOR SELECT USING (auth.uid() = user_id);

-- Policies for user_votes
CREATE POLICY "Users can view all votes" ON user_votes
  FOR SELECT USING (true);

CREATE POLICY "Users can update own votes" ON user_votes
  FOR UPDATE USING (auth.uid() = user_id);
```

## Step 4: Test

1. Start PHP server: `php -S localhost:8080`
2. Start Vite: `npm run dev`
3. Navigate to `/buy-votes`
4. Click on a package and click "Pay with Stripe"
5. Use Stripe test card: `4242 4242 4242 4242`
6. Use any future expiration date and any 3-digit CVC
7. Complete the payment
8. You should be redirected to success page and votes should be added

## Test Cards

These cards can be used in test mode:

| Card Number | CVC | Expiration | Behavior |
|---|---|---|---|
| 4242 4242 4242 4242 | Any | Any future | Successful payment |
| 4000 0000 0000 9995 | Any | Any future | Card declined |
| 4000 0025 0000 3155 | Any | Any future | Requires authentication |

## Stripe Test Cards: https://stripe.com/docs/testing

## Real Stripe Keys

When ready to go live:

1. Log in to Stripe Dashboard: https://dashboard.stripe.com
2. Switch from "Test Mode" to "Live Mode" (top right)
3. Get your LIVE secret key (starts with `sk_live_`)
4. Replace test key with live key
5. Update frontend environment variable

**IMPORTANT**: In production, only use HTTPS and keep your secret key secure!
