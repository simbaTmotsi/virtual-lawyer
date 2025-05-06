from rest_framework import serializers
from .models import Invoice, TimeEntry
from cases.serializers import CaseSerializer
from clients.serializers import ClientSerializer

class TimeEntrySerializer(serializers.ModelSerializer):
    case_detail = CaseSerializer(source='case', read_only=True)
    amount = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    
    class Meta:
        model = TimeEntry
        fields = ['id', 'case', 'case_detail', 'user', 'date', 'hours', 
                 'description', 'rate', 'is_billable', 'invoice', 'amount',
                 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at', 'amount']

class InvoiceSerializer(serializers.ModelSerializer):
    client_detail = ClientSerializer(source='client', read_only=True)
    time_entries = TimeEntrySerializer(many=True, read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = Invoice
        fields = ['id', 'client', 'client_detail', 'invoice_number', 'issue_date', 
                 'due_date', 'status', 'status_display', 'total_amount', 'notes', 
                 'time_entries', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at', 'total_amount']
