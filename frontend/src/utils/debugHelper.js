/**
 * Helper utility to debug authentication and API issues
 */

export const checkAuthStatus = () => {
  console.group('🔐 Auth Debug Information');
  
  // Check if token exists - fixed to use the same key as AuthContext.js
  const token = localStorage.getItem('token');
  console.log('Token exists:', !!token);
  if (token) {
    try {
      // Check token structure (without revealing full token)
      const tokenParts = token.split('.');
      console.log('Token format valid:', tokenParts.length === 3);
      
      // Show token expiration if possible
      if (tokenParts.length === 3) {
        try {
          const payload = JSON.parse(atob(tokenParts[1]));
          const expTime = new Date(payload.exp * 1000);
          const now = new Date();
          console.log('Token expired:', expTime < now);
          console.log('Expiration time:', expTime.toLocaleString());
          console.log('Current time:', now.toLocaleString());
        } catch (e) {
          console.log('Could not decode token payload');
        }
      }
    } catch (e) {
      console.log('Error examining token:', e);
    }
  }
  
  // Check localStorage for other auth items
  console.log('All auth-related localStorage items:');
  Object.keys(localStorage).forEach(key => {
    if (key.toLowerCase().includes('token') || key.toLowerCase().includes('auth')) {
      console.log(`- ${key}: ${localStorage.getItem(key) ? '[EXISTS]' : '[EMPTY]'}`);
    }
  });
  
  console.groupEnd();
  
  // Return true if a token exists (doesn't validate it)
  return !!token;
};

export const testApiConnection = async () => {
  console.group('🌐 API Connection Test');
  
  try {
    // Test a simple endpoint that doesn't require authentication
    const response = await fetch('/api/health-check');
    const isJson = response.headers.get('content-type')?.includes('application/json');
    const data = isJson ? await response.json() : await response.text();
    
    console.log('API connection:', response.ok ? 'SUCCESS' : 'FAILED');
    console.log('Status:', response.status);
    console.log('Response:', data);
    
    console.groupEnd();
    return {success: response.ok, status: response.status, data};
  } catch (error) {
    console.log('API connection error:', error);
    console.groupEnd();
    return {success: false, error};
  }
};
