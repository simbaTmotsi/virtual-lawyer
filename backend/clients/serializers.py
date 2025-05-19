from rest_framework import serializers
from .models import Client

class ClientSerializer(serializers.ModelSerializer):
    """Serializer for the Client model"""
    
    # Add created_at as an alias for date_added for compatibility with frontend
    created_at = serializers.DateTimeField(source='date_added', read_only=True)
    
    class Meta:
        model = Client
        fields = ('id', 'first_name', 'last_name', 'email', 'phone', 'address', 
                 'date_added', 'last_updated', 'created_at')
        read_only_fields = ('id', 'date_added', 'last_updated', 'created_at')
