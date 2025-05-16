from django.shortcuts import render
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Notification
from .serializers import NotificationSerializer

class NotificationViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows notifications to be viewed or edited.
    
    This ViewSet automatically provides:
    - GET /api/notifications/ - list all notifications for current user
    - POST /api/notifications/ - create new notification
    - GET /api/notifications/{id}/ - retrieve a specific notification
    - PUT/PATCH /api/notifications/{id}/ - update a notification
    - DELETE /api/notifications/{id}/ - delete a notification
    - POST /api/notifications/mark-all-read/ - mark all notifications as read
    """
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Return notifications for the current user only."""
        return Notification.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        """Set the user when creating a notification."""
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        """Mark all notifications as read for the current user."""
        notifications = self.get_queryset()
        notifications.update(read=True)
        return Response({"status": "All notifications marked as read"}, 
                        status=status.HTTP_200_OK)
