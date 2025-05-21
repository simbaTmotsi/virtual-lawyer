import os
import json
from typing import List, Dict, Any, Optional
import google.generativeai as genai
from ..utils.logger import get_logger

logger = get_logger(__name__)

from asgiref.sync import sync_to_async
from backend.admin_portal.models import APIKeyStorage # This import needs Django to be setup

# logger is already defined above

# Global variable to store the key, though direct use is minimized
# current_gemini_api_key = None 

# genai configuration and model initialization will be handled by load_and_configure_gemini

class GeminiService:
    """Service to interact with Google's Gemini AI models"""
    
    _instance = None

    # Make it a singleton
    def __new__(cls, *args, **kwargs):
        if cls._instance is None:
            cls._instance = super(GeminiService, cls).__new__(cls)
        return cls._instance

    def __init__(self, model_name: str = 'gemini-pro'):
        """Initialize the Gemini service. Key fetching and model setup are deferred."""
        # Ensure __init__ is only run once for the singleton
        if not hasattr(self, '_initialized_once'): 
            self.model_name = model_name # Store model name for later use
            self.model = None
            self.initialized = False
            self.current_api_key = None # Store the currently configured API key
            logger.info(f"GeminiService instance created. Waiting for asynchronous initialization with model '{model_name}'.")
            self._initialized_once = True
    
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
gemini_service = GeminiService() # model_name can be passed if different from 'gemini-pro'

async def load_and_configure_gemini(service_instance: GeminiService):
    """
    Fetches the Gemini API key from Django's APIKeyStorage,
    configures the genai library, and initializes the GeminiService instance.
    """
    
    logger.info(f"Attempting to load and configure Gemini API key for instance {id(service_instance)}...")
    try:
        # Django should be set up by main.py's startup event
        api_key_from_db = await sync_to_async(APIKeyStorage.get_api_key)('gemini_api_key')
        
        if api_key_from_db:
            genai.configure(api_key=api_key_from_db)
            service_instance.current_api_key = api_key_from_db
            logger.info("Gemini API key fetched and genai configured successfully.")
            
            try:
                service_instance.model = genai.GenerativeModel(service_instance.model_name)
                service_instance.initialized = True
                logger.info(f"GeminiService model '{service_instance.model_name}' initialized successfully for instance {id(service_instance)}.")
            except Exception as e:
                service_instance.model = None
                service_instance.initialized = False
                service_instance.current_api_key = None # Key is problematic
                logger.error(f"Failed to initialize Gemini model '{service_instance.model_name}' after key configuration: {e}")
        else:
            service_instance.current_api_key = None
            service_instance.initialized = False
            service_instance.model = None
            logger.warning("Gemini API key not found in storage. Gemini service remains uninitialized.")

    except Exception as e:
        service_instance.current_api_key = None
        service_instance.initialized = False
        service_instance.model = None
        logger.error(f"An error occurred during Gemini API key fetching/configuration: {e}", exc_info=True)

async def refresh_gemini_client(service_instance: Optional[GeminiService] = None):
    """
    Refreshes the Gemini client by fetching the latest API key from storage
    and re-initializing the genai model if the key has changed or service is not initialized.
    """
    if service_instance is None:
        service_instance = gemini_service # Use the global singleton

    logger.info(f"Attempting to refresh Gemini client for instance {id(service_instance)}...")
    try:
        new_api_key = await sync_to_async(APIKeyStorage.get_api_key)('gemini_api_key')

        if new_api_key:
            if new_api_key != service_instance.current_api_key or not service_instance.initialized:
                logger.info(f"New or different Gemini API key found, or service uninitialized. Re-configuring. Old key: {'***' if service_instance.current_api_key else 'None'}")
                genai.configure(api_key=new_api_key)
                service_instance.current_api_key = new_api_key
                
                try:
                    service_instance.model = genai.GenerativeModel(service_instance.model_name)
                    service_instance.initialized = True
                    logger.info(f"GeminiService model '{service_instance.model_name}' refreshed and initialized successfully.")
                except Exception as model_init_e:
                    service_instance.model = None
                    service_instance.initialized = False
                    # Keep current_api_key as it was set, but log model init failure
                    logger.error(f"Failed to initialize Gemini model '{service_instance.model_name}' during refresh: {model_init_e}", exc_info=True)
            else:
                logger.info("Gemini API key unchanged and service already initialized. No refresh needed.")
        else:
            logger.warning("Gemini API key not found in storage during refresh. De-initializing Gemini service.")
            service_instance.current_api_key = None
            service_instance.initialized = False
            service_instance.model = None
            # It's good practice to clear the API key in genai if possible, 
            # but genai.configure(api_key=None) might error or not be supported.
            # The main thing is self.initialized = False will prevent usage.
            # If genai library holds onto the last valid key, subsequent calls without a key might still work if that key was valid.
            # However, our service logic relies on `self.initialized`.

    except Exception as e:
        logger.error(f"An error occurred during Gemini client refresh: {e}", exc_info=True)
        # Potentially mark as uninitialized depending on the error
        # For now, if an error occurs during fetch/configure, it might be safer to mark as uninitialized.
        service_instance.initialized = False
        service_instance.model = None
        # service_instance.current_api_key could be left as is, or cleared.
        # Clearing it might be safer if the error implies the key is no longer valid.
        # service_instance.current_api_key = None 
