import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Input, Button } from '../components/UI';
import { Lock, ArrowLeft, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import api from '../services/api';

const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  // Verify token on component mount
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setError('No reset token provided. Please use the link from your email.');
        setVerifying(false);
        return;
      }

      try {
        const response = await api.get('/auth/password-reset/verify/', {
          params: { token }
        });

        if (response.data.valid) {
          setTokenValid(true);
          setUserEmail(response.data.email);
        } else {
          setError(response.data.error || 'Invalid or expired reset token.');
        }
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to verify reset token.');
      } finally {
        setVerifying(false);
      }
    };

    verifyToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Client-side validation
    if (newPassword !== confirmPassword) {
      setError("Passwords don't match. Please try again.");
      setLoading(false);
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      setLoading(false);
      return;
    }

    try {
      const response = await api.post('/auth/password-reset/confirm/', {
        token,
        new_password: newPassword,
        new_password_confirm: confirmPassword,
      });

      setSuccess(true);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login', { 
          state: { 
            message: 'Password reset successful! Please login with your new password.' 
          } 
        });
      }, 3000);
    } catch (err: any) {
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else if (err.response?.data?.new_password) {
        // Handle validation errors
        const passwordErrors = err.response.data.new_password;
        if (Array.isArray(passwordErrors)) {
          setError(passwordErrors.join(' '));
        } else {
          setError(passwordErrors);
        }
      } else {
        setError('Failed to reset password. Please try again.');
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
            <h2 className="text-2xl font-bold text-gray-900">Reset Password</h2>
            <p className="mt-2 text-sm text-gray-600">
              {tokenValid && userEmail 
                ? `Create a new password for ${userEmail}`
                : 'Set a new password for your account'
              }
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          {verifying ? (
            <div className="text-center py-8">
              <Loader className="animate-spin mx-auto text-primary-600 mb-4" size={40} />
              <p className="text-gray-600">Verifying reset token...</p>
            </div>
          ) : !tokenValid ? (
            <div>
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2 text-red-800">
                <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">{error || 'Invalid Reset Link'}</p>
                  <p className="text-xs mt-2">
                    This password reset link is invalid or has expired. 
                    Password reset links are only valid for 1 hour.
                  </p>
                </div>
              </div>
              
              <div className="space-y-3">
                <Button
                  onClick={() => navigate('/forgot-password')}
                  variant="primary"
                  className="w-full"
                >
                  Request New Reset Link
                </Button>
                
                <Button
                  onClick={() => navigate('/login')}
                  variant="outline"
                  className="w-full"
                >
                  Back to Login
                </Button>
              </div>
            </div>
          ) : success ? (
            <div>
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start space-x-2 text-green-800">
                  <CheckCircle size={24} className="flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium mb-2">Password Reset Successful! 🎉</p>
                    <p className="text-xs text-green-700">
                      Your password has been changed successfully. 
                      You will be redirected to the login page in a few seconds.
                    </p>
                  </div>
                </div>
              </div>
              
              <Button
                onClick={() => navigate('/login')}
                variant="primary"
                className="w-full"
              >
                Go to Login Now
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2 text-red-800">
                  <AlertCircle size={20} />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              <div className="space-y-4">
                <div className="relative">
                  <Lock className="absolute left-3 top-9 text-gray-400" size={20} />
                  <Input
                    label="New Password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    required
                    className="pl-10"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Must be at least 8 characters long
                  </p>
                </div>

                <div className="relative">
                  <Lock className="absolute left-3 top-9 text-gray-400" size={20} />
                  <Input
                    label="Confirm New Password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    required
                    className="pl-10"
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full"
                loading={loading}
              >
                Reset Password
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
          )}
        </div>

        <div className="text-center text-xs text-gray-500">
          <p>Secured with data integrity checks and anomaly detection</p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
