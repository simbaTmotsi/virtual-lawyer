from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'users', views.UserManagementViewSet, basename='admin-user')

urlpatterns = [
    path('', include(router.urls)),
    path('settings/', views.SystemSettingsView.as_view(), name='system-settings'),
    path('llm-settings/', views.LlmSettingsView.as_view(), name='llm-settings'),
    # Add other admin-specific endpoints like analytics data sources
]
