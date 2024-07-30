"""FieldBoost URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include

from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('farmer/', include('FieldBoost.app_urls.farmer_urls')),
    path('lawyer/', include('FieldBoost.app_urls.lawyer_urls')),
    path('driver/', include('FieldBoost.app_urls.driver_urls')),
    path("", include('FieldBoost.app_urls.auth_urls')),    
]+static(settings.MEDIA_URL, document_root=settings.FIELDBOOST_DOCS_ROOT)
