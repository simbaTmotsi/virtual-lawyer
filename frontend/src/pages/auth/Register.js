import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { EnvelopeIcon, LockClosedIcon, UserIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { ScaleIcon } from '@heroicons/react/24/solid';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    password2: '',
    first_name: '',
    last_name: '',
    role: 'attorney', // Default role
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: '',
  });
  const [showContent, setShowContent] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();
  
  // Animation effect
  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 100);
    return () => clearTimeout(timer);
  }, []);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Check password strength when password changes
    if (name === 'password') {
      checkPasswordStrength(value);
    }
  };
  
  const checkPasswordStrength = (password) => {
    let score = 0;
    let feedback = '';
    
    // Check minimum length
    if (password.length < 8) {
      feedback = 'Password must be at least 8 characters long';
    } else {
      // Count criteria: lowercase, uppercase, numbers, special chars
      const hasLowercase = /[a-z]/.test(password);
      const hasUppercase = /[A-Z]/.test(password);
      const hasNumber = /\d/.test(password);
      const hasSpecialChar = /[^a-zA-Z0-9]/.test(password);
      
      const criteriaCount = [hasLowercase, hasUppercase, hasNumber, hasSpecialChar].filter(Boolean).length;
      
      score = criteriaCount;
      
      if (criteriaCount < 3) {
        feedback = 'Password must contain at least 3 of the following: lowercase letters, uppercase letters, numbers, special characters';
      } else {
        feedback = 'Password strength: ' + (criteriaCount === 3 ? 'Good' : 'Strong');
      }
    }
    
    setPasswordStrength({ score, feedback });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validate inputs
    if (!formData.email || !formData.password || !formData.password2 || !formData.first_name || !formData.last_name) {
      setError('All fields are required');
      return;
    }
    
    if (formData.password !== formData.password2) {
      setError('Passwords do not match');
      return;
    }
    
    if (passwordStrength.score < 3) {
      setError(passwordStrength.feedback);
      return;
    }
    
    setLoading(true);
    
    try {
      await register(formData);
      navigate('/login', { state: { registrationSuccess: true } });
    } catch (err) {
      console.error('Registration error:', err);
      
      // Handle different error formats
      if (err.response && err.response.data) {
        const responseData = err.response.data;
        
        if (responseData.detail && Array.isArray(responseData.detail)) {
          // FastAPI validation errors come as an array of detail objects
          const errMessages = responseData.detail.map(err => err.msg).join('; ');
          setError(errMessages || 'Registration failed. Please check your information.');
        } else if (responseData.detail) {
          setError(responseData.detail);
        } else if (typeof responseData === 'object') {
          // Django-style field errors
          const firstError = Object.entries(responseData)[0];
          if (firstError) {
            setError(`${firstError[0]}: ${firstError[1]}`);
          } else {
            setError('Registration failed. Please check your information.');
          }
        } else {
          setError('Registration failed. Please try again.');
        }
      } else {
        setError(err.message || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col md:flex-row">
      {/* Branding Section - Left Side */}
      <div className="hidden md:flex md:w-1/2 bg-primary-600 justify-center items-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500 to-primary-800 opacity-90"></div>
        
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
          <h2 className="text-3xl font-bold mb-6">Create Your Account</h2>
          <p className="text-xl opacity-90 mb-8">
            Sign up to access your legal workspace and start managing cases, documents, and client information efficiently.
          </p>
          <div className="flex space-x-3 mt-10">
            <div className="h-2 w-2 rounded-full bg-white opacity-60"></div>
            <div className="h-2 w-8 rounded-full bg-white"></div>
            <div className="h-2 w-2 rounded-full bg-white opacity-60"></div>
          </div>
        </div>
      </div>

      {/* Register Form - Right Side */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div 
          className={`max-w-md w-full transition-all duration-700 ease-out transform ${
            showContent ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`}
        >
          {/* Mobile logo - only shown on small screens */}
          <div className="md:hidden flex justify-center mb-8">
            <ScaleIcon className="h-12 w-12 text-primary-600" />
          </div>

          <h2 className="text-center text-3xl font-extrabold text-gray-900 dark:text-white mb-6">
            Create your account
          </h2>

          {error && (
            <div className="mb-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 p-4 rounded-md text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex space-x-4">
              <div>
                <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">First Name</label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="first_name"
                    name="first_name"
                    type="text"
                    autoComplete="given-name"
                    required
                    value={formData.first_name}
                    onChange={handleChange}
                    className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                    placeholder="First Name"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Last Name</label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="last_name"
                    name="last_name"
                    type="text"
                    autoComplete="family-name"
                    required
                    value={formData.last_name}
                    onChange={handleChange}
                    className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                    placeholder="Last Name"
                  />
                </div>
              </div>
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email address</label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                  placeholder="Email address"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="appearance-none block w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                  placeholder="Password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
                >
                  {showPassword ? 
                    <EyeSlashIcon className="h-5 w-5" aria-hidden="true" /> : 
                    <EyeIcon className="h-5 w-5" aria-hidden="true" />
                  }
                </button>
              </div>
              {formData.password && (
                <p className={`mt-1 text-xs ${passwordStrength.score >= 3 ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                  {passwordStrength.feedback}
                </p>
              )}
            </div>
            
            <div>
              <label htmlFor="password2" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Confirm Password</label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password2"
                  name="password2"
                  type={showPassword2 ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={formData.password2}
                  onChange={handleChange}
                  className="appearance-none block w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                  placeholder="Confirm Password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword2(!showPassword2)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
                >
                  {showPassword2 ? 
                    <EyeSlashIcon className="h-5 w-5" aria-hidden="true" /> : 
                    <EyeIcon className="h-5 w-5" aria-hidden="true" />
                  }
                </button>
              </div>
              {formData.password && formData.password2 && formData.password !== formData.password2 && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">Passwords do not match</p>
              )}
            </div>
            
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Role</label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm rounded-md"
              >
                <option value="attorney">Attorney</option>
                <option value="paralegal">Paralegal</option>
                <option value="client">Client</option>
              </select>
            </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating account...
                </>
              ) : 'Create Account'}
            </button>
          </div>
          </form>
          
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Already have an account? {' '}
              <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300">
                Sign in
              </Link>
            </p>
          </div>
          
          <div className="mt-4 text-sm text-center text-gray-600 dark:text-gray-400">
            By creating an account, you agree to our{' '}
            <Link to="/terms" className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300">Terms of Service</Link>
            {' '}and{' '}
            <Link to="/privacy" className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300">Privacy Policy</Link>.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
