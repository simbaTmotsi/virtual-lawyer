from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

router = APIRouter()

class Event(BaseModel):
    title: str
    start_time: datetime
    end_time: datetime
    case_id: Optional[int] = None
    description: Optional[str] = None

@router.get("/events")
async def get_events():
    """Endpoint to list all calendar events"""
    return {"events": [
        {
            "id": 1, 
            "title": "Client Meeting", 
            "start_time": "2023-12-01T09:00:00Z",
            "end_time": "2023-12-01T10:00:00Z"
        }
    ]}

@router.post("/events")
async def create_event(event: Event):
    """Endpoint to create a new calendar event"""
    return {
        "id": 1,
        "title": event.title,
        "start_time": event.start_time,
        "end_time": event.end_time,
        "status": "created"
    }
