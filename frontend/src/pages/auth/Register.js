import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { 
  LockClosedIcon, 
  ArrowRightIcon, 
  ExclamationCircleIcon, 
  UserIcon, 
  EnvelopeIcon, 
  CheckCircleIcon 
} from '@heroicons/react/24/solid';
import { ScaleIcon } from '@heroicons/react/24/outline';
import { AuthAPI } from '../../utils/api';

const Register = () => {
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState('attorney'); // Default role
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  
  // UI state
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [step, setStep] = useState(1); // Multi-step form (1: account, 2: personal)
  // eslint-disable-next-line no-unused-vars
  const [isRegistered, setIsRegistered] = useState(false); // Registration state
  
  const { login } = useAuth(); // Get login from context
  const navigate = useNavigate();

  // Animation effect on mount
  useEffect(() => {
    const timer = setTimeout(() => setShowForm(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Password strength checker
  useEffect(() => {
    if (!password) {
      setPasswordStrength(0);
      return;
    }

    let strength = 0;
    // Length check
    if (password.length >= 8) strength += 1;
    // Contains number
    if (/\d/.test(password)) strength += 1;
    // Contains lowercase letter
    if (/[a-z]/.test(password)) strength += 1;
    // Contains uppercase letter
    if (/[A-Z]/.test(password)) strength += 1;
    // Contains special character
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;

    setPasswordStrength(strength);
  }, [password]);

  const validateStep1 = () => {
    // Email validation
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return false;
    }

    // Password validation
    if (!password || password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }

    if (passwordStrength < 3) {
      setError('Please use a stronger password (include numbers, symbols, or uppercase letters)');
      return false;
    }

    // Password confirmation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    setError('');
    return true;
  };

  // eslint-disable-next-line no-unused-vars
  const validateStep2 = () => {
    if (!firstName || !lastName) {
      setError('First name and last name are required');
      return false;
    }

    if (!agreeToTerms) {
      setError('You must agree to the terms of service to continue');
      return false;
    }

    setError('');
    return true;
  };

  const handleNextStep = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handlePrevStep = () => {
    setStep(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Step 1 validation
    if (step === 1) {
      handleNextStep();
      return;
    }
    
    // Step 2 validation
    if (!agreeToTerms) {
      setError('You must agree to the Terms of Service and Privacy Policy');
      return;
    }
    
    setLoading(true);
    setError('');
    
    const userData = {
      email,
      password,
      password2: confirmPassword, // Add password confirmation field
      first_name: firstName,
      last_name: lastName,
      role: role,
    };
    
    try {
      // Use the API utility instead of raw fetch
      await AuthAPI.register(userData);
      
      // Handle successful registration
      setIsRegistered(true);

      // After successful registration, attempt to log the user in
      try {
        await login(email, password);
        navigate('/'); // Redirect to dashboard after successful login
      } catch (loginErr) {
        // Handle login failure after registration (e.g., account needs verification)
        setError('Registration successful, but login failed. Please try logging in manually.');
        console.error('Post-registration login error:', loginErr);
        navigate('/login'); // Redirect to login page
      }
    } catch (err) {
      console.error('Registration error:', err);
      let errorMessage = 'Registration failed. Please try again.';
      
      // Enhanced error extraction
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.log('Error response data:', err.response.data);
        console.log('Error response status:', err.response.status);
        
        if (err.response.data) {
          if (typeof err.response.data === 'string') {
            errorMessage = err.response.data;
          } else if (err.response.data.detail) {
            errorMessage = err.response.data.detail;
          } else if (typeof err.response.data === 'object') {
            errorMessage = Object.entries(err.response.data)
              .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(' ') : value}`)
              .join('; ');
          }
        }
      } else if (err.data) {
        // The error has a data property (from your API utility)
        if (err.data.detail) {
          errorMessage = err.data.detail;
        } else if (typeof err.data === 'object') {
          errorMessage = Object.entries(err.data)
            .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(' ') : value}`)
            .join('; ');
        }
      } else if (err.message) {
        // Request was made but no response was received or error in setting up request
        errorMessage = `Registration error: ${err.message}`;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrengthColor = () => {  
    if (passwordStrength === 0) return 'bg-gray-200';
    if (passwordStrength === 1) return 'bg-red-500';
    if (passwordStrength === 2) return 'bg-orange-500';
    if (passwordStrength === 3) return 'bg-yellow-500';
    if (passwordStrength === 4) return 'bg-green-500';
    return 'bg-green-600';
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
          <h2 className="text-3xl font-bold mb-6">Join our legal community</h2>
          <p className="text-xl opacity-90 mb-8">
            Create an account to access powerful legal management tools designed specifically for modern law professionals.
          </p>
          <div className="flex space-x-3 mt-10">
            <div className="h-2 w-2 rounded-full bg-white opacity-60"></div>
            <div className="h-2 w-2 rounded-full bg-white opacity-60"></div>
            <div className="h-2 w-8 rounded-full bg-white"></div>
            <div className="h-2 w-2 rounded-full bg-white opacity-60"></div>
          </div>
        </div>
      </div>
      
      {/* Right panel - Registration Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div
          className={`max-w-md w-full transition-all duration-700 ease-out transform ${
            showForm ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`}
        >
          <div className="text-center mb-8">
            <div className="flex justify-center lg:hidden mb-6">
              <ScaleIcon className="h-10 w-10 text-primary-600" />
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900 mb-1">
              {step === 1 ? 'Create your account' : 'Your information'}
            </h2>
            <p className="text-gray-500">
              {step === 1 ? 'Set up your login credentials' : 'Tell us about yourself'}
            </p>
          </div>
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            {step === 1 ? (
              /* Step 1: Account credentials */
              <>
                {/* Email field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email address
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <EnvelopeIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      className={`appearance-none block w-full pl-10 pr-3 py-3 border ${
                        error && error.includes('email') ? 'border-red-300' : 'border-gray-300'
                      } rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200 sm:text-sm`}
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                {/* Password field */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <LockClosedIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="new-password"
                      required
                      className={`appearance-none block w-full pl-10 pr-3 py-3 border ${
                        error && error.includes('Password') ? 'border-red-300' : 'border-gray-300'
                      } rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200 sm:text-sm`}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>

                  {/* Password strength indicator */}
                  {password && (
                    <div className="mt-2">
                      <div className="flex justify-between mb-1">
                        <span className="text-xs text-gray-500">
                          {passwordStrength === 0 && 'Enter a password'}
                          {passwordStrength === 1 && 'Weak password'}
                          {passwordStrength === 2 && 'Fair password'}
                          {passwordStrength === 3 && 'Good password'}
                          {passwordStrength === 4 && 'Strong password'}
                          {passwordStrength === 5 && 'Very strong password'}
                        </span>
                        <span className="text-xs text-gray-500">{passwordStrength}/5</span>
                      </div>
                      <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                        <div style={{ width: `${passwordStrength * 20}%` }} className={`transition-all duration-300 ${getPasswordStrengthColor()}`}></div>
                      </div>
                      <div className="mt-1 text-xs text-gray-500">
                        Include a mix of letters, numbers & symbols for a strong password
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password field */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    Confirm Password
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <LockClosedIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </div>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      autoComplete="new-password"
                      required
                      className={`appearance-none block w-full pl-10 pr-3 py-3 border ${
                        error && error.includes('match') ? 'border-red-300' : 'border-gray-300'
                      } rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200 sm:text-sm`}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                </div>
              </>
            ) : (
              /* Step 2: Personal information */
              <>
                {/* First Name field */}
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                    First Name
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <UserIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </div>
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      autoComplete="given-name"
                      required
                      className={`appearance-none block w-full pl-10 pr-3 py-3 border ${
                        error && error.includes('first name') ? 'border-red-300' : 'border-gray-300'
                      } rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200 sm:text-sm`}
                      placeholder="John"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                  </div>
                </div>

                {/* Last Name field */}
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                    Last Name
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <UserIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </div>
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      autoComplete="family-name"
                      required
                      className={`appearance-none block w-full pl-10 pr-3 py-3 border ${
                        error && error.includes('last name') ? 'border-red-300' : 'border-gray-300'
                      } rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200 sm:text-sm`}
                      placeholder="Doe"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </div>
                </div>

                {/* Role selection */}
                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                    Your Role
                  </label>
                  <div className="mt-1">
                    <select
                      id="role"
                      name="role"
                      required
                      className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200 sm:text-sm"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                    >
                      <option value="attorney">Attorney</option>
                      <option value="paralegal">Paralegal</option>
                      <option value="client">Client</option>
                    </select>
                    <p className="mt-1 text-xs text-gray-500">
                      Administrator roles are assigned by existing administrators.
                    </p>
                  </div>
                </div>

                {/* Terms and conditions checkbox */}
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="terms"
                      name="terms"
                      type="checkbox"
                      checked={agreeToTerms}
                      onChange={(e) => setAgreeToTerms(e.target.checked)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded transition-colors duration-200"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="terms" className="font-medium text-gray-700">
                      I agree to the <Link to="/terms" className="text-primary-600 hover:text-primary-500">Terms of Service</Link> and <Link to="/privacy" className="text-primary-600 hover:text-primary-500">Privacy Policy</Link>
                    </label>
                  </div>
                </div>
              </>
            )}

            {/* Error message */}
            {error && (
              <div className="rounded-md bg-red-50 p-3 flex items-center">
                <ExclamationCircleIcon className="h-5 w-5 text-red-500 mr-2" aria-hidden="true" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex flex-col-reverse sm:flex-row sm:justify-between gap-3">
              {step === 2 && (
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Back
                </button>
              )}
              
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full sm:w-auto flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200 disabled:opacity-70"
              >
                {loading && (
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {step === 1 ? (
                  <>
                    Continue <ArrowRightIcon className="ml-2 -mr-1 h-4 w-4 text-white group-hover:translate-x-1 transition-transform duration-200" />
                  </>
                ) : loading ? (
                  'Creating account...'
                ) : (
                  <>
                    Complete Registration <CheckCircleIcon className="ml-2 -mr-1 h-4 w-4 text-white" />
                  </>
                )}
              </button>
            </div>
            
            {/* Sign In Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500 transition-colors duration-200">
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
