from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'notifications', views.NotificationViewSet, basename='notification')

urlpatterns = [
    path('status/', views.NotificationStatusView.as_view(), name='notification-status'),
    path('', include(router.urls)),
]
