import { XCircle, ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function PaymentCanceledPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-12 h-12 text-red-600" />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Canceled</h1>
        
        <p className="text-gray-600 mb-6">
          Your payment was not completed. No charges have been made to your account.
        </p>

        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-yellow-700">
            Your cart items are still saved. You can return to the store and try again whenever you're ready.
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => navigate('/medication-store')}
            className="w-full bg-gradient-to-r from-green-600 to-teal-600 text-white py-3 rounded-lg hover:from-green-700 hover:to-teal-700 transition-all font-semibold flex items-center justify-center gap-2"
          >
            <ShoppingCart className="w-5 h-5" />
            Return to Store
          </button>
          
          <button
            onClick={() => navigate('/doctor-dashboard')}
            className="w-full bg-gray-200 text-gray-900 py-3 rounded-lg hover:bg-gray-300 transition-all font-semibold"
          >
            Back to Dashboard
          </button>
        </div>

        <p className="text-xs text-gray-500 mt-6">
          Your payment information was not processed and your card was not charged.
        </p>
      </div>
    </div>
  );
}
