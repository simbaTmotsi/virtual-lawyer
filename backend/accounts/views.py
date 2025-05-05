from django.shortcuts import render
from rest_framework import viewsets, permissions, generics, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .models import User, UserProfile
from .serializers import UserSerializer, UserProfileSerializer, RegisterSerializer

class UserViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint that allows users to be viewed.
    Provides read-only access for general users. Admin management is in admin_portal.
    """
    queryset = User.objects.filter(is_active=True) # Only show active users by default
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    # Add action for current user details
    @action(detail=False, methods=['get'], url_path='me')
    def get_current_user(self, request):
        """Returns details for the currently authenticated user."""
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

class UserProfileViewSet(viewsets.ModelViewSet):
    """
    API endpoint for viewing and editing the profile of the authenticated user.
    """
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Only allow users to see/edit their own profile."""
        return UserProfile.objects.filter(user=self.request.user)

    def get_object(self):
        """Get the profile for the current user, creating if it doesn't exist."""
        obj, created = UserProfile.objects.get_or_create(user=self.request.user)
        return obj

    def perform_create(self, serializer):
        # This shouldn't normally be called due to get_object creating it.
        serializer.save(user=self.request.user)

    def perform_update(self, serializer):
        serializer.save(user=self.request.user) # Ensure user association on update

class RegisterView(generics.CreateAPIView):
    """
    API endpoint for user registration.
    """
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,) # Allow anyone to register
    serializer_class = RegisterSerializer

# JWT Views (can be used directly in urls.py or wrapped)
class CustomTokenObtainPairView(TokenObtainPairView):
    # Optionally customize the response payload
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        # Add custom data to token response if needed
        # try:
        #     user = User.objects.get(email=request.data['email'])
        #     response.data['user_role'] = user.role
        #     response.data['user_id'] = user.id
        # except User.DoesNotExist:
        #     pass 
        return response

# No changes needed for Refresh view usually
class CustomTokenRefreshView(TokenRefreshView):
    pass
