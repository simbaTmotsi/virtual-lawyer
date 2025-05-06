from django.shortcuts import render
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.utils import timezone
from datetime import datetime, timedelta
from django.db.models import Sum, F, DecimalField
from django.db.models.functions import Coalesce
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
