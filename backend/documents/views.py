from django.shortcuts import render
from rest_framework import viewsets, permissions, status
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db.models import Q
from .models import Document
from .serializers import DocumentSerializer

class DocumentViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows documents to be viewed or edited.
    """
    queryset = Document.objects.all()
    serializer_class = DocumentSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    
    def get_queryset(self):
        """
        Optionally restricts the returned documents to a given user,
        by filtering against a `case` or `client` query parameter in the URL.
        Also filters by user's organization or direct access.
        """
        queryset = Document.objects.all() 
        
        # Restrict to documents uploaded by the user or visible to their organization
        # Unless the user is an admin, who can see all documents
        if not self.request.user.is_staff:
            queryset = queryset.filter(
                Q(uploaded_by=self.request.user) | 
                Q(case__assigned_attorneys=self.request.user)
            ).distinct()
        
        # Filter by case ID
        case_id = self.request.query_params.get('caseId')
        if case_id:
            queryset = queryset.filter(case_id=case_id)
            
        # Filter by client ID
        client_id = self.request.query_params.get('clientId')
        if client_id:
            queryset = queryset.filter(case__client_id=client_id)
            
        # Filter by document type
        doc_type = self.request.query_params.get('docType')
        if doc_type:
            queryset = queryset.filter(doc_type=doc_type)
            
        # Search by name or description
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) | 
                Q(description__icontains=search)
            )

        return queryset
    
    def perform_create(self, serializer):
        """Save the document with the current user as uploader"""
        serializer.save(uploaded_by=self.request.user)
        
    @action(detail=True, methods=['get'])
    def download(self, request, pk=None):
        """
        Download the document file directly
        """
        document = self.get_object()
        return Response({
            'file_url': request.build_absolute_uri(document.file.url),
            'name': document.name
        })
