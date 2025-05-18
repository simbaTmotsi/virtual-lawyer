from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import schemas, crud

router = APIRouter()

@router.get("/", response_model=List[schemas.Client])
async def get_clients(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Endpoint to list all clients"""
    clients = crud.get_clients(db, skip=skip, limit=limit)
    return clients

@router.post("/", response_model=schemas.Client, status_code=status.HTTP_201_CREATED)
async def create_client(client: schemas.ClientCreate, db: Session = Depends(get_db)):
    """Create a new client"""
    db_client = crud.get_client_by_email(db, email=client.email)
    if db_client and client.email:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )
    return crud.create_client(db=db, client=client)

@router.get("/{client_id}", response_model=schemas.Client)
async def get_client(client_id: int, db: Session = Depends(get_db)):
    """Endpoint to get a specific client by ID"""
    db_client = crud.get_client(db, client_id=client_id)
    if db_client is None:
        raise HTTPException(status_code=404, detail="Client not found")
    return db_client

@router.put("/{client_id}", response_model=schemas.Client)
async def update_client(client_id: int, client: schemas.ClientUpdate, db: Session = Depends(get_db)):
    """Update a client"""
    db_client = crud.update_client(db, client_id=client_id, client=client)
    if db_client is None:
        raise HTTPException(status_code=404, detail="Client not found")
    return db_client

@router.delete("/{client_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_client(client_id: int, db: Session = Depends(get_db)):
    """Delete a client"""
    success = crud.delete_client(db, client_id=client_id)
    if not success:
        raise HTTPException(status_code=404, detail="Client not found")
    return None
