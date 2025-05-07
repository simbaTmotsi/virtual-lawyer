from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from datetime import timedelta, datetime
import random
import uuid

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def mock_revenue_report(request):
    """Temporary mock implementation for revenue report"""
    # Get date range parameters or use defaults
    end_date = request.query_params.get('end_date', timezone.now().date().isoformat())
    start_date = request.query_params.get('start_date', (timezone.now().date() - timedelta(days=180)).isoformat())
    
    try:
        start_dt = datetime.fromisoformat(start_date)
        end_dt = datetime.fromisoformat(end_date)
    except ValueError:
        # Handle invalid date format
        start_dt = timezone.now().date() - timedelta(days=180)
        end_dt = timezone.now().date()
    
    # Generate monthly data
    months = []
    current_dt = start_dt.replace(day=1)
    while current_dt <= end_dt:
        months.append(current_dt.strftime('%b %Y'))
        if current_dt.month == 12:
            current_dt = current_dt.replace(year=current_dt.year + 1, month=1)
        else:
            current_dt = current_dt.replace(month=current_dt.month + 1)
    
    # Generate mock revenue data
    invoiced_data = [random.randint(5000, 20000) for _ in range(len(months))]
    collected_data = [int(invoiced_data[i] * random.uniform(0.7, 0.95)) for i in range(len(months))]
    
    return Response({
        'labels': months,
        'datasets': [
            {
                'label': 'Invoiced Amount',
                'data': invoiced_data,
                'backgroundColor': 'rgba(59, 130, 246, 0.5)',
                'borderColor': 'rgb(59, 130, 246)',
                'borderWidth': 2
            },
            {
                'label': 'Collected Amount',
                'data': collected_data,
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
    clients = [
        'Acme Corporation', 'Smith Family', 'Johnson LLC', 
        'Tech Innovators Inc.', 'Global Holdings'
    ]
    
    amounts = [random.randint(5000, 30000) for _ in range(len(clients))]
    
    return Response({
        'labels': clients,
        'datasets': [
            {
                'label': 'Billed Amount',
                'data': amounts,
                'backgroundColor': [
                    'rgba(59, 130, 246, 0.7)',
                    'rgba(16, 185, 129, 0.7)',
                    'rgba(245, 158, 11, 0.7)',
                    'rgba(139, 92, 246, 0.7)',
                    'rgba(236, 72, 153, 0.7)',
                ],
                'borderWidth': 1
            }
        ]
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def mock_aging_report(request):
    """Temporary mock implementation for accounts receivable aging report"""
    aging_categories = ['Current', '1-30 days', '31-60 days', '61-90 days', '90+ days']
    
    amounts = [
        random.randint(20000, 40000),  # Current
        random.randint(10000, 20000),  # 1-30 days
        random.randint(5000, 15000),   # 31-60 days
        random.randint(3000, 10000),   # 61-90 days
        random.randint(1000, 8000)     # 90+ days
    ]
    
    return Response({
        'labels': aging_categories,
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
            'name': 'Smith Family Trust',
            'unbilled_hours': round(random.uniform(5, 20), 2),
            'unbilled_amount': round(random.uniform(500, 2000), 2),
            'outstanding_invoices': round(random.uniform(1000, 5000), 2)
        },
        {
            'id': 3,
            'name': 'Tech Innovators Inc.',
            'unbilled_hours': round(random.uniform(15, 40), 2),
            'unbilled_amount': round(random.uniform(1500, 4000), 2),
            'outstanding_invoices': round(random.uniform(3000, 8000), 2)
        },
        {
            'id': 4,
            'name': 'Global Holdings LLC',
            'unbilled_hours': round(random.uniform(8, 30), 2),
            'unbilled_amount': round(random.uniform(800, 3000), 2),
            'outstanding_invoices': round(random.uniform(1500, 6000), 2)
        }
    ]
    
    return Response(clients)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def mock_time_entries_list(request):
    """Temporary mock implementation for time entries list"""
    entries = []
    cases = ["Johnson Divorce", "Smith vs. Corp", "Tech Patent Case", "Estate Planning"]
    descriptions = [
        "Client consultation",
        "Document review",
        "Research on case law",
        "Drafting motion",
        "Court appearance",
        "Client call",
        "Preparation for deposition",
        "Contract review"
    ]
    
    # Get query params
    client_id = request.query_params.get('client_id')
    invoiced = request.query_params.get('invoiced')
    billable = request.query_params.get('billable')
    limit = int(request.query_params.get('limit', 20))
    
    for i in range(1, limit + 1):
        is_billable = True if billable is None else billable.lower() == 'true'
        is_invoiced = False if invoiced is None else invoiced.lower() == 'true'
        
        # Only include entries for the specified client if client_id is provided
        if client_id and i % 4 != int(client_id) % 4:
            continue
            
        entries.append({
            'id': i,
            'date': (timezone.now() - timedelta(days=i)).date().isoformat(),
            'case': i % 4 + 1,
            'case_detail': {'id': i % 4 + 1, 'title': cases[i % 4]},
            'user': i % 3 + 1,
            'user_detail': {
                'id': i % 3 + 1, 
                'username': f'user{i % 3 + 1}',
                'first_name': ['John', 'Jane', 'Robert'][i % 3],
                'last_name': ['Smith', 'Doe', 'Johnson'][i % 3],
                'email': f'user{i % 3 + 1}@example.com',
                'billing_rate': 200 + (i % 3) * 50
            },
            'description': random.choice(descriptions),
            'hours': round(random.uniform(0.5, 8.0), 2),
            'is_billable': is_billable,
            'invoice': i if is_invoiced else None,
            'rate': 200 + (i % 3) * 50,
            'amount': round((200 + (i % 3) * 50) * round(random.uniform(0.5, 8.0), 2), 2)
        })
    
    return Response(entries)

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def mock_time_entry_detail(request, pk):
    """Temporary mock implementation for time entry detail"""
    cases = ["Johnson Divorce", "Smith vs. Corp", "Tech Patent Case", "Estate Planning"]
    descriptions = [
        "Client consultation",
        "Document review",
        "Research on case law",
        "Drafting motion"
    ]
    
    if request.method == 'GET':
        time_entry = {
            'id': pk,
            'date': (timezone.now() - timedelta(days=pk % 10)).date().isoformat(),
            'case': pk % 4 + 1,
            'case_detail': {'id': pk % 4 + 1, 'title': cases[pk % 4]},
            'user': pk % 3 + 1,
            'user_detail': {
                'id': pk % 3 + 1, 
                'username': f'user{pk % 3 + 1}',
                'first_name': ['John', 'Jane', 'Robert'][pk % 3],
                'last_name': ['Smith', 'Doe', 'Johnson'][pk % 3],
                'email': f'user{pk % 3 + 1}@example.com',
                'billing_rate': 200 + (pk % 3) * 50
            },
            'description': descriptions[pk % 4],
            'hours': round(random.uniform(0.5, 8.0), 2),
            'is_billable': pk % 5 != 0,  # Make every 5th entry non-billable
            'invoice': pk if pk % 3 == 0 else None,  # Make every 3rd entry invoiced
            'rate': 200 + (pk % 3) * 50,
            'amount': round((200 + (pk % 3) * 50) * round(random.uniform(0.5, 8.0), 2), 2)
        }
        return Response(time_entry)
    
    elif request.method == 'PUT':
        # Just return the data that was sent, simulating an update
        return Response(request.data)
    
    elif request.method == 'DELETE':
        # Return success for delete operation
        return Response({"detail": "Time entry deleted successfully"})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def mock_expenses_list(request):
    """Temporary mock implementation for expenses list"""
    expenses = []
    cases = ["Johnson Divorce", "Smith vs. Corp", "Tech Patent Case", "Estate Planning"]
    descriptions = [
        "Court filing fees",
        "Travel expenses",
        "Expert witness fee",
        "Document printing",
        "Courier service",
        "Deposition transcripts",
        "Research database access",
        "Meal with client"
    ]
    
    # Get query params
    client_id = request.query_params.get('client_id')
    invoiced = request.query_params.get('invoiced')
    billable = request.query_params.get('billable')
    limit = int(request.query_params.get('limit', 20))
    
    for i in range(1, limit + 1):
        is_billable = True if billable is None else billable.lower() == 'true'
        is_invoiced = False if invoiced is None else invoiced.lower() == 'true'
        
        # Only include expenses for the specified client if client_id is provided
        if client_id and i % 4 != int(client_id) % 4:
            continue
            
        expenses.append({
            'id': i,
            'date': (timezone.now() - timedelta(days=i)).date().isoformat(),
            'case': i % 4 + 1,
            'case_detail': {'id': i % 4 + 1, 'title': cases[i % 4]},
            'user': i % 3 + 1,
            'user_detail': {
                'id': i % 3 + 1, 
                'username': f'user{i % 3 + 1}',
                'first_name': ['John', 'Jane', 'Robert'][i % 3],
                'last_name': ['Smith', 'Doe', 'Johnson'][i % 3],
                'email': f'user{i % 3 + 1}@example.com'
            },
            'description': random.choice(descriptions),
            'amount': round(random.uniform(10, 1000), 2),
            'is_billable': is_billable,
            'invoice': i if is_invoiced else None,
            'receipt': f"https://example.com/receipts/{uuid.uuid4()}.pdf" if i % 3 == 0 else None
        })
    
    return Response(expenses)

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def mock_expense_detail(request, pk):
    """Temporary mock implementation for expense detail"""
    cases = ["Johnson Divorce", "Smith vs. Corp", "Tech Patent Case", "Estate Planning"]
    descriptions = [
        "Court filing fees",
        "Travel expenses",
        "Expert witness fee",
        "Document printing"
    ]
    
    if request.method == 'GET':
        expense = {
            'id': pk,
            'date': (timezone.now() - timedelta(days=pk % 10)).date().isoformat(),
            'case': pk % 4 + 1,
            'case_detail': {'id': pk % 4 + 1, 'title': cases[pk % 4]},
            'user': pk % 3 + 1,
            'user_detail': {
                'id': pk % 3 + 1, 
                'username': f'user{pk % 3 + 1}',
                'first_name': ['John', 'Jane', 'Robert'][pk % 3],
                'last_name': ['Smith', 'Doe', 'Johnson'][pk % 3],
                'email': f'user{pk % 3 + 1}@example.com'
            },
            'description': descriptions[pk % 4],
            'amount': round(random.uniform(10, 1000), 2),
            'is_billable': pk % 5 != 0,  # Make every 5th expense non-billable
            'invoice': pk if pk % 3 == 0 else None,  # Make every 3rd expense invoiced
            'receipt': f"https://example.com/receipts/{uuid.uuid4()}.pdf" if pk % 3 == 0 else None
        }
        return Response(expense)
    
    elif request.method == 'PUT':
        # Just return the data that was sent, simulating an update
        return Response(request.data)
    
    elif request.method == 'DELETE':
        # Return success for delete operation
        return Response({"detail": "Expense deleted successfully"})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def mock_invoices_list(request):
    """Temporary mock implementation for invoices list"""
    invoices = []
    clients = [
        {"id": 1, "full_name": "Acme Corporation"},
        {"id": 2, "full_name": "Smith Family Trust"},
        {"id": 3, "full_name": "Tech Innovators Inc."},
        {"id": 4, "full_name": "Global Holdings LLC"}
    ]
    statuses = ["draft", "sent", "paid", "overdue", "void"]
    status_displays = ["Draft", "Sent", "Paid", "Overdue", "Void"]
    
    # Get query params
    limit = int(request.query_params.get('limit', 20))
    
    for i in range(1, limit + 1):
        status_idx = i % len(statuses)
        invoice_date = timezone.now() - timedelta(days=i * 7)
        due_date = invoice_date + timedelta(days=30)
        
        invoices.append({
            'id': i,
            'client': i % 4 + 1,
            'client_detail': clients[i % 4],
            'invoice_number': f'INV-{2023}-{1000 + i}',
            'issue_date': invoice_date.date().isoformat(),
            'due_date': due_date.date().isoformat(),
            'status': statuses[status_idx],
            'status_display': status_displays[status_idx],
            'total_amount': round(random.uniform(500, 10000), 2),
            'notes': "Thank you for your business." if i % 2 == 0 else "",
            'created_at': invoice_date.isoformat(),
            'updated_at': (invoice_date + timedelta(days=1)).isoformat()
        })
    
    return Response(invoices)

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def mock_invoice_detail(request, pk):
    """Temporary mock implementation for invoice detail"""
    clients = [
        {"id": 1, "full_name": "Acme Corporation"},
        {"id": 2, "full_name": "Smith Family Trust"},
        {"id": 3, "full_name": "Tech Innovators Inc."},
        {"id": 4, "full_name": "Global Holdings LLC"}
    ]
    statuses = ["draft", "sent", "paid", "overdue", "void"]
    status_displays = ["Draft", "Sent", "Paid", "Overdue", "Void"]
    
    status_idx = pk % len(statuses)
    invoice_date = timezone.now() - timedelta(days=pk * 7)
    due_date = invoice_date + timedelta(days=30)
    
    # Generate some time entries for this invoice
    time_entries = []
    for i in range(1, 4):
        entry_id = (pk * 10) + i
        time_entries.append({
            'id': entry_id,
            'date': (invoice_date - timedelta(days=i)).date().isoformat(),
            'description': f"Work on case {pk % 4 + 1} - Task {i}",
            'user_detail': {
                'first_name': ['John', 'Jane', 'Robert'][i % 3],
                'last_name': ['Smith', 'Doe', 'Johnson'][i % 3],
            },
            'hours': round(random.uniform(0.5, 8.0), 2),
            'rate': 200 + (i % 3) * 50,
            'amount': round((200 + (i % 3) * 50) * round(random.uniform(0.5, 8.0), 2), 2)
        })
    
    # Generate some expenses for this invoice
    expenses = []
    for i in range(1, 3):
        expense_id = (pk * 10) + i
        expenses.append({
            'id': expense_id,
            'date': (invoice_date - timedelta(days=i)).date().isoformat(),
            'description': f"Expense {i} for case {pk % 4 + 1}",
            'amount': round(random.uniform(10, 500), 2)
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
