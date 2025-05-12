/**
 * Authentication debugging utility
 */

export const debugAuthIssues = () => {
  console.group('🔐 Auth Token Debug Info');
  
  // Check all stored tokens - focus on the 'token' key which is what we're standardizing on
  const tokenKeys = ['token', 'authToken', 'access_token', 'accessToken', 'access'];
  const foundTokens = [];
  
  tokenKeys.forEach(key => {
    const value = localStorage.getItem(key);
    if (value) {
      foundTokens.push({ key, length: value.length, preview: value.substring(0, 10) + '...' });
      console.log(`Found token with key "${key}" (length: ${value.length})`);
    }
  });
  
  if (foundTokens.length === 0) {
    console.log('❌ No authentication tokens found in localStorage');
  } else if (foundTokens.length > 1) {
    console.warn('⚠️ Multiple tokens found - potential inconsistency issue');
  } else {
    console.log('✅ Single token found with key:', foundTokens[0].key);
  }
  
  // Parse token if it exists
  const mainToken = localStorage.getItem('token');
  if (mainToken) {
    try {
      const parts = mainToken.split('.');
      if (parts.length === 3) {
        // Looks like JWT
        try {
          const payload = JSON.parse(atob(parts[1]));
          console.log('Token payload:', payload);
          if (payload.exp) {
            const expDate = new Date(payload.exp * 1000);
            const now = new Date();
            console.log(`Token expires: ${expDate.toLocaleString()} (${now > expDate ? 'EXPIRED' : 'valid'})`);
          }
        } catch (e) {
          console.log('Could not parse token payload:', e);
        }
      }
    } catch (e) {
      console.error('Error analyzing token:', e);
    }
  }
  
  console.groupEnd();
  
  return foundTokens.length > 0;
};
