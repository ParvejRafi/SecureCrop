import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Input, Button } from '../components/UI';
import { Mail, Lock, User as UserIcon, AlertCircle, CheckCircle, Phone, ArrowLeft } from 'lucide-react';

const Register: React.FC = () => {
  const { register } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    password_confirm: '',
    phone_number: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Get return URL and service name from navigation state
  const returnTo = (location.state as any)?.returnTo;
  const serviceName = (location.state as any)?.serviceName;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate passwords match
    if (formData.password !== formData.password_confirm) {
      setError('Passwords do not match');
      return;
    }

    // Validate password strength
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);

    try {
      await register(formData);
      setSuccess('Registration successful! Redirecting to login...');

      // Redirect to login with return URL
      setTimeout(() => {
        navigate('/login', {
          state: {
            returnTo,
            serviceName,
            message: serviceName
              ? `Registration successful! Login to access ${serviceName}`
              : 'Registration successful! Please login.'
          }
        });
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const passwordsMatch = formData.password && formData.password === formData.password_confirm;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <Link to="/" className="inline-flex items-center space-x-2 text-green-600 hover:text-green-700 transition mb-6">
            <ArrowLeft size={20} />
            <span className="font-medium">Back to Home</span>
          </Link>
          <div className="text-center">
            <h1 className="text-4xl font-bold text-primary-700 mb-2">🌾 SecureCrop</h1>
            <h2 className="text-2xl font-bold text-gray-900">Create Account</h2>
            <p className="mt-2 text-sm text-gray-600">
              {serviceName
                ? `Register to access ${serviceName}`
                : 'Join us to get personalized crop recommendations'}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          {serviceName && !success && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800 font-medium mb-2">
                🌾 Welcome to SecureCrop!
              </p>
              <p className="text-xs text-blue-700">
                Create your account to access <strong>{serviceName}</strong>.
                After registration, you'll be redirected to login.
              </p>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2 text-green-800">
              <CheckCircle size={20} />
              <span className="text-sm">{success}</span>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2 text-red-800">
              <AlertCircle size={20} />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="relative">
              <Mail className="absolute left-3 top-9 text-gray-400" size={20} />
              <Input
                label="Email Address"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your.email@example.com"
                required
                className="pl-10"
              />
            </div>

            <div className="relative">
              <UserIcon className="absolute left-3 top-9 text-gray-400" size={20} />
              <Input
                label="Username"
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Choose a username"
                required
                className="pl-10"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-9 text-gray-400" size={20} />
              <Input
                label="Password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="At least 8 characters"
                required
                className="pl-10"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-9 text-gray-400" size={20} />
              {passwordsMatch && formData.password_confirm && (
                <CheckCircle className="absolute right-3 top-9 text-green-500" size={20} />
              )}
              <Input
                label="Confirm Password"
                type="password"
                name="password_confirm"
                value={formData.password_confirm}
                onChange={handleChange}
                placeholder="Re-enter your password"
                required
                className="pl-10"
              />
            </div>

            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-xs text-blue-800">
                <strong>Password Requirements:</strong> Minimum 8 characters, include numbers and letters
              </p>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              loading={loading}
            >
              Create Account
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link
                to="/login"
                state={{ returnTo, serviceName }}
                className="font-medium text-primary-600 hover:text-primary-700"
              >
                Sign in here
              </Link>
            </p>
            {returnTo && (
              <p className="text-xs text-gray-500 mt-2">
                After registration and login, you'll be redirected to your requested service
              </p>
            )}
          </div>
        </div>

        <div className="text-center text-xs text-gray-500">
          <p>By registering, you agree to our terms of service and privacy policy</p>
        </div>
      </div>
    </div>
  );
};

export default Register;
