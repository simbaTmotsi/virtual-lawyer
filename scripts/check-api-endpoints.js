const axios = require('axios');

// Base URLs to test
const urls = [
  'http://localhost:8000',
  'http://localhost:8000/api',
];

// Endpoints to check
const endpoints = [
  // Remove duplicate and incorrect endpoints
  '/api/accounts/register/',
  '/api/accounts/proxy-login/',
  '/api/accounts/me/',
];

async function checkEndpoint(baseUrl, endpoint) {
  const url = `${baseUrl}${endpoint}`;
  console.log(`Checking ${url}...`);
  
  try {
    // Just do a OPTIONS request to check if endpoint exists
    const response = await axios.options(url, { timeout: 5000 });
    console.log(`✅ ${url} - Status: ${response.status}`);
    return true;
  } catch (error) {
    if (error.response) {
      // If we get any response, the endpoint exists but might require authentication
      console.log(`✅ ${url} - Status: ${error.response.status} (Requires auth or POST only)`);
      return true;
    } else {
      console.log(`❌ ${url} - Error: ${error.message}`);
      return false;
    }
  }
}

async function main() {
  console.log('Checking API endpoints...');
  
  for (const baseUrl of urls) {
    console.log(`\nTesting base URL: ${baseUrl}`);
    for (const endpoint of endpoints) {
      await checkEndpoint(baseUrl, endpoint);
    }
  }
}

main();
