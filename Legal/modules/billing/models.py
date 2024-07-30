from django.shortcuts import render, redirect
from django.views.generic import ListView, DetailView
from django.views.generic.edit import CreateView, UpdateView, DeleteView
from django.urls import reverse_lazy
from .models import Plan, Subscription, Invoice, Payment

class PlanListView(ListView):
    model = Plan
    template_name = 'billing/plan_list.html'

class PlanDetailView(DetailView):
    model = Plan
    template_name = 'billing/plan_detail.html'

class SubscriptionListView(ListView):
    model = Subscription
    template_name = 'billing/subscription_list.html'

class SubscriptionDetailView(DetailView):
    model = Subscription
    template_name = 'billing/subscription_detail.html'

class InvoiceListView(ListView):
    model = Invoice
    template_name = 'billing/invoice_list.html'

class InvoiceDetailView(DetailView):
    model = Invoice
    template_name = 'billing/invoice_detail.html'

class PaymentCreateView(CreateView):
    model = Payment
    fields = ['invoice', 'amount_paid']
    template_name = 'billing/payment_form.html'
    success_url = reverse_lazy('invoice-list')

    def form_valid(self, form):
        form.instance.invoice.paid = True
        form.instance.invoice.save()
        return super().form_valid(form)

class PaymentDetailView(DetailView):
    model = Payment
    template_name = 'billing/payment_detail.html'
