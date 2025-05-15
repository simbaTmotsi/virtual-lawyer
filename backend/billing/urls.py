from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views, mock_views

router = DefaultRouter()
router.register(r'invoices', views.InvoiceViewSet, basename='invoice')
router.register(r'time-entries', views.TimeEntryViewSet, basename='timeentry')
router.register(r'expenses', views.ExpenseViewSet, basename='expense')

urlpatterns = [
    # Use real database views
    path('', include(router.urls)),
    
    # Fallback to mock views for any endpoints not yet implemented in real views
    path('mock/client-summary/', mock_views.mock_client_billing_summary, name='mock-client-billing-summary'),
    path('mock/time-entries/', mock_views.mock_time_entries_list, name='mock-time-entries-list'),
    path('mock/time-entries/<int:pk>/', mock_views.mock_time_entry_detail, name='mock-time-entry-detail'),
    path('mock/expenses/', mock_views.mock_expenses_list, name='mock-expenses-list'),
    path('mock/expenses/<int:pk>/', mock_views.mock_expense_detail, name='mock-expense-detail'),
    path('mock/invoices/', mock_views.mock_invoices_list, name='mock-invoices-list'),
    path('mock/invoices/<int:pk>/', mock_views.mock_invoice_detail, name='mock-invoice-detail'),
    
    # Report endpoints (using mock views for now)
    path('reports/revenue/', mock_views.mock_revenue_report, name='revenue-report'),
    path('reports/hours/', mock_views.mock_hours_report, name='hours-report'),
    path('reports/clients/', mock_views.mock_clients_report, name='clients-report'),
    path('reports/aging/', mock_views.mock_aging_report, name='aging-report'),
]