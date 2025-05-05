from fastapi import APIRouter, Depends

router = APIRouter()

@router.get("/users")
async def get_users():
    """Endpoint to list all users"""
    return {"users": [{"id": 1, "email": "admin@example.com", "role": "admin"}]}

@router.get("/settings")
async def get_system_settings():
    """Endpoint to retrieve system settings"""
    return {"settings": {"maintenance_mode": False, "default_language": "en"}}
