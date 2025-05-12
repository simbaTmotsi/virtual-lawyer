from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import UserViewSet, UserProfileViewSet, RegisterView, proxy_login_view, CurrentUserView
from . import mock_views

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'profiles', UserProfileViewSet, basename='userprofile')

urlpatterns = [
    path('', include(router.urls)),
    # Keep this endpoint as-is, we'll adjust the frontend
    path('register/', RegisterView.as_view(), name='register'),
    path('proxy-login/', proxy_login_view, name='proxy-login'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),  # Added standard JWT refresh view
    path('me/', CurrentUserView.as_view(), name='current-user'),
    path('users/', mock_views.mock_users_list, name='mock-users-list'),
]
