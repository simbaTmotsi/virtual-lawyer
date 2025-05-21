from django.shortcuts import render
from rest_framework import viewsets, permissions, status, generics
from rest_framework.response import Response
from rest_framework.decorators import action
from django.conf import settings as django_settings
from accounts.models import User
from accounts.serializers import UserSerializer # Assuming UserSerializer exists
from .models import SystemSetting, APIKeyStorage
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

    @action(detail=True, methods=['post'])
    def set_billing_status(self, request, pk=None):
        """Enable or disable billing for a user."""
        user = self.get_object()
        billing_enabled = request.data.get('billing_enabled', None)
        if billing_enabled is None:
            return Response({"error": "'billing_enabled' (true/false) is required."}, status=status.HTTP_400_BAD_REQUEST)
        
        # Assuming user profile has billing_enabled field, adjust as needed
        if hasattr(user, 'profile'):
            user.profile.billing_enabled = bool(billing_enabled)
            user.profile.save()
        else:
            # If billing fields are on the user model directly
            user.billing_enabled = bool(billing_enabled)
            user.save()
            
        return Response(UserSerializer(user).data)
    
    @action(detail=True, methods=['post'])
    def set_billing_rate(self, request, pk=None):
        """Set hourly billing rate for a user."""
        user = self.get_object()
        billing_rate = request.data.get('billing_rate', None)
        
        try:
            billing_rate = float(billing_rate)
            if billing_rate < 0:
                raise ValueError("Billing rate must be non-negative")
        except (TypeError, ValueError):
            return Response({"error": "'billing_rate' must be a valid non-negative number."}, 
                            status=status.HTTP_400_BAD_REQUEST)
        
        # Update the billing rate on user profile or user model
        if hasattr(user, 'profile'):
            user.profile.billing_rate = billing_rate
            user.profile.save()
        else:
            # If billing fields are on the user model directly
            user.billing_rate = billing_rate
            user.save()
            
        return Response(UserSerializer(user).data)
        
    @action(detail=True, methods=['post'])
    def update_billing_settings(self, request, pk=None):
        """Update all billing settings for a user in one call."""
        user = self.get_object()
        billing_enabled = request.data.get('billing_enabled')
        billing_rate = request.data.get('billing_rate')
        
        # Validate billing_rate if provided
        if billing_rate is not None:
            try:
                billing_rate = float(billing_rate)
                if billing_rate < 0:
                    raise ValueError("Billing rate must be non-negative")
            except (TypeError, ValueError):
                return Response({"error": "'billing_rate' must be a valid non-negative number."}, 
                                status=status.HTTP_400_BAD_REQUEST)
        
        # Update fields based on which model contains the billing info
        if hasattr(user, 'profile'):
            if billing_enabled is not None:
                user.profile.billing_enabled = bool(billing_enabled)
            if billing_rate is not None:
                user.profile.billing_rate = billing_rate
            user.profile.save()
        else:
            # If billing fields are on the user model directly
            if billing_enabled is not None:
                user.billing_enabled = bool(billing_enabled)
            if billing_rate is not None:
                user.billing_rate = billing_rate
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
         """
         Get current LLM settings with masked API keys for security.
         """
         # Get masked versions of the keys if they exist
         openai_key_masked = APIKeyStorage.get_masked_api_key('openai_api_key')
         gemini_key_masked = APIKeyStorage.get_masked_api_key('gemini_api_key')
         
         # Get the preferred model setting
         preferred_model = 'openai'  # Default
         try:
             system_settings = SystemSetting.load()
             if hasattr(system_settings, 'preferred_llm'):
                 preferred_model = system_settings.preferred_llm
         except Exception as e:
             print(f"Error retrieving preferred model: {e}")
         
         return Response({
             "openai_key_set": bool(openai_key_masked),
             "gemini_key_set": bool(gemini_key_masked),
             "preferred_model": preferred_model,
             "openai_key_masked": openai_key_masked or "",
             "gemini_key_masked": gemini_key_masked or ""
         })

     def post(self, request, *args, **kwargs):
         """
         Update the preferred LLM model only.
         """
         selected_model = request.data.get('preferred_model')
         
         if selected_model in ['openai', 'gemini']:
             try:
                 # Update the system settings
                 system_settings = SystemSetting.load()
                 system_settings.preferred_llm = selected_model
                 system_settings.save()
                 
                 return Response({
                     "message": "LLM preference updated successfully",
                     "preferred_model": selected_model
                 })
             except Exception as e:
                 return Response({
                     "error": f"Failed to update LLM preference: {str(e)}"
                 }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
         else:
             return Response({
                 "error": "Invalid preferred_model value. Must be 'openai' or 'gemini'."
             }, status=status.HTTP_400_BAD_REQUEST)
         
     def put(self, request, *args, **kwargs):
         """
         Handle PUT requests for updating LLM settings.
         Securely stores API keys in the database using encryption.
         """
         preferred_model = request.data.get('preferred_model')
         openai_key = request.data.get('openai_key')
         gemini_key = request.data.get('gemini_key')
         
         # Store keys securely if provided
         responses = {}
         
         if openai_key:
             try:
                 APIKeyStorage.store_api_key('openai_api_key', openai_key)
                 responses["openai_key"] = "OpenAI API key updated successfully"
             except Exception as e:
                 responses["openai_key_error"] = f"Failed to update OpenAI API key: {str(e)}"
         
         if gemini_key:
             try:
                 APIKeyStorage.store_api_key('gemini_api_key', gemini_key)
                 responses["gemini_key"] = "Gemini API key updated successfully"
             except Exception as e:
                 responses["gemini_key_error"] = f"Failed to update Gemini API key: {str(e)}"
         
         # Update preferred model if provided
         if preferred_model:
             if preferred_model in ['openai', 'gemini']:
                 try:
                     system_settings = SystemSetting.load()
                     if not hasattr(system_settings, 'preferred_llm'):
                         # Add the field if it doesn't exist
                         SystemSetting._meta.get_field('preferred_llm')
                     system_settings.preferred_llm = preferred_model
                     system_settings.save()
                     responses["preferred_model"] = f"Preferred model set to {preferred_model}"
                 except Exception as e:
                     responses["preferred_model_error"] = f"Failed to update preferred model: {str(e)}"
             else:
                 responses["preferred_model_error"] = "Invalid preferred_model value. Must be 'openai' or 'gemini'."
         
         # Get current status for response
         openai_key_masked = APIKeyStorage.get_masked_api_key('openai_api_key')
         gemini_key_masked = APIKeyStorage.get_masked_api_key('gemini_api_key')
         
         # Get the current preferred model setting
         try:
             system_settings = SystemSetting.load()
             current_model = getattr(system_settings, 'preferred_llm', 'openai')
         except Exception:
             current_model = 'openai'
         
         return Response({
             "message": "LLM settings updated successfully",
             "details": responses,
             "openai_key_set": bool(openai_key_masked),
             "gemini_key_set": bool(gemini_key_masked),
             "openai_key_masked": openai_key_masked or "",
             "gemini_key_masked": gemini_key_masked or "",
             "preferred_model": preferred_model or current_model
         })

# Add views for Analytics Dashboard data if needed
