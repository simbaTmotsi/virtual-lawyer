from django.urls import path
from .views import PlanListView, PlanDetailView, SubscriptionListView, SubscriptionDetailView, InvoiceListView, InvoiceDetailView, PaymentCreateView, PaymentDetailView

app_name = 'billing'

urlpatterns = [
    path('plans/', PlanListView.as_view(), name='plan-list'),
    path('plans/<int:pk>/', PlanDetailView.as_view(), name='plan-detail'),
    path('subscriptions/', SubscriptionListView.as_view(), name='subscription-list'),
    path('subscriptions/<int:pk>/', SubscriptionDetailView.as_view(), name='subscription-detail'),
    path('invoices/', InvoiceListView.as_view(), name='invoice-list'),
    path('invoices/<int:pk>/', InvoiceDetailView.as_view(), name='invoice-detail'),
    path('payments/create/', PaymentCreateView.as_view(), name='payment-create'),
    path('payments/<int:pk>/', PaymentDetailView.as_view(), name='payment-detail'),
]
