// Base URL for the API, can be configured through environment variables
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '/api';

/**
 * Helper function to perform API requests.
 * It handles common tasks like setting headers, stringifying body,
 * and basic error handling.
 */
const request = async (endpoint, options = {}) => {
  const { method = 'GET', body, isExternal = false, ...customHeaders } = options;
  
  const headers = {
    'Content-Type': 'application/json',
    ...customHeaders,
  };

  const token = localStorage.getItem('authToken');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    method,
    headers,
  };

  if (body) {
    config.body = JSON.stringify(body);
  }
  
  const url = isExternal ? endpoint : `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, config);
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { message: response.statusText };
      }
      const errorMessage = errorData?.error || errorData?.detail || errorData?.message || `Request failed with status ${response.status}`;
      throw new Error(errorMessage);
    }
    // For 204 No Content, response.json() will fail.
    if (response.status === 204) {
        return null; 
    }
    return response.json();
  } catch (error) {
    console.error(`API request error to ${method} ${url}:`, error);
    throw error; // Re-throw to be caught by the caller
  }
};

// --- Research API Functions ---

/**
 * Calls the Gemini API through the backend.
 * @param {string} query - The query text.
 * @param {Array} [documentContext] - Optional context from documents.
 * @param {Array} [chatHistory] - Optional chat history.
 * @returns {Promise<Object>} The API response.
 */
export const callQueryGemini = async (query, documentContext, chatHistory) => {
  const payload = { query };
  if (documentContext && documentContext.length > 0) payload.documentContext = documentContext;
  if (chatHistory && chatHistory.length > 0) payload.chatHistory = chatHistory;
  
  return request('/research/query_gemini/', { method: 'POST', body: payload });
};

/**
 * Searches legal databases through the backend.
 * @param {Object} params - Parameters for the search.
 * @param {string} params.query - The search query.
 * @param {string} [params.database='all'] - The database to search.
 * @param {string} [params.jurisdiction] - The jurisdiction.
 * @param {string} [params.doc_type] - Document type.
 * @param {string} [params.date_from] - Start date for search.
 * @param {string} [params.date_to] - End date for search.
 * @returns {Promise<Object>} The API response.
 */
export const callSearchLegalDatabases = async (params) => {
  // Filter out null/undefined params to keep payload clean
  const payload = Object.fromEntries(Object.entries(params).filter(([_, v]) => v != null));
  return request('/research/search_legal_databases/', { method: 'POST', body: payload });
};

/**
 * Performs comprehensive research using AI and legal databases.
 * @param {Object} params - Parameters for comprehensive research.
 * @param {string} params.query - The research query.
 * @param {string} [params.jurisdiction] - The jurisdiction.
 * @param {string} [params.case_id] - Optional case ID.
 * @param {Array<string>} [params.document_ids] - Optional list of document IDs.
 * @returns {Promise<Object>} The API response.
 */
export const callComprehensiveResearch = async (params) => {
  const payload = { query: params.query };
  if (params.jurisdiction) payload.jurisdiction = params.jurisdiction;
  if (params.case_id) payload.case_id = params.case_id;
  if (params.document_ids && params.document_ids.length > 0) payload.document_ids = params.document_ids;
  
  return request('/research/comprehensive_research/', { method: 'POST', body: payload });
};

/**
 * Recommends relevant cases based on context.
 * @param {Object} params - Parameters for case recommendation.
 * @param {string} [params.description] - Description of what to search for.
 * @param {string} [params.case_id] - Optional case ID for context.
 * @param {string} [params.document_id] - Optional document ID for context.
 * @param {string} [params.jurisdiction] - The jurisdiction.
 * @returns {Promise<Object>} The API response.
 */
export const callRecommendCases = async (params) => {
  const payload = {};
  if (params.description) payload.description = params.description;
  if (params.case_id) payload.case_id = params.case_id;
  if (params.document_id) payload.document_id = params.document_id;
  if (params.jurisdiction) payload.jurisdiction = params.jurisdiction;
  
  return request('/research/recommend_cases/', { method: 'POST', body: payload });
};

/**
 * Fetches research dashboard data.
 * @returns {Promise<Object>} The dashboard data.
 */
export const getResearchDashboardData = async () => {
  return request('/research/dashboard/', { method: 'GET' });
};

/**
 * Fetches Google API usage metrics.
 * @param {Object} filters - Optional filters for the query.
 * @param {string} filters.metric_date_after - Start date (YYYY-MM-DD).
 * @param {string} filters.metric_date_before - End date (YYYY-MM-DD).
 * @param {string} filters.service_name - Specific service name.
 * @param {string} filters.metric_name - Specific metric name.
 * @returns {Promise<Array>} A list of API usage metrics.
 */
export const getGoogleApiMetrics = async (filters = {}) => {
  const queryParams = new URLSearchParams(filters);
  // Ensure the endpoint matches the one registered in backend analytics/urls.py
  // The backend router for GoogleApiUsageMetricViewSet was registered under 'api/google-api-metrics/'
  // So, the full path from API_BASE_URL would be /analytics/api/google-api-metrics/
  const path = `/analytics/api/google-api-metrics/?${queryParams.toString()}`;
  return request(path); 
};
