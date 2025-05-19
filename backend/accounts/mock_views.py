from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def mock_users_list(request):
    """Temporary mock implementation to return users filtered by role"""
    role = request.query_params.get('role', None)
    
    # Base list of mock users
    users = [
        {
            'id': 1,
            'email': 'john.lawyer@easylaw.com',
            'first_name': 'John',
            'last_name': 'Smith',
            'role': 'attorney',
            'is_active': True,
            'date_joined': '2023-01-15T10:00:00Z'
        },
        {
            'id': 2,
            'email': 'sarah.attorney@easylaw.com',
            'first_name': 'Sarah',
            'last_name': 'Johnson',
            'role': 'attorney',
            'is_active': True,
            'date_joined': '2023-02-20T14:30:00Z'
        },
        {
            'id': 3,
            'email': 'robert.admin@easylaw.com',
            'first_name': 'Robert',
            'last_name': 'Davis',
            'role': 'admin',
            'is_active': True,
            'date_joined': '2023-01-01T09:00:00Z'
        },
        {
            'id': 4,
            'email': 'lisa.paralegal@easylaw.com',
            'first_name': 'Lisa',
            'last_name': 'Chen',
            'role': 'paralegal',
            'is_active': True,
            'date_joined': '2023-03-10T11:15:00Z'
        }
    ]
    
    # Filter by role if provided
    if role:
        users = [user for user in users if user['role'] == role]
        
    return Response(users)

@api_view(['GET'])
@permission_classes([AllowAny])
def get_test_token(request):
    """
    Generate a test token for the specified role or default to admin.
    ?role=admin|attorney|client
    """
    role = request.query_params.get('role', 'admin')
    User = get_user_model()
    
    # Map role parameter to actual role in the system
    role_mapping = {
        'admin': 'admin',
        'attorney': 'attorney',
        'lawyer': 'attorney',
        'client': 'client',
        'user': 'client'
    }
    
    role = role_mapping.get(role.lower(), 'admin')
    
    email_map = {
        'admin': 'test_admin@example.com',
        'attorney': 'test_attorney@example.com',
        'client': 'test_client@example.com'
    }
    
    email = email_map.get(role)
    
    # Get or create the test user
    user_data = {
        'email': email,
        'first_name': 'Test',
        'last_name': role.capitalize(),
        'role': role,
        'is_staff': role in ['admin', 'attorney'],
        'is_superuser': role == 'admin'
    }
    
    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        user = User.objects.create_user(
            email=email,
            password='testpassword123',
            **{k: v for k, v in user_data.items() if k != 'email'}
        )
    
    # Generate token
    refresh = RefreshToken.for_user(user)
    
    return Response({
        'refresh': str(refresh),
        'access': str(refresh.access_token),
        'user': {
            'id': user.id,
            'email': user.email,
            'role': user.role,
            'name': f"{user.first_name} {user.last_name}"
        }
    }, status=status.HTTP_200_OK)
