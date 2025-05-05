from django.shortcuts import render
from rest_framework import viewsets, permissions, status
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from .models import Document
from .serializers import DocumentSerializer

class DocumentViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows documents to be viewed or edited.
    """
    queryset = Document.objects.all()
    serializer_class = DocumentSerializer
    permission_classes = [permissions.IsAuthenticated] # Add more specific permissions later
    parser_classes = (MultiPartParser, FormParser)

    def get_queryset(self):
        """
        Optionally restricts the returned documents to a given user,
        by filtering against a `case` or `client` query parameter in the URL.
        Also filters by user's organization or direct access.
        """
        queryset = Document.objects.all() 
        # Add filtering based on user/organization
        # Example: queryset = queryset.filter(uploaded_by=self.request.user) 
        # Example: queryset = queryset.filter(case__client__organization=self.request.user.profile.organization)
        
        case_id = self.request.query_params.get('caseId')
        if case_id is not None:
            queryset = queryset.filter(case_id=case_id)
            
        client_id = self.request.query_params.get('clientId')
        if client_id is not None:
             queryset = queryset.filter(case__client_id=client_id) # Assumes Case model has client FK

        return queryset

    def perform_create(self, serializer):
        """Associate the document with the logged-in user upon creation."""
        serializer.save(uploaded_by=self.request.user)

    # Add custom actions if needed, e.g., for document analysis trigger
    # @action(detail=True, methods=['post'])
    # def analyze(self, request, pk=None):
    #     document = self.get_object()
    #     # Trigger analysis task (e.g., via Celery)
    #     # analysis_task.delay(document.id)
    #     return Response({'status': 'Analysis started'}, status=status.HTTP_202_ACCEPTED)
