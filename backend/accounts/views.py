from django.shortcuts import render
from django.contrib.auth import get_user_model
from rest_framework import viewsets, permissions, generics, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .models import User, UserProfile
from .serializers import UserSerializer, UserProfileSerializer, RegisterSerializer
from .services import AuthService

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
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Connect to FastAPI for user registration
        auth_service = AuthService()
        api_response = auth_service.register_user(serializer.validated_data)
        
        # Create local user record from the response
        user_data = api_response.get('user', {})
        user = User.objects.create_user(
            email=user_data.get('email'),
            password=serializer.validated_data['password'],
            first_name=user_data.get('first_name'),
            last_name=user_data.get('last_name'),
            role=user_data.get('role')
        )
        
        # Return response with user data
        user_data = UserSerializer(user).data
        return Response({
            "user": user_data,
            "message": "User registered successfully"
        }, status=status.HTTP_201_CREATED)

class CustomTokenObtainPairView(APIView):
    """
    Custom token view that returns user data along with the token
    """
    permission_classes = (permissions.AllowAny,)
    
    def post(self, request, *args, **kwargs):
        email = request.data.get('email')
        password = request.data.get('password')
        
        if not email or not password:
            return Response({
                "detail": "Email and password are required."
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Connect to FastAPI for authentication
        auth_service = AuthService()
        try:
            auth_response = auth_service.authenticate_user(email, password)
            
            # Get or create the user locally if they don't exist
            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    'first_name': auth_response.get('user', {}).get('first_name', ''),
                    'last_name': auth_response.get('user', {}).get('last_name', ''),
                    'role': auth_response.get('user', {}).get('role', 'client')
                }
            )
            
            # Return token and user data
            return Response({
                "access_token": auth_response.get('access_token'),
                "token_type": auth_response.get('token_type', 'bearer'),
                "user": UserSerializer(user).data
            })
            
        except Exception as e:
            return Response({
                "detail": str(e)
            }, status=status.HTTP_401_UNAUTHORIZED)

class CustomTokenRefreshView(APIView):
    """
    Custom token refresh view
    """
    permission_classes = (permissions.AllowAny,)
    
    def post(self, request, *args, **kwargs):
        refresh_token = request.data.get('refresh_token')
        
        if not refresh_token:
            return Response({
                "detail": "Refresh token is required."
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # In a real implementation, you would call the FastAPI refresh token endpoint
        # For now, just return an error since we don't have refresh tokens implemented
        
        return Response({
            "detail": "Token refresh not implemented"
        }, status=status.HTTP_501_NOT_IMPLEMENTED)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """
    API endpoint for user logout.
    For JWT auth, we don't actually need to do anything server-side 
    as the frontend will remove the token. This endpoint just provides
    a clean API interface.
    """
    return Response({"detail": "Successfully logged out."}, status=status.HTTP_200_OK)
