from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Body, BackgroundTasks, status
from fastapi.responses import JSONResponse
from typing import List, Dict, Any, Optional
import os
import tempfile
import shutil
import json
from pydantic import BaseModel
from fastapi.security import OAuth2PasswordBearer
from ..dependencies import oauth2_scheme
from ..services.gemini_service import GeminiService
from ..services.zimlii_service import ZimLIIService
from ..utils.document_processor import extract_text_from_pdf, extract_text_from_image
from ..utils.logger import get_logger

logger = get_logger(__name__)

router = APIRouter(
    prefix="/legal-research",
    tags=["Legal Research"],
    responses={404: {"description": "Not found"}},
)

# Initialize services
gemini_service = GeminiService()
zimlii_service = ZimLIIService()

# Pydantic models for request/response validation
class DocumentReference(BaseModel):
    id: str
    name: str
    content: Optional[str] = None

class ChatMessage(BaseModel):
    role: str  # 'user' or 'assistant'
    content: str

class DocumentContext(BaseModel):
    documents: List[DocumentReference]
    
class LegalResearchQuery(BaseModel):
    query: str
    document_ids: Optional[List[str]] = None
    chat_history: Optional[List[ChatMessage]] = None
    include_zimlii_results: bool = False
    
class ZimLIISearchParams(BaseModel):
    query: str
    jurisdiction: Optional[str] = None
    doc_type: Optional[str] = None
    date_from: Optional[str] = None
    date_to: Optional[str] = None

# Define get_current_user function locally to avoid import issues
async def get_current_user(token: str = Depends(oauth2_scheme)) -> Dict[str, Any]:
    """
    Simplified authentication function for legal research routes
    """
    try:
        # Simple placeholder implementation
        if token.startswith("user_") and "_token" in token:
            user_id = token.split("_")[1]
            return {
                "id": int(user_id),
                "email": f"user{user_id}@example.com",
                "role": "user"
            }
        
        # Demo admin user
        if token == "admin_token":
            return {
                "id": 0,
                "email": "admin@example.com",
                "role": "admin"
            }
            
        # Demo token
        if token == "demo_token":
            return {
                "id": 999,
                "email": "demo@example.com",
                "role": "user"
            }
        
        raise ValueError("Invalid token format")
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

