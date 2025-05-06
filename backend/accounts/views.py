from django.shortcuts import render
from django.contrib.auth import get_user_model, authenticate
from rest_framework import viewsets, permissions, generics, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User, UserProfile
from .serializers import UserSerializer, UserProfileSerializer, RegisterSerializer
from .services import AuthService
import requests
from django.conf import settings
import json
import traceback

User = get_user_model()

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
        if not serializer.is_valid():
            print(f"Registration validation errors: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
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

@api_view(['POST'])
@permission_classes([AllowAny])  # Allow anyone to attempt login
def proxy_login_view(request):
    """
    Proxies login requests to the external authentication API.
    Expects JSON body with 'email' and 'password'.
    Returns Django JWT tokens upon successful external authentication.
    """
    try:
        data = json.loads(request.body)
        email = data.get('email')
        password = data.get('password')

        if not email or not password:
            return Response({'detail': 'Email and password are required.'}, status=status.HTTP_400_BAD_REQUEST)

        # --- First try Django authentication ---
        print(f"Attempting Django authentication for {email}")
        # Django's authenticate expects username field, but we're using email
        django_user = authenticate(username=email, password=password)
        
        if django_user is not None and django_user.is_active:
            print(f"Django authentication successful for {email}")
            
            # Generate Django JWT tokens
            refresh = RefreshToken.for_user(django_user)
            django_access_token = str(refresh.access_token)
            django_refresh_token = str(refresh)

            user_data = UserSerializer(django_user).data

            frontend_response_data = {
                'access': django_access_token,
                'refresh': django_refresh_token,
                'user': user_data,
                'auth_type': 'django'  # For debugging
            }

            return Response(frontend_response_data, status=status.HTTP_200_OK)
        else:
            print(f"Django authentication failed for {email}, trying FastAPI")
        
        # --- If Django authentication fails, try External API ---
        external_api_url = settings.EXTERNAL_AUTH_LOGIN_URL
        
        # Check if external auth is enabled
        try_external = getattr(settings, 'USE_EXTERNAL_AUTH', True)
        if not try_external:
            return Response(
                {'detail': 'Invalid email or password. Please try again.'}, 
                status=status.HTTP_401_UNAUTHORIZED
            )

        payload = {
            'grant_type': '',
            'username': email,
            'password': password,
            'scope': '',
            'client_id': '',
            'client_secret': ''
        }
        headers = {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json'
        }

        try:
            print(f"Proxying login for {email} to {external_api_url}")
            response = requests.post(external_api_url, data=payload, headers=headers, timeout=10)
            
            # Instead of raising an exception, check the status code to handle 401 more gracefully
            if response.status_code == 401:
                print(f"Authentication failed for {email}: Invalid credentials")
                return Response(
                    {'detail': 'Invalid email or password. Please try again.', 'error_type': 'invalid_credentials'}, 
                    status=status.HTTP_401_UNAUTHORIZED
                )
            
            # For other errors, still use raise_for_status to maintain existing behavior
            response.raise_for_status()

            print(f"External API response status: {response.status_code}")
            external_data = response.json()

            # --- Generate Django JWT Token ---
            external_user_info = external_data.get('user', {})
            user = None
            try:
                print("Attempting to get or create Django user...")
                # First try to get the user
                try:
                    user = User.objects.get(email=email)
                    created = False
                except User.DoesNotExist:
                    # Create user with a temporary password (will be made unusable)
                    user = User.objects.create(
                        email=email,
                        first_name=external_user_info.get('first_name', ''),
                        last_name=external_user_info.get('last_name', ''),
                        role=external_user_info.get('role', 'client'),
                        password='!'  # Temporary non-null value
                    )
                    created = True
                    
                    user.set_unusable_password()
                    user.save()

                if created:
                    UserProfile.objects.get_or_create(user=user)

                if not user.is_active:
                    return Response({'detail': 'User account is inactive.'}, status=status.HTTP_401_UNAUTHORIZED)

                refresh = RefreshToken.for_user(user)
                django_access_token = str(refresh.access_token)
                django_refresh_token = str(refresh)

                user_data = UserSerializer(user).data

                frontend_response_data = {
                    'access': django_access_token,
                    'refresh': django_refresh_token,
                    'user': user_data
                }

                return Response(frontend_response_data, status=status.HTTP_200_OK)

            except Exception as db_error:
                error_location = "Unknown location in DB/Token block"
                if user is None: error_location = "get_or_create User"
                elif created and not user.pk: error_location = "saving new User"
                elif created: error_location = "get_or_create UserProfile"
                elif not user.is_active: error_location = "checking user active status"
                elif 'refresh' not in locals(): error_location = "generating RefreshToken"
                elif 'user_data' not in locals(): error_location = "serializing User"

                traceback.print_exc()
                return Response({'detail': f'Error processing user account ({error_location}). Check server logs.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        except requests.exceptions.RequestException as e:
            print(f"Error calling external API: {e}")
            traceback.print_exc()
            error_detail = f"Could not connect to authentication service: {e}"
            error_type = 'service_error'
            
            if hasattr(e, 'response') and e.response is not None:
                try:
                    error_data = e.response.json()
                    error_detail = error_data.get('detail', f"Authentication service error (Status: {e.response.status_code})")
                    
                    # Handle specific error cases
                    if e.response.status_code == 401:
                        error_detail = 'Invalid email or password. Please try again.'
                        error_type = 'invalid_credentials'
                except json.JSONDecodeError:
                    error_detail = f"Authentication service error (Status: {e.response.status_code}, non-JSON response)"
                
                return Response({
                    'detail': error_detail,
                    'error_type': error_type
                }, status=e.response.status_code)

            return Response({
                'detail': error_detail,
                'error_type': 'service_unavailable'
            }, status=status.HTTP_503_SERVICE_UNAVAILABLE)

    except json.JSONDecodeError:
        print(f"ERROR: Invalid JSON body received.")
        traceback.print_exc()
        return Response({
            'detail': 'Invalid JSON body.', 
            'error_type': 'invalid_request'
        }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        print(f"ERROR: Unexpected error in proxy_login_view: {e}")
        traceback.print_exc()
        return Response({
            'detail': 'An unexpected error occurred. Check server logs.',
            'error_type': 'server_error'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
