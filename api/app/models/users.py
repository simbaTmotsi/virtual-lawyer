from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional, List

class UserRegistration(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)
    password2: str
    first_name: str
    last_name: str
    role: str
    phone: Optional[str] = None
    
    @validator('password2')
    def passwords_match(cls, v, values):
        if 'password' in values and v != values['password']:
            raise ValueError('Passwords do not match')
        return v
    
    @validator('role')
    def valid_role(cls, v):
        allowed_roles = ['attorney', 'paralegal', 'client']
        if v not in allowed_roles:
            raise ValueError(f'Invalid role. Allowed roles: {", ".join(allowed_roles)}')
        return v

class UserResponse(BaseModel):
    id: int
    email: EmailStr
    first_name: str
    last_name: str
    role: str
    is_active: bool = True
