import os
import json
import requests
from typing import Dict, Any, Optional
from ..utils.logger import get_logger

logger = get_logger(__name__)

# ZimLII API Configuration
ZIMLII_API_URL = os.getenv("ZIMLII_API_URL", "https://zimlii.org/api/v1")
ZIMLII_API_KEY = os.getenv("ZIMLII_API_KEY")


class ZimLIIService:
    """Service to interact with ZimLII (Zimbabwe Legal Information Institute) API"""
    
    def __init__(self, api_url: Optional[str] = None, api_key: Optional[str] = None):
        """Initialize the ZimLII service with API credentials"""
        self.api_url = api_url or ZIMLII_API_URL
        self.api_key = api_key or ZIMLII_API_KEY
        self.headers = {
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
        
        if self.api_key:
            self.headers["Authorization"] = f"Token {self.api_key}"
    
    def search(self, 
               query: str, 
               jurisdiction: Optional[str] = None,
               doc_type: Optional[str] = None,
               date_from: Optional[str] = None,
               date_to: Optional[str] = None,
               page: int = 1,
               page_size: int = 10) -> Dict[str, Any]:
        """
        Search for cases, legislation, and other legal documents on ZimLII
        
        Args:
            query: Search query text
            jurisdiction: Specific jurisdiction to search within
            doc_type: Document type filter (e.g., "judgment", "legislation")
            date_from: Start date for filtering (format: YYYY-MM-DD)
            date_to: End date for filtering (format: YYYY-MM-DD)
            page: Page number for pagination
            page_size: Number of results per page
            
        Returns:
            Dict containing search results and metadata
        """
        try:
            params = {
                "q": query,
                "page": page,
                "page_size": page_size
            }
            
            # Add optional filters if provided
            if jurisdiction:
                params["jurisdiction"] = jurisdiction
            if doc_type:
                params["doc_type"] = doc_type
            if date_from:
                params["date_from"] = date_from
            if date_to:
                params["date_to"] = date_to
            
            # Make the API request
            response = self._make_request("GET", "/search", params=params)
            
            # Process the response
            return self._process_search_results(response, query, jurisdiction)
            
        except Exception as e:
            logger.error(f"Error searching ZimLII: {e}")
            return {
                "error": str(e),
                "count": 0,
                "query": query,
                "items": []
            }
    
    def get_document(self, document_id: str) -> Dict[str, Any]:
        """
        Retrieve a specific document by ID
        
        Args:
            document_id: The ID of the document to retrieve
            
        Returns:
            Dict containing the document data
        """
        try:
            # Make the API request
            response = self._make_request("GET", f"/documents/{document_id}")
            
            # Return the document data
            return response
            
        except Exception as e:
            logger.error(f"Error retrieving document from ZimLII: {e}")
            return {
                "error": str(e),
                "id": document_id,
                "content": None
            }
    
    def get_case_by_citation(self, citation: str) -> Dict[str, Any]:
        """
        Find a case by its citation
        
        Args:
            citation: Legal citation for the case
            
        Returns:
            Dict containing the case data if found
        """
        try:
            # Search for the case using the citation
            search_results = self.search(citation, doc_type="judgment")
            
            # Check if any results match the citation
            if search_results.get("count", 0) > 0:
                for item in search_results.get("items", []):
                    if item.get("citation") and citation.lower() in item.get("citation").lower():
                        # Found a match, get the full document
                        return self.get_document(item.get("id"))
            
            # No matching case found
            return {
                "error": "Case not found",
                "citation": citation,
                "content": None
            }
            
        except Exception as e:
            logger.error(f"Error finding case by citation: {e}")
            return {
                "error": str(e),
                "citation": citation,
                "content": None
            }
    
    def _make_request(self, method: str, endpoint: str, params: Optional[Dict[str, Any]] = None, data: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Make an HTTP request to the ZimLII API
        
        Args:
            method: HTTP method (GET, POST, etc.)
            endpoint: API endpoint path
            params: Query parameters
            data: Request body data for POST/PUT requests
            
        Returns:
            Dict containing the API response
        """
        url = f"{self.api_url.rstrip('/')}{endpoint}"
        
        try:
            # Make request with proper error handling
            if method.upper() == "GET":
                response = requests.get(url, headers=self.headers, params=params)
            elif method.upper() == "POST":
                response = requests.post(url, headers=self.headers, params=params, json=data)
            else:
                raise ValueError(f"Unsupported HTTP method: {method}")
            
            # Check for successful response
            response.raise_for_status()
            
            # Parse and return JSON response
            return response.json()
            
        except requests.exceptions.RequestException as e:
            logger.error(f"ZimLII API request failed: {e}")
            
            # Try to extract error message from response if available
            error_message = str(e)
            try:
                if hasattr(e, 'response') and e.response is not None:
                    error_data = e.response.json()
                    if 'detail' in error_data:
                        error_message = error_data['detail']
                    elif 'error' in error_data:
                        error_message = error_data['error']
            except Exception:
                pass
            
            return {
                "error": error_message
            }
    
    def _process_search_results(self, response: Dict[str, Any], query: str, jurisdiction: Optional[str] = None) -> Dict[str, Any]:
        """
        Process and standardize search results format
        
        Args:
            response: Raw API response from ZimLII
            query: Original search query
            jurisdiction: Jurisdiction filter used
            
        Returns:
            Dict containing processed results in a standardized format
        """
        # Handle error responses
        if "error" in response:
            return {
                "error": response["error"],
                "count": 0,
                "query": query,
                "jurisdiction": jurisdiction,
                "items": []
            }
        
        # Process successful response
        try:
            results = {
                "count": response.get("count", 0),
                "query": query,
                "jurisdiction": jurisdiction,
                "items": []
            }
            
            # Format items
            for item in response.get("results", []):
                formatted_item = {
                    "id": item.get("id"),
                    "title": item.get("title"),
                    "type": item.get("type"),
                    "date": item.get("date"),
                    "url": item.get("url"),
                    "citation": item.get("citation"),
                    "court": item.get("court_name"),
                    "excerpt": item.get("snippet") or item.get("summary")
                }
                results["items"].append(formatted_item)
            
            # Add pagination info if available
            if "next" in response or "previous" in response:
                results["pagination"] = {
                    "next": response.get("next"),
                    "prev": response.get("previous"),
                    "startIndex": response.get("start_index", 1),
                    "endIndex": response.get("end_index"),
                }
            
            return results
            
        except Exception as e:
            logger.error(f"Error processing ZimLII search results: {e}")
            return {
                "error": str(e),
                "count": 0,
                "query": query,
                "jurisdiction": jurisdiction,
                "items": []
            }


# Create a singleton instance
zimlii_service = ZimLIIService()
