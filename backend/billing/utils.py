import calendar
from datetime import datetime, timedelta
from decimal import Decimal
from django.utils import timezone
from .models import Invoice, TimeEntry

def generate_invoice_number(client_id=None):
    """Generate a unique invoice number."""
    today = datetime.now()
    year = today.strftime('%Y')
    month = today.strftime('%m')
    
    # Find the highest existing invoice number for this month/year pattern
    prefix = f"INV-{year}{month}"
    
    existing_numbers = Invoice.objects.filter(
        invoice_number__startswith=prefix
    ).values_list('invoice_number', flat=True)
    
    # Extract the sequence numbers from existing invoice numbers
    sequence_numbers = []
    for number in existing_numbers:
        try:
            seq = int(number.split('-')[-1])
            sequence_numbers.append(seq)
        except (ValueError, IndexError):
            pass
    
    # Determine the next sequence number
    next_sequence = 1
    if sequence_numbers:
        next_sequence = max(sequence_numbers) + 1
    
    # Create the new invoice number
    client_suffix = f"-{client_id}" if client_id else ""
    return f"{prefix}-{next_sequence:04d}{client_suffix}"

def generate_invoice_from_time_entries(client_id, time_entry_ids=None, start_date=None, end_date=None):
    """
    Generate an invoice for a client from selected time entries or a date range.
    """
    from clients.models import Client
    
    try:
        client = Client.objects.get(id=client_id)
    except Client.DoesNotExist:
        return None
    
    # Create a new invoice
    invoice = Invoice.objects.create(
        client=client,
        invoice_number=generate_invoice_number(client_id),
        issue_date=timezone.now().date(),
        due_date=timezone.now().date() + timedelta(days=30),
        status='draft'
    )
    
    # Select time entries to include
    if time_entry_ids:
        time_entries = TimeEntry.objects.filter(
            id__in=time_entry_ids,
            case__client=client,
            invoice__isnull=True,
            is_billable=True
        )
    else:
        # Filter by date range if provided
        time_entries = TimeEntry.objects.filter(
            case__client=client,
            invoice__isnull=True,
            is_billable=True
        )
        
        if start_date:
            time_entries = time_entries.filter(date__gte=start_date)
        
        if end_date:
            time_entries = time_entries.filter(date__lte=end_date)
    
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
