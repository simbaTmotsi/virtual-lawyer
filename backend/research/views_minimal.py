from django.shortcuts import render
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from .models import ResearchQuery, ResearchResult
from .serializers import ResearchQuerySerializer, ResearchResultSerializer

# Simple viewset with minimal functionality
class ResearchViewSet(viewsets.ModelViewSet):
    """ViewSet for handling research queries."""
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ResearchQuerySerializer
    
    def get_queryset(self):
        return ResearchQuery.objects.filter(user=self.request.user).order_by('-timestamp')