@router.post("/query")
async def query_legal_research(
    query_data: LegalResearchQuery,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Process a legal research query with document context and chat history.
    Optionally searches ZimLII for relevant legal information.
    """
    try:
        # Gather active document context
        document_context = []
        if query_data.document_ids:
            # In a real implementation, this would retrieve document content from a database
            # For simplicity, we're using a placeholder
            for doc_id in query_data.document_ids:
                # This should fetch the document content from your document storage
                document_context.append({
                    "id": doc_id,
                    "name": f"Document {doc_id}",
                    "content": "Sample document content. This would be the actual content in production."
                })
        
        # Format chat history if provided
        chat_history = query_data.chat_history if query_data.chat_history else []
        
        # Query Gemini for the response
        gemini_response = gemini_service.query_gemini(
            query=query_data.query,
            document_context=document_context,
            chat_history=[{"role": msg.role, "content": msg.content} for msg in chat_history],
        )
        
        # Check if we need to also search ZimLII
        zimlii_results = None
        if query_data.include_zimlii_results or "/search_zimlii" in query_data.query.lower():
            # Extract search terms - this is simplified and would be more sophisticated in production
            search_query = query_data.query
            if "/search_zimlii" in query_data.query.lower():
                # Extract the actual search terms after the command
                search_parts = query_data.query.lower().split("/search_zimlii", 1)
                if len(search_parts) > 1:
                    search_query = search_parts[1].strip()
            
            zimlii_results = zimlii_service.search(query=search_query)
        
        return {
            "query": query_data.query,
            "gemini_response": gemini_response,
            "zimlii_results": zimlii_results,
            "document_context_used": [doc["name"] for doc in document_context]
        }
    except Exception as e:
        logger.error(f"Error processing legal research query: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing query: {str(e)}")

@router.post("/upload-document")
async def upload_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    document_name: str = Form(...),
    document_type: Optional[str] = Form(None),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Upload a document for legal research and extract its text content.
    Supports PDFs, images (for OCR), and text files.
    """
    try:
        # Create a temp file
        with tempfile.NamedTemporaryFile(delete=False) as temp_file:
            # Copy the uploaded file content to the temp file
            shutil.copyfileobj(file.file, temp_file)
            temp_path = temp_file.name
        
        # Extract text based on file type
        extracted_text = ""
        file_extension = os.path.splitext(file.filename)[1].lower()
        
        # Process the file based on its type
        if file_extension in ['.pdf']:
            # Schedule text extraction as a background task
            background_tasks.add_task(extract_text_from_pdf, temp_path)
            extracted_text = "PDF text extraction in progress..."
        elif file_extension in ['.jpg', '.jpeg', '.png', '.bmp', '.tiff', '.tif']:
            # Schedule OCR as a background task
            background_tasks.add_task(extract_text_from_image, temp_path)
            extracted_text = "Image OCR extraction in progress..."
        elif file_extension in ['.txt', '.md', '.csv', '.docx', '.doc']:
            # For text files, read directly
            with open(temp_path, "r", encoding="utf-8") as f:
                extracted_text = f.read()
        else:
            # Clean up the temp file
            os.unlink(temp_path)
            raise HTTPException(
                status_code=400, 
                detail=f"Unsupported file type: {file_extension}"
            )
        
        # In a real implementation, save the document info and extracted text to a database
        document_id = "doc-" + str(hash(file.filename))  # This is just a placeholder
        
        # Clean up the temp file (if not needed for background processing)
        if file_extension not in ['.pdf', '.jpg', '.jpeg', '.png', '.bmp', '.tiff', '.tif']:
            os.unlink(temp_path)
        
        return {
            "document_id": document_id,
            "name": document_name,
            "original_filename": file.filename,
            "size": file.size,
            "type": document_type or file_extension,
            "text_extraction_status": "complete" if extracted_text else "pending",
            "text_preview": extracted_text[:200] + "..." if len(extracted_text) > 200 else extracted_text
        }
    except Exception as e:
        logger.error(f"Error uploading document: {str(e)}")
        # Clean up temp file if it exists
        if 'temp_path' in locals():
            os.unlink(temp_path)
        raise HTTPException(status_code=500, detail=f"Error uploading document: {str(e)}")

@router.get("/documents/{document_id}")
async def get_document(
    document_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Get a document's details and content by its ID"""
    # In a real implementation, this would retrieve the document from your database
    # This is just a placeholder
    try:
        # Placeholder - would normally fetch from database
        document = {
            "id": document_id,
            "name": f"Document {document_id}",
            "content": "This is a placeholder for the document's content."
        }
        return document
    except Exception as e:
        logger.error(f"Error getting document: {str(e)}")
        raise HTTPException(status_code=404, detail="Document not found")

@router.delete("/documents/{document_id}")
async def delete_document(
    document_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Delete a document by its ID"""
    try:
        # In a real implementation, this would remove the document from your database
        # This is just a placeholder
        return {"status": "success", "message": f"Document {document_id} deleted successfully"}
    except Exception as e:
        logger.error(f"Error deleting document: {str(e)}")
        raise HTTPException(status_code=404, detail="Document not found")

@router.post("/zimlii-search")
async def search_zimlii_direct(
    search_params: ZimLIISearchParams,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Direct search endpoint for ZimLII legal information
    """
    try:
        results = zimlii_service.search(
            query=search_params.query,
            jurisdiction=search_params.jurisdiction,
            doc_type=search_params.doc_type,
            date_from=search_params.date_from,
            date_to=search_params.date_to
        )
        return results
    except Exception as e:
        logger.error(f"Error searching ZimLII: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error searching ZimLII: {str(e)}")
