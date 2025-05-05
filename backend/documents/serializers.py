from rest_framework import serializers
from .models import Document

class DocumentSerializer(serializers.ModelSerializer):
    """Serializer for the Document model"""
    
    class Meta:
        model = Document
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at')
