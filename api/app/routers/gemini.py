from fastapi import APIRouter, Depends, HTTPException, Body
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from ..services.gemini_service import gemini_service
from ..utils.logger import get_logger

logger = get_logger(__name__)

router = APIRouter(
    prefix="/research",
    tags=["Research"],
    responses={404: {"description": "Not found"}},
)

class ChatMessage(BaseModel):
    type: str  # 'user' or 'ai'
    content: str
    timestamp: Optional[str] = None

class DocumentContext(BaseModel):
    id: Optional[str] = None
    name: Optional[str] = None
    content: Optional[str] = None

class GeminiQuery(BaseModel):
    query: str
    documentContext: Optional[List[DocumentContext]] = None
    chatHistory: Optional[List[ChatMessage]] = None

@router.post("/query-gemini")
async def query_gemini(query_data: GeminiQuery = Body(...)):
    """
    Process a query using the Gemini AI model.
    """
    try:
        # Process document context if provided
        document_context = []
        if query_data.documentContext:
            document_context = [
                {
                    "id": doc.id,
                    "name": doc.name,
                    "content": doc.content
                }
                for doc in query_data.documentContext
                if doc.content  # Only include documents with content
            ]
        
        # Process chat history if provided
        chat_history = []
        if query_data.chatHistory:
            chat_history = [
                {
                    "type": msg.type,
                    "content": msg.content
                }
                for msg in query_data.chatHistory
            ]
        
        # Call Gemini service
        result = gemini_service.query_gemini(
            query=query_data.query,
            document_context=document_context,
            chat_history=chat_history
        )
        
        return result
    except Exception as e:
        logger.error(f"Error querying Gemini: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error querying Gemini: {str(e)}")
