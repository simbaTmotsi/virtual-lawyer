from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    # Include authentication URLs with the prefix that the frontend expects
    path('api/accounts/', include('accounts.urls')),
    path('api/auth/', include('accounts.auth_urls')),
    # Other app URLs
    path('api/clients/', include('clients.urls')),
    path('api/cases/', include('cases.urls')),
    path('api/documents/', include('documents.urls')),
    path('api/research/', include('research.urls')),
    path('api/billing/', include('billing.urls')),
    path('api/calendar/', include('calendar_app.urls')),
    path('api/admin/', include('admin_portal.urls')),
    path('api/analytics/', include('analytics.urls')),
    path('api/notifications/', include('notifications.urls')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
