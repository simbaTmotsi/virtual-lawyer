import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { checkAuthStatus, testApiConnection } from '../utils/debugHelper';

const AuthDebugger = () => {
  const { isAuthenticated, user, fetchUserProfile } = useAuth();
  const [showDebugger, setShowDebugger] = useState(false);
  const [apiStatus, setApiStatus] = useState(null);
  const [localTokenStatus, setLocalTokenStatus] = useState(null);

  const runDiagnostics = async () => {
    // Check token in localStorage
    const hasToken = checkAuthStatus();
    setLocalTokenStatus(hasToken);
    
    // Test API connectivity
    const apiResult = await testApiConnection();
    setApiStatus(apiResult);
  };

  if (!showDebugger) {
    return (
      <button 
        onClick={() => setShowDebugger(true)}
        className="fixed bottom-4 right-4 bg-gray-800 text-white p-2 rounded-full text-xs"
        title="Auth Debug"
      >
        🔒
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border text-sm max-w-md z-50">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold text-gray-900 dark:text-white">Auth Debugger</h3>
        <button 
          onClick={() => setShowDebugger(false)}
          className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
        >
          ✕
        </button>
      </div>
      
      <div className="space-y-3">
        <div>
          <span className="font-medium">Auth State:</span> 
          <span className={isAuthenticated ? "text-green-600" : "text-red-600"}>
            {isAuthenticated ? "Authenticated" : "Not Authenticated"}
          </span>
        </div>
        
        <div>
          <span className="font-medium">User:</span> 
          {user ? (
            <span className="text-green-600">
              {user.email || JSON.stringify(user)}
            </span>
          ) : (
            <span className="text-red-600">No user data</span>
          )}
        </div>
        
        {localTokenStatus !== null && (
          <div>
            <span className="font-medium">Token in Storage:</span> 
            <span className={localTokenStatus ? "text-green-600" : "text-red-600"}>
              {localTokenStatus ? "Present" : "Missing"}
            </span>
          </div>
        )}
        
        {apiStatus && (
          <div>
            <span className="font-medium">API Connection:</span> 
            <span className={apiStatus.success ? "text-green-600" : "text-red-600"}>
              {apiStatus.success ? "Working" : "Failed"}
            </span>
            {apiStatus.status && <span> (Status: {apiStatus.status})</span>}
          </div>
        )}
        
        <div className="flex space-x-2 pt-2">
          <button
            onClick={runDiagnostics}
            className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
          >
            Run Diagnostics
          </button>
          
          <button
            onClick={fetchUserProfile}
            className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
          >
            Refresh User
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthDebugger;
