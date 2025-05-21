import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import GeminiQueryPage from './GeminiQueryPage';
import * as apiClient from '../../../utils/apiClient'; // Mock the whole module

// Mock the apiClient
jest.mock('../../../utils/apiClient');

describe('GeminiQueryPage', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
  });

  test('renders the page and form elements correctly', () => {
    render(<GeminiQueryPage />);
    expect(screen.getByRole('heading', { name: /gemini ai query/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/query:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/document context \(optional\):/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/chat history \(optional\):/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /query gemini/i })).toBeInTheDocument();
  });

  test('allows typing in form fields', () => {
    render(<GeminiQueryPage />);
    fireEvent.change(screen.getByLabelText(/query:/i), { target: { value: 'Test Query' } });
    expect(screen.getByLabelText(/query:/i)).toHaveValue('Test Query');

    fireEvent.change(screen.getByLabelText(/document context \(optional\):/i), { target: { value: 'Test Context' } });
    expect(screen.getByLabelText(/document context \(optional\):/i)).toHaveValue('Test Context');

    fireEvent.change(screen.getByLabelText(/chat history \(optional\):/i), { target: { value: '[{"role": "user", "parts": [{"text": "Hello"}]}]' } });
    expect(screen.getByLabelText(/chat history \(optional\):/i)).toHaveValue('[{"role": "user", "parts": [{"text": "Hello"}]}]');
  });

  test('handles successful API call and displays results', async () => {
    const mockResponse = { response: 'AI says hello!' };
    apiClient.callQueryGemini.mockResolvedValue(mockResponse);

    render(<GeminiQueryPage />);

    fireEvent.change(screen.getByLabelText(/query:/i), { target: { value: 'Hello AI' } });
    fireEvent.change(screen.getByLabelText(/document context \(optional\):/i), { target: { value: 'Some doc' } });
    fireEvent.change(screen.getByLabelText(/chat history \(optional\):/i), { target: { value: '[{"role":"user", "parts":[{"text":"Hi"}]}]' } });
    
    fireEvent.click(screen.getByRole('button', { name: /query gemini/i }));

    expect(screen.getByRole('button', { name: /querying.../i })).toBeDisabled();

    await waitFor(() => {
      expect(apiClient.callQueryGemini).toHaveBeenCalledWith(
        'Hello AI',
        'Some doc', // Sent as plain text because it's not valid JSON
        [{role: "user", parts:[{text:"Hi"}]}] // Parsed because it's valid JSON
      );
    });
    
    await waitFor(() => {
      expect(screen.getByText(/ai response:/i)).toBeInTheDocument();
    });
    expect(screen.getByText(mockResponse.response)).toBeInTheDocument();
    expect(screen.queryByText(/error:/i)).not.toBeInTheDocument();
  });
  
  test('handles successful API call with empty optional fields', async () => {
    const mockResponse = { response: 'AI processed basic query.' };
    apiClient.callQueryGemini.mockResolvedValue(mockResponse);

    render(<GeminiQueryPage />);

    fireEvent.change(screen.getByLabelText(/query:/i), { target: { value: 'Basic Query' } });
    
    fireEvent.click(screen.getByRole('button', { name: /query gemini/i }));

    expect(screen.getByRole('button', { name: /querying.../i })).toBeDisabled();

    await waitFor(() => {
      expect(apiClient.callQueryGemini).toHaveBeenCalledWith(
        'Basic Query',
        '', 
        '' 
      );
    });
    
    await waitFor(() => {
      expect(screen.getByText(/ai response:/i)).toBeInTheDocument();
    });
    expect(screen.getByText(mockResponse.response)).toBeInTheDocument();
  });


  test('handles API error and displays error message', async () => {
    const errorMessage = 'Network Error';
    apiClient.callQueryGemini.mockRejectedValue(new Error(errorMessage));

    render(<GeminiQueryPage />);

    fireEvent.change(screen.getByLabelText(/query:/i), { target: { value: 'Error Query' } });
    fireEvent.click(screen.getByRole('button', { name: /query gemini/i }));

    expect(screen.getByRole('button', { name: /querying.../i })).toBeDisabled();

    await waitFor(() => {
      expect(apiClient.callQueryGemini).toHaveBeenCalledWith('Error Query', '', '');
    });

    await waitFor(() => {
      expect(screen.getByText(`Error: ${errorMessage}`)).toBeInTheDocument();
    });
    expect(screen.queryByText(/ai response:/i)).not.toBeInTheDocument();
  });

  test('attempts to parse JSON for documentContext and chatHistory', async () => {
    apiClient.callQueryGemini.mockResolvedValue({ response: 'Parsed correctly' });
    render(<GeminiQueryPage />);

    const query = "Test JSON parsing";
    const docContextJSON = '{"id": "doc1", "content": "Test content"}';
    const chatHistoryJSON = '[{"role": "user", "parts": [{"text": "Hello"}]}]';

    fireEvent.change(screen.getByLabelText(/query:/i), { target: { value: query } });
    fireEvent.change(screen.getByLabelText(/document context \(optional\):/i), { target: { value: docContextJSON } });
    fireEvent.change(screen.getByLabelText(/chat history \(optional\):/i), { target: { value: chatHistoryJSON } });
    fireEvent.click(screen.getByRole('button', { name: /query gemini/i }));

    await waitFor(() => {
      expect(apiClient.callQueryGemini).toHaveBeenCalledWith(
        query,
        JSON.parse(docContextJSON),
        JSON.parse(chatHistoryJSON)
      );
    });
  });

  test('sends documentContext and chatHistory as plain text if not valid JSON', async () => {
    apiClient.callQueryGemini.mockResolvedValue({ response: 'Sent as plain text' });
    render(<GeminiQueryPage />);

    const query = "Test plain text";
    const docContextPlainText = "This is not JSON.";
    const chatHistoryPlainText = "user: Hello model: Hi";

    fireEvent.change(screen.getByLabelText(/query:/i), { target: { value: query } });
    fireEvent.change(screen.getByLabelText(/document context \(optional\):/i), { target: { value: docContextPlainText } });
    fireEvent.change(screen.getByLabelText(/chat history \(optional\):/i), { target: { value: chatHistoryPlainText } });
    fireEvent.click(screen.getByRole('button', { name: /query gemini/i }));

    await waitFor(() => {
      expect(apiClient.callQueryGemini).toHaveBeenCalledWith(
        query,
        docContextPlainText,
        chatHistoryPlainText
      );
    });
  });
});
