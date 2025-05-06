from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from . import mock_views

router = DefaultRouter()
router.register(r'', views.CaseViewSet, basename='case')

urlpatterns = [
    path('', include(router.urls)),
    path('', mock_views.mock_cases_list, name='mock-cases-list'),
]