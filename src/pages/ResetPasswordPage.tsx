import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle, Eye, EyeOff, Lock } from 'lucide-react';

export function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Handle the password recovery from URL
    const handleRecovery = async () => {
      // Check for error in URL search params
      const searchParams = new URLSearchParams(window.location.search);
      const urlError = searchParams.get('error');
      
      if (urlError) {
        setError(decodeURIComponent(urlError));
        return;
      }
      
      // Check if we have a recovery token in URL search params (after ?)
      let accessToken = searchParams.get('access_token');
      let type = searchParams.get('type');

      if (type === 'recovery' && accessToken) {
        // Token is valid, user can reset password
        setError('');
        return;
      }

      // Check SECOND hash segment (after the route hash)
      // URL format: /#/reset-password#access_token=...&type=recovery
      const fullHash = window.location.hash; // Gets everything after first #
      const secondHashIndex = fullHash.indexOf('#', 1); // Find second # after the route
      
      if (secondHashIndex > 0) {
        const tokenHash = fullHash.substring(secondHashIndex + 1); // Get everything after second #
        const hashParams = new URLSearchParams(tokenHash);
        accessToken = hashParams.get('access_token');
        type = hashParams.get('type');
        
        if (type === 'recovery' && accessToken) {
          // Token is valid, user can reset password
          setError('');
          return;
        }
      }

      // Otherwise check if we have a valid session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError('Invalid or expired reset link. Please request a new password reset.');
      }
    };

    handleRecovery();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) throw error;

      setSuccess('Password updated successfully! Redirecting to login...');
      
      // Sign out and redirect to login
      setTimeout(async () => {
        await supabase.auth.signOut();
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <Lock className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Reset Password</h1>
            <p className="text-gray-600">Enter your new password below</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* New Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="mt-1 text-sm text-gray-500">Must be at least 6 characters</p>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{success}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              {loading ? 'Updating Password...' : 'Reset Password'}
            </button>

            {/* Back to Login */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Back to Login
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Need help? Contact support
        </p>
      </div>
    </div>
  );
}
