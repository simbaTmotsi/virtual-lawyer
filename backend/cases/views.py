from django.shortcuts import render
from rest_framework import viewsets, permissions
from .models import Case
from .serializers import CaseSerializer

class CaseViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows cases to be viewed or edited.
    """
    queryset = Case.objects.all()
    serializer_class = CaseSerializer
    permission_classes = [permissions.IsAuthenticated] # Add more specific permissions later

    def get_queryset(self):
        """
        Filter cases based on the user's organization or assigned cases.
        """
        user = self.request.user
        # Example: Filter by organization
        # if hasattr(user, 'profile') and hasattr(user.profile, 'organization'):
        #     return Case.objects.filter(client__organization=user.profile.organization)
        # Example: Filter by assigned attorney/staff
        # return Case.objects.filter(assigned_attorneys=user) | Case.objects.filter(client__user_account=user) # Allow clients to see their cases
        
        # For now, return all - implement proper multi-tenancy/permissions later
        return Case.objects.all()

    def perform_create(self, serializer):
        """Optionally set default fields or perform actions on creation."""
        # Example: Assign creating user if needed
        # serializer.save(created_by=self.request.user)
        serializer.save()
