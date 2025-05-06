import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { LockClosedIcon, ArrowRightIcon, ExclamationCircleIcon } from '@heroicons/react/24/solid';
import { ScaleIcon } from '@heroicons/react/24/outline';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Animation states
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    // Clear the "just_logged_out" flag when the login page loads
    localStorage.removeItem('just_logged_out');
    
    // Redirect if already authenticated
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || "/";
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location.state]);

  useEffect(() => {
    // Trigger animation after component mounts
    const timer = setTimeout(() => setShowForm(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    
    setError('');
    setLoading(true);
    
    try {
      console.log('Submitting login form with email:', email);
      // Change the login endpoint to match your backend API structure
      await login(email, password);
      console.log('Login successful, user authenticated');
      
      // Get redirect path or default to home
      const from = location.state?.from?.pathname || "/";
      navigate(from, { replace: true });
    } catch (err) {
      console.error('Login error details:', err);
      
      // Better error message handling
      let errorMessage = 'Invalid email or password. Please try again.';
      
      if (err.status === 500) {
        errorMessage = 'Server error. Please try again later or contact support.';
      } else if (err.data) {
        if (err.data.detail) {
          errorMessage = err.data.detail;
        } else if (err.data.non_field_errors) {
          errorMessage = err.data.non_field_errors.join(' ');
        } else if (typeof err.data === 'object') {
          // Combine all error messages
          errorMessage = Object.entries(err.data)
            .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(' ') : value}`)
            .join('; ');
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left panel - Branding & Visual */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary-600 justify-center items-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-400 to-primary-800 opacity-90"></div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-20">
          <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-white opacity-10"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-white opacity-10"></div>
        </div>
        
        <div className="relative z-10 max-w-md text-white p-12">
          <div className="flex items-center mb-8">
            <ScaleIcon className="h-12 w-12 mr-4" />
            <h1 className="text-4xl font-bold">EasyLaw</h1>
          </div>
          <h2 className="text-3xl font-bold mb-6">Legal technology simplified</h2>
          <p className="text-xl opacity-90 mb-8">
            Your complete legal practice management solution with AI-powered capabilities for modern law firms.
          </p>
          <div className="flex space-x-3 mt-10">
            <div className="h-2 w-2 rounded-full bg-white opacity-60"></div>
            <div className="h-2 w-8 rounded-full bg-white"></div>
            <div className="h-2 w-2 rounded-full bg-white opacity-60"></div>
            <div className="h-2 w-2 rounded-full bg-white opacity-60"></div>
          </div>
        </div>
      </div>
      
      {/* Right panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div 
          className={`max-w-md w-full transition-all duration-700 ease-out transform ${
            showForm ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`}
        >
          <div className="text-center mb-10">
            <div className="flex justify-center lg:hidden mb-6">
              <ScaleIcon className="h-10 w-10 text-primary-600" />
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900 mb-1">Welcome back</h2>
            <p className="text-gray-500">Sign in to access your account</p>
          </div>
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1 relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className={`appearance-none block w-full px-3 py-3 border ${
                    error ? 'border-red-300' : 'border-gray-300'
                  } rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200 sm:text-sm`}
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <Link to="/forgot-password" className="text-sm font-medium text-primary-600 hover:text-primary-500 transition-colors duration-200">
                  Forgot password?
                </Link>
              </div>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className={`appearance-none block w-full px-3 py-3 border ${
                    error ? 'border-red-300' : 'border-gray-300'
                  } rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200 sm:text-sm`}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-3 flex items-center">
                <ExclamationCircleIcon className="h-5 w-5 text-red-500 mr-2" aria-hidden="true" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded transition-colors duration-200"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading || isAuthenticated}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200 disabled:opacity-70"
              >
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  <LockClosedIcon 
                    className={`h-5 w-5 text-primary-300 group-hover:text-primary-200 transition-colors duration-200 ${loading ? 'animate-pulse' : ''}`} 
                    aria-hidden="true" 
                  />
                </span>
                {loading ? 'Signing in...' : 'Sign in'}
                {!loading && (
                  <ArrowRightIcon className="ml-2 -mr-1 h-4 w-4 text-white group-hover:translate-x-1 transition-transform duration-200" />
                )}
              </button>
            </div>
          </form>

          <div className="mt-4">
            <button 
              type="button"
              onClick={() => {
                // Add debugging info
                const token = localStorage.getItem('token');
                console.log('Current token:', token ? 'exists' : 'none');
                if (token) {
                  try {
                    const parts = token.split('.');
                    if (parts.length === 3) {
                      const payload = JSON.parse(atob(parts[1]));
                      console.log('Token payload:', payload);
                      const expiry = new Date(payload.exp * 1000);
                      console.log('Token expires:', expiry.toLocaleString());
                    }
                  } catch (e) {
                    console.error('Error parsing token:', e);
                  }
                }
              }}
              className="text-xs text-gray-500 underline"
            >
              Debug Auth
            </button>
          </div>
          
          <div className="mt-10 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500 transition-colors duration-200">
                Create a free account
              </Link>
            </p>
          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-xs text-center text-gray-500">
              By continuing, you agree to EasyLaw's <Link to="/terms" className="text-primary-600 hover:underline">Terms of Service</Link> and <Link to="/privacy" className="text-primary-600 hover:underline">Privacy Policy</Link>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
