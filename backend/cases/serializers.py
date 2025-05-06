from rest_framework import serializers
from .models import Case
from clients.models import Client

class CaseSerializer(serializers.ModelSerializer):
    """Full serializer for Case model"""
    class Meta:
        model = Case
        fields = '__all__'

class SimpleCaseSerializer(serializers.ModelSerializer):
    """Simplified serializer for Case model to use in related objects"""
    class Meta:
        model = Case
        fields = ['id', 'title', 'case_number', 'status']
