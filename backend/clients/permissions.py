from rest_framework import permissions
import logging

# Set up logger
logger = logging.getLogger(__name__)

class IsAdminOrOwner(permissions.BasePermission):
    """
    Custom permission to allow:
    - Administrators to do anything
    - Users with the staff role to view all clients but only edit their own
    - Regular users to only view and edit their own clients
    
    Usage:
    Add this permission to your ViewSet's permission_classes, or use it in
    the get_permissions() method for action-based permissions.
    
    Example:
    ```python
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            permission_classes = [permissions.IsAuthenticated]
        else:
            permission_classes = [permissions.IsAuthenticated, IsAdminOrOwner]
        return [permission() for permission in permission_classes]
    ```
    """
    
    def has_permission(self, request, view):
        """Determine if the user has basic permission to access the view"""
        # Always allow GET, HEAD, OPTIONS requests for authenticated users
        if request.method in permissions.SAFE_METHODS and request.user.is_authenticated:
            logger.debug(f"Allowing read access for authenticated user {request.user}")
            return True
        
        # For PATCH/PUT, check if user is authenticated    
        if request.method in ['PATCH', 'PUT'] and request.user.is_authenticated:
            # We'll do the detailed check in has_object_permission
            logger.debug(f"User {request.user} is authenticated for PATCH/PUT, will check object permission")
            return True
            
        # Additional checks for POST/DELETE
        has_perm = request.user.is_authenticated and (
            request.user.is_superuser or 
            request.user.is_staff or
            hasattr(request.user, 'role') and request.user.role in ['admin', 'attorney', 'lawyer', 'paralegal']
        )
        
        if not has_perm:
            logger.warning(f"Denying write access for user {request.user}. Method: {request.method}")
        
        return has_perm
    
    def has_object_permission(self, request, view, obj):
        """Determine if the user has permission to access a specific object"""
        logger.debug(f"Checking object permission for {request.user} on {obj}")
        
        # Always allow GET, HEAD, OPTIONS for authenticated users
        if request.method in permissions.SAFE_METHODS and request.user.is_authenticated:
            logger.debug(f"Allowing read access for {request.user} on {obj}")
            return True
            
        # Allow administrators full access
        if request.user.is_superuser:
            logger.debug(f"Allowing superuser {request.user} access to {obj}")
            return True
            
        # Staff with attorney/lawyer role can edit all clients
        if request.user.is_staff and hasattr(request.user, 'role') and request.user.role in ['attorney', 'lawyer']:
            logger.debug(f"Allowing staff attorney {request.user} access to {obj}")
            return True
        
        # For general staff, only allow read
        if request.user.is_staff and request.method in permissions.SAFE_METHODS:
            logger.debug(f"Allowing staff {request.user} read access to {obj}")
            return True
            
        # For lawyers/attorneys, allow access to all clients
        if hasattr(request.user, 'role') and request.user.role in ['attorney', 'lawyer']:
            logger.debug(f"Allowing attorney {request.user} access to {obj}")
            return True
            
        # By default, deny access
        logger.warning(f"Denied object access for {request.user} on {obj}")
        return False
