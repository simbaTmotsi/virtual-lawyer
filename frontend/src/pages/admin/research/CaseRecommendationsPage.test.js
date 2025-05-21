import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CaseRecommendationsPage from './CaseRecommendationsPage';
import * as apiClient from '../../../utils/apiClient';

jest.mock('../../../utils/apiClient');

describe('CaseRecommendationsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders the page and form elements correctly', () => {
    render(<CaseRecommendationsPage />);
    expect(screen.getByRole('heading', { name: /case recommendations/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/description \(optional\):/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/case id \(optional\):/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/document id \(optional\):/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/jurisdiction \(optional\):/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /get case recommendations/i })).toBeInTheDocument();
  });

  test('allows typing in form fields', () => {
    render(<CaseRecommendationsPage />);
    fireEvent.change(screen.getByLabelText(/description \(optional\):/i), { target: { value: 'Breach of contract' } });
    expect(screen.getByLabelText(/description \(optional\):/i)).toHaveValue('Breach of contract');

    fireEvent.change(screen.getByLabelText(/case id \(optional\):/i), { target: { value: 'C123' } });
    expect(screen.getByLabelText(/case id \(optional\):/i)).toHaveValue('C123');
  });

  test('handles successful API call and displays recommendations', async () => {
    const mockResponse = { 
      recommended_cases: [
        { id: 1, title: 'Smith v Jones', summary: 'A landmark case...', citation: '1 U.S. 1', url: 'http://example.com/smith', relevance_score: 0.98 },
        { id: 2, title: 'Doe v Roe', summary: 'Relevant precedent...', citation: '2 U.S. 2', url: 'http://example.com/doe', relevance_score: 0.95 },
      ] 
    };
    apiClient.callRecommendCases.mockResolvedValue(mockResponse);

    render(<CaseRecommendationsPage />);

    fireEvent.change(screen.getByLabelText(/description \(optional\):/i), { target: { value: 'Looking for precedents on intellectual property' } });
    fireEvent.change(screen.getByLabelText(/jurisdiction \(optional\):/i), { target: { value: 'US' } });
    
    fireEvent.click(screen.getByRole('button', { name: /get case recommendations/i }));

    expect(screen.getByRole('button', { name: /getting recommendations.../i })).toBeDisabled();

    await waitFor(() => {
      expect(apiClient.callRecommendCases).toHaveBeenCalledWith({
        description: 'Looking for precedents on intellectual property',
        jurisdiction: 'US',
        // case_id and document_id are not included as they are empty
      });
    });
    
    await waitFor(() => {
      expect(screen.getByText(/recommended cases:/i)).toBeInTheDocument();
    });
    expect(screen.getByText('Smith v Jones')).toBeInTheDocument();
    expect(screen.getByText('Doe v Roe')).toBeInTheDocument();
    expect(screen.getAllByText(/view source/i).length).toBe(2);
    expect(screen.queryByText(/error:/i)).not.toBeInTheDocument();
  });

  test('displays "No recommendations found" message when API returns empty array', async () => {
    apiClient.callRecommendCases.mockResolvedValue({ recommended_cases: [] });
    render(<CaseRecommendationsPage />);
    fireEvent.change(screen.getByLabelText(/description \(optional\):/i), { target: { value: 'obscure topic' } });
    fireEvent.click(screen.getByRole('button', { name: /get case recommendations/i }));

    await waitFor(() => {
      expect(screen.getByText(/no recommendations found for your criteria/i)).toBeInTheDocument();
    });
  });
  
  test('handles API error and displays error message', async () => {
    const errorMessage = 'Recommendation engine unavailable';
    apiClient.callRecommendCases.mockRejectedValue(new Error(errorMessage));

    render(<CaseRecommendationsPage />);

    fireEvent.change(screen.getByLabelText(/case id \(optional\):/i), { target: { value: 'C456' } });
    fireEvent.click(screen.getByRole('button', { name: /get case recommendations/i }));

    await waitFor(() => {
      expect(apiClient.callRecommendCases).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.getByText(`Error: ${errorMessage}`)).toBeInTheDocument();
    });
    expect(screen.queryByText(/recommended cases:/i)).not.toBeInTheDocument();
  });

  test('shows client-side error if no input is provided', async () => {
    render(<CaseRecommendationsPage />);
    fireEvent.click(screen.getByRole('button', { name: /get case recommendations/i }));

    // API should not be called
    expect(apiClient.callRecommendCases).not.toHaveBeenCalled();
    
    await waitFor(() => {
      expect(screen.getByText(/please provide at least one input: description, case id, or document id./i)).toBeInTheDocument();
    });
  });

  test('submits all fields when populated', async () => {
    const mockResponse = { recommended_cases: [] };
    apiClient.callRecommendCases.mockResolvedValue(mockResponse);

    render(<CaseRecommendationsPage />);

    fireEvent.change(screen.getByLabelText(/description \(optional\):/i), { target: { value: 'Specific scenario' } });
    fireEvent.change(screen.getByLabelText(/case id \(optional\):/i), { target: { value: 'CaseXYZ' } });
    fireEvent.change(screen.getByLabelText(/document id \(optional\):/i), { target: { value: 'DocABC' } });
    fireEvent.change(screen.getByLabelText(/jurisdiction \(optional\):/i), { target: { value: 'Canada' } });
    
    fireEvent.click(screen.getByRole('button', { name: /get case recommendations/i }));

    await waitFor(() => {
      expect(apiClient.callRecommendCases).toHaveBeenCalledWith({
        description: 'Specific scenario',
        case_id: 'CaseXYZ',
        document_id: 'DocABC',
        jurisdiction: 'Canada',
      });
    });
  });
});
