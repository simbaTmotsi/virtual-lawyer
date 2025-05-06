from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from . import mock_views

router = DefaultRouter()
router.register(r'events', views.EventViewSet)

urlpatterns = [
    # Temporary mock routes that don't require database access
    path('events/', mock_views.mock_events_list, name='mock-events-list'),
    path('events/upcoming/', mock_views.mock_events_upcoming, name='mock-events-upcoming'),
    
    # Keep the router URLs but commented out until migrations are applied
    # path('', include(router.urls)),
]