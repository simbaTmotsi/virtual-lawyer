from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

router = APIRouter()

class CaseBase(BaseModel):
    title: str
    client_id: int
    description: Optional[str] = None

@router.get("/")
async def get_cases():
    """Endpoint to list all cases"""
    return {"cases": [{"id": 1, "title": "Smith vs. Jones", "client_id": 1}]}

@router.get("/{case_id}")
async def get_case(case_id: int):
    """Endpoint to get a specific case by ID"""
    return {"id": case_id, "title": "Smith vs. Jones", "client_id": 1}
