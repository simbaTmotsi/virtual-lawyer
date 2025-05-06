from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def mock_cases_list(request):
    """Temporary mock implementation to return cases"""
    cases = [
        {
            'id': 1,
            'title': 'Johnson vs. MegaCorp',
            'case_number': 'CV-2025-123456',
            'description': 'Workplace discrimination lawsuit',
            'status': 'active',
            'client': 5,
            'date_opened': '2025-01-15',
            'date_closed': None,
            'last_updated': '2025-05-01T10:30:00Z'
        },
        {
            'id': 2,
            'title': 'Davis Estate Planning',
            'case_number': 'EP-2025-789012',
            'description': 'Estate planning and trust setup',
            'status': 'active',
            'client': 6,
            'date_opened': '2025-02-10',
            'date_closed': None,
            'last_updated': '2025-04-25T14:15:00Z'
        },
    ]
    
    return Response(cases)
