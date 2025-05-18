from django.shortcuts import render
from rest_framework import viewsets, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Event
from .serializers import EventSerializer
from django.utils import timezone
from datetime import timedelta

def upcoming_events(request):
    """
    Function-based view to get upcoming events within the next 7 days.
    This is an alternative to the ViewSet action method.
    """
    if not request.user.is_authenticated:
        return Response({"detail": "Authentication required"}, status=401)
    
    now = timezone.now()
    end_date = now + timedelta(days=7)
    
    # Handle user permissions (staff vs. regular users)
    user = request.user
    if user.is_staff:
        events = Event.objects.filter(
            start_time__gte=now,
            start_time__lte=end_date
        )
    else:
        # For non-staff, only show events they're invited to or related to their cases
        events = Event.objects.filter(
            start_time__gte=now,
            start_time__lte=end_date
        ).filter(
            attendees=user
        ) | Event.objects.filter(
            start_time__gte=now,
            start_time__lte=end_date,
            case__client=user
        )
    
    # Order by start time
    events = events.order_by('start_time')
    
    # Serialize and return the data
    serializer = EventSerializer(events, many=True)
    return Response(serializer.data)

class EventViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows calendar events to be viewed or edited.
    """
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['event_type', 'case', 'all_day']
    search_fields = ['title', 'description', 'location']
    ordering_fields = ['start_time', 'end_time', 'created_at', 'updated_at']
    ordering = ['start_time']

    def get_queryset(self):
        """
        Filter events based on user, associated case/client, and date range.
        """
        user = self.request.user
        queryset = Event.objects.all()
        
        # Filter by user access
        if not user.is_staff:
            queryset = queryset.filter(
                attendees=user
            ) | queryset.filter(
                case__client=user
            )
        
        # Filter by attendee if provided
        attendee_id = self.request.query_params.get('attendee')
        if attendee_id:
            queryset = queryset.filter(attendees__id=attendee_id)
        
        # Filter by date range if provided
        start_date_str = self.request.query_params.get('start')
        end_date_str = self.request.query_params.get('end')

        if start_date_str:
            try:
                start_date = timezone.datetime.strptime(start_date_str, '%Y-%m-%d').date()
                # Filter events that end on/after the start date
                queryset = queryset.filter(
                    end_time__date__gte=start_date
                ) | queryset.filter(
                    start_time__date__gte=start_date, end_time__isnull=True
                )
            except ValueError:
                pass # Ignore invalid date format

        if end_date_str:
            try:
                end_date = timezone.datetime.strptime(end_date_str, '%Y-%m-%d').date()
                # Filter events that start on/before the end date
                queryset = queryset.filter(start_time__date__lte=end_date)
            except ValueError:
                pass # Ignore invalid date format

        return queryset

    def perform_create(self, serializer):
        """Set the creator and handle other pre-save operations"""
        # Set the current user as the creator
        serializer.save(created_by=self.request.user)
    
    @action(detail=False, methods=['get'])
    def upcoming(self, request):
        """Get upcoming events within the next 7 days"""
        now = timezone.now()
        end_date = now + timedelta(days=7)
        
        events = self.get_queryset().filter(
            start_time__gte=now,
            start_time__lte=end_date
        ).order_by('start_time')
        
        serializer = self.get_serializer(events, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def today(self, request):
        """Get today's events"""
        today = timezone.now().date()
        
        events = self.get_queryset().filter(
            start_time__date=today
        ).order_by('start_time')
        
        serializer = self.get_serializer(events, many=True)
        return Response(serializer.data)
