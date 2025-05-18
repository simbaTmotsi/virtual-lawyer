import random
import uuid
from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from datetime import timedelta, datetime
from django.db.models import Sum, Count, F, DecimalField, Q as models_Q
from django.db.models.functions import TruncMonth
from .models import Invoice, TimeEntry

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def mock_revenue_report(request):
    """Generate revenue report from actual database records"""
    # Get date range parameters or use defaults
    end_date = request.query_params.get('end_date', timezone.now().date().isoformat())
    start_date = request.query_params.get('start_date', (timezone.now().date() - timedelta(days=180)).isoformat())
    
    try:
        start_dt = datetime.fromisoformat(start_date)
        end_dt = datetime.fromisoformat(end_date)
    except ValueError:
        return Response({"error": "Invalid date format"}, status=400)

    # Generate monthly data for the specified time period
    current_date = start_dt.replace(day=1)
    months = []
    invoiced_dataset = []
    collected_dataset = []

    while current_date <= end_dt:
        # Add month to labels
        months.append(current_date.strftime('%b %Y'))
        
        # Generate random data for invoiced and collected amounts
        invoiced = round(random.uniform(5000, 15000), 2)
        collected = round(random.uniform(3000, invoiced), 2)
        
        invoiced_dataset.append(invoiced)
        collected_dataset.append(collected)
        
        # Move to next month
        if current_date.month == 12:
            current_date = current_date.replace(year=current_date.year + 1, month=1)
        else:
            current_date = current_date.replace(month=current_date.month + 1)
    
    # Return the data in a format for Chart.js
    return Response({
        'labels': months,
        'datasets': [
            {
                'label': 'Invoiced Amount',
                'data': invoiced_dataset,
                'backgroundColor': 'rgba(59, 130, 246, 0.5)',
                'borderColor': 'rgb(59, 130, 246)',
                'borderWidth': 2
            },
            {
                'label': 'Collected Amount',
                'data': collected_dataset,
                'backgroundColor': 'rgba(16, 185, 129, 0.5)',
                'borderColor': 'rgb(16, 185, 129)',
                'borderWidth': 2
            }
        ]
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def mock_hours_report(request):
    """Temporary mock implementation for billable hours report"""
    # Generate data for hours tracked per attorney
    attorneys = [
        'John Smith', 'Sarah Johnson', 'Michael Wong', 
        'Emily Davis', 'Robert Taylor'
    ]
    
    billable_hours = [random.randint(20, 120) for _ in range(len(attorneys))]
    non_billable_hours = [random.randint(5, 30) for _ in range(len(attorneys))]
    
    return Response({
        'labels': attorneys,
        'datasets': [
            {
                'label': 'Billable Hours',
                'data': billable_hours,
                'backgroundColor': 'rgba(59, 130, 246, 0.7)',
                'stack': 'Stack 0',
            },
            {
                'label': 'Non-Billable Hours',
                'data': non_billable_hours,
                'backgroundColor': 'rgba(209, 213, 219, 0.7)',
                'stack': 'Stack 0',
            }
        ]
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def mock_clients_report(request):
    """Temporary mock implementation for top clients report"""
    # Generate dummy client data
    clients = ['Acme Corporation', 'Smith & Associates', 'Johnson Enterprises', 
              'XYZ Tech', 'ABC Retail', 'Global Industries', 'Local Firm']
    
    # Generate revenue data for each client
    revenue = [round(random.uniform(10000, 50000), 2) for _ in range(len(clients))]
    outstanding = [round(random.uniform(1000, 15000), 2) for _ in range(len(clients))]
    
    # Sort clients by revenue
    client_data = sorted(zip(clients, revenue, outstanding), key=lambda x: x[1], reverse=True)
    clients = [data[0] for data in client_data]
    revenue = [data[1] for data in client_data]
    outstanding = [data[2] for data in client_data]
    
    return Response({
        'labels': clients,
        'datasets': [
            {
                'label': 'Revenue',
                'data': revenue,
                'backgroundColor': 'rgba(59, 130, 246, 0.7)',
            },
            {
                'label': 'Outstanding',
                'data': outstanding,
                'backgroundColor': 'rgba(245, 158, 11, 0.7)',
            }
        ]
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def mock_aging_report(request):
    """Temporary mock implementation for accounts receivable aging report"""
    # Define aging buckets
    labels = ['Current', '1-30 Days', '31-60 Days', '61-90 Days', '90+ Days']
    
    # Generate random amounts for each bucket
    amounts = [
        round(random.uniform(5000, 15000), 2),  # Current
        round(random.uniform(3000, 10000), 2),  # 1-30 days
        round(random.uniform(2000, 7000), 2),   # 31-60 days
        round(random.uniform(1000, 5000), 2),   # 61-90 days
        round(random.uniform(500, 3000), 2)     # 90+ days
    ]
    
    return Response({
        'labels': labels,
        'datasets': [
            {
                'label': 'Outstanding Amount',
                'data': amounts,
                'backgroundColor': [
                    'rgba(16, 185, 129, 0.7)',    # Green for current
                    'rgba(59, 130, 246, 0.7)',    # Blue for 1-30
                    'rgba(245, 158, 11, 0.7)',    # Orange for 31-60
                    'rgba(249, 115, 22, 0.7)',    # Dark orange for 61-90
                    'rgba(239, 68, 68, 0.7)',     # Red for 90+
                ],
                'borderWidth': 1
            }
        ]
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def mock_client_billing_summary(request):
    """Temporary mock implementation for client billing summary"""
    clients = [
        {
            'id': 1,
            'name': 'Acme Corporation',
            'unbilled_hours': round(random.uniform(10, 50), 2),
            'unbilled_amount': round(random.uniform(1000, 5000), 2),
            'outstanding_invoices': round(random.uniform(2000, 10000), 2)
        },
        {
            'id': 2,
            'name': 'Smith & Associates',
            'unbilled_hours': round(random.uniform(10, 50), 2),
            'unbilled_amount': round(random.uniform(1000, 5000), 2),
            'outstanding_invoices': round(random.uniform(2000, 10000), 2)
        },
        {
            'id': 3,
            'name': 'Johnson Enterprises',
            'unbilled_hours': round(random.uniform(10, 50), 2),
            'unbilled_amount': round(random.uniform(1000, 5000), 2),
            'outstanding_invoices': round(random.uniform(2000, 10000), 2)
        },
        {
            'id': 4,
            'name': 'XYZ Tech',
            'unbilled_hours': round(random.uniform(10, 50), 2),
            'unbilled_amount': round(random.uniform(1000, 5000), 2),
            'outstanding_invoices': round(random.uniform(2000, 10000), 2)
        }
    ]
    
    return Response(clients)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def mock_time_entries_list(request):
    """Get a list of mock time entries."""
    entries = []
    
    # Create some users for time entries
    users = [
        {'id': 1, 'username': 'john.smith', 'full_name': 'John Smith'},
        {'id': 2, 'username': 'sarah.johnson', 'full_name': 'Sarah Johnson'},
        {'id': 3, 'username': 'michael.wong', 'full_name': 'Michael Wong'}
    ]
    
    # Create some cases
    cases = [
        {'id': 1, 'number': 'CASE-001', 'title': 'Smith v. Jones', 'client': 1},
        {'id': 2, 'number': 'CASE-002', 'title': 'Johnson Bankruptcy', 'client': 2},
        {'id': 3, 'number': 'CASE-003', 'title': 'XYZ Tech Merger', 'client': 4}
    ]
    
    # Generate mock time entries
    for i in range(20):
        user_idx = random.randint(0, len(users) - 1)
        case_idx = random.randint(0, len(cases) - 1)
        
        # Determine if this entry has been invoiced
        invoiced = random.choice([True, False])
        invoice_id = random.randint(1000, 1999) if invoiced else None
        
        # Generate a random date in the last 30 days
        days_ago = random.randint(0, 30)
        entry_date = (timezone.now() - timedelta(days=days_ago)).date()
        
        # Generate random hours and description
        hours = round(random.uniform(0.25, 4.0), 2)
        descriptions = [
            "Research case law on contract disputes",
            "Draft motion for summary judgment",
            "Call with client to discuss case strategy",
            "Review discovery documents",
            "Prepare for deposition",
            "Attend court hearing",
            "Update case notes"
        ]
        
        entries.append({
            'id': i + 1,
            'user': users[user_idx]['id'],
            'user_name': users[user_idx]['full_name'],
            'case': cases[case_idx]['id'],
            'case_number': cases[case_idx]['number'],
            'case_title': cases[case_idx]['title'],
            'client': cases[case_idx]['client'],
            'date': entry_date.isoformat(),
            'hours': hours,
            'amount': round(hours * 250, 2),  # Assume $250/hour rate
            'description': random.choice(descriptions),
            'is_billable': random.random() > 0.2,  # 80% are billable
            'invoice': invoice_id,
            'created_at': (timezone.now() - timedelta(days=days_ago, hours=random.randint(0, 8))).isoformat()
        })
    
    return Response(entries)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def mock_time_entry_detail(request, pk):
    """Get details for a specific mock time entry."""
    # Create a user for this entry
    user = {
        'id': 1, 
        'username': 'john.smith', 
        'full_name': 'John Smith',
        'email': 'john.smith@lawfirm.com'
    }
    
    # Create a case
    case = {
        'id': 1, 
        'number': 'CASE-001', 
        'title': 'Smith v. Jones', 
        'client': 1
    }
    
    # Generate a random date in the last 30 days
    days_ago = random.randint(0, 30)
    entry_date = (timezone.now() - timedelta(days=days_ago)).date()
    
    # Generate random hours and description
    hours = round(random.uniform(0.25, 4.0), 2)
    description = "Research case law on contract disputes and prepare memo for client briefing"
    
    # Determine if this entry has been invoiced
    invoiced = random.choice([True, False])
    invoice_id = random.randint(1000, 1999) if invoiced else None
    
    entry = {
        'id': pk,
        'user': user['id'],
        'user_name': user['full_name'],
        'case': case['id'],
        'case_number': case['number'],
        'case_title': case['title'],
        'client': case['client'],
        'date': entry_date.isoformat(),
        'hours': hours,
        'amount': round(hours * 250, 2),  # Assume $250/hour rate
        'description': description,
        'is_billable': True,
        'invoice': invoice_id,
        'created_at': (timezone.now() - timedelta(days=days_ago, hours=random.randint(0, 8))).isoformat(),
        'updated_at': (timezone.now() - timedelta(days=max(0, days_ago-2), hours=random.randint(0, 8))).isoformat()
    }
    
    return Response(entry)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def mock_expenses_list(request):
    """Get a list of mock expenses."""
    expenses = []
    
    # Create some users for expenses
    users = [
        {'id': 1, 'username': 'john.smith', 'full_name': 'John Smith'},
        {'id': 2, 'username': 'sarah.johnson', 'full_name': 'Sarah Johnson'},
        {'id': 3, 'username': 'michael.wong', 'full_name': 'Michael Wong'}
    ]
    
    # Create some cases
    cases = [
        {'id': 1, 'number': 'CASE-001', 'title': 'Smith v. Jones', 'client': 1},
        {'id': 2, 'number': 'CASE-002', 'title': 'Johnson Bankruptcy', 'client': 2},
        {'id': 3, 'number': 'CASE-003', 'title': 'XYZ Tech Merger', 'client': 4}
    ]
    
    # Types of expenses
    expense_types = [
        'Filing Fee', 'Travel', 'Meals', 'Copying', 'Expert Witness', 
        'Court Reporter', 'Research', 'Postage'
    ]
    
    # Generate mock expenses
    for i in range(15):
        user_idx = random.randint(0, len(users) - 1)
        case_idx = random.randint(0, len(cases) - 1)
        
        # Determine if this expense has been invoiced
        invoiced = random.choice([True, False])
        invoice_id = random.randint(1000, 1999) if invoiced else None
        
        # Generate a random date in the last 60 days
        days_ago = random.randint(0, 60)
        expense_date = (timezone.now() - timedelta(days=days_ago)).date()
        
        # Generate random amount and type
        amount = round(random.uniform(25, 500), 2)
        expense_type = random.choice(expense_types)
        
        description = f"{expense_type} for {cases[case_idx]['title']}"
        if expense_type == 'Travel':
            description += " - Mileage and parking"
        elif expense_type == 'Meals':
            description += " - Client meeting"
        
        expenses.append({
            'id': i + 1,
            'user': users[user_idx]['id'],
            'user_name': users[user_idx]['full_name'],
            'case': cases[case_idx]['id'],
            'case_number': cases[case_idx]['number'],
            'case_title': cases[case_idx]['title'],
            'client': cases[case_idx]['client'],
            'date': expense_date.isoformat(),
            'amount': amount,
            'type': expense_type,
            'description': description,
            'is_billable': random.random() > 0.1,  # 90% are billable
            'invoice': invoice_id,
            'created_at': (timezone.now() - timedelta(days=days_ago, hours=random.randint(0, 8))).isoformat()
        })
    
    return Response(expenses)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def mock_expense_detail(request, pk):
    """Get details for a specific mock expense."""
    # Create a user for this expense
    user = {
        'id': 2, 
        'username': 'sarah.johnson', 
        'full_name': 'Sarah Johnson',
        'email': 'sarah.johnson@lawfirm.com'
    }
    
    # Create a case
    case = {
        'id': 2, 
        'number': 'CASE-002', 
        'title': 'Johnson Bankruptcy', 
        'client': 2
    }
    
    # Generate a random date in the last 60 days
    days_ago = random.randint(0, 60)
    expense_date = (timezone.now() - timedelta(days=days_ago)).date()
    
    # Determine if this expense has been invoiced
    invoiced = random.choice([True, False])
    invoice_id = random.randint(1000, 1999) if invoiced else None
    
    expense = {
        'id': pk,
        'user': user['id'],
        'user_name': user['full_name'],
        'case': case['id'],
        'case_number': case['number'],
        'case_title': case['title'],
        'client': case['client'],
        'date': expense_date.isoformat(),
        'amount': 350.75,
        'type': 'Filing Fee',
        'description': 'Filing Fee for Johnson Bankruptcy - Chapter 7',
        'is_billable': True,
        'invoice': invoice_id,
        'created_at': (timezone.now() - timedelta(days=days_ago, hours=random.randint(0, 8))).isoformat(),
        'updated_at': (timezone.now() - timedelta(days=max(0, days_ago-2), hours=random.randint(0, 8))).isoformat()
    }
    
    return Response(expense)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def mock_invoices_list(request):
    """Get a list of mock invoices."""
    invoices = []
    
    # Client info
    clients = [
        {'id': 1, 'name': 'Acme Corporation'},
        {'id': 2, 'name': 'Smith & Associates'},
        {'id': 3, 'name': 'Johnson Enterprises'},
        {'id': 4, 'name': 'XYZ Tech'}
    ]
    
    # Status options
    statuses = ['draft', 'sent', 'paid', 'overdue', 'void']
    status_displays = ['Draft', 'Sent', 'Paid', 'Overdue', 'Void']
    
    # Generate mock invoices
    for i in range(25):
        # Pick a client
        client_idx = random.randint(0, len(clients) - 1)
        
        # Generate invoice date - within the last 90 days
        days_ago = random.randint(0, 90)
        invoice_date = timezone.now() - timedelta(days=days_ago)
        
        # Due date is 30 days after invoice date
        due_date = invoice_date + timedelta(days=30)
        
        # Status depends on dates
        if days_ago < 5:
            status_idx = 0  # draft
        elif days_ago < 30:
            status_idx = 1  # sent
        elif days_ago >= 30:
            if random.random() > 0.3:
                status_idx = 2  # paid
            else:
                status_idx = 3  # overdue
        
        # 5% chance of void
        if random.random() < 0.05:
            status_idx = 4  # void
        
        invoices.append({
            'id': i + 1,
            'client': clients[client_idx]['id'],
            'client_detail': clients[client_idx],
            'invoice_number': f'INV-{2023}-{1000 + i}',
            'issue_date': invoice_date.date().isoformat(),
            'due_date': due_date.date().isoformat(),
            'status': statuses[status_idx],
            'status_display': status_displays[status_idx],
            'total_amount': round(random.uniform(500, 10000), 2),
            'notes': "Thank you for your business." if random.random() > 0.5 else "",
            'created_at': invoice_date.isoformat(),
            'updated_at': (invoice_date + timedelta(days=random.randint(0, 5))).isoformat()
        })
    
    # Sort by date (latest first)
    invoices.sort(key=lambda x: x['issue_date'], reverse=True)
    
    return Response(invoices)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def mock_invoice_detail(request, pk):
    """Get details for a specific mock invoice."""
    # Client info
    clients = [
        {'id': 1, 'name': 'Acme Corporation'},
        {'id': 2, 'name': 'Smith & Associates'},
        {'id': 3, 'name': 'Johnson Enterprises'},
        {'id': 4, 'name': 'XYZ Tech'}
    ]
    
    # Status options
    statuses = ['draft', 'sent', 'paid', 'overdue', 'void']
    status_displays = ['Draft', 'Sent', 'Paid', 'Overdue', 'Void']
    
    # Generate invoice date - within the last 90 days
    days_ago = random.randint(0, 90)
    invoice_date = timezone.now() - timedelta(days=days_ago)
    
    # Due date is 30 days after invoice date
    due_date = invoice_date + timedelta(days=30)
    
    # Status depends on dates
    if days_ago < 5:
        status_idx = 0  # draft
    elif days_ago < 30:
        status_idx = 1  # sent
    elif days_ago >= 30:
        if random.random() > 0.3:
            status_idx = 2  # paid
        else:
            status_idx = 3  # overdue
            
    # Generate time entries for this invoice
    time_entries = []
    for i in range(random.randint(3, 8)):
        entry_date = invoice_date - timedelta(days=random.randint(1, 20))
        hours = round(random.uniform(0.5, 4.0), 2)
        
        time_entries.append({
            'id': 1000 + i,
            'date': entry_date.date().isoformat(),
            'hours': hours,
            'amount': round(hours * 250, 2),
            'description': random.choice([
                "Research case law on contract disputes",
                "Draft motion for summary judgment",
                "Call with client to discuss case strategy",
                "Review discovery documents",
                "Prepare for deposition"
            ]),
            'user_name': random.choice(["John Smith", "Sarah Johnson", "Michael Wong"]),
            'case_number': f"CASE-00{random.randint(1, 5)}"
        })
    
    # Generate expenses for this invoice
    expenses = []
    expense_types = ['Filing Fee', 'Travel', 'Meals', 'Copying', 'Expert Witness']
    
    for i in range(random.randint(0, 3)):
        expense_date = invoice_date - timedelta(days=random.randint(1, 20))
        expense_type = random.choice(expense_types)
        
        expenses.append({
            'id': 2000 + i,
            'date': expense_date.date().isoformat(),
            'amount': round(random.uniform(50, 300), 2),
            'type': expense_type,
            'description': f"{expense_type} for case activities",
            'user_name': random.choice(["John Smith", "Sarah Johnson", "Michael Wong"]),
            'case_number': f"CASE-00{random.randint(1, 5)}"
        })
    
    invoice = {
        'id': pk,
        'client': pk % 4 + 1,
        'client_detail': clients[pk % 4],
        'invoice_number': f'INV-{2023}-{1000 + pk}',
        'issue_date': invoice_date.date().isoformat(),
        'due_date': due_date.date().isoformat(),
        'status': statuses[status_idx],
        'status_display': status_displays[status_idx],
        'total_amount': round(random.uniform(500, 10000), 2),
        'notes': "Thank you for your business." if pk % 2 == 0 else "",
        'time_entries': time_entries,
        'expenses': expenses,
        'created_at': invoice_date.isoformat(),
        'updated_at': (invoice_date + timedelta(days=1)).isoformat()
    }
    
    return Response(invoice)