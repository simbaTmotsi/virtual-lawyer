from django.urls import path
from FieldBoost.views.lawyer.case_views import CaseCreateView
from FieldBoost.views.lawyer.document_views import DocumentUploadView

urlpatterns = [
    path('create_case/', CaseCreateView.as_view(), name='create_case'),
    path('upload_document/', DocumentUploadView.as_view(), name='upload_document'),
]
