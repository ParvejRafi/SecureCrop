import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Input, Button } from '../components/UI';
import { Mail, Lock, AlertCircle, ArrowLeft, CheckCircle } from 'lucide-react';

const Login: React.FC = () => {
  const { login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Get return URL and message from navigation state
  const returnTo = (location.state as any)?.returnTo;
  const message = (location.state as any)?.message;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password, returnTo);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

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
            <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
            <p className="mt-2 text-sm text-gray-600">
              {(location.state as any)?.serviceName 
                ? `Login to access ${(location.state as any).serviceName}` 
                : 'Sign in to access your dashboard'}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          {returnTo === '/services' && !message && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800 font-medium mb-2">
                🔒 Login Required
              </p>
              <p className="text-xs text-blue-700">
                Please login to view and access our services. 
                If you're a first-time user, please register first.
              </p>
            </div>
          )}

          {(location.state as any)?.serviceName && !message && returnTo !== '/services' && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800 font-medium mb-2">
                🔒 Access Required
              </p>
              <p className="text-xs text-blue-700">
                Please login to access <strong>{(location.state as any).serviceName}</strong>. 
                If you're a first-time user, please register first.
              </p>
            </div>
          )}

          {message && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2 text-green-800">
              <CheckCircle size={20} />
              <span className="text-sm">{message}</span>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2 text-red-800">
              <AlertCircle size={20} />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
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

              <div className="relative">
                <Lock className="absolute left-3 top-9 text-gray-400" size={20} />
                <Input
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
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
              Sign In
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link 
                to="/register" 
                state={{ returnTo }}
                className="font-medium text-primary-600 hover:text-primary-700"
              >
                Register here
              </Link>
            </p>
            {returnTo && (
              <p className="text-xs text-gray-500 mt-2">
                You'll be redirected to your requested service after login
              </p>
            )}
          </div>
        </div>

        <div className="text-center text-xs text-gray-500">
          <p>Secured with data integrity checks and anomaly detection</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
