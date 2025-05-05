from django.shortcuts import render
from rest_framework import viewsets, permissions, status, generics
from rest_framework.response import Response
from rest_framework.decorators import action
from django.conf import settings as django_settings
from accounts.models import User
from accounts.serializers import UserSerializer # Assuming UserSerializer exists
from .models import SystemSetting
from .serializers import SystemSettingSerializer
from .permissions import IsAdminUser # Custom permission

class UserManagementViewSet(viewsets.ModelViewSet):
    """
    API endpoint for administrators to manage user accounts.
    """
    queryset = User.objects.all().order_by('email')
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser] # Use Django's IsAdminUser or custom one

    # Add actions like 'activate_user', 'deactivate_user', 'set_role'
    @action(detail=True, methods=['post'])
    def set_active_status(self, request, pk=None):
        user = self.get_object()
        is_active = request.data.get('is_active', None)
        if is_active is None:
            return Response({"error": "'is_active' (true/false) is required."}, status=status.HTTP_400_BAD_REQUEST)
        
        user.is_active = bool(is_active)
        user.save()
        return Response(UserSerializer(user).data)

    @action(detail=True, methods=['post'])
    def set_role(self, request, pk=None):
        user = self.get_object()
        role = request.data.get('role', None)
        valid_roles = [r[0] for r in User.ROLE_CHOICES]
        if role not in valid_roles:
             return Response({"error": f"Invalid role. Valid roles are: {', '.join(valid_roles)}"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Prevent demoting the last admin? Add checks if needed.
        user.role = role
        # Adjust is_staff based on role?
        user.is_staff = (role == 'admin') 
        user.save()
        return Response(UserSerializer(user).data)


class SystemSettingsView(generics.RetrieveUpdateAPIView):
    """
    API endpoint for administrators to view and update system settings.
    Uses a single object approach for simplicity.
    """
    serializer_class = SystemSettingSerializer
    permission_classes = [permissions.IsAdminUser]

    def get_object(self):
        # Get the first SystemSetting object, or create it if it doesn't exist
        obj, created = SystemSetting.objects.get_or_create(id=1) 
        return obj

    def update(self, request, *args, **kwargs):
        response = super().update(request, *args, **kwargs)
        # Potentially trigger actions based on settings changes (e.g., clear cache)
        return response

class LlmSettingsView(generics.GenericAPIView):
     """
     API endpoint for managing LLM API Keys (stored securely, not in DB ideally).
     This is a placeholder - actual implementation should use secure storage.
     """
     permission_classes = [permissions.IsAdminUser]

     def get(self, request, *args, **kwargs):
         # Return masked keys or just confirmation they are set
         return Response({
             "openai_key_set": bool(django_settings.OPENAI_API_KEY),
             "gemini_key_set": bool(django_settings.GEMINI_API_KEY),
             # "selected_model": get_selected_llm_model() # Need a way to store this preference
         })

     def post(self, request, *args, **kwargs):
         # This is highly insecure - DO NOT store keys directly from request in production.
         # Use environment variables or a secure secrets manager.
         # This endpoint might just update the 'selected_model' preference.
         selected_model = request.data.get('selected_model')
         # save_selected_llm_model(selected_model) # Persist the preference
         return Response({"message": "LLM preference updated (API keys managed via environment/secrets)."})

# Add views for Analytics Dashboard data if needed
