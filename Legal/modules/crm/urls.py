from django.urls import path
from .views import CustomerListView, CustomerDetailView, TransactionListView, TransactionDetailView

app_name = 'crm'

urlpatterns = [
    path('customers/', CustomerListView.as_view(), name='customer-list'),
    path('customers/<int:pk>/', CustomerDetailView.as_view(), name='customer-detail'),
    path('transactions/', TransactionListView.as_view(), name='transaction-list'),
    path('transactions/<int:pk>/', TransactionDetailView.as_view(), name='transaction-detail'),
]
