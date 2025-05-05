from django.shortcuts import render
from rest_framework import viewsets, permissions
from .models import Client
from .serializers import ClientSerializer

class ClientViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows clients to be viewed or edited.
    """
    queryset = Client.objects.all()
    serializer_class = ClientSerializer
    permission_classes = [permissions.IsAuthenticated] # Add more specific permissions later

    def get_queryset(self):
        """
        Filter clients based on the user's organization or relationship.
        """
        user = self.request.user
        # Example: Filter by organization if users are linked via a profile/organization model
        # if hasattr(user, 'profile') and hasattr(user.profile, 'organization'):
        #     return Client.objects.filter(organization=user.profile.organization)
        # For now, return all - implement proper multi-tenancy/permissions later
        return Client.objects.all()

    # perform_create, perform_update, perform_destroy can be overridden
    # for custom logic, e.g., associating with the current user's organization.
