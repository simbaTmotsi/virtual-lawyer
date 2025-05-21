import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ComprehensiveResearchPage from './ComprehensiveResearchPage';
import * as apiClient from '../../../utils/apiClient';

jest.mock('../../../utils/apiClient');

describe('ComprehensiveResearchPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders the page and form elements correctly', () => {
    render(<ComprehensiveResearchPage />);
    expect(screen.getByRole('heading', { name: /comprehensive legal research/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/query:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/jurisdiction \(optional\):/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/case id \(optional\):/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/document ids \(optional, comma-separated\):/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /start comprehensive research/i })).toBeInTheDocument();
  });

  test('allows typing in form fields', () => {
    render(<ComprehensiveResearchPage />);
    fireEvent.change(screen.getByLabelText(/query:/i), { target: { value: 'Test Query' } });
    expect(screen.getByLabelText(/query:/i)).toHaveValue('Test Query');

    fireEvent.change(screen.getByLabelText(/jurisdiction \(optional\):/i), { target: { value: 'US' } });
    expect(screen.getByLabelText(/jurisdiction \(optional\):/i)).toHaveValue('US');
    
    fireEvent.change(screen.getByLabelText(/document ids \(optional, comma-separated\):/i), { target: { value: '1, 2,3' } });
    expect(screen.getByLabelText(/document ids \(optional, comma-separated\):/i)).toHaveValue('1, 2,3');
  });

  test('handles successful API call and displays results', async () => {
    const mockResponse = { 
      ai_response: 'This is the AI analysis.',
      legal_database_results: [
        { id: 1, title: 'DB Case 1', excerpt: 'DB Summary 1', source: 'WestLaw', url: 'http://example.com/db1', relevance_score: 0.9 }
      ]
    };
    apiClient.callComprehensiveResearch.mockResolvedValue(mockResponse);

    render(<ComprehensiveResearchPage />);

    fireEvent.change(screen.getByLabelText(/query:/i), { target: { value: 'Analyze contract law' } });
    fireEvent.change(screen.getByLabelText(/jurisdiction \(optional\):/i), { target: { value: 'UK' } });
    fireEvent.change(screen.getByLabelText(/case id \(optional\):/i), { target: { value: 'case123' } });
    fireEvent.change(screen.getByLabelText(/document ids \(optional, comma-separated\):/i), { target: { value: 'doc1, doc2' } });
    
    fireEvent.click(screen.getByRole('button', { name: /start comprehensive research/i }));

    expect(screen.getByRole('button', { name: /researching.../i })).toBeDisabled();

    await waitFor(() => {
      expect(apiClient.callComprehensiveResearch).toHaveBeenCalledWith({
        query: 'Analyze contract law',
        jurisdiction: 'UK',
        case_id: 'case123',
        document_ids: ['doc1', 'doc2']
      });
    });
    
    await waitFor(() => {
      expect(screen.getByText(/ai analysis:/i)).toBeInTheDocument();
    });
    expect(screen.getByText(mockResponse.ai_response)).toBeInTheDocument();
    expect(screen.getByText(/legal database results:/i)).toBeInTheDocument();
    expect(screen.getByText('DB Case 1')).toBeInTheDocument();
    expect(screen.queryByText(/error:/i)).not.toBeInTheDocument();
  });
  
  test('displays "No results found" when API returns empty results', async () => {
    apiClient.callComprehensiveResearch.mockResolvedValue({ ai_response: null, legal_database_results: [] });
    render(<ComprehensiveResearchPage />);
    fireEvent.change(screen.getByLabelText(/query:/i), { target: { value: 'empty query' } });
    fireEvent.click(screen.getByRole('button', { name: /start comprehensive research/i }));

    await waitFor(() => {
      expect(screen.getByText(/no results found for your query/i)).toBeInTheDocument();
    });
  });

  test('handles API error and displays error message', async () => {
    const errorMessage = 'Comprehensive research failed';
    apiClient.callComprehensiveResearch.mockRejectedValue(new Error(errorMessage));

    render(<ComprehensiveResearchPage />);

    fireEvent.change(screen.getByLabelText(/query:/i), { target: { value: 'Error Query Comp' } });
    fireEvent.click(screen.getByRole('button', { name: /start comprehensive research/i }));

    await waitFor(() => {
      expect(apiClient.callComprehensiveResearch).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.getByText(`Error: ${errorMessage}`)).toBeInTheDocument();
    });
    expect(screen.queryByText(/ai analysis:/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/legal database results:/i)).not.toBeInTheDocument();
  });

  test('submits only query when optional fields are empty', async () => {
    const mockResponse = { ai_response: 'AI processed basic comprehensive query.', legal_database_results: [] };
    apiClient.callComprehensiveResearch.mockResolvedValue(mockResponse);

    render(<ComprehensiveResearchPage />);
    fireEvent.change(screen.getByLabelText(/query:/i), { target: { value: 'Basic Comp Query' } });
    fireEvent.click(screen.getByRole('button', { name: /start comprehensive research/i }));

    await waitFor(() => {
      expect(apiClient.callComprehensiveResearch).toHaveBeenCalledWith({
        query: 'Basic Comp Query',
        // jurisdiction, case_id, document_ids are not included as they are empty
      });
    });
    await waitFor(() => {
        expect(screen.getByText(mockResponse.ai_response)).toBeInTheDocument();
    });
  });

  test('correctly parses comma-separated document_ids with spaces', async () => {
    apiClient.callComprehensiveResearch.mockResolvedValue({ ai_response: 'Docs parsed', legal_database_results: [] });
    render(<ComprehensiveResearchPage />);

    fireEvent.change(screen.getByLabelText(/query:/i), { target: { value: 'Doc Parsing Test' } });
    fireEvent.change(screen.getByLabelText(/document ids \(optional, comma-separated\):/i), { target: { value: 'docA, docB , docC  ,docD' } });
    fireEvent.click(screen.getByRole('button', { name: /start comprehensive research/i }));

    await waitFor(() => {
      expect(apiClient.callComprehensiveResearch).toHaveBeenCalledWith({
        query: 'Doc Parsing Test',
        document_ids: ['docA', 'docB', 'docC', 'docD']
      });
    });
  });
  
  test('handles empty document_ids string correctly (no document_ids sent)', async () => {
    apiClient.callComprehensiveResearch.mockResolvedValue({ ai_response: 'No docs sent', legal_database_results: [] });
    render(<ComprehensiveResearchPage />);

    fireEvent.change(screen.getByLabelText(/query:/i), { target: { value: 'Empty Docs Test' } });
    fireEvent.change(screen.getByLabelText(/document ids \(optional, comma-separated\):/i), { target: { value: '   ' } }); // Empty or whitespace
    fireEvent.click(screen.getByRole('button', { name: /start comprehensive research/i }));

    await waitFor(() => {
      expect(apiClient.callComprehensiveResearch).toHaveBeenCalledWith({
        query: 'Empty Docs Test',
        // document_ids field should not be present in the payload if input was empty/whitespace only
      });
      // To be more precise, check that document_ids key is not in the called payload
      const callArgs = apiClient.callComprehensiveResearch.mock.calls[0][0];
      expect(callArgs).not.toHaveProperty('document_ids');
    });
  });

});
