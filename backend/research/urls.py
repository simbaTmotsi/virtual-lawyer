from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
# If using ModelViewSet:
# router.register(r'queries', views.ResearchQueryViewSet, basename='researchquery')

# If using ViewSet:
router.register(r'', views.ResearchViewSet, basename='research')


urlpatterns = [
    path('', include(router.urls)),
    # Example for ViewSet actions if not using router registration for actions:
    # path('perform-search/', views.ResearchViewSet.as_view({'post': 'perform_search'}), name='perform-search'),
    # path('analyze-document/<int:pk>/', views.ResearchViewSet.as_view({'post': 'analyze_document'}), name='analyze-document'),
]