from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import schemas, crud

router = APIRouter()

@router.get("/", response_model=List[schemas.Case])
async def get_cases(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Endpoint to list all cases"""
    cases = crud.get_cases(db, skip=skip, limit=limit)
    return cases

@router.post("/", response_model=schemas.Case, status_code=status.HTTP_201_CREATED)
async def create_case(case: schemas.CaseCreate, db: Session = Depends(get_db)):
    """Create a new case"""
    return crud.create_case(db=db, case=case)

@router.get("/{case_id}", response_model=schemas.Case)
async def get_case(case_id: int, db: Session = Depends(get_db)):
    """Endpoint to get a specific case by ID"""
    db_case = crud.get_case(db, case_id=case_id)
    if db_case is None:
        raise HTTPException(status_code=404, detail="Case not found")
    return db_case

@router.put("/{case_id}", response_model=schemas.Case)
async def update_case(case_id: int, case: schemas.CaseUpdate, db: Session = Depends(get_db)):
    """Update a case"""
    db_case = crud.update_case(db, case_id=case_id, case=case)
    if db_case is None:
        raise HTTPException(status_code=404, detail="Case not found")
    return db_case

@router.delete("/{case_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_case(case_id: int, db: Session = Depends(get_db)):
    """Delete a case"""
    success = crud.delete_case(db, case_id=case_id)
    if not success:
        raise HTTPException(status_code=404, detail="Case not found")
    return None

@router.get("/client/{client_id}", response_model=List[schemas.Case])
async def get_client_cases(client_id: int, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all cases for a specific client"""
    cases = crud.get_client_cases(db, client_id=client_id, skip=skip, limit=limit)
    return cases
