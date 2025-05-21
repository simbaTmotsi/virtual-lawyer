import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import LegalDatabaseSearchPage from './LegalDatabaseSearchPage';
import * as apiClient from '../../../utils/apiClient';

jest.mock('../../../utils/apiClient');

describe('LegalDatabaseSearchPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders the page and form elements correctly', () => {
    render(<LegalDatabaseSearchPage />);
    expect(screen.getByRole('heading', { name: /legal database search/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/query:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/database:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/jurisdiction \(optional\):/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/document type \(optional\):/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/date from \(optional\):/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/date to \(optional\):/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /search databases/i })).toBeInTheDocument();
  });

  test('allows typing in form fields and selecting database', () => {
    render(<LegalDatabaseSearchPage />);
    fireEvent.change(screen.getByLabelText(/query:/i), { target: { value: 'Test Query' } });
    expect(screen.getByLabelText(/query:/i)).toHaveValue('Test Query');

    fireEvent.change(screen.getByLabelText(/database:/i), { target: { value: 'SAFLII' } });
    expect(screen.getByLabelText(/database:/i)).toHaveValue('SAFLII');
    
    fireEvent.change(screen.getByLabelText(/jurisdiction \(optional\):/i), { target: { value: 'ZA' } });
    expect(screen.getByLabelText(/jurisdiction \(optional\):/i)).toHaveValue('ZA');
  });

  test('handles successful API call and displays results in table', async () => {
    const mockResponse = { 
      items: [
        { id: 1, title: 'Case Alpha', excerpt: 'Summary Alpha', source: 'ZimLII', url: 'http://example.com/alpha', relevance_score: 0.95 },
        { id: 2, title: 'Statute Beta', excerpt: 'Summary Beta', source: 'SAFLII', url: 'http://example.com/beta', relevance_score: 0.88 },
      ] 
    };
    apiClient.callSearchLegalDatabases.mockResolvedValue(mockResponse);

    render(<LegalDatabaseSearchPage />);

    fireEvent.change(screen.getByLabelText(/query:/i), { target: { value: 'search term' } });
    fireEvent.change(screen.getByLabelText(/database:/i), { target: { value: 'ZimLII' } });
    fireEvent.change(screen.getByLabelText(/jurisdiction \(optional\):/i), { target: { value: 'ZW' } });
    
    fireEvent.click(screen.getByRole('button', { name: /search databases/i }));

    expect(screen.getByRole('button', { name: /searching.../i })).toBeDisabled();

    await waitFor(() => {
      expect(apiClient.callSearchLegalDatabases).toHaveBeenCalledWith({
        query: 'search term',
        database: 'ZimLII',
        jurisdiction: 'ZW',
        // doc_type, date_from, date_to are not filled, so not sent
      });
    });
    
    await waitFor(() => {
      expect(screen.getByText(/search results:/i)).toBeInTheDocument();
    });
    expect(screen.getByText('Case Alpha')).toBeInTheDocument();
    expect(screen.getByText('Statute Beta')).toBeInTheDocument();
    expect(screen.getAllByText(/view source/i).length).toBe(2);
    expect(screen.queryByText(/error:/i)).not.toBeInTheDocument();
  });
  
  test('displays "No results found" message when API returns empty items', async () => {
    apiClient.callSearchLegalDatabases.mockResolvedValue({ items: [] });
    render(<LegalDatabaseSearchPage />);
    fireEvent.change(screen.getByLabelText(/query:/i), { target: { value: 'no results query' } });
    fireEvent.click(screen.getByRole('button', { name: /search databases/i }));

    await waitFor(() => {
      expect(screen.getByText(/no results found for your query/i)).toBeInTheDocument();
    });
  });

  test('handles API error and displays error message', async () => {
    const errorMessage = 'Failed to fetch';
    apiClient.callSearchLegalDatabases.mockRejectedValue(new Error(errorMessage));

    render(<LegalDatabaseSearchPage />);

    fireEvent.change(screen.getByLabelText(/query:/i), { target: { value: 'Error Query' } });
    fireEvent.click(screen.getByRole('button', { name: /search databases/i }));

    await waitFor(() => {
      expect(apiClient.callSearchLegalDatabases).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.getByText(`Error: ${errorMessage}`)).toBeInTheDocument();
    });
    expect(screen.queryByText(/search results:/i)).not.toBeInTheDocument();
  });
  
  test('submits all filter fields when populated', async () => {
    const mockResponse = { items: [] };
    apiClient.callSearchLegalDatabases.mockResolvedValue(mockResponse);

    render(<LegalDatabaseSearchPage />);

    fireEvent.change(screen.getByLabelText(/query:/i), { target: { value: 'Full Query' } });
    fireEvent.change(screen.getByLabelText(/database:/i), { target: { value: 'AfricanLII' } });
    fireEvent.change(screen.getByLabelText(/jurisdiction \(optional\):/i), { target: { value: 'Kenya' } });
    fireEvent.change(screen.getByLabelText(/document type \(optional\):/i), { target: { value: 'Legislation' } });
    fireEvent.change(screen.getByLabelText(/date from \(optional\):/i), { target: { value: '2023-01-01' } });
    fireEvent.change(screen.getByLabelText(/date to \(optional\):/i), { target: { value: '2023-12-31' } });
    
    fireEvent.click(screen.getByRole('button', { name: /search databases/i }));

    await waitFor(() => {
      expect(apiClient.callSearchLegalDatabases).toHaveBeenCalledWith({
        query: 'Full Query',
        database: 'AfricanLII',
        jurisdiction: 'Kenya',
        doc_type: 'Legislation',
        date_from: '2023-01-01',
        date_to: '2023-12-31',
      });
    });
  });
});
