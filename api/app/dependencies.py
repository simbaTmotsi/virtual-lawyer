import os
from functools import lru_cache
from pydantic_settings import BaseSettings
from typing import Optional, List
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Settings(BaseSettings):
    """Application settings loaded from environment variables"""
    
    # API configuration
    api_title: str = "EasyLaw API"
    api_version: str = "1.0.0"
    debug: bool = os.getenv("DEBUG", "False").lower() in ("true", "1", "t")
    
    # Security and authentication
    jwt_secret_key: str = os.getenv("JWT_SECRET_KEY", "development_secret_key_change_in_production")
    jwt_algorithm: str = "HS256"
    jwt_token_expire_minutes: int = 30
    
    # CORS settings
    cors_origins: List[str] = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
    
    # Database settings
    database_url: str = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/easylaw")
    
    # Backend service URL
    backend_url: str = os.getenv("BACKEND_URL", "http://localhost:8000")
    
    # AI integration settings
    openai_api_key: Optional[str] = os.getenv("OPENAI_API_KEY", "")
    gemini_api_key: Optional[str] = os.getenv("GEMINI_API_KEY", "")
    
    # File storage settings
    upload_dir: str = os.getenv("UPLOAD_DIR", "uploads")
    max_upload_size: int = int(os.getenv("MAX_UPLOAD_SIZE", "10485760"))  # 10MB default
    
    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    """
    Returns the application settings as a cached singleton.
    
    This function is used as a FastAPI dependency to inject settings
    into route handlers and other dependencies.
    """
    return Settings()
