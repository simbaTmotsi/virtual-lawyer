from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from ..dependencies import get_settings
from ..models.users import UserRegistration, UserResponse
from typing import Dict, Any
import hashlib
import json
import os
from datetime import datetime
import logging  # Import logging

# Setup basic logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

# Simple in-memory user store for demo purposes
# In production, this would connect to a database
USER_DATA_FILE = "user_data.json"

def get_user_data():
    """Load user data from JSON file or initialize if it doesn't exist"""
    default_data = {"users": [], "next_id": 1}
    if not os.path.exists(USER_DATA_FILE):
        logger.warning(f"{USER_DATA_FILE} not found. Initializing with empty data.")
        save_user_data(default_data)  # Create the file with default structure
        return default_data
    try:
        with open(USER_DATA_FILE, "r") as f:
            try:
                data = json.load(f)
                # Ensure basic structure exists
                if "users" not in data or "next_id" not in data:
                    logger.warning(f"{USER_DATA_FILE} has invalid structure. Re-initializing.")
                    save_user_data(default_data)
                    return default_data
                return data
            except json.JSONDecodeError:
                logger.error(f"Error decoding JSON from {USER_DATA_FILE}. Re-initializing.")
                save_user_data(default_data)
                return default_data
    except IOError as e:
        logger.error(f"Could not read {USER_DATA_FILE}: {e}. Using default data.")
        return default_data
    except Exception as e:  # Catch any other unexpected errors during loading
        logger.error(f"Unexpected error loading {USER_DATA_FILE}: {e}. Using default data.")
        return default_data

def save_user_data(data):
    """Save user data to JSON file"""
    try:
        with open(USER_DATA_FILE, "w") as f:
            json.dump(data, f, indent=4)
    except IOError as e:
        logger.error(f"Could not write to {USER_DATA_FILE}: {e}")
    except Exception as e:
        logger.error(f"Unexpected error saving {USER_DATA_FILE}: {e}")

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
