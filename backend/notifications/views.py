from django.shortcuts import render
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.views import APIView
from .models import Notification
from .serializers import NotificationSerializer
from .status_serializer import NotificationStatusSerializer

class NotificationStatusView(APIView):
    """
    A public endpoint to check notification status without authentication.
    This helps prevent repeated 401 errors when client isn't yet authenticated.
    """
    permission_classes = [AllowAny]
    serializer_class = NotificationStatusSerializer
    
    def get(self, request):
        data = {
            "status": "ok",
            "message": "Authentication required to view notifications. Please log in first.",
            "authenticated": request.user.is_authenticated,
            "unread_count": 0
        }
        
        # If authenticated, include unread notification count
        if request.user.is_authenticated:
            data["unread_count"] = Notification.objects.filter(
                user=request.user, 
                read=False
            ).count()
            data["message"] = "User is authenticated. You can access notifications."
            
        return Response(data, status=status.HTTP_200_OK)

class NotificationViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows notifications to be viewed or edited.
    
    This ViewSet automatically provides:
    - GET /api/notifications/notifications/ - list all notifications for current user
    - POST /api/notifications/notifications/ - create new notification
    - GET /api/notifications/notifications/{id}/ - retrieve a specific notification
    - PUT/PATCH /api/notifications/notifications/{id}/ - update a notification
    - DELETE /api/notifications/notifications/{id}/ - delete a notification
    - POST /api/notifications/notifications/mark-all-read/ - mark all notifications as read
    - GET /api/notifications/notifications/unread-count/ - get count of unread notifications
    """
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Return notifications for the current user only."""
        if not self.request.user.is_authenticated:
            return Notification.objects.none()
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
                        
    @action(detail=False, methods=['get'])
    def unread_count(self, request):
        """Get count of unread notifications for the current user."""
        count = self.get_queryset().filter(read=False).count()
        return Response({"unread_count": count}, status=status.HTTP_200_OK)
