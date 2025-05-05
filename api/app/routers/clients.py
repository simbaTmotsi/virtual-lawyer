from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter()

class ClientBase(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None

@router.get("/")
async def get_clients():
    """Endpoint to list all clients"""
    return {"clients": [{"id": 1, "name": "John Doe", "email": "john@example.com"}]}

@router.get("/{client_id}")
async def get_client(client_id: int):
    """Endpoint to get a specific client by ID"""
    return {"id": client_id, "name": "John Doe", "email": "john@example.com"}
