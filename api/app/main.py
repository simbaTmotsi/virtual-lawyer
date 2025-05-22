from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from .dependencies import get_settings
from .routers import auth, admin, clients, cases, documents, research, billing, calendar, legal_research, gemini
from .models import init_db
from .database import get_db
from sqlalchemy.orm import Session
import os
import django
import sys
import logging
from pathlib import Path
from .services.gemini_service import load_and_configure_gemini, gemini_service # Import the function and instance

# Set up logger
logger = logging.getLogger(__name__)

# Add the project root to sys.path so we can import from backend
import sys
import logging
from pathlib import Path

# Set up logger
logger = logging.getLogger(__name__)

# Get the project root directory
PROJECT_ROOT = Path(__file__).parent.parent.parent
sys.path.append(str(PROJECT_ROOT))
# Add the backend directory specifically
sys.path.append(str(PROJECT_ROOT / "backend"))

# Create FastAPI app
app = FastAPI(
    title="EasyLaw API",
    description="Backend API for the EasyLaw legal practice management platform",
    version="1.0.0"
)

# Initialize database tables on startup
@app.on_event("startup")
async def startup_db_client():
    # Set up Django with our custom settings
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "app.django_settings")
    django.setup()
    logger.info("Django setup successfully")

    init_db.create_tables()
    logger.info("Database tables created successfully")

    # Initialize API key table
    try:
        from app.utils.create_api_key_table import create_apikey_storage_table
        create_apikey_storage_table()
        logger.info("API key storage table initialized")
    except Exception as e:
        logger.error(f"Error initializing API key table: {e}")

    # Try to initialize Gemini Service - with error handling
    try:
        await load_and_configure_gemini(gemini_service)
        logger.info("Gemini Service initialization successful.")
    except Exception as e:
        logger.error(f"Gemini Service initialization failed: {str(e)}")
        logger.info("Continuing startup despite Gemini initialization failure.")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(admin.router, prefix="/admin", tags=["Administration"])
app.include_router(clients.router, prefix="/clients", tags=["Client Management"])
app.include_router(cases.router, prefix="/cases", tags=["Case Management"])
app.include_router(documents.router, prefix="/documents", tags=["Document Management"])
app.include_router(research.router, prefix="/research", tags=["Legal Research"])
app.include_router(legal_research.router, prefix="/legal-research", tags=["Advanced Legal Research"])
app.include_router(gemini.router, prefix="/api", tags=["Gemini AI Integration"])  # Changed prefix to /api
app.include_router(billing.router, prefix="/billing", tags=["Billing & Payments"])
app.include_router(calendar.router, prefix="/calendar", tags=["Calendar & Reminders"])

@app.get("/")
async def root():
    """Root endpoint to verify API is running"""
    return {"message": "Welcome to EasyLaw API"}

@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring"""
    return {"status": "healthy"}
