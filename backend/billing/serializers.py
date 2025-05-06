from rest_framework import serializers
from .models import Invoice, TimeEntry, Expense
from cases.serializers import CaseSerializer
from clients.serializers import ClientSerializer
from django.contrib.auth import get_user_model

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'billing_rate']

class TimeEntrySerializer(serializers.ModelSerializer):
    case_detail = CaseSerializer(source='case', read_only=True)
    user_detail = UserSerializer(source='user', read_only=True)
    amount = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    
    class Meta:
        model = TimeEntry
        fields = ['id', 'case', 'case_detail', 'user', 'user_detail', 'date', 
                 'hours', 'description', 'is_billable', 'rate', 'amount', 'invoice',
                 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at', 'amount']
    
    def validate(self, data):
        """
        Ensure rate is set if entry is billable, and fetch from user if not provided.
        """
        is_billable = data.get('is_billable', True)
        rate = data.get('rate')
        
        if is_billable and not rate:
            user = data.get('user')
            if not user and self.context and 'request' in self.context:
                user = self.context['request'].user
                
            if user and hasattr(user, 'billing_rate') and user.billing_rate:
                data['rate'] = user.billing_rate
            else:
                raise serializers.ValidationError("Rate must be provided for billable time entries")
        
        return data

class ExpenseSerializer(serializers.ModelSerializer):
    case_detail = CaseSerializer(source='case', read_only=True)
    user_detail = UserSerializer(source='user', read_only=True)
    
    class Meta:
        model = Expense
        fields = ['id', 'case', 'case_detail', 'user', 'user_detail', 'date', 
                 'description', 'amount', 'is_billable', 'invoice', 'receipt',
                 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']

class InvoiceSerializer(serializers.ModelSerializer):
    client_detail = ClientSerializer(source='client', read_only=True)
    time_entries = TimeEntrySerializer(many=True, read_only=True)
    expenses = ExpenseSerializer(many=True, read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = Invoice
        fields = ['id', 'client', 'client_detail', 'invoice_number', 'issue_date', 
                 'due_date', 'status', 'status_display', 'total_amount', 'notes', 
                 'time_entries', 'expenses', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at', 'total_amount']
