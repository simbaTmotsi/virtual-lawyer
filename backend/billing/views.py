from django.shortcuts import render
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from datetime import datetime, timedelta
from django.db.models import Sum, F, DecimalField, Q as models_Q
from django.db.models.functions import Coalesce, TruncMonth
from .models import Invoice, TimeEntry, Expense
from .serializers import InvoiceSerializer, TimeEntrySerializer, ExpenseSerializer
from clients.models import Client
from decimal import Decimal
from .utils import generate_invoice_number

class InvoiceViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows invoices to be viewed or edited.
    """
    queryset = Invoice.objects.all()
    serializer_class = InvoiceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Filter invoices based on user's organization or client relationship."""
        queryset = super().get_queryset()
        
        # Add filters based on query parameters
        client_id = self.request.query_params.get('client_id')
        status = self.request.query_params.get('status')
        
        if client_id:
            queryset = queryset.filter(client_id=client_id)
        
        if status:
            queryset = queryset.filter(status=status)
            
        return queryset

    def perform_create(self, serializer):
        """Set invoice number if not provided"""
        if 'invoice_number' not in serializer.validated_data:
            client_id = serializer.validated_data.get('client').id
            invoice_number = generate_invoice_number(client_id)
            serializer.save(invoice_number=invoice_number)
        else:
            serializer.save()

    @action(detail=True, methods=['post'])
    def mark_as_paid(self, request, pk=None):
        invoice = self.get_object()
        invoice.status = 'paid'
        invoice.save()
        return Response(InvoiceSerializer(invoice).data)
    
    @action(detail=True, methods=['post'])
    def mark_as_sent(self, request, pk=None):
        invoice = self.get_object()
        invoice.status = 'sent'
        invoice.save()
        return Response(InvoiceSerializer(invoice).data)
    
    @action(detail=True, methods=['post'])
    def void(self, request, pk=None):
        invoice = self.get_object()
        invoice.status = 'void'
        invoice.save()
        return Response(InvoiceSerializer(invoice).data)
    
    @action(detail=True, methods=['post'])
    def recalculate_total(self, request, pk=None):
        """Recalculate the invoice total based on time entries and expenses."""
        invoice = self.get_object()
        time_total = sum(entry.amount for entry in invoice.time_entries.filter(is_billable=True))
        expense_total = sum(expense.amount for expense in invoice.expenses.filter(is_billable=True))
        
        invoice.total_amount = time_total + expense_total
        invoice.save()
        
        return Response(InvoiceSerializer(invoice).data)
    
    @action(detail=True, methods=['post'])
    def add_time_entries(self, request, pk=None):
        invoice = self.get_object()
        entry_ids = request.data.get('time_entry_ids', [])
        
        if not entry_ids:
            return Response({"error": "No time entries provided"}, status=status.HTTP_400_BAD_REQUEST)
        
        time_entries = TimeEntry.objects.filter(id__in=entry_ids, invoice__isnull=True)
        for entry in time_entries:
            entry.invoice = invoice
            entry.save()
        
        invoice.calculate_total()
        return Response(InvoiceSerializer(invoice).data)
    
    @action(detail=True, methods=['post'])
    def add_expenses(self, request, pk=None):
        """Add expenses to an invoice."""
        invoice = self.get_object()
        expense_ids = request.data.get('expense_ids', [])
        
        if not expense_ids:
            return Response({"error": "No expenses provided"}, status=status.HTTP_400_BAD_REQUEST)
        
        expenses = Expense.objects.filter(id__in=expense_ids, invoice__isnull=True)
        for expense in expenses:
            expense.invoice = invoice
            expense.save()
        
        invoice.calculate_total()
        return Response(InvoiceSerializer(invoice).data)


class TimeEntryViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows time entries to be viewed or edited.
    """
    queryset = TimeEntry.objects.all()
    serializer_class = TimeEntrySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Filter time entries based on query parameters"""
        queryset = super().get_queryset()
        
        # Filter by case
        case_id = self.request.query_params.get('case_id')
        if case_id:
            queryset = queryset.filter(case_id=case_id)
        
        # Filter by user
        user_id = self.request.query_params.get('user_id')
        if user_id:
            queryset = queryset.filter(user_id=user_id)
        
        # Filter by date range
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        
        if start_date:
            queryset = queryset.filter(date__gte=start_date)
        
        if end_date:
            queryset = queryset.filter(date__lte=end_date)
        
        # Filter by billable status
        billable = self.request.query_params.get('billable')
        if billable is not None:
            is_billable = billable.lower() == 'true'
            queryset = queryset.filter(is_billable=is_billable)
        
        # Filter by invoice status
        invoiced = self.request.query_params.get('invoiced')
        if invoiced is not None:
            if invoiced.lower() == 'true':
                queryset = queryset.filter(invoice__isnull=False)
            else:
                queryset = queryset.filter(invoice__isnull=True)
                
        return queryset
    
    @action(detail=False, methods=['get'], url_path='client-summary')
    def client_billing_summary(self, request):
        """Get billing summary for all clients."""
        clients = Client.objects.all()
        result = []
        
        for client in clients:
            # Calculate unbilled hours and amount
            unbilled_entries = TimeEntry.objects.filter(
                case__client=client,
                invoice__isnull=True,
                is_billable=True
            )
            
            unbilled_hours = unbilled_entries.aggregate(
                total=Coalesce(Sum('hours'), Decimal('0.00'))
            )['total']
            
            unbilled_amount = sum(entry.amount for entry in unbilled_entries)
            
            # Calculate outstanding invoices amount
            outstanding_amount = Invoice.objects.filter(
                client=client,
                status__in=['sent', 'overdue']
            ).aggregate(
                total=Coalesce(Sum('total_amount'), Decimal('0.00'))
            )['total']
            
            result.append({
                'id': client.id,
                'name': client.full_name,
                'unbilled_hours': float(unbilled_hours),
                'unbilled_amount': float(unbilled_amount),
                'outstanding_invoices': float(outstanding_amount)
            })
        
        return Response(result)


class ExpenseViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows expenses to be viewed or edited.
    """
    queryset = Expense.objects.all()
    serializer_class = ExpenseSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Filter expenses based on query parameters"""
        queryset = super().get_queryset()
        
        # Filter by case
        case_id = self.request.query_params.get('case_id')
        if case_id:
            queryset = queryset.filter(case_id=case_id)
        
        # Filter by user
        user_id = self.request.query_params.get('user_id')
        if user_id:
            queryset = queryset.filter(user_id=user_id)
        
        # Filter by date range
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        
        if start_date:
            queryset = queryset.filter(date__gte=start_date)
        
        if end_date:
            queryset = queryset.filter(date__lte=end_date)
        
        # Filter by billable status
        billable = self.request.query_params.get('billable')
        if billable is not None:
            is_billable = billable.lower() == 'true'
            queryset = queryset.filter(is_billable=is_billable)
        
        # Filter by invoice status
        invoiced = self.request.query_params.get('invoiced')
        if invoiced is not None:
            if invoiced.lower() == 'true':
                queryset = queryset.filter(invoice__isnull=False)
            else:
                queryset = queryset.filter(invoice__isnull=True)
                
        return queryset

    def perform_create(self, serializer):
        """Set the user to the current user if not specified."""
        if 'user' not in serializer.validated_data:
            serializer.save(user=self.request.user)
        else:
            serializer.save()
    
    @action(detail=False, methods=['get'])
    def unbilled(self, request):
        """Get all unbilled expenses."""
        expenses = Expense.objects.filter(
            invoice__isnull=True,
            is_billable=True
        )
        serializer = self.get_serializer(expenses, many=True)
        return Response(serializer.data)

