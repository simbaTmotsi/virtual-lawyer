from django.shortcuts import render
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
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
        # Implement filtering based on organization/permissions
        return Invoice.objects.all() # Placeholder

    # Add custom actions like 'send_invoice', 'mark_as_paid'
    @action(detail=True, methods=['post'])
    def mark_as_paid(self, request, pk=None):
        invoice = self.get_object()
        invoice.status = 'paid'
        invoice.save()
        # Potentially trigger notifications or other actions
        return Response(InvoiceSerializer(invoice).data)

class TimeEntryViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows time entries to be viewed or edited.
    """
    queryset = TimeEntry.objects.all()
    serializer_class = TimeEntrySerializer
    permission_classes = [permissions.IsAuthenticated] # Add specific permissions

    def get_queryset(self):
        """Filter time entries based on user or case."""
        user = self.request.user
        queryset = TimeEntry.objects.all()
        
        # Filter by user who made the entry
        # queryset = queryset.filter(user=user) 
        
        # Filter by case if caseId is provided
        case_id = self.request.query_params.get('caseId')
        if case_id:
            queryset = queryset.filter(case_id=case_id)
            
        # Implement further filtering based on organization/permissions
        return queryset # Placeholder

    def perform_create(self, serializer):
        """Associate the time entry with the logged-in user."""
        serializer.save(user=self.request.user)
