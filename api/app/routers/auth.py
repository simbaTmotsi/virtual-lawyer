from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from ..dependencies import get_settings
from ..models.users import UserRegistration, UserResponse
from typing import Dict, Any
import hashlib
import json
import os
from datetime import datetime

router = APIRouter()

# Simple in-memory user store for demo purposes
# In production, this would connect to a database
USER_DATA_FILE = "user_data.json"

def get_user_data():
    """Load user data from JSON file or initialize if it doesn't exist"""
    if os.path.exists(USER_DATA_FILE):
        with open(USER_DATA_FILE, 'r') as f:
            return json.load(f)
    else:
        return {"users": [], "next_id": 1}

def save_user_data(data):
    """Save user data to JSON file"""
    with open(USER_DATA_FILE, 'w') as f:
        json.dump(data, f, indent=2)

@router.post("/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    """Endpoint for user authentication and token generation"""
    # This is a placeholder - implement actual authentication logic
    if form_data.username == "demo@example.com" and form_data.password == "demo123":
        return {"access_token": "demo_token", "token_type": "bearer"}
    
    # Check against stored users
    user_data = get_user_data()
    hashed_password = hashlib.sha256(form_data.password.encode()).hexdigest()
    
    for user in user_data["users"]:
        if user["email"] == form_data.username and user["password"] == hashed_password:
            # Return user information along with the token
            return {
                "access_token": f"user_{user['id']}_token",  # In production, use a proper JWT
                "token_type": "bearer",
                "user": {
                    "id": user["id"],
                    "email": user["email"],
                    "first_name": user["first_name"],
                    "last_name": user["last_name"],
                    "role": user["role"]
                }
            }
    
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Incorrect username or password",
        headers={"WWW-Authenticate": "Bearer"},
    )

@router.post("/refresh")
async def refresh_token():
    """Endpoint to refresh an access token"""
    return {"access_token": "new_token", "token_type": "bearer"}

@router.post("/register", response_model=Dict[str, Any], status_code=status.HTTP_201_CREATED)
async def register(user_data: UserRegistration):
    """Endpoint for user registration"""
    # Load existing user data
    data = get_user_data()
    
    # Check if email already exists
    for user in data["users"]:
        if user["email"] == user_data.email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"email": "A user with that email already exists."}
            )
    
    # Create new user
    new_user = {
        "id": data["next_id"],
        "email": user_data.email,
        "password": hashlib.sha256(user_data.password.encode()).hexdigest(),
        "first_name": user_data.first_name,
        "last_name": user_data.last_name,
        "role": user_data.role,
        "is_active": True,
        "date_joined": datetime.now().isoformat()
    }
    
    # Add user to data store
    data["users"].append(new_user)
    data["next_id"] += 1
    save_user_data(data)
    
    # Return response similar to the Django backend
    user_response = {
        "user": {
            "id": new_user["id"],
            "email": new_user["email"],
            "first_name": new_user["first_name"],
            "last_name": new_user["last_name"],
            "role": new_user["role"],
            "is_active": new_user["is_active"]
        },
        "message": "User registered successfully"
    }
    
    return user_response
