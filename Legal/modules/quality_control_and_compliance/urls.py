from django.urls import path
from .views import (
    QualityControlListView, QualityControlDetailView, QualityControlCreateView, QualityControlUpdateView, QualityControlDeleteView,
    ComplianceListView, ComplianceDetailView, ComplianceCreateView, ComplianceUpdateView, ComplianceDeleteView,
)

app_name = 'quality_control_and_compliance'

urlpatterns = [
    path('qualitycontrol/', QualityControlListView.as_view(), name='qualitycontrol-list'),
    path('qualitycontrol/<int:pk>/', QualityControlDetailView.as_view(), name='qualitycontrol-detail'),
    path('qualitycontrol/create/', QualityControlCreateView.as_view(), name='qualitycontrol-create'),
    path('qualitycontrol/<int:pk>/update/', QualityControlUpdateView.as_view(), name='qualitycontrol-update'),
    path('qualitycontrol/<int:pk>/delete/', QualityControlDeleteView.as_view(), name='qualitycontrol-delete'),

    path('compliance/', ComplianceListView.as_view(), name='compliance-list'),
    path('compliance/<int:pk>/', ComplianceDetailView.as_view(), name='compliance-detail'),
    path('compliance/create/', ComplianceCreateView.as_view(), name='compliance-create'),
    path('compliance/<int:pk>/update/', ComplianceUpdateView.as_view(), name='compliance-update'),
    path('compliance/<int:pk>/delete/', ComplianceDeleteView.as_view(), name='compliance-delete'),
]
