import React, { useState } from 'react';
import { callQueryGemini } from '../../../utils/apiClient'; // Adjust path as needed

// Assuming no specific AdminLayout or Card components are known, using basic structure.

const GeminiQueryPage = () => {
  const [query, setQuery] = useState('');
  const [documentContext, setDocumentContext] = useState('');
  const [chatHistory, setChatHistory] = useState('');
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setResult(null);

    // Attempt to parse documentContext and chatHistory if they are meant to be JSON
    let parsedDocumentContext = documentContext;
    if (documentContext.trim().startsWith('{') || documentContext.trim().startsWith('[')) {
        try {
            parsedDocumentContext = JSON.parse(documentContext);
        } catch (err) {
            // Not valid JSON, send as plain text
        }
    }

    let parsedChatHistory = chatHistory;
    if (chatHistory.trim().startsWith('{') || chatHistory.trim().startsWith('[')) {
        try {
            parsedChatHistory = JSON.parse(chatHistory);
        } catch (err) {
            // Not valid JSON, send as plain text
        }
    }

    try {
      // Pass the potentially parsed values or original strings to the API
      const data = await callQueryGemini(query, parsedDocumentContext, parsedChatHistory);
      setResult(data);
    } catch (err) {
      setError(err.message || 'An error occurred while querying Gemini.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Gemini AI Query</h1>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="gemini-query" style={{ display: 'block', marginBottom: '5px' }}>Query:</label>
          <textarea
            id="gemini-query"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            required
            rows={5}
            style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="gemini-doc-context" style={{ display: 'block', marginBottom: '5px' }}>Document Context (Optional):</label>
          <textarea
            id="gemini-doc-context"
            value={documentContext}
            onChange={(e) => setDocumentContext(e.target.value)}
            placeholder="Provide document context as JSON or plain text. For multiple documents, use an array of objects structure if sending JSON."
            rows={5}
            style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="gemini-chat-history" style={{ display: 'block', marginBottom: '5px' }}>Chat History (Optional):</label>
          <textarea
            id="gemini-chat-history"
            value={chatHistory}
            onChange={(e) => setChatHistory(e.target.value)}
            placeholder="Provide chat history as JSON (e.g., array of {role: 'user/model', parts: [{text: '...'}) or plain text."
            rows={5}
            style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
        </div>
        <button 
          type="submit" 
          disabled={isLoading} 
          style={{ 
            padding: '10px 15px', 
            border: 'none', 
            borderRadius: '4px', 
            backgroundColor: isLoading ? '#ccc' : '#007bff', 
            color: 'white', 
            cursor: 'pointer' 
          }}
        >
          {isLoading ? 'Querying...' : 'Query Gemini'}
        </button>
      </form>

      {error && (
        <div style={{ color: 'red', marginTop: '20px', padding: '10px', border: '1px solid red', borderRadius: '4px' }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {result && (
        <div style={{ marginTop: '20px', border: '1px solid #eee', padding: '15px', borderRadius: '4px', backgroundColor: '#f9f9f9' }}>
          <h2>AI Response:</h2>
          <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word', backgroundColor: '#fff', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}>
            {typeof result.response === 'object' ? JSON.stringify(result.response, null, 2) : result.response}
          </pre>
          {/* TODO: Consider adding a "Copy Response" button here */}
        </div>
      )}
    </div>
  );
};

export default GeminiQueryPage;
