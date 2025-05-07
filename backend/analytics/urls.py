from django.urls import path
from . import mock_views

urlpatterns = [
    path('stats/', mock_views.mock_analytics_stats, name='analytics-stats'),
    path('cases/', mock_views.mock_analytics_cases, name='analytics-cases'),
    path('time-tracking/', mock_views.mock_analytics_time_tracking, name='analytics-time-tracking'),
    path('billing/', mock_views.mock_analytics_billing, name='analytics-billing'),
    # Add this new route for admin analytics summary
    path('summary/', mock_views.mock_analytics_summary, name='analytics-summary'),
    # Add these routes for admin-specific analytics
    path('user-signups/', mock_views.mock_user_signups, name='analytics-user-signups'),
    path('api-usage/', mock_views.mock_api_usage, name='analytics-api-usage'),
    path('case-distribution/', mock_views.mock_case_distribution, name='analytics-case-distribution'),
]
