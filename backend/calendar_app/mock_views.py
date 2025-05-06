from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from datetime import datetime, timedelta
from django.utils import timezone

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def mock_events_list(request):
    """Temporary mock implementation to return calendar events"""
    # Generate some sample event data
    now = timezone.now()
    events = [
        {
            'id': 1,
            'title': 'Client Meeting with Smith',
            'description': 'Initial consultation regarding divorce proceedings',
            'event_type': 'meeting',
            'start_time': (now + timedelta(days=1)).isoformat(),
            'end_time': (now + timedelta(days=1, hours=1)).isoformat(),
            'all_day': False,
            'case': None,
            'location': 'Office Room 203',
            'created_by': request.user.id,
            'attendees': [request.user.id],
            'created_at': now.isoformat(),
            'updated_at': now.isoformat()
        },
        {
            'id': 2,
            'title': 'Court Hearing - Johnson vs. MegaCorp',
            'description': 'Preliminary hearing for case #CV-2025-123456',
            'event_type': 'hearing',
            'start_time': (now + timedelta(days=3)).isoformat(),
            'end_time': (now + timedelta(days=3, hours=2)).isoformat(),
            'all_day': False,
            'case': 1,  # Mock case ID
            'location': 'County Courthouse, Room 4B',
            'created_by': request.user.id,
            'attendees': [request.user.id],
            'created_at': now.isoformat(),
            'updated_at': now.isoformat()
        },
        {
            'id': 3,
            'title': 'Filing Deadline - Tax Documents',
            'description': 'Submit all tax-related documents for Davis case',
            'event_type': 'deadline',
            'start_time': (now + timedelta(days=5)).isoformat(),
            'end_time': None,
            'all_day': True,
            'case': 2,  # Mock case ID
            'location': '',
            'created_by': request.user.id,
            'attendees': [request.user.id],
            'created_at': now.isoformat(),
            'updated_at': now.isoformat()
        }
    ]
    
    return Response(events)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def mock_events_upcoming(request):
    """Temporary mock implementation for upcoming events"""
    now = timezone.now()
    events = [
        {
            'id': 1,
            'title': 'Client Meeting with Smith',
            'description': 'Initial consultation regarding divorce proceedings',
            'event_type': 'meeting',
            'start_time': (now + timedelta(days=1)).isoformat(),
            'end_time': (now + timedelta(days=1, hours=1)).isoformat(),
            'all_day': False,
            'case': None,
            'location': 'Office Room 203',
            'created_by': request.user.id,
            'attendees': [request.user.id],
            'created_at': now.isoformat(),
            'updated_at': now.isoformat()
        },
        {
            'id': 2,
            'title': 'Court Hearing - Johnson vs. MegaCorp',
            'description': 'Preliminary hearing for case #CV-2025-123456',
            'event_type': 'hearing',
            'start_time': (now + timedelta(days=3)).isoformat(),
            'end_time': (now + timedelta(days=3, hours=2)).isoformat(),
            'all_day': False,
            'case': 1,
            'location': 'County Courthouse, Room 4B',
            'created_by': request.user.id,
            'attendees': [request.user.id],
            'created_at': now.isoformat(),
            'updated_at': now.isoformat()
        }
    ]
    
    return Response(events)
