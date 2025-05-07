from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views, mock_views

router = DefaultRouter()
router.register(r'invoices', views.InvoiceViewSet, basename='invoice')
router.register(r'time-entries', views.TimeEntryViewSet, basename='timeentry')
router.register(r'expenses', views.ExpenseViewSet, basename='expense')

urlpatterns = [
    path('', include(router.urls)),
    # Existing endpoints
    path('client-summary/', mock_views.mock_client_billing_summary, name='client-billing-summary'),
    path('time-entries/', mock_views.mock_time_entries_list, name='time-entries-list'),
    path('time-entries/<int:pk>/', mock_views.mock_time_entry_detail, name='time-entry-detail'),
    path('expenses/', mock_views.mock_expenses_list, name='expenses-list'),
    path('expenses/<int:pk>/', mock_views.mock_expense_detail, name='expense-detail'),
    path('invoices/', mock_views.mock_invoices_list, name='invoices-list'),
    path('invoices/<int:pk>/', mock_views.mock_invoice_detail, name='invoice-detail'),
    
    # New report endpoints
    path('reports/revenue/', mock_views.mock_revenue_report, name='revenue-report'),
    path('reports/hours/', mock_views.mock_hours_report, name='hours-report'),
    path('reports/clients/', mock_views.mock_clients_report, name='clients-report'),
    path('reports/aging/', mock_views.mock_aging_report, name='aging-report'),
]