import React from 'react';
import { Link } from 'react-router-dom';

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 bg-white shadow-md rounded-lg">
        <div className="py-8 px-6">
          <div className="mb-8 border-b border-gray-200 pb-5">
            <h1 className="text-3xl font-bold text-gray-900">Terms of Service</h1>
            <p className="mt-2 text-sm text-gray-500">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          
          <div className="prose max-w-none">
            <h2 className="text-xl font-semibold mb-4">1. Introduction</h2>
            <p className="mb-4">
              Welcome to EasyLaw ("Company", "we", "our", "us")! These Terms of Service ("Terms", "Terms of Service") govern your use of our website and services operated by EasyLaw.
            </p>
            <p className="mb-6">
              By accessing or using the Service, you agree to be bound by these Terms. If you disagree with any part of the terms, then you may not access the Service.
            </p>

            <h2 className="text-xl font-semibold mb-4">2. Usage Terms</h2>
            <p className="mb-4">
              Our service provides a platform for legal professionals to manage their practice, clients, and cases. You are responsible for maintaining the confidentiality of your account information.
            </p>
            <p className="mb-6">
              You are responsible for all activities that occur under your account. You agree not to disclose your password to any third party.
            </p>

            <h2 className="text-xl font-semibold mb-4">3. Limitations</h2>
            <p className="mb-6">
              In no event shall EasyLaw, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
            </p>

            <h2 className="text-xl font-semibold mb-4">4. Privacy</h2>
            <p className="mb-4">
              Please review our <Link to="/privacy" className="text-primary-600 hover:underline">Privacy Policy</Link>, which also governs your use of our services.
            </p>
            
            {/* More sections would be added here in a real implementation */}
          </div>
          
          <div className="mt-8 pt-5 border-t border-gray-200">
            <Link to="/" className="text-primary-600 hover:text-primary-800">
              ← Back to EasyLaw
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
