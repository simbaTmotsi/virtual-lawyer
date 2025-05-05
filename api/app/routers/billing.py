from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

router = APIRouter()

class TimeEntry(BaseModel):
    case_id: int
    description: str
    hours: float
    date: datetime

@router.get("/invoices")
async def get_invoices():
    """Endpoint to list all invoices"""
    return {"invoices": [{"id": 1, "client_id": 1, "amount": 500.00, "status": "pending"}]}

@router.post("/time-entries")
async def add_time_entry(entry: TimeEntry):
    """Endpoint to add a new time entry"""
    return {"id": 1, "case_id": entry.case_id, "hours": entry.hours, "status": "recorded"}
