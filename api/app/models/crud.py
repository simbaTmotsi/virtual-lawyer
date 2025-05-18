from sqlalchemy.orm import Session
from . import models, schemas
from datetime import datetime
from passlib.context import CryptContext

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# User CRUD operations
def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def get_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.User).offset(skip).limit(limit).all()

def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = pwd_context.hash(user.password)
    db_user = models.User(
        email=user.email,
        first_name=user.first_name,
        last_name=user.last_name,
        role=user.role,
        is_active=user.is_active,
        hashed_password=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user(db: Session, user_id: int, user: schemas.UserUpdate):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if db_user:
        update_data = user.dict(exclude_unset=True)
        if "password" in update_data and update_data["password"]:
            update_data["hashed_password"] = pwd_context.hash(update_data.pop("password"))
        for key, value in update_data.items():
            setattr(db_user, key, value)
        db_user.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(db_user)
    return db_user

def delete_user(db: Session, user_id: int):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if db_user:
        db.delete(db_user)
        db.commit()
        return True
    return False

# Client CRUD operations
def get_client(db: Session, client_id: int):
    return db.query(models.Client).filter(models.Client.id == client_id).first()

def get_client_by_email(db: Session, email: str):
    return db.query(models.Client).filter(models.Client.email == email).first()

def get_clients(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Client).offset(skip).limit(limit).all()

def create_client(db: Session, client: schemas.ClientCreate):
    db_client = models.Client(**client.dict())
    db.add(db_client)
    db.commit()
    db.refresh(db_client)
    return db_client

def update_client(db: Session, client_id: int, client: schemas.ClientUpdate):
    db_client = db.query(models.Client).filter(models.Client.id == client_id).first()
    if db_client:
        update_data = client.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_client, key, value)
        db_client.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(db_client)
    return db_client

def delete_client(db: Session, client_id: int):
    db_client = db.query(models.Client).filter(models.Client.id == client_id).first()
    if db_client:
        db.delete(db_client)
        db.commit()
        return True
    return False

# Case CRUD operations
def get_case(db: Session, case_id: int):
    return db.query(models.Case).filter(models.Case.id == case_id).first()

def get_cases(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Case).offset(skip).limit(limit).all()

def get_client_cases(db: Session, client_id: int, skip: int = 0, limit: int = 100):
    return db.query(models.Case).filter(models.Case.client_id == client_id).offset(skip).limit(limit).all()

def create_case(db: Session, case: schemas.CaseCreate):
    db_case = models.Case(**case.dict())
    db.add(db_case)
    db.commit()
    db.refresh(db_case)
    return db_case

def update_case(db: Session, case_id: int, case: schemas.CaseUpdate):
    db_case = db.query(models.Case).filter(models.Case.id == case_id).first()
    if db_case:
        update_data = case.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_case, key, value)
        db_case.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(db_case)
    return db_case

def delete_case(db: Session, case_id: int):
    db_case = db.query(models.Case).filter(models.Case.id == case_id).first()
    if db_case:
        db.delete(db_case)
        db.commit()
        return True
    return False

# Document CRUD operations
def get_document(db: Session, document_id: int):
    return db.query(models.Document).filter(models.Document.id == document_id).first()

def get_documents(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Document).offset(skip).limit(limit).all()

def get_case_documents(db: Session, case_id: int, skip: int = 0, limit: int = 100):
    return db.query(models.Document).filter(models.Document.case_id == case_id).offset(skip).limit(limit).all()

def create_document(db: Session, document: schemas.DocumentCreate):
    db_document = models.Document(**document.dict())
    db.add(db_document)
    db.commit()
    db.refresh(db_document)
    return db_document

def update_document(db: Session, document_id: int, document: schemas.DocumentUpdate):
    db_document = db.query(models.Document).filter(models.Document.id == document_id).first()
    if db_document:
        update_data = document.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_document, key, value)
        db_document.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(db_document)
    return db_document

def delete_document(db: Session, document_id: int):
    db_document = db.query(models.Document).filter(models.Document.id == document_id).first()
    if db_document:
        db.delete(db_document)
        db.commit()
        return True
    return False

# Calendar event CRUD operations
def get_calendar_event(db: Session, event_id: int):
    return db.query(models.CalendarEvent).filter(models.CalendarEvent.id == event_id).first()

def get_calendar_events(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.CalendarEvent).offset(skip).limit(limit).all()

def get_case_calendar_events(db: Session, case_id: int, skip: int = 0, limit: int = 100):
    return db.query(models.CalendarEvent).filter(models.CalendarEvent.case_id == case_id).offset(skip).limit(limit).all()

def create_calendar_event(db: Session, event: schemas.CalendarEventCreate):
    db_event = models.CalendarEvent(**event.dict())
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    return db_event

def update_calendar_event(db: Session, event_id: int, event: schemas.CalendarEventUpdate):
    db_event = db.query(models.CalendarEvent).filter(models.CalendarEvent.id == event_id).first()
    if db_event:
        update_data = event.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_event, key, value)
        db_event.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(db_event)
    return db_event

def delete_calendar_event(db: Session, event_id: int):
    db_event = db.query(models.CalendarEvent).filter(models.CalendarEvent.id == event_id).first()
    if db_event:
        db.delete(db_event)
        db.commit()
        return True
    return False

# Billing entry CRUD operations
def get_billing_entry(db: Session, entry_id: int):
    return db.query(models.BillingEntry).filter(models.BillingEntry.id == entry_id).first()

def get_billing_entries(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.BillingEntry).offset(skip).limit(limit).all()

def get_case_billing_entries(db: Session, case_id: int, skip: int = 0, limit: int = 100):
    return db.query(models.BillingEntry).filter(models.BillingEntry.case_id == case_id).offset(skip).limit(limit).all()

def create_billing_entry(db: Session, entry: schemas.BillingEntryCreate):
    db_entry = models.BillingEntry(**entry.dict())
    db.add(db_entry)
    db.commit()
    db.refresh(db_entry)
    return db_entry

def update_billing_entry(db: Session, entry_id: int, entry: schemas.BillingEntryUpdate):
    db_entry = db.query(models.BillingEntry).filter(models.BillingEntry.id == entry_id).first()
    if db_entry:
        update_data = entry.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_entry, key, value)
        db_entry.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(db_entry)
    return db_entry

def delete_billing_entry(db: Session, entry_id: int):
    db_entry = db.query(models.BillingEntry).filter(models.BillingEntry.id == entry_id).first()
    if db_entry:
        db.delete(db_entry)
        db.commit()
        return True
    return False
