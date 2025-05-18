from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Case
from .serializers import CaseSerializer

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def mock_cases_list(request):
    """
    Redirects to the real database-backed API endpoint.
    This function is kept for backward compatibility but uses real data.
    """
    # Instead of mock data, query the database
    cases = Case.objects.all()
    serializer = CaseSerializer(cases, many=True)
    return Response(serializer.data)
