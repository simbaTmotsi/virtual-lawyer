from rest_framework import serializers
from .models import Client

class ClientSerializer(serializers.ModelSerializer):
    """Serializer for the Client model"""
    
    class Meta:
        model = Client
        fields = ('id', 'first_name', 'last_name', 'email', 'phone', 'address', 
                 'created_at', 'updated_at')
        read_only_fields = ('id', 'created_at', 'updated_at')
