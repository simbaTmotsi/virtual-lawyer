from rest_framework import serializers
from .models import ResearchQuery, ResearchResult
from accounts.serializers import UserSerializer

class ResearchResultSerializer(serializers.ModelSerializer):
    """Serializer for ResearchResult model"""
    
    class Meta:
        model = ResearchResult
        fields = [
            'id', 'title', 'excerpt', 'source', 'url', 
            'relevance_score', 'added_at'
        ]
        read_only_fields = ['added_at']

class ResearchQuerySerializer(serializers.ModelSerializer):
    """Serializer for ResearchQuery model"""
    user_details = UserSerializer(source='user', read_only=True)
    results = ResearchResultSerializer(many=True, read_only=True)
    
    class Meta:
        model = ResearchQuery
        fields = [
            'id', 'query_text', 'jurisdiction', 'timestamp',
            'user', 'user_details', 'results'
        ]
        read_only_fields = ['timestamp']
        extra_kwargs = {
            'user': {'write_only': True}
        }
    
    def create(self, validated_data):
        # Ensure the current user is set as the user
        user = self.context['request'].user
        validated_data['user'] = user
        return super().create(validated_data)