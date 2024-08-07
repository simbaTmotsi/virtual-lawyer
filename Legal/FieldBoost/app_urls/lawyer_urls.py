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

from FieldBoost.views import lawyer_views

from django.urls import path
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    #-------------------------General(Dashboards,Widgets & Layout)---------------------------------------
    
    path('', lawyer_views.DashboardView.as_view(), name='lawyer_home'),
    #--------------- Documents
    path('CreateDocument/', lawyer_views.DocumentCreation.as_view(), name='lawyer_document_create'),
    path('DocumentStorage/', lawyer_views.DocumentStorage.as_view(), name='lawyer_document_storage'),
    path('DocumentSharing/', lawyer_views.DocumentTable.as_view(), name='lawyer_document_sharing'),
    path('DocumentCollaboration/', lawyer_views.DocumentCollaboration.as_view(), name='lawyer_document_table_collaboration'),
    path('DocumentReview/', lawyer_views.DocumentReview.as_view(), name='lawyer_document_table_review'),
    path('DocumentSearch/', lawyer_views.DocumentSearch.as_view(), name='lawyer_document_table_search'),
    path('DocumentAutomation/', lawyer_views.DocumentAutomation.as_view(), name='lawyer_document_table_automation'),
    path('DocumentImportExport/', lawyer_views.DocumentImportExport.as_view(), name='lawyer_document_table_import_export'),
    #---------------------------------------------------------------------------------------
]+static(settings.MEDIA_URL, document_root=settings.EASYLAW_DOCS_ROOT)
