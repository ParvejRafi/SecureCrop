import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Input, Button } from '../components/UI';
import { Mail, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';
import api from '../services/api';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await api.post('/auth/password-reset/', {
        email: email.toLowerCase(),
      });

      setSuccess(response.data.message);
      setEmail(''); // Clear the form
      
      // If in development and debug link is provided
      if (response.data.debug_link) {
        console.log('Password reset link:', response.data.debug_link);
      }
    } catch (err: any) {
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('Failed to send reset email. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <Link to="/login" className="inline-flex items-center space-x-2 text-green-600 hover:text-green-700 transition mb-6">
            <ArrowLeft size={20} />
            <span className="font-medium">Back to Login</span>
          </Link>
          <div className="text-center">
            <h1 className="text-4xl font-bold text-primary-700 mb-2">🌾 SecureCrop</h1>
            <h2 className="text-2xl font-bold text-gray-900">Forgot Password?</h2>
            <p className="mt-2 text-sm text-gray-600">
              No worries! Enter your email and we'll send you reset instructions.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2 text-red-800">
              <AlertCircle size={20} />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start space-x-2 text-green-800 mb-2">
                <CheckCircle size={20} className="flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">{success}</p>
                  <p className="text-xs mt-2 text-green-700">
                    Please check your email inbox (and spam folder) for the password reset link.
                    The link will expire in 1 hour.
                  </p>
                </div>
              </div>
            </div>
          )}

          {!success ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative">
                <Mail className="absolute left-3 top-9 text-gray-400" size={20} />
                <Input
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  required
                  className="pl-10"
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full"
                loading={loading}
              >
                Send Reset Link
              </Button>

              <div className="text-center text-sm text-gray-600">
                <p>Remember your password?{' '}
                  <Link 
                    to="/login" 
                    className="font-medium text-primary-600 hover:text-primary-700"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            </form>
          ) : (
            <div className="text-center">
              <Button
                onClick={() => {
                  setSuccess('');
                  setEmail('');
                }}
                variant="outline"
                className="w-full"
              >
                Send Another Reset Link
              </Button>
              
              <div className="mt-4 text-sm text-gray-600">
                <Link 
                  to="/login" 
                  className="font-medium text-primary-600 hover:text-primary-700"
                >
                  Return to Login
                </Link>
              </div>
            </div>
          )}
        </div>

        <div className="text-center text-xs text-gray-500">
          <p>Secured with data integrity checks and anomaly detection</p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
