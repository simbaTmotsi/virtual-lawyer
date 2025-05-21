from django.shortcuts import render
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db.models import Prefetch, Count
from .models import ResearchQuery, ResearchResult
from .serializers import ResearchQuerySerializer, ResearchResultSerializer
from admin_portal.models import APIKeyStorage, SystemSetting
import re
from collections import Counter
import requests
import json

class ResearchViewSet(viewsets.ModelViewSet):
    """
    ViewSet for handling AI-powered legal research tasks.
    """
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ResearchQuerySerializer
    
    def get_queryset(self):
        """
        Return queries for the current user only.
        Optionally filter by case if specified.
        """
        queryset = ResearchQuery.objects.filter(user=self.request.user)
        
        # Filter by case if a case_id is provided in query params
        case_id = self.request.query_params.get('case_id', None)
        if case_id:
            queryset = queryset.filter(case_id=case_id)
            
        return queryset.prefetch_related(
            Prefetch('results', queryset=ResearchResult.objects.order_by('-relevance_score'))
        ).order_by('-timestamp')
    
    @action(detail=False, methods=['post'])
    def query_gemini(self, request):
        """
        Sends a query to the Gemini AI through the FastAPI service.
        """
        query = request.data.get('query')
        if not query:
            return Response({"error": "Query text is required."}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            # Get the API key from secure storage
            api_key = APIKeyStorage.get_api_key('gemini_api_key')
            if not api_key:
                return Response(
                    {"error": "Gemini API key not configured. Please configure it in the admin settings."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Record the query
            research_query = ResearchQuery.objects.create(
                user=request.user,
                query_text=query
            )
            
            # In a real implementation, you would call the Gemini API here
            # For demo purposes, we'll just return a mock response
            # In production, implement actual Gemini API call
            
            result = {"response": f"This is a mock response to your query: {query}"}
            
            return Response(result, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {"error": f"An error occurred: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
