from django.urls import path
from .views import (
    RegisterView,
    CustomTokenObtainPairView,
    CustomTokenRefreshView,
    logout_view,
    proxy_login_view
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', proxy_login_view, name='token_obtain_pair'),
    path('refresh/', CustomTokenRefreshView.as_view(), name='token_refresh'),
    path('logout/', logout_view, name='logout'),
]
