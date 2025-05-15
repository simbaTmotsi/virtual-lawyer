from django.urls import path
from . import views, mock_views

# Use real views if available, fallback to mock views
try:
    # Check if analytics views are implemented
    urlpatterns = [
        path('stats/', views.analytics_stats, name='analytics-stats'),
        path('cases/', views.analytics_cases, name='analytics-cases'),
        path('time-tracking/', views.analytics_time_tracking, name='analytics-time-tracking'),
        path('billing/', views.analytics_billing, name='analytics-billing'),
        path('summary/', views.analytics_summary, name='analytics-summary'),
        path('user-signups/', views.user_signups, name='analytics-user-signups'),
        path('api-usage/', views.api_usage, name='analytics-api-usage'),
        path('case-distribution/', views.case_distribution, name='analytics-case-distribution'),
    ]
except (ImportError, AttributeError):
    # Fallback to mock views
    urlpatterns = [
        path('stats/', mock_views.mock_analytics_stats, name='analytics-stats'),
        path('cases/', mock_views.mock_analytics_cases, name='analytics-cases'),
        path('time-tracking/', mock_views.mock_analytics_time_tracking, name='analytics-time-tracking'),
        path('billing/', mock_views.mock_analytics_billing, name='analytics-billing'),
        path('summary/', mock_views.mock_analytics_summary, name='analytics-summary'),
        path('user-signups/', mock_views.mock_user_signups, name='analytics-user-signups'),
        path('api-usage/', mock_views.mock_api_usage, name='analytics-api-usage'),
        path('case-distribution/', mock_views.mock_case_distribution, name='analytics-case-distribution'),
    ]
