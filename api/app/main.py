from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from .dependencies import get_settings
from .routers import auth, admin, clients, cases, documents, research, billing, calendar

# Create FastAPI app
app = FastAPI(
    title="EasyLaw API",
    description="Backend API for the EasyLaw legal practice management platform",
    version="1.0.0"
)

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
