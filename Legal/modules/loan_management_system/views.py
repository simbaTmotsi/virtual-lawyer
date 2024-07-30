from django.shortcuts import render, redirect
from django.views.generic import ListView, DetailView, CreateView
from .models import Loan, Payment

class LoanListView(ListView):
    model = Loan
    template_name = 'lms/loan_list.html'
    context_object_name = 'loans'

class LoanDetailView(DetailView):
    model = Loan
    template_name = 'lms/loan_detail.html'
    context_object_name = 'loan'

class LoanCreateView(CreateView):
    model = Loan
    fields = ['customer', 'amount', 'interest_rate', 'start_date', 'end_date', 'status']
    template_name = 'lms/loan_form.html'

class PaymentCreateView(CreateView):
    model = Payment
    fields = ['loan', 'amount', 'date']
    template_name = 'lms/payment_form.html'

    def form_valid(self, form):
        loan = form.cleaned_data['loan']
        loan.amount -= form.cleaned_data['amount']
        loan.save()
        return super().form_valid(form)

    def get_success_url(self):
        return reverse_lazy('loan_detail', kwargs={'pk': self.object.loan.pk})
