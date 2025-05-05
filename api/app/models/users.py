from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional, Dict, Any
import re

class UserRegistration(BaseModel):
    """Model for user registration data"""
    email: EmailStr
    password: str = Field(..., min_length=8)
    password2: str = Field(..., min_length=8)
    first_name: str
    last_name: str
    role: str
    phone: Optional[str] = None
    
    @validator('password')
    def password_strength(cls, v):
        """Validate password strength"""
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        
        # Check if password contains at least 3 of the following:
        # - Lowercase letter
        # - Uppercase letter
        # - Number
        # - Special character
        checks = [
            re.search(r'[a-z]', v) is not None,  # lowercase
            re.search(r'[A-Z]', v) is not None,  # uppercase
            re.search(r'\d', v) is not None,     # digit
            re.search(r'[^a-zA-Z0-9]', v) is not None,  # special char
        ]
        
        if sum(checks) < 3:
            raise ValueError('Password must contain at least 3 of the following: lowercase letters, uppercase letters, numbers, special characters')
        
        return v
    
    @validator('password2')
    def passwords_match(cls, v, values):
        """Validate that passwords match"""
        if 'password' in values and v != values['password']:
            raise ValueError('Passwords do not match')
        return v
    
    @validator('role')
    def valid_role(cls, v):
        """Validate user role"""
        allowed_roles = ['attorney', 'paralegal', 'client', 'admin']
        if v not in allowed_roles:
            raise ValueError(f'Role must be one of: {", ".join(allowed_roles)}')
        return v

class UserResponse(BaseModel):
    """Model for user data in responses"""
    id: int
    email: str
    first_name: str
    last_name: str
    role: str
    is_active: bool = True
