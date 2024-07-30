from django.urls import path
from .views import (
    AnalyticsListView, AnalyticsDetailView, AnalyticsCreateView, AnalyticsUpdateView, AnalyticsDeleteView,
    BusinessIntelligenceListView, BusinessIntelligenceDetailView, BusinessIntelligenceCreateView, BusinessIntelligenceUpdateView, BusinessIntelligenceDeleteView,
)

app_name = 'analytics_and_business_intelligence'

urlpatterns = [
    path('analytics/', AnalyticsListView.as_view(), name='analytics-list'),
    path('analytics/<int:pk>/', AnalyticsDetailView.as_view(), name='analytics-detail'),
    path('analytics/create/', AnalyticsCreateView.as_view(), name='analytics-create'),
    path('analytics/<int:pk>/update/', AnalyticsUpdateView.as_view(), name='analytics-update'),
    path('analytics/<int:pk>/delete/', AnalyticsDeleteView.as_view(), name='analytics-delete'),

    path('businessintelligence/', BusinessIntelligenceListView.as_view(), name='businessintelligence-list'),
    path('businessintelligence/<int:pk>/', BusinessIntelligenceDetailView.as_view(), name='businessintelligence-detail'),
    path('businessintelligence/create/', BusinessIntelligenceCreateView.as_view(), name='businessintelligence-create'),
    path('businessintelligence/<int:pk>/update/', BusinessIntelligenceUpdateView.as_view(), name='businessintelligence-update'),
    path('businessintelligence/<int:pk>/delete/', BusinessIntelligenceDeleteView.as_view(), name='businessintelligence-delete'),
]
