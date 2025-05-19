from django.shortcuts import render
from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
import logging
import json
from .models import Client
from .serializers import ClientSerializer
from .permissions import IsAdminOrOwner

# Set up logger
logger = logging.getLogger(__name__)

class ClientViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows clients to be viewed or edited.
    Supports full CRUD operations with appropriate permissions.
    
    Permissions:
    - List/retrieve: Any authenticated user can view
    - Create/update/delete: Only admin, staff, or lawyer roles can modify
    
    Filtering:
    - Supports searching by first_name, last_name, email, and phone
    - Supports ordering by last_name, first_name, date_added, and last_updated
    
    Endpoints:
    - GET /api/clients/ - List all clients (with filters and pagination)
    - POST /api/clients/ - Create a new client
    - GET /api/clients/{id}/ - Retrieve a specific client
    - PUT/PATCH /api/clients/{id}/ - Update a client
    - DELETE /api/clients/{id}/ - Delete a client
    """
    queryset = Client.objects.all()
    serializer_class = ClientSerializer
    # Permissions are handled in get_permissions method
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['first_name', 'last_name', 'email', 'phone']
    ordering_fields = ['last_name', 'first_name', 'date_added', 'last_updated']
    ordering = ['last_name', 'first_name']

    def create(self, request, *args, **kwargs):
        """Enhanced create method with better logging and validation"""
        # Enhanced logging for debugging
        logger.warning(f"Request Content-Type: {request.content_type}")
        try:
            body_data = json.loads(request.body.decode('utf-8')) if hasattr(request, 'body') else {}
            logger.warning(f"Raw request body: {body_data}")
        except Exception as e:
            logger.warning(f"Error parsing request body: {str(e)}")
        
        logger.warning(f"Received client creation data: {request.data}")
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            logger.warning(f"Client serializer validation errors: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
        
    def get_permissions(self):
        """
        Customize permissions based on the action:
        - List/retrieve: Allow all authenticated users
        - Create/update/delete: Only allow admin, staff, or lawyer roles
        """
        if self.action in ['list', 'retrieve']:
            permission_classes = [permissions.IsAuthenticated]
        else:
            permission_classes = [permissions.IsAuthenticated, IsAdminOrOwner]
        return [permission() for permission in permission_classes]
        
    def retrieve(self, request, *args, **kwargs):
        """Override retrieve method to add logging and explicit permission checks"""
        logger.info(f"Retrieving client with ID: {kwargs.get('pk')}")
        try:
            instance = self.get_object()
            # Log additional information for debugging
            logger.info(f"User: {request.user}, Client: {instance}, Method: {request.method}")
            
            # Get the serialized data
            serializer = self.get_serializer(instance)
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Error retrieving client: {str(e)}")
            return Response({"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            logger.error(f"Error retrieving client: {str(e)}")
            raise
            
    def update(self, request, *args, **kwargs):
        """Override update method to add logging and explicit permission handling"""
        logger.info(f"Updating client with ID: {kwargs.get('pk')}")
        logger.info(f"User: {request.user}, Method: {request.method}")
        logger.info(f"Update data: {request.data}")
        
        try:
            # Get the client object
            instance = self.get_object()
            logger.info(f"Retrieved client: {instance}")
            
            # Serialize and validate the data
            serializer = self.get_serializer(instance, data=request.data, partial=kwargs.get('partial', False))
            if not serializer.is_valid():
                logger.error(f"Validation errors: {serializer.errors}")
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
                
            # Perform the update
            self.perform_update(serializer)
            logger.info(f"Client updated successfully: {instance.id}")
            
            if getattr(instance, '_prefetched_objects_cache', None):
                # If 'prefetch_related' has been applied to a queryset, we need to
                # forcibly invalidate the prefetch cache on the instance.
                instance._prefetched_objects_cache = {}
                
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Error updating client: {str(e)}")
            return Response({"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
    def partial_update(self, request, *args, **kwargs):
        """Override partial_update method to add logging and explicit permission handling"""
        logger.info(f"Partially updating client with ID: {kwargs.get('pk')}")
        logger.info(f"User: {request.user}, Method: {request.method}")
        logger.info(f"Partial update data: {request.data}")
        
        # Set partial=True to update only provided fields
        kwargs['partial'] = True
        return self.update(request, *args, **kwargs)
        
    def destroy(self, request, *args, **kwargs):
        """
        Provide confirmation and logging for client deletion.
        Checks for dependencies before allowing deletion.
        """
        try:
            client = self.get_object()
            logger.info(f"Attempting to delete client: {client.full_name} (ID: {client.id})")
            
            # Check for active cases (if Case model exists and is related)
            has_dependencies = False
            dependency_message = "Cannot delete client because they have:"
            
            # Check for cases if the relationship exists
            if hasattr(client, 'case_set'):
                active_cases = client.case_set.filter(status__in=['active', 'Active', 'pending', 'Pending']).count()
                if active_cases > 0:
                    has_dependencies = True
                    dependency_message += f" {active_cases} active case(s)"
            
            # Check for other dependencies here (documents, invoices, etc.)
            
            if has_dependencies:
                logger.warning(f"Deletion of client {client.id} prevented due to dependencies")
                return Response(
                    {"detail": dependency_message}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Proceed with deletion if no dependencies
            logger.info(f"Deleting client: {client.full_name} (ID: {client.id})")
            return super().destroy(request, *args, **kwargs)
            
        except Exception as e:
            logger.error(f"Error deleting client: {str(e)}")
            return Response(
                {"detail": f"Error deleting client: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def get_queryset(self):
        """
        Filter clients based on the user's role and permissions.
        """
        user = self.request.user
        logger.debug(f"User accessing clients: {user.email} (ID: {user.id})")
        
        # Superusers can see all clients
        if user.is_superuser:
            logger.debug("Superuser access - returning all clients")
            return Client.objects.all()
            
        # Filter by search query if provided
        query = self.request.query_params.get('q', None)
        queryset = Client.objects.all()
        
        if query:
            logger.debug(f"Filtering clients by search query: {query}")
            queryset = queryset.filter(
                Q(first_name__icontains=query) | 
                Q(last_name__icontains=query) |
                Q(email__icontains=query)
            )
            
        # Return filtered queryset
        return queryset
        
    @action(detail=False, methods=['get'])
    def recent(self, request):
        """Return recently added clients"""
        recent_clients = Client.objects.all().order_by('-date_added')[:5]
        serializer = self.get_serializer(recent_clients, many=True)
        return Response(serializer.data)
        
    @action(detail=True, methods=['get'])
    def cases(self, request, pk=None):
        """Return cases associated with this client"""
        client = self.get_object()
        # Check if there's a related manager for cases
        if hasattr(client, 'case_set'):
            cases = client.case_set.all()
            from cases.serializers import CaseSerializer  # Import here to avoid circular imports
            serializer = CaseSerializer(cases, many=True)
            return Response(serializer.data)
        return Response([], status=status.HTTP_200_OK)

    # perform_create, perform_update, perform_destroy can be overridden
    # for custom logic, e.g., associating with the current user's organization.
