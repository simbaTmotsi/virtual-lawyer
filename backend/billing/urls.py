from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'invoices', views.InvoiceViewSet, basename='invoice')
router.register(r'time-entries', views.TimeEntryViewSet, basename='timeentry')
router.register(r'expenses', views.ExpenseViewSet, basename='expense')

urlpatterns = [
    path('', include(router.urls)),
    # Add direct access to client-summary endpoint
    path('client-summary/', views.TimeEntryViewSet.as_view({'get': 'client_billing_summary'}), name='client-summary'),
]