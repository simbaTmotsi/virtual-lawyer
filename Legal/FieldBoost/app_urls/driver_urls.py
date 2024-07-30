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

from FieldBoost.views import driver_views

from django.urls import path
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    #-------------------------General(Dashboards,Widgets & Layout)---------------------------------------
    
    path('', driver_views.index, name="driver_home"),
    path('notifications/', driver_views.notifications, name="driver_notifications"),
    path('recent_activities/', driver_views.recent_activities, name="driver_recent_activities"),
]+static(settings.MEDIA_URL, document_root=settings.FIELDBOOST_DOCS_ROOT)
