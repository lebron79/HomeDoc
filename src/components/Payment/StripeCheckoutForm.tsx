import { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Loader2, CreditCard, Lock } from 'lucide-react';

interface StripeCheckoutFormProps {
  amount: number;
  onSuccess: (paymentIntentId: string) => void;
  onCancel: () => void;
}

export function StripeCheckoutForm({ amount, onSuccess, onCancel }: StripeCheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setError(null);

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setError('Card element not found');
      setProcessing(false);
      return;
    }

    try {
      // Create payment method
      const { error: methodError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });

      if (methodError) {
        throw new Error(methodError.message);
      }

      // In a real application, you would:
      // 1. Send the payment method to your backend
      // 2. Create a payment intent on the backend
      // 3. Confirm the payment
      
      // For demo purposes, we'll simulate a successful payment
      // In production, replace this with actual Stripe payment processing
      console.log('Payment Method created:', paymentMethod.id);
      
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate success
      onSuccess(paymentMethod.id);
    } catch (err: any) {
      setError(err.message || 'Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
        fontFamily: 'system-ui, -apple-system, sans-serif',
      },
      invalid: {
        color: '#ef4444',
        iconColor: '#ef4444',
      },
    },
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <CreditCard className="w-4 h-4" />
          Card Information
        </label>
        <div className="border-2 border-gray-200 rounded-lg p-4 bg-white hover:border-green-400 transition-colors">
          <CardElement options={cardElementOptions} />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-700 font-medium">{error}</p>
        </div>
      )}

      <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-lg p-4 border-2 border-green-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Total Amount</span>
          <span className="text-2xl font-bold text-green-600">${amount.toFixed(2)}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
          <Lock className="w-3 h-3" />
          Secure payment powered by Stripe
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={!stripe || processing}
          className="flex-1 bg-gradient-to-r from-green-600 to-teal-600 text-white py-4 rounded-xl hover:from-green-700 hover:to-teal-700 transition-all shadow-lg font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {processing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Processing Payment...
            </>
          ) : (
            <>
              <Lock className="w-5 h-5" />
              Pay ${amount.toFixed(2)}
            </>
          )}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={processing}
          className="px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-semibold disabled:opacity-50"
        >
          Cancel
        </button>
      </div>

      <div className="text-center">
        <p className="text-xs text-gray-500">
          Your payment information is encrypted and secure
        </p>
      </div>
    </form>
  );
}
