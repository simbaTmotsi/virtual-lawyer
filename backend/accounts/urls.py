from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Set up DRF router for ViewSet-based views
router = DefaultRouter()
router.register(r'profile', views.UserProfileViewSet, basename='profile')

urlpatterns = [
    # Include router URLs
    path('', include(router.urls)),
    
    # User registration
    path('register/', views.RegisterView.as_view(), name='register'),
    
    # JWT authentication
    path('login/', views.CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', views.CustomTokenRefreshView.as_view(), name='token_refresh'),
]
