import os
import json
from typing import List, Dict, Any, Optional
import google.generativeai as genai
from ..utils.logger import get_logger

logger = get_logger(__name__)

# Configure the Gemini API with your API key
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# Initialize Gemini
try:
    genai.configure(api_key=GEMINI_API_KEY)
    default_model = genai.GenerativeModel('gemini-pro')
    logger.info("Gemini API initialized successfully")
except Exception as e:
    logger.error(f"Failed to initialize Gemini API: {e}")
    default_model = None


class GeminiService:
    """Service to interact with Google's Gemini AI models"""
    
    def __init__(self, model_name: str = 'gemini-pro'):
        """Initialize the Gemini service with a specific model"""
        try:
            self.model = genai.GenerativeModel(model_name)
            self.initialized = True
        except Exception as e:
            logger.error(f"Failed to initialize Gemini model {model_name}: {e}")
            self.model = default_model
            self.initialized = default_model is not None
    
    def query_gemini(
        self, 
        query: str, 
        document_context: Optional[List[Dict[str, Any]]] = None,
        chat_history: Optional[List[Dict[str, Any]]] = None,
        temperature: float = 0.7
    ) -> Dict[str, Any]:
        """
        Query the Gemini AI model with context from documents and chat history
        
        Args:
            query: The user's query
            document_context: List of documents with their content
            chat_history: Previous chat messages for context
            temperature: Sampling temperature (higher = more creative, lower = more deterministic)
            
        Returns:
            Dict containing the response text and additional metadata
        """
        if not self.initialized:
            return {
                "error": "Gemini API not initialized",
                "response": "I'm sorry, but I'm having trouble accessing the AI service. Please try again later."
            }
        
        try:
            # Construct prompt with proper context
            prompt = self._construct_prompt(query, document_context, chat_history)
            
            # Generate response
            response = self.model.generate_content(
                prompt,
                generation_config=genai.GenerationConfig(
                    temperature=temperature,
                    top_p=0.95,
                    top_k=40,
                    max_output_tokens=8192,
                )
            )
            
            # Process response
            return self._process_response(response)
            
        except Exception as e:
            logger.error(f"Error querying Gemini: {e}")
            return {
                "error": str(e),
                "response": "I'm sorry, but I encountered an error while processing your request. Please try again."
            }
    
    def _construct_prompt(
        self, 
        query: str, 
        document_context: Optional[List[Dict[str, Any]]] = None,
        chat_history: Optional[List[Dict[str, Any]]] = None
    ) -> str:
        """
        Construct a prompt for Gemini with appropriate context
        
        Args:
            query: The user's query
            document_context: List of documents with their content
            chat_history: Previous chat messages for context
            
        Returns:
            A formatted prompt string
        """
        prompt_parts = []
        
        # System instruction
        system_instruction = """You are a legal assistant specializing in Zimbabwe law. Help the user with their legal research questions.
Your answers should be:
1. Accurate and based on facts
2. Properly cited when referencing case law or legislation
3. Neutral and objective
4. Clear and concise

When referencing Zimbabwe case law or legislation that you're uncertain about, indicate that the user may want to search ZimLII (Zimbabwe Legal Information Institute) for more information.

If you think the user should search ZimLII for specific information, suggest keywords for their search.

Remember to follow these guidelines:
- Do not make up legal citations or cases
- Clearly indicate when you're uncertain
- Provide balanced perspectives on legal questions
- Focus on Zimbabwe law and jurisdiction when relevant"""
        
        prompt_parts.append(system_instruction)
        
        # Add document context if available
        if document_context and len(document_context) > 0:
            doc_context = "DOCUMENT CONTEXT:\n"
            for doc in document_context:
                doc_context += f"Document: {doc.get('name', 'Unnamed Document')}\n"
                doc_context += f"Content: {doc.get('content', 'No content available')}\n\n"
            
            prompt_parts.append(doc_context)
        
        # Add relevant chat history if available
        if chat_history and len(chat_history) > 0:
            chat_context = "PREVIOUS CONVERSATION:\n"
            # Only include the last 5 messages to avoid token limits
            for msg in chat_history[-5:]:
                role = "User" if msg.get('type') == 'user' else "Assistant"
                chat_context += f"{role}: {msg.get('content', '')}\n"
            
            prompt_parts.append(chat_context)
        
        # Add the current query
        prompt_parts.append(f"CURRENT QUERY: {query}\n\nPlease provide a helpful response.")
        
        return "\n\n".join(prompt_parts)
    
    def _process_response(self, response: Any) -> Dict[str, Any]:
        """
        Process and parse the Gemini response
        
        Args:
            response: Raw response from Gemini API
            
        Returns:
            Dict with processed response and metadata
        """
        try:
            response_text = response.text
            
            # Check if the response suggests searching ZimLII
            needs_zimlii = any(term in response_text.lower() for term in 
                             ['search zimlii', 'check zimlii', 'zimlii database', 'zimlii for more', 'zimbabwe legal information institute'])
            
            # Extract a potential ZimLII search query
            zimlii_query = None
            if needs_zimlii:
                # Look for explicit search suggestions
                import re
                match = re.search(r'search(?:\s+ZimLII|\s+the\s+ZimLII\s+database)?\s+for\s+["\'"]([^"\']+)["\']', response_text)
                if match:
                    zimlii_query = match.group(1)
                else:
                    # Try to extract case names or citation patterns
                    case_match = re.search(r'\[([^\]]+)\]', response_text)
                    if case_match:
                        zimlii_query = case_match.group(1)
            
            # Extract references/citations
            references = []
            import re
            # Look for bracketed citations [Case Name, Year]
            citations = re.findall(r'\[([^\]]+)\]', response_text)
            if citations:
                references.extend(citations)
                
            # Look for section references like "Section X of Y Act"
            sections = re.findall(r'Section\s+(\d+)\s+of\s+the\s+([^.,]+)', response_text)
            if sections:
                references.extend([f"Section {s[0]} of {s[1]}" for s in sections])
            
            return {
                "response": response_text,
                "needsZimLII": needs_zimlii,
                "zimLIIQuery": zimlii_query,
                "references": references,
                "rawResponse": str(response)
            }
        except Exception as e:
            logger.error(f"Error processing Gemini response: {e}")
            return {
                "error": str(e),
                "response": "I'm sorry, but I encountered an error while processing my response. Please try again."
            }


# Create a singleton instance
gemini_service = GeminiService()
