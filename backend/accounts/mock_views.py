from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

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
