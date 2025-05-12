from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional, Dict, Any
import re

class UserRegistration(BaseModel):
    """Model for user registration data"""
    email: str
    password: str
    password2: str  # Add this field to match Django's expectation
    first_name: str
    last_name: str
    role: str = "client"  # Default to client role

    @validator('email')
    def email_must_be_valid(cls, v):
        """Basic email validation - expand as needed"""
        if '@' not in v:
            raise ValueError('must be a valid email address')
        return v.lower()

    @validator('password')
    def password_must_be_strong(cls, v):
        """Validate password strength"""
        if len(v) < 8:
            raise ValueError('must be at least 8 characters')
        return v
    
    @validator('password2')
    def passwords_must_match(cls, v, values):
        """Validate that passwords match"""
        if 'password' in values and v != values['password']:
            raise ValueError('passwords must match')
        return v

class UserResponse(BaseModel):
    """Model for user data in responses"""
    id: int
    email: str
    first_name: str
    last_name: str
    role: str
    is_active: bool = True
