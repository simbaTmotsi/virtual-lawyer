# Models package initialization

# Make models importable from app.models
from .models import User, Client, Case, Document, CalendarEvent, BillingEntry
from .schemas import (
    User as UserSchema,
    UserCreate, 
    UserUpdate,
    Client as ClientSchema,
    ClientCreate,
    ClientUpdate,
    Case as CaseSchema,
    CaseCreate,
    CaseUpdate,
    Document as DocumentSchema,
    DocumentCreate,
    DocumentUpdate,
    CalendarEvent as CalendarEventSchema,
    CalendarEventCreate,
    CalendarEventUpdate,
    BillingEntry as BillingEntrySchema,
    BillingEntryCreate,
    BillingEntryUpdate
)
from .crud import (
    get_user, get_user_by_email, get_users, create_user, update_user, delete_user,
    get_client, get_client_by_email, get_clients, create_client, update_client, delete_client,
    get_case, get_cases, get_client_cases, create_case, update_case, delete_case,
    get_document, get_documents, get_case_documents, create_document, update_document, delete_document,
    get_calendar_event, get_calendar_events, get_case_calendar_events, create_calendar_event, update_calendar_event, delete_calendar_event,
    get_billing_entry, get_billing_entries, get_case_billing_entries, create_billing_entry, update_billing_entry, delete_billing_entry
)
