import calendar
from datetime import datetime, timedelta
from decimal import Decimal
from django.utils import timezone
from .models import Invoice, TimeEntry

def generate_invoice_number(client_id=None):
    """Generate a unique invoice number."""
    today = timezone.now()
    count = Invoice.objects.filter(
        created_at__year=today.year,
        created_at__month=today.month
    ).count() + 1
    
    # Format: INV-YYYYMM-COUNT-CLIENTID (if provided)
    if client_id:
        return f"INV-{today.year}{today.month:02d}-{count:04d}-{client_id}"
    else:
        return f"INV-{today.year}{today.month:02d}-{count:04d}"

def generate_invoice_from_time_entries(client_id, time_entry_ids=None, start_date=None, end_date=None):
    """
    Generate an invoice for a client from selected time entries or a date range.
    """
    from clients.models import Client
    
    try:
        client = Client.objects.get(id=client_id)
    except Client.DoesNotExist:
        return None
    
    # Create the invoice
    invoice = Invoice.objects.create(
        client=client,
        invoice_number=generate_invoice_number(client_id),
        issue_date=timezone.now().date(),
        due_date=(timezone.now() + timedelta(days=30)).date(),
        status='draft'
    )
    
    # Get time entries
    if time_entry_ids:
        time_entries = TimeEntry.objects.filter(
            id__in=time_entry_ids,
            invoice__isnull=True,
            is_billable=True
        )
    elif start_date and end_date:
        time_entries = TimeEntry.objects.filter(
            case__client=client,
            date__gte=start_date,
            date__lte=end_date,
            invoice__isnull=True,
            is_billable=True
        )
    else:
        # Default to all unbilled entries for this client
        time_entries = TimeEntry.objects.filter(
            case__client=client,
            invoice__isnull=True,
            is_billable=True
        )
    
    # Attach time entries to invoice
    for entry in time_entries:
        entry.invoice = invoice
        entry.save()
    
    # Calculate total
    invoice.calculate_total()
    return invoice

def check_overdue_invoices():
    """
    Check and update status of overdue invoices.
    """
    today = timezone.now().date()
    
    # Get all sent invoices that are past due date
    overdue_invoices = Invoice.objects.filter(
        status='sent',
        due_date__lt=today
    )
    
    # Update their status
    for invoice in overdue_invoices:
        invoice.status = 'overdue'
        invoice.save()
    
    return overdue_invoices.count()
