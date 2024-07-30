from django.shortcuts import render
from django.views.generic import ListView, DetailView, CreateView, UpdateView, DeleteView
from .models import Customer, Transaction, Interaction, Lead

class CustomerListView(ListView):
    model = Customer
    template_name = 'customer_list.html'
    context_object_name = 'customers'

class CustomerDetailView(DetailView):
    model = Customer
    template_name = 'customer_detail.html'
    context_object_name = 'customer'

class CustomerCreateView(CreateView):
    model = Customer
    template_name = 'customer_create.html'
    fields = ['name', 'email', 'phone_number', 'address']
    success_url = '/customers/'

class CustomerUpdateView(UpdateView):
    model = Customer
    template_name = 'customer_update.html'
    fields = ['name', 'email', 'phone_number', 'address']
    success_url = '/customers/'

class CustomerDeleteView(DeleteView):
    model = Customer
    template_name = 'customer_delete.html'
    success_url = '/customers/'

class TransactionCreateView(CreateView):
    model = Transaction
    template_name = 'transaction_create.html'
    fields = ['customer', 'amount', 'description']
    success_url = '/transactions/'

class InteractionCreateView(CreateView):
    model = Interaction
    template_name = 'interaction_create.html'
    fields = ['customer', 'notes']
    success_url = '/interactions/'

class LeadCreateView(CreateView):
    model = Lead
    template_name = 'lead_create.html'
    fields = ['name', 'email', 'phone_number', 'message']
    success_url = '/leads/'
