# GeminiService class for interacting with the Gemini AI model
import os
import json
from typing import List, Dict, Any, Optional
import logging
import google.generativeai as genai
from ..utils.logger import get_logger

logger = get_logger(__name__)

from asgiref.sync import sync_to_async
from ..utils.django_utils import get_api_key_storage_model

class GeminiService:
    """Service to interact with Google's Gemini AI models"""
    
    _instance = None

    # Make it a singleton
    def __new__(cls, *args, **kwargs):
        if cls._instance is None:
            cls._instance = super(GeminiService, cls).__new__(cls)
        return cls._instance

    def __init__(self, model_name: str = 'gemini-pro'):
        """Initialize the Gemini service with deferred setup"""
        # Ensure __init__ is only run once for the singleton
        if not hasattr(self, '_initialized_once'): 
            self.model_name = model_name
            self.model = None
            self.initialized = False
            self.current_api_key = None
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
        """
        prompt_parts = []
        
        # System instruction
        system_instruction = """You are a legal assistant specializing in Zimbabwe law. Help the user with their legal research questions."""
        
        prompt_parts.append(system_instruction)
        
        # Add the current query
        prompt_parts.append(f"CURRENT QUERY: {query}\n\nPlease provide a helpful response.")
        
        return "\n\n".join(prompt_parts)
    
    def _process_response(self, response: Any) -> Dict[str, Any]:
        """
        Process and parse the Gemini response
        """
        try:
            response_text = response.text
            
            return {
                "response": response_text,
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

async def load_and_configure_gemini(service_instance: GeminiService):
    """
    Fetches the Gemini API key from Django's APIKeyStorage,
    configures the genai library, and initializes the GeminiService instance.
    """
    
    logger.info(f"Attempting to load and configure Gemini API key...")
    try:
        # Get APIKeyStorage model through utility function
        APIKeyStorage = get_api_key_storage_model()
        
        # Django should be set up by main.py's startup event
        api_key_from_db = await sync_to_async(APIKeyStorage.get_api_key)('gemini_api_key')
        
        if api_key_from_db:
            genai.configure(api_key=api_key_from_db)
            service_instance.current_api_key = api_key_from_db
            logger.info("Gemini API key fetched and genai configured successfully.")
            
            try:
                service_instance.model = genai.GenerativeModel(service_instance.model_name)
                service_instance.initialized = True
                logger.info(f"GeminiService model '{service_instance.model_name}' initialized successfully.")
            except Exception as e:
                service_instance.model = None
                service_instance.initialized = False
                service_instance.current_api_key = None
                logger.error(f"Failed to initialize Gemini model: {e}")
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
        raise

async def refresh_gemini_client(service_instance: Optional[GeminiService] = None):
    """
    Refreshes the Gemini client by fetching the latest API key from storage
    and re-initializing the genai model if the key has changed or service is not initialized.
    """
    if service_instance is None:
        service_instance = gemini_service
        
    await load_and_configure_gemini(service_instance)
