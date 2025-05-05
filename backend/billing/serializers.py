from rest_framework import serializers
from .models import Invoice, TimeEntry

class InvoiceSerializer(serializers.ModelSerializer):
    """Serializer for the Invoice model"""
    
    class Meta:
        model = Invoice
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at')

class TimeEntrySerializer(serializers.ModelSerializer):
    """Serializer for the TimeEntry model"""
    
    class Meta:
        model = TimeEntry
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at')
