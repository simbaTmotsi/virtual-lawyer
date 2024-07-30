from django.urls import path
from .views import LoanListView, LoanDetailView, RepaymentCreateView, RepaymentDetailView

app_name = 'loan_management_system'

urlpatterns = [
    path('loans/', LoanListView.as_view(), name='loan-list'),
    path('loans/<int:pk>/', LoanDetailView.as_view(), name='loan-detail'),
    path('repayments/create/', RepaymentCreateView.as_view(), name='repayment-create'),
    path('repayments/<int:pk>/', RepaymentDetailView.as_view(), name='repayment-detail'),
]
