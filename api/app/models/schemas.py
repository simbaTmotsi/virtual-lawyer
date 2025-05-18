from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

# User schemas
class UserBase(BaseModel):
    email: EmailStr
    first_name: str
    last_name: str
    role: str = "user"
    is_active: bool = True

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    password: Optional[str] = None
    is_active: Optional[bool] = None
    role: Optional[str] = None

class User(UserBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

# Client schemas
class ClientBase(BaseModel):
    first_name: str
    last_name: str
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    address: Optional[str] = None

class ClientCreate(ClientBase):
    user_id: Optional[int] = None

class ClientUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    user_id: Optional[int] = None

class Client(ClientBase):
    id: int
    user_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

# Case schemas
class CaseBase(BaseModel):
    title: str
    case_number: str
    description: Optional[str] = None
    status: str = "active"
    client_id: int
    date_opened: datetime = Field(default_factory=datetime.utcnow)
    date_closed: Optional[datetime] = None

class CaseCreate(CaseBase):
    pass

class CaseUpdate(BaseModel):
    title: Optional[str] = None
    case_number: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    client_id: Optional[int] = None
    date_closed: Optional[datetime] = None

class Case(CaseBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

# Document schemas
class DocumentBase(BaseModel):
    title: str
    file_path: str
    document_type: Optional[str] = None
    description: Optional[str] = None
    case_id: Optional[int] = None

class DocumentCreate(DocumentBase):
    pass

class DocumentUpdate(BaseModel):
    title: Optional[str] = None
    file_path: Optional[str] = None
    document_type: Optional[str] = None
    description: Optional[str] = None
    case_id: Optional[int] = None

class Document(DocumentBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

# Calendar event schemas
class CalendarEventBase(BaseModel):
    title: str
    description: Optional[str] = None
    start_time: datetime
    end_time: datetime
    event_type: str
    location: Optional[str] = None
    case_id: Optional[int] = None

class CalendarEventCreate(CalendarEventBase):
    pass

class CalendarEventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    event_type: Optional[str] = None
    location: Optional[str] = None
    case_id: Optional[int] = None

class CalendarEvent(CalendarEventBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

# Billing entry schemas
class BillingEntryBase(BaseModel):
    description: str
    amount: float
    date: datetime = Field(default_factory=datetime.utcnow)
    status: str = "unpaid"
    case_id: int

class BillingEntryCreate(BillingEntryBase):
    pass

class BillingEntryUpdate(BaseModel):
    description: Optional[str] = None
    amount: Optional[float] = None
    date: Optional[datetime] = None
    status: Optional[str] = None
    case_id: Optional[int] = None

class BillingEntry(BillingEntryBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True
