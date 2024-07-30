from django.urls import path
from .views import (
    ReportListView, ReportDetailView, ReportCreateView, ReportUpdateView, ReportDeleteView,
    AccountingListView, AccountingDetailView, AccountingCreateView, AccountingUpdateView, AccountingDeleteView,
)

app_name = 'accounting_and_reporting'

urlpatterns = [
    path('reports/', ReportListView.as_view(), name='report-list'),
    path('reports/<int:pk>/', ReportDetailView.as_view(), name='report-detail'),
    path('reports/create/', ReportCreateView.as_view(), name='report-create'),
    path('reports/<int:pk>/update/', ReportUpdateView.as_view(), name='report-update'),
    path('reports/<int:pk>/delete/', ReportDeleteView.as_view(), name='report-delete'),

    path('accounting/', AccountingListView.as_view(), name='accounting-list'),
    path('accounting/<int:pk>/', AccountingDetailView.as_view(), name='accounting-detail'),
    path('accounting/create/', AccountingCreateView.as_view(), name='accounting-create'),
    path('accounting/<int:pk>/update/', AccountingUpdateView.as_view(), name='accounting-update'),
    path('accounting/<int:pk>/delete/', AccountingDeleteView.as_view(), name='accounting-delete'),
]
