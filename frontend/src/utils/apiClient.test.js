import * as apiClient from './apiClient';

// Mock global fetch
global.fetch = jest.fn();
// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: key => store[key] || null,
    setItem: (key, value) => { store[key] = value.toString(); },
    removeItem: key => { delete store[key]; },
    clear: () => { store = {}; }
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('apiClient', () => {
  beforeEach(() => {
    fetch.mockClear();
    localStorageMock.clear(); // Clear localStorage before each test
  });

  // Helper to mock successful fetch response
  const mockFetchSuccess = (data, status = 200) => {
    fetch.mockResolvedValueOnce({
      ok: true,
      status,
      json: async () => data,
    });
  };

  // Helper to mock failed fetch response
  const mockFetchFailure = (errorData, status = 400) => {
    fetch.mockResolvedValueOnce({
      ok: false,
      status,
      json: async () => errorData,
      statusText: errorData.message || 'Error',
    });
  };
  
  // Helper to mock 204 No Content response
  const mockFetchNoContent = () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      status: 204,
      json: async () => { throw new Error("Should not call json() on 204"); }, // json() would fail
    });
  };

  describe('request helper (underlying mechanism)', () => {
    test('includes Authorization header if token exists', async () => {
      localStorageMock.setItem('authToken', 'test-token');
      mockFetchSuccess({});
      await apiClient.request('/test-auth');
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/test-auth'),
        expect.objectContaining({
          headers: expect.objectContaining({ Authorization: 'Bearer test-token' }),
        })
      );
    });

    test('does not include Authorization header if no token', async () => {
      mockFetchSuccess({});
      await apiClient.request('/test-no-auth');
      const callOptions = fetch.mock.calls[0][1];
      expect(callOptions.headers).not.toHaveProperty('Authorization');
    });
    
    test('handles 204 No Content response', async () => {
      mockFetchNoContent();
      const result = await apiClient.request('/test-no-content', { method: 'DELETE' });
      expect(result).toBeNull();
    });
  });


  // --- Research API Functions ---

  describe('callQueryGemini', () => {
    const endpoint = '/research/query_gemini/';
    it('calls fetch with correct parameters and handles success', async () => {
      const mockData = { query: 'Hello Gemini', documentContext: [{id: "1"}], chatHistory: [{role: "user"}] };
      const mockResponse = { result: 'Gemini says hi' };
      mockFetchSuccess(mockResponse);

      const result = await apiClient.callQueryGemini(mockData.query, mockData.documentContext, mockData.chatHistory);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining(endpoint),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(mockData),
        })
      );
      expect(result).toEqual(mockResponse);
    });
    
    it('sends only query if optional params are missing', async () => {
      const mockData = { query: 'Simple query' };
      mockFetchSuccess({});
      await apiClient.callQueryGemini(mockData.query);
      expect(fetch).toHaveBeenCalledWith(
          expect.stringContaining(endpoint),
          expect.objectContaining({
              body: JSON.stringify({ query: mockData.query }) // Only query is sent
          })
      );
    });

    it('throws error on API failure', async () => {
      const mockError = { error: 'Gemini error' };
      mockFetchFailure(mockError, 500);
      await expect(apiClient.callQueryGemini('test')).rejects.toThrow(mockError.error);
    });
  });

  describe('callSearchLegalDatabases', () => {
    const endpoint = '/research/search_legal_databases/';
    it('calls fetch with correct parameters filtering out nulls', async () => {
      const params = { query: 'search terms', database: 'all', jurisdiction: null, doc_type: 'case' };
      const expectedPayload = { query: 'search terms', database: 'all', doc_type: 'case' }; // jurisdiction is filtered
      const mockResponse = { items: [] };
      mockFetchSuccess(mockResponse);

      const result = await apiClient.callSearchLegalDatabases(params);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining(endpoint),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(expectedPayload),
        })
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('callComprehensiveResearch', () => {
    const endpoint = '/research/comprehensive_research/';
    it('calls fetch with correct parameters including optional ones', async () => {
      const params = { query: 'deep dive', jurisdiction: 'US', case_id: 'C123', document_ids: ['D456'] };
      const mockResponse = { analysis: 'done' };
      mockFetchSuccess(mockResponse);
      
      const result = await apiClient.callComprehensiveResearch(params);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining(endpoint),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(params),
        })
      );
      expect(result).toEqual(mockResponse);
    });
    
    it('sends only query if optional params are missing', async () => {
        const params = { query: 'simple comprehensive' };
        mockFetchSuccess({});
        await apiClient.callComprehensiveResearch(params);
        expect(fetch).toHaveBeenCalledWith(
            expect.stringContaining(endpoint),
            expect.objectContaining({
                body: JSON.stringify({ query: params.query })
            })
        );
    });
  });

  describe('callRecommendCases', () => {
    const endpoint = '/research/recommend_cases/';
    it('calls fetch with correct parameters', async () => {
      const params = { description: 'need cases', jurisdiction: 'UK' };
      const mockResponse = { recommendations: [] };
      mockFetchSuccess(mockResponse);

      const result = await apiClient.callRecommendCases(params);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining(endpoint),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(params),
        })
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getResearchDashboardData', () => {
    const endpoint = '/research/dashboard/';
    it('calls fetch with GET method and handles success', async () => {
      const mockResponse = { stats: {} };
      mockFetchSuccess(mockResponse);

      const result = await apiClient.getResearchDashboardData();
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining(endpoint),
        expect.objectContaining({ method: 'GET' })
      );
      expect(result).toEqual(mockResponse);
    });
  });
  
  // --- Analytics API Function ---
  describe('getGoogleApiMetrics', () => {
    // Backend router prefix is /analytics/api/google-api-metrics/
    const baseEndpoint = '/analytics/api/google-api-metrics/'; 
    
    it('calls fetch with GET method and no filters', async () => {
      const mockResponse = [{ metric: 'test' }];
      mockFetchSuccess(mockResponse);

      const result = await apiClient.getGoogleApiMetrics();
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining(baseEndpoint + "?"), // Query will be empty
        expect.objectContaining({ method: 'GET' })
      );
      expect(result).toEqual(mockResponse);
    });

    it('calls fetch with filters in query string', async () => {
      const filters = { 
        metric_date_after: '2023-01-01', 
        service_name: 'Vertex AI API' 
      };
      const mockResponse = [{ metric: 'filtered' }];
      mockFetchSuccess(mockResponse);

      const result = await apiClient.getGoogleApiMetrics(filters);
      const expectedQuery = new URLSearchParams(filters).toString();
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining(`${baseEndpoint}?${expectedQuery}`),
        expect.objectContaining({ method: 'GET' })
      );
      expect(result).toEqual(mockResponse);
    });
    
    it('throws error on API failure for getGoogleApiMetrics', async () => {
      const mockError = { detail: 'Metrics fetch failed' };
      mockFetchFailure(mockError, 403);
      await expect(apiClient.getGoogleApiMetrics()).rejects.toThrow(mockError.detail);
    });
  });
});
