import { useEffect, useState } from 'react';
import { CheckCircle, Loader2, Package, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export function PaymentSuccessPage() {
  const navigate = useNavigate();
  const [orderData, setOrderData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyPayment = async () => {
      const params = new URLSearchParams(window.location.search);
      const sessionId = params.get('session_id');

      if (!sessionId) {
        setError('No session ID found');
        setLoading(false);
        return;
      }

      try {
        // Call verify-payment edge function
        const { data, error: functionError } = await supabase.functions.invoke(
          'verify-payment',
          {
            body: { sessionId },
          }
        );

        if (functionError) {
          console.error('Verification error:', functionError);
          setError(functionError.message || 'Failed to verify payment');
          setLoading(false);
          return;
        }

        if (data?.success) {
          setOrderData(data.order);
        } else {
          setError(data?.error || 'Payment verification failed');
        }
      } catch (err: any) {
        console.error('Error:', err);
        setError(err.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-700 font-semibold">Verifying your payment...</p>
          <p className="text-gray-500 text-sm mt-2">Please wait while we process your order</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-red-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Verification Error</h1>
          
          <p className="text-gray-600 mb-6">{error}</p>

          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-yellow-700">
              Your payment may have been successful, but we couldn't verify it automatically. 
              Please contact support with your payment details.
            </p>
          </div>

          <button
            onClick={() => navigate('/medication-store')}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all font-semibold"
          >
            Return to Store
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h1>
        
        <p className="text-gray-600 mb-6">
          Thank you for your purchase! Your order has been confirmed and we will contact you soon with delivery details.
        </p>

        {orderData && (
          <div className="bg-gradient-to-r from-green-50 to-teal-50 border-2 border-green-200 rounded-xl p-6 mb-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-600 font-medium">Order ID:</span>
              <span className="font-mono text-sm text-gray-900 font-bold">
                #{orderData.id?.substring(0, 8).toUpperCase()}
              </span>
            </div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-600 font-medium">Total Amount:</span>
              <span className="text-2xl font-bold text-green-600">
                ${orderData.total_amount?.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 font-medium">Status:</span>
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                Completed
              </span>
            </div>
          </div>
        )}

        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-700 flex items-start gap-2">
            <Package className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>
              Your order is confirmed! We will contact you soon with shipping and delivery details.
            </span>
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => navigate('/order-history')}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all font-semibold flex items-center justify-center gap-2"
          >
            <Package className="w-5 h-5" />
            View All Orders
          </button>
          
          <button
            onClick={() => navigate('/medication-store')}
            className="w-full bg-gradient-to-r from-green-600 to-teal-600 text-white py-3 rounded-lg hover:from-green-700 hover:to-teal-700 transition-all font-semibold flex items-center justify-center gap-2"
          >
            Continue Shopping
            <ArrowRight className="w-5 h-5" />
          </button>
          
          <button
            onClick={() => navigate('/doctor-dashboard')}
            className="w-full bg-gray-200 text-gray-900 py-3 rounded-lg hover:bg-gray-300 transition-all font-semibold"
          >
            Back to Dashboard
          </button>
        </div>

        <p className="text-xs text-gray-500 mt-6">
          A confirmation email has been sent to your registered email address.
        </p>
      </div>
    </div>
  );
}

