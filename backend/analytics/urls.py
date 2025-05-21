from django.urls import path
from . import views, mock_views

# Use real views and fallback to mock views only if needed
urlpatterns = [
    # Primary paths use real database-connected views
    path('stats/', views.analytics_stats, name='analytics-stats'),
    path('cases/', views.analytics_cases, name='analytics-cases'),
    path('time-tracking/', views.analytics_time_tracking, name='analytics-time-tracking'),
    path('billing/', views.analytics_billing, name='analytics-billing'),
    path('summary/', views.analytics_summary, name='analytics-summary'),
    path('admin-summary/', views.admin_analytics_summary, name='admin-analytics-summary'),
    path('user-signups/', views.user_signups, name='analytics-user-signups'),
    path('admin-user-signups/', views.admin_user_signups, name='admin-analytics-user-signups'),
    path('api-usage/', views.api_usage, name='analytics-api-usage'),
    path('admin-api-usage/', views.admin_api_usage, name='admin-analytics-api-usage'),
    path('case-distribution/', views.case_distribution, name='analytics-case-distribution'),
    path('admin-case-distribution/', views.admin_case_distribution, name='admin-analytics-case-distribution'),
    
    # Keep mock endpoints as fallbacks with different URLs
    path('mock/stats/', mock_views.mock_analytics_stats, name='mock-analytics-stats'),
    path('mock/cases/', mock_views.mock_analytics_cases, name='mock-analytics-cases'),
    path('mock/time-tracking/', mock_views.mock_analytics_time_tracking, name='mock-analytics-time-tracking'),
    path('mock/billing/', mock_views.mock_analytics_billing, name='mock-analytics-billing'),
    path('mock/summary/', mock_views.mock_analytics_summary, name='mock-analytics-summary'),
    path('mock/user-signups/', mock_views.mock_user_signups, name='mock-analytics-user-signups'),
    path('mock/api-usage/', mock_views.mock_api_usage, name='mock-analytics-api-usage'),
    path('mock/case-distribution/', mock_views.mock_case_distribution, name='mock-analytics-case-distribution'),
]

# Add router for ViewSets
from rest_framework.routers import DefaultRouter
from .views import GoogleApiUsageMetricViewSet # Ensure this import is correct

router = DefaultRouter()
router.register(r'google-api-metrics', GoogleApiUsageMetricViewSet, basename='googleapimetric')

# Combine existing urlpatterns with the router's URLs
from django.urls import include # Ensure include is imported

urlpatterns += [
    path('api/', include(router.urls)), # Prefix router URLs with 'api/' to avoid conflicts
]
