from django.shortcuts import render
from rest_framework import viewsets, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Case
from .serializers import CaseSerializer
from django.db.models import Q

class CaseViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows cases to be viewed or edited.
    """
    queryset = Case.objects.all()
    serializer_class = CaseSerializer
    permission_classes = [permissions.IsAuthenticated] # Add more specific permissions later
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'case_number', 'description', 'client__first_name', 'client__last_name']
    ordering_fields = ['title', 'date_opened', 'last_updated', 'status']
    ordering = ['-last_updated']

    def get_queryset(self):
        """
        Filter cases based on the user's role and permissions.
        """
        user = self.request.user
        queryset = Case.objects.all()
        
        # Filter by client if parameter is provided
        client_id = self.request.query_params.get('client_id')
        if client_id:
            queryset = queryset.filter(client_id=client_id)
            
        # Filter by status if parameter is provided
        status = self.request.query_params.get('status')
        if status:
            queryset = queryset.filter(status=status)
            
        # Filter by assigned attorney if parameter is provided
        attorney_id = self.request.query_params.get('attorney_id')
        if attorney_id:
            queryset = queryset.filter(assigned_attorneys__id=attorney_id)
            
        # If the user has a specific role, filter accordingly
        if hasattr(user, 'role'):
            if user.role == 'client':
                # Clients should only see their own cases
                queryset = queryset.filter(client__user_account=user)
            elif user.role in ['attorney', 'paralegal']:
                # Attorneys and paralegals should see cases assigned to them
                queryset = queryset.filter(Q(assigned_attorneys=user) | Q(created_by=user))
                
        return queryset

    def perform_create(self, serializer):
        """Optionally set default fields or perform actions on creation."""
        # Example: Assign creating user if needed
        # serializer.save(created_by=self.request.user)
        serializer.save()
