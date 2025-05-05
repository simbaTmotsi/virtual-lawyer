from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import List, Optional

router = APIRouter()

@router.get("/")
async def get_documents():
    """Endpoint to list all documents"""
    return {"documents": [{"id": 1, "name": "Contract.pdf", "case_id": 1}]}

@router.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    """Endpoint to upload a new document"""
    return {"filename": file.filename, "status": "uploaded"}