# Standalone view functions for billing reports
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def client_billing_summary(request):
    """Get billing summary for all clients."""
    clients = Client.objects.all()
    result = []
    
    for client in clients:
        # Calculate unbilled hours and amount
        unbilled_entries = TimeEntry.objects.filter(
            case__client=client,
            invoice__isnull=True,
            is_billable=True
        )
        
        unbilled_hours = unbilled_entries.aggregate(
            total=Coalesce(Sum('hours'), Decimal('0.00'))
        )['total']
        
        unbilled_amount = sum(entry.amount for entry in unbilled_entries)
        
        # Calculate outstanding invoices amount
        outstanding_amount = Invoice.objects.filter(
            client=client,
            status__in=['sent', 'overdue']
        ).aggregate(
            total=Coalesce(Sum('total_amount'), Decimal('0.00'))
        )['total']
        
        result.append({
            'id': client.id,
            'name': client.full_name,
            'unbilled_hours': float(unbilled_hours),
            'unbilled_amount': float(unbilled_amount),
            'outstanding_invoices': float(outstanding_amount)
        })
    
    return Response(result)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def revenue_report(request):
    """Generate revenue report from database records"""
    # Get date range parameters or use defaults
    end_date = request.query_params.get('end_date', timezone.now().date().isoformat())
    start_date = request.query_params.get('start_date', (timezone.now().date() - timedelta(days=180)).isoformat())
    
    try:
        start_dt = datetime.fromisoformat(start_date)
        end_dt = datetime.fromisoformat(end_date)
    except ValueError:
        return Response({"error": "Invalid date format"}, status=400)

    # Query database for monthly invoice data
    invoices = Invoice.objects.filter(
        issue_date__gte=start_dt,
        issue_date__lte=end_dt
    ).annotate(
        month=TruncMonth('issue_date')
    ).values('month').annotate(
        invoiced=Sum('total_amount'),
        collected=Sum(
            F('total_amount'),
            filter=models_Q(status='paid')
        )
    ).order_by('month')
    
    # Convert to chart.js format
    months = []
    invoiced_dataset = []
    collected_dataset = []
    
    current_date = start_dt.replace(day=1)
    end_month = end_dt.replace(day=1)
    
    # Create a mapping of month to data for easier lookup
    invoice_data = {i['month']: i for i in invoices}
    
    while current_date <= end_month:
        # Add month to labels
        months.append(current_date.strftime('%b %Y'))
        
        # Get data for this month or default to 0
        month_data = invoice_data.get(current_date.date(), {})
        invoiced = float(month_data.get('invoiced', 0) or 0)
        collected = float(month_data.get('collected', 0) or 0)
        
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
def hours_report(request):
    """Generate billable hours report from database records"""
    # Get user filter if provided
    user_filter = request.query_params.get('user_id')
    date_from = request.query_params.get('from_date', (timezone.now() - timedelta(days=30)).date().isoformat())
    date_to = request.query_params.get('to_date', timezone.now().date().isoformat())
    
    # Query time entries
    time_entries = TimeEntry.objects.filter(
        date__gte=date_from,
        date__lte=date_to
    )
    
    if user_filter:
        time_entries = time_entries.filter(user_id=user_filter)
    
    # Group by attorney
    attorney_data = time_entries.values('user__username').annotate(
        billable=Sum('hours', filter=models_Q(is_billable=True)),
        non_billable=Sum('hours', filter=models_Q(is_billable=False))
    ).order_by('-billable')
    
    # Prepare chart data
    attorneys = []
    billable_hours = []
    non_billable_hours = []
    
    for entry in attorney_data:
        attorneys.append(entry['user__username'])
        billable_hours.append(float(entry['billable'] or 0))
        non_billable_hours.append(float(entry['non_billable'] or 0))
    
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
def clients_report(request):
    """Generate top clients report from database records"""
    # Get time period filter
    year = int(request.query_params.get('year', timezone.now().year))
    
    # Query paid invoices for the year
    invoices = Invoice.objects.filter(
        issue_date__year=year,
        status='paid'
    )
    
    # Group by client
    client_data = invoices.values('client', 'client__full_name').annotate(
        revenue=Sum('total_amount')
    ).order_by('-revenue')[:10]  # Get top 10 clients
    
    # Also get outstanding amounts
    outstanding = Invoice.objects.filter(
        status__in=['sent', 'overdue']
    ).values('client').annotate(
        outstanding=Sum('total_amount')
    )
    
    # Create a mapping of client ID to outstanding amount
    outstanding_map = {item['client']: float(item['outstanding']) for item in outstanding}
    
    # Prepare chart data
    clients = []
    revenue = []
    outstanding_amounts = []
    
    for entry in client_data:
        clients.append(entry['client__full_name'])
        revenue.append(float(entry['revenue']))
        outstanding_amounts.append(outstanding_map.get(entry['client'], 0))
    
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
                'data': outstanding_amounts,
                'backgroundColor': 'rgba(245, 158, 11, 0.7)',
            }
        ]
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def aging_report(request):
    """Generate accounts receivable aging report from database records"""
    today = timezone.now().date()
    
    # Get all unpaid invoices
    invoices = Invoice.objects.filter(
        status__in=['sent', 'overdue']
    )
    
    # Define aging buckets
    buckets = {
        'current': 0,
        '1-30': 0,
        '31-60': 0,
        '61-90': 0,
        '90+': 0
    }
    
    # Calculate age for each invoice and add to appropriate bucket
    for invoice in invoices:
        age = (today - invoice.due_date).days
        
        if age <= 0:
            buckets['current'] += invoice.total_amount
        elif age <= 30:
            buckets['1-30'] += invoice.total_amount
        elif age <= 60:
            buckets['31-60'] += invoice.total_amount
        elif age <= 90:
            buckets['61-90'] += invoice.total_amount
        else:
            buckets['90+'] += invoice.total_amount
    
    # Prepare chart data
    labels = ['Current', '1-30 Days', '31-60 Days', '61-90 Days', '90+ Days']
    amounts = [
        float(buckets['current']),
        float(buckets['1-30']),
        float(buckets['31-60']),
        float(buckets['61-90']),
        float(buckets['90+'])
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
