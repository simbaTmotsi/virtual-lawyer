from rest_framework import serializers
from .models import Case
from clients.models import Client

class CaseSerializer(serializers.ModelSerializer):
    """Serializer for the Case model"""
    
    # Uncomment and adjust the following if you have a client relationship
    # client_details = serializers.SerializerMethodField(read_only=True)
    
    class Meta:
        model = Case
        fields = '__all__'  # Replace with specific fields as needed
        read_only_fields = ('id', 'created_at', 'updated_at')
    
    # def get_client_details(self, obj):
    #     from clients.serializers import ClientSerializer
    #     return ClientSerializer(obj.client).data
