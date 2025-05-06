from rest_framework import serializers
from .models import Event
from accounts.serializers import UserSerializer
from cases.serializers import CaseSerializer

class EventSerializer(serializers.ModelSerializer):
    """Serializer for calendar events with expanded relationships"""
    created_by_details = UserSerializer(source='created_by', read_only=True)
    attendees_details = UserSerializer(source='attendees', many=True, read_only=True)
    case_details = CaseSerializer(source='case', read_only=True, required=False)
    
    class Meta:
        model = Event
        fields = [
            'id', 'title', 'description', 'event_type', 'start_time', 'end_time', 
            'all_day', 'case', 'location', 'created_by', 'attendees',
            'created_by_details', 'attendees_details', 'case_details',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']
    
    def validate(self, data):
        """
        Check that start time is before end time if both are provided
        """
        start_time = data.get('start_time')
        end_time = data.get('end_time')
        all_day = data.get('all_day', False)
        
        if not all_day and start_time and end_time and start_time >= end_time:
            raise serializers.ValidationError(
                {"end_time": "End time must be after start time"}
            )
            
        return data
