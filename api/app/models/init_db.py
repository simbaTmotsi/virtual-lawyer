from ..database import engine, Base
from .models import User, Client, Case, Document, CalendarEvent, BillingEntry

def create_tables():
    """Create all database tables if they don't exist"""
    Base.metadata.create_all(bind=engine)
