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
from FieldBoost.views.lawyer import auth_views as dashboard_views
from FieldBoost.views.lawyer.document_management import views as doc_views
from FieldBoost.views.lawyer.case_management import views as case_views
from FieldBoost.views.lawyer.client_management import views as client_views
from FieldBoost.views.lawyer.analytics_reporting import views as analytics_views
from FieldBoost.views.lawyer.documents_compliance import views as compliance_views
from django.urls import path
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    #-------------------------General(Dashboards,Widgets & Layout)---------------------------------------
    
    path('', dashboard_views.DashboardView.as_view(), name='lawyer_home'),
    path('to_do/', dashboard_views.to_do, name='to_do'),
    path('to_do_database/', dashboard_views.to_do_database, name='to_do_database'),
    path('mark_all_complete/', dashboard_views.markAllComplete, name='mark_all_complete'),
    path('mark_all_incomplete/', dashboard_views.markAllIncomplete, name='mark_all_incomplete'),
    path('delete_task/<int:pk>/', dashboard_views.deleteTask, name='delete_task'),
    path('update_task/<int:pk>/', dashboard_views.updateTask, name='update_task'),

    #--------------- # Document Management

    path('CreateDocument/', doc_views.DocumentCreation.as_view(), name='lawyer_document_create'),
    path('DocumentList/', doc_views.DocumentListView.as_view(), name='document_list'),
    path('DocumentShareListView/', doc_views.DocumentShareListView.as_view(), name='document_share_list'),
    path('Document/<int:pk>/', doc_views.DocumentDetailView.as_view(), name='document_detail'),
    path('document/<int:document_id>/share/', doc_views.DocumentShareView.as_view(), name='document_share'),
    path('Document/<int:pk>/update/', doc_views.DocumentUpdateView.as_view(), name='document_update'),
    path('Document/<int:pk>/delete/', doc_views.DocumentDeleteView.as_view(), name='document_delete'),
    
    path('DocumentStorage/', doc_views.DocumentStorage.as_view(), name='lawyer_document_storage'),
    path('DocumentSharing/', doc_views.DocumentTable.as_view(), name='lawyer_document_sharing'),
    path('document/<int:document_id>/share/', doc_views.DocumentShareView.as_view(), name='document_share'),
    
    path('DocumentReview/', doc_views.DocumentReview.as_view(), name='lawyer_document_table_review'),
    path('DocumentSearch/', doc_views.DocumentSearch.as_view(), name='lawyer_document_table_search'),
    path('DocumentAutomation/', doc_views.DocumentAutomation.as_view(), name='lawyer_document_table_automation'),
    path('DocumentImportExport/', doc_views.DocumentImportExport.as_view(), name='lawyer_document_table_import_export'),
    #---------------------------------------------------------------------------------------
]+static(settings.MEDIA_URL, document_root=settings.EASYLAW_DOCS_ROOT)
