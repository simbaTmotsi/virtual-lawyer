from rest_framework import serializers
from .models import Client

class ClientSerializer(serializers.ModelSerializer):
    """Serializer for the Client model"""
    
    # Add created_at as an alias for date_added for compatibility with frontend
    created_at = serializers.DateTimeField(source='date_added', read_only=True)
    
    class Meta:
        model = Client
        fields = ('id', 'first_name', 'last_name', 'email', 'phone', 'address', 
                 'date_added', 'last_updated', 'created_at', 'notes')
        read_only_fields = ('id', 'date_added', 'last_updated', 'created_at')
        
    def validate_email(self, value):
        """Validate email uniqueness only if provided"""
        if value is not None and value.strip() != '':
            if Client.objects.filter(email=value).exists():
                raise serializers.ValidationError("A client with this email already exists.")
        return value
        
    def validate(self, data):
        """Extra validation to make debugging easier"""
        print(f"DEBUG: Validating client data: {data}")
        return data
