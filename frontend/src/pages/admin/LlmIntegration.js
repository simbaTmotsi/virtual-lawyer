import React, { useState } from 'react';
import { CheckIcon, KeyIcon } from '@heroicons/react/24/solid';

const LlmIntegration = () => {
  // Mock state - replace with API integration
  const [apiKeys, setApiKeys] = useState({
    openai: '',
    gemini: '',
  });
  const [selectedModel, setSelectedModel] = useState('openai'); // Default model
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setApiKeys(prev => ({ ...prev, [name]: value }));
    setSuccess(false);
  };

  const handleModelChange = (e) => {
    setSelectedModel(e.target.value);
    setSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    try {
      // Simulate API call to save LLM settings
      console.log('Saving LLM settings:', { apiKeys, selectedModel });
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuccess(true);
    } catch (error) {
      console.error('Failed to save LLM settings:', error);
      // Handle error display
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow dark:shadow-gray-700/10 rounded-lg p-6">
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">LLM Integration Settings</h2>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
        Configure API keys for integrating Large Language Models (LLMs) like OpenAI and Google Gemini for features like legal research and document analysis.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
        {/* OpenAI API Key */}
        <div>
          <label htmlFor="openai" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            OpenAI API Key
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <KeyIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
              type="password" // Use password type to obscure key
              id="openai"
              name="openai"
              value={apiKeys.openai}
              onChange={handleChange}
              placeholder="sk-..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white"
            />
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Enter your API key from OpenAI.</p>
        </div>

        {/* Google Gemini API Key */}
        <div>
          <label htmlFor="gemini" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Google Gemini API Key
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <KeyIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
              type="password" // Use password type to obscure key
              id="gemini"
              name="gemini"
              value={apiKeys.gemini}
              onChange={handleChange}
              placeholder="AIza..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white"
            />
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Enter your API key from Google AI Studio.</p>
        </div>

        {/* Preferred Model Selection */}
        <div>
          <label htmlFor="selectedModel" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Preferred Model for AI Features
          </label>
          <select
            id="selectedModel"
            name="selectedModel"
            value={selectedModel}
            onChange={handleModelChange}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white"
          >
            <option value="openai">OpenAI (GPT)</option>
            <option value="gemini">Google Gemini</option>
            {/* Add more models if supported */}
          </select>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Select the primary LLM to use for AI-powered features.</p>
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
          >
            {loading ? (
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <CheckIcon className="h-5 w-5 mr-2" />
            )}
            {loading ? 'Saving...' : 'Save Configuration'}
          </button>
          {success && (
            <span className="text-sm text-green-600 dark:text-green-400">LLM settings saved successfully!</span>
          )}
        </div>
      </form>
    </div>
  );
};

export default LlmIntegration;
