from django.shortcuts import render
from rest_framework import viewsets, permissions
from .models import Event
from .serializers import EventSerializer
from django.utils import timezone
from datetime import timedelta

class EventViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows calendar events to be viewed or edited.
    """
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    permission_classes = [permissions.IsAuthenticated] # Add more specific permissions later

    def get_queryset(self):
        """
        Filter events based on user, associated case/client, and date range.
        """
        user = self.request.user
        queryset = Event.objects.all() # Start with all

        # Filter by user/organization (implement proper logic later)
        # Example: queryset = queryset.filter(attendees=user) | queryset.filter(case__client__organization=user.profile.organization)
        
        # Filter by date range if provided (e.g., ?start=YYYY-MM-DD&end=YYYY-MM-DD)
        start_date_str = self.request.query_params.get('start')
        end_date_str = self.request.query_params.get('end')

        if start_date_str:
            try:
                start_date = timezone.datetime.strptime(start_date_str, '%Y-%m-%d').date()
                # Filter events that overlap with the start date (or start on/after it)
                queryset = queryset.filter(end_time__date__gte=start_date)
            except ValueError:
                pass # Ignore invalid date format

        if end_date_str:
            try:
                end_date = timezone.datetime.strptime(end_date_str, '%Y-%m-%d').date()
                # Filter events that start on/before the end date
                queryset = queryset.filter(start_time__date__lte=end_date)
            except ValueError:
                pass # Ignore invalid date format

        # If no range, maybe default to upcoming events?
        # if not start_date_str and not end_date_str:
        #     queryset = queryset.filter(start_time__gte=timezone.now())

        return queryset.order_by('start_time')

    def perform_create(self, serializer):
        """Optionally set the creator or add default attendees."""
        # serializer.save(created_by=self.request.user)
        # Add creator to attendees by default?
        instance = serializer.save()
        # instance.attendees.add(self.request.user)
