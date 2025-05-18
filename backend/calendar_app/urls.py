from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from . import mock_views

router = DefaultRouter()
router.register(r'events', views.EventViewSet)

urlpatterns = [
    # Use real views that interact with the database
    path('', include(router.urls)),
    path('events/upcoming/', views.upcoming_events, name='upcoming-events'),
    
    # Keep mock views for testing but with a mock/ prefix
    path('mock/events/', mock_views.mock_events_list, name='mock-events-list'),
    path('mock/events/upcoming/', mock_views.mock_events_upcoming, name='mock-events-upcoming'),
]