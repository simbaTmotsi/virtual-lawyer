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
from FieldBoost.views.lawyer import dashboard_views 
from FieldBoost.views.lawyer import case_views, document_views, lawyer_client_views
#from FieldBoost.views.lawyer.document_management import views as doc_views
from FieldBoost.views.lawyer.case_management import views as case_views
from django.urls import path
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('create_case/', case_views.CaseCreateView.as_view(), name='create_case'),
    path('upload_document/', document_views.DocumentUploadView.as_view(), name='lawyer_document_create'),
    #-------------------------General(Dashboards,Widgets & Layout)---------------------------------------
    
    path('', dashboard_views.DashboardView.as_view(), name='lawyer_home'),

    #--------------- # Document Management
    #path('CreateDocument/', document_views.DocumentCreation.as_view(), name='lawyer_document_create'),
    path('DocumentList/', document_views.DocumentListView.as_view(), name='document_list'),
    path('DocumentShareListView/', document_views.DocumentShareListView.as_view(), name='document_share_list'),
    path('Document/<int:pk>/', document_views.DocumentDetailView.as_view(), name='document_detail'),
    path('document/<int:document_id>/share/', document_views.DocumentShareView.as_view(), name='document_share'),
    path('Document/<int:pk>/update/', document_views.DocumentUpdateView.as_view(), name='document_update'),
    path('Document/<int:pk>/delete/', document_views.DocumentDeleteView.as_view(), name='document_delete'),
    path('DocumentStorage/', document_views.DocumentStorage.as_view(), name='lawyer_document_storage'),
    path('DocumentSharing/', document_views.DocumentTable.as_view(), name='lawyer_document_sharing'),
    path('share/<int:pk>/', document_views.DocumentShareView.as_view(), name='document_share'),
    #---------------------------------------------------------------------------------------
    
    #--------------- # Case Management
    #path('cases_list/', case_views.CaseListView.as_view(), name='case_list'),
    #path('cases_new/', case_views.CaseCreateView.as_view(), name='case_create'),
    path('cases_overview/', case_views.CaseOverviewView.as_view(), name='case_overview'),
    path('cases_details/', case_views.CaseOverviewView.as_view(), name='case_details'),
    #path('case/<int:pk>/', case_views.CaseDetailView.as_view(), name='case_detail'),
    path('case/<int:case_id>/archive/', case_views.archive_case_view, name='archive_case'),
    path('archived-cases/', case_views.ArchivedCaseListView.as_view(), name='archived_cases'),
    path('case/<int:case_id>/restore/', case_views.restore_case_view, name='restore_case'),

    path('case/create/', lawyer_client_views.CaseCreateView.as_view(), name='case_create'),
    path('case/list/', lawyer_client_views.CaseListView.as_view(), name='case_list'),
    path('case/<int:pk>/', lawyer_client_views.CaseDetailView.as_view(), name='case_detail'),
    path('case/<int:pk>/edit/', lawyer_client_views.CaseUpdateView.as_view(), name='case_edit'),
    path('case/<int:pk>/delete/', lawyer_client_views.CaseDeleteView.as_view(), name='case_delete'),
    #---------------------------------------------------------------------------------------

    #--------------- # Client Management
    path('onboard-client/', lawyer_client_views.ClientOnboardingView.as_view(), name='lawyer_client_onboarding'),
    path('client-list/', lawyer_client_views.LawyerClientListView.as_view(), name='lawyer_client_list'),  # Added URL pattern
    path('client/<int:pk>/', lawyer_client_views.ClientDetailView.as_view(), name='client_detail'),  # Client detail URL
    path('client/<int:pk>/edit/', lawyer_client_views.ClientEditView.as_view(), name='client_edit'),  # Edit URL
    path('client/<int:pk>/delete/', lawyer_client_views.ClientDeleteView.as_view(), name='client_delete'),  # Delete URL
    path('client-communication/', lawyer_client_views.ClientCommunicationView.as_view(), name='client_communication'),  # Communication URL
    path('messages/', lawyer_client_views.ClientMessageListView.as_view(), name='client_messages'),
    #---------------------------------------------------------------------------------------

    #-----------------Appointments
    path('appointment/create/', lawyer_client_views.AppointmentCreateView.as_view(), name='appointment_create'),
    path('appointment/list/', lawyer_client_views.AppointmentListView.as_view(), name='appointment_list'),
    path('appointment/<int:pk>/edit/', lawyer_client_views.AppointmentEditView.as_view(), name='appointment_edit'),
    path('appointment/<int:pk>/delete/', lawyer_client_views.AppointmentDeleteView.as_view(), name='appointment_delete'),
    #---------------------------------------------------------------------------------------

    #----------------- Documents
    path('document/upload/', lawyer_client_views.DocumentUploadView.as_view(), name='document_upload'),
    path('document/list/', lawyer_client_views.DocumentListView.as_view(), name='client_document_list'),
    path('document/<int:pk>/edit/', lawyer_client_views.DocumentUpdateView.as_view(), name='document_edit'),
    path('document/<int:pk>/delete/', lawyer_client_views.DocumentDeleteView.as_view(), name='document_delete'),
    #---------------------------------------------------------------------------------------

    #---------------- # Evidence management
    path('case/<int:case_id>/evidence/upload/', lawyer_client_views.EvidenceCreateView.as_view(), name='evidence_add'),
    path('case/<int:case_id>/evidence/', lawyer_client_views.EvidenceListView.as_view(), name='evidence_list'),
    path('evidence/<int:pk>/edit/', lawyer_client_views.EvidenceUpdateView.as_view(), name='evidence_edit'),
    path('evidence/<int:pk>/delete/', lawyer_client_views.EvidenceDeleteView.as_view(), name='evidence_delete'),
    path('case/<int:case_id>/evidence/upload/', lawyer_client_views.EvidenceUploadView.as_view(), name='evidence_upload'),
    path('evidence/upload/', lawyer_client_views.StandaloneEvidenceUploadView.as_view(), name='standalone_evidence_upload'),
    path('case/<int:case_id>/evidence/', lawyer_client_views.CaseEvidenceListView.as_view(), name='case_evidence_list'),  # New case evidence list
    
    path('cases-with-evidence/', lawyer_client_views.CasesWithEvidenceListView.as_view(), name='cases_with_evidence'),
    #---------------------------------------------------------------------------------------
    

]+static(settings.MEDIA_URL, document_root=settings.EASYLAW_DOCS_ROOT)
