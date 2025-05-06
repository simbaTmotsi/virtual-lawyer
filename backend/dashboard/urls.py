from django.urls import path
from . import views

urlpatterns = [
    path('stats/', views.dashboard_stats, name='dashboard-stats'),
    path('deadlines/', views.dashboard_deadlines, name='dashboard-deadlines'),
    path('events/', views.dashboard_events, name='dashboard-events'),
    path('active-cases/', views.dashboard_active_cases, name='dashboard-active-cases'),
]
