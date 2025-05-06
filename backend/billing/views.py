from django.shortcuts import render
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.utils import timezone
from datetime import datetime, timedelta
from .models import Invoice, TimeEntry
from .serializers import InvoiceSerializer, TimeEntrySerializer

class InvoiceViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows invoices to be viewed or edited.
    """
    queryset = Invoice.objects.all()
    serializer_class = InvoiceSerializer
    permission_classes = [permissions.IsAuthenticated] # Add specific permissions

    def get_queryset(self):
        """Filter invoices based on user's organization or client relationship."""
        user = self.request.user
        # Filter by client if provided
        client_id = self.request.query_params.get('client_id')
        status = self.request.query_params.get('status')
        
        queryset = Invoice.objects.all()
        
        if client_id:
            queryset = queryset.filter(client_id=client_id)
        
        if status:
            queryset = queryset.filter(status=status)
            
        return queryset

    def perform_create(self, serializer):
        """Set invoice number if not provided"""
        instance = serializer.save()
        if not instance.invoice_number:
            # Generate invoice number: INV-YEAR-MONTH-ID
            today = timezone.now()
            instance.invoice_number = f"INV-{today.year}-{today.month:02d}-{instance.id:04d}"
            instance.save()

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
        invoice = self.get_object()
        invoice.calculate_total()
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


class TimeEntryViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows time entries to be viewed or edited.
    """
    queryset = TimeEntry.objects.all()
    serializer_class = TimeEntrySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Filter time entries based on query parameters."""
        user = self.request.user
        case_id = self.request.query_params.get('case_id')
        user_id = self.request.query_params.get('user_id')
        billable = self.request.query_params.get('billable')
        unbilled = self.request.query_params.get('unbilled')
        date_from = self.request.query_params.get('date_from')
        date_to = self.request.query_params.get('date_to')
        
        queryset = TimeEntry.objects.all()
        
        if case_id:
            queryset = queryset.filter(case_id=case_id)
        
        if user_id:
            queryset = queryset.filter(user_id=user_id)
        
        if billable == 'true':
            queryset = queryset.filter(is_billable=True)
        elif billable == 'false':
            queryset = queryset.filter(is_billable=False)
        
        if unbilled == 'true':
            queryset = queryset.filter(invoice__isnull=True)
        
        if date_from:
            try:
                date_from = datetime.strptime(date_from, '%Y-%m-%d').date()
                queryset = queryset.filter(date__gte=date_from)
            except ValueError:
                pass
        
        if date_to:
            try:
                date_to = datetime.strptime(date_to, '%Y-%m-%d').date()
                queryset = queryset.filter(date__lte=date_to)
            except ValueError:
                pass
        
        return queryset
    
    def perform_create(self, serializer):
        """Set the user to the current user if not specified."""
        if 'user' not in serializer.validated_data:
            serializer.save(user=self.request.user)
        else:
            serializer.save()
    
    @action(detail=False, methods=['get'])
    def unbilled(self, request):
        """Get all unbilled time entries."""
        queryset = self.get_queryset().filter(invoice__isnull=True, is_billable=True)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Get summary of time entries."""
        queryset = self.get_queryset()
        
        # Calculate total hours
        total_hours = sum(entry.hours for entry in queryset)
        
        # Calculate billable hours
        billable_hours = sum(entry.hours for entry in queryset if entry.is_billable)
        
        # Calculate total billable amount
        billable_amount = sum(entry.amount for entry in queryset if entry.is_billable)
        
        return Response({
            'total_entries': queryset.count(),
            'total_hours': total_hours,
            'billable_hours': billable_hours,
            'billable_amount': billable_amount,
        })
