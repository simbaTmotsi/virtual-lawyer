from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/accounts/', include('accounts.urls')),
    path('api/admin-portal/', include('admin_portal.urls')),
    path('api/analytics/', include('analytics.urls')),
    path('api/billing/', include('billing.urls')),
    path('api/calendar/', include('calendar_app.urls')),
    path('api/cases/', include('cases.urls')),
    path('api/clients/', include('clients.urls')),
    path('api/dashboard/', include('dashboard.urls')),
    path('api/documents/', include('documents.urls')),
    path('api/notifications/', include('notifications.urls')),
]
