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

from FieldBoost.views import farmer_views

from django.urls import path
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    #-------------------------General(Dashboards,Widgets & Layout)---------------------------------------
    
    path('', farmer_views.index, name="farmer_home"),
    path('dashboard_02/', farmer_views.dashboard_02, name="dashboard_02"),
    path('online_course/', farmer_views.online_course, name="online_course"),
    path('crypto/', farmer_views.crypto, name="crypto"),
    path('social/', farmer_views.social, name="social")
]+static(settings.MEDIA_URL, document_root=settings.FIELDBOOST_DOCS_ROOT)
