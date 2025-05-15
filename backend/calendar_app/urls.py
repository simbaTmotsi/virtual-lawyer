from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from . import mock_views

router = DefaultRouter()
router.register(r'events', views.EventViewSet)

urlpatterns = [
    # Use real views that interact with the database
    path('', include(router.urls)),
    
    # If we need to fallback to mock views for testing
    # path('mock/events/', mock_views.mock_events_list, name='mock-events-list'),
    # path('mock/events/upcoming/', mock_views.mock_events_upcoming, name='mock-events-upcoming'),
]