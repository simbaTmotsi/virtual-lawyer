import React from 'react';
import { Link } from 'react-router-dom';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 bg-white shadow-md rounded-lg">
        <div className="py-8 px-6">
          <div className="mb-8 border-b border-gray-200 pb-5">
            <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
            <p className="mt-2 text-sm text-gray-500">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          
          <div className="prose max-w-none">
            <h2 className="text-xl font-semibold mb-4">1. Information We Collect</h2>
            <p className="mb-4">
              EasyLaw collects several different types of information for various purposes to provide and improve our service to you.
            </p>
            <p className="mb-6">
              Personal Data may include, but is not limited to:
            </p>
            <ul className="list-disc pl-6 mb-6">
              <li>Email address</li>
              <li>First name and last name</li>
              <li>Phone number</li>
              <li>Address, State, Province, ZIP/Postal code, City</li>
              <li>Cookies and Usage Data</li>
            </ul>

            <h2 className="text-xl font-semibold mb-4">2. Use of Data</h2>
            <p className="mb-4">
              EasyLaw uses the collected data for various purposes:
            </p>
            <ul className="list-disc pl-6 mb-6">
              <li>To provide and maintain our service</li>
              <li>To notify you about changes to our service</li>
              <li>To provide customer support</li>
              <li>To gather analysis or valuable information so that we can improve our service</li>
              <li>To monitor the usage of our service</li>
              <li>To detect, prevent and address technical issues</li>
            </ul>

            <h2 className="text-xl font-semibold mb-4">3. Security of Data</h2>
            <p className="mb-6">
              The security of your data is important to us, but remember that no method of transmission over the Internet, or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your Personal Data, we cannot guarantee its absolute security.
            </p>

            <h2 className="text-xl font-semibold mb-4">4. Legal Basis for Processing Personal Data</h2>
            <p className="mb-6">
              EasyLaw's legal basis for collecting and using the personal information described in this Privacy Policy depends on the Personal Data we collect and the specific context in which we collect it.
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

export default PrivacyPolicy;
