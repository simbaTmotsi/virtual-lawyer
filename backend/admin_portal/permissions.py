from rest_framework import permissions

class IsAdminUser(permissions.BasePermission):
    """
    Custom permission to only allow users with admin role to access.
    Different from Django's built-in IsAdminUser which checks is_staff.
    """
    
    def has_permission(self, request, view):
        # Check if user is authenticated and has admin role
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.role == 'admin'
        )
