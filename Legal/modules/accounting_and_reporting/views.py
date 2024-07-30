from django.shortcuts import render
from django.views.generic import ListView, CreateView, UpdateView, DeleteView
from .models import Transaction, Expense, Revenue, FinancialReport

class TransactionListView(ListView):
    model = Transaction
    template_name = 'transaction_list.html'
    context_object_name = 'transactions'

class TransactionCreateView(CreateView):
    model = Transaction
    template_name = 'transaction_form.html'
    fields = ['customer', 'amount', 'description']
    success_url = '/transactions/'

class TransactionUpdateView(UpdateView):
    model = Transaction
    template_name = 'transaction_form.html'
    fields = ['customer', 'amount', 'description']
    success_url = '/transactions/'

class TransactionDeleteView(DeleteView):
    model = Transaction
    template_name = 'transaction_confirm_delete.html'
    success_url = '/transactions/'

class ExpenseListView(ListView):
    model = Expense
    template_name = 'expense_list.html'
    context_object_name = 'expenses'

class ExpenseCreateView(CreateView):
    model = Expense
    template_name = 'expense_form.html'
    fields = ['description', 'amount']
    success_url = '/expenses/'

class ExpenseUpdateView(UpdateView):
    model = Expense
    template_name = 'expense_form.html'
    fields = ['description', 'amount']
    success_url = '/expenses/'

class ExpenseDeleteView(DeleteView):
    model = Expense
    template_name = 'expense_confirm_delete.html'
    success_url = '/expenses/'

class RevenueListView(ListView):
    model = Revenue
    template_name = 'revenue_list.html'
    context_object_name = 'revenues'

class RevenueCreateView(CreateView):
    model = Revenue
    template_name = 'revenue_form.html'
    fields = ['description', 'amount']
    success_url = '/revenues/'

class RevenueUpdateView(UpdateView):
    model = Revenue
    template_name = 'revenue_form.html'
    fields = ['description', 'amount']
    success_url = '/revenues/'

class RevenueDeleteView(DeleteView):
    model = Revenue
    template_name = 'revenue_confirm_delete.html'
    success_url = '/revenues/'

class FinancialReportListView(ListView):
    model = FinancialReport
    template_name = 'financialreport_list.html'
    context_object_name = 'financialreports'

class FinancialReportCreateView(CreateView):
    model = FinancialReport
    template_name = 'financialreport_form.html'
    fields = ['start_date', 'end_date', 'total_revenue', 'total_expenses', 'net_income']
    success_url = '/financialreports/'

class FinancialReportUpdateView(UpdateView):
    model = FinancialReport
    template_name = 'financialreport_form.html'
    fields = ['start_date', 'end_date', 'total_revenue', 'total_expenses', 'net_income']
    success_url = '/financialreports/'

class FinancialReportDeleteView(DeleteView):
    model = FinancialReport
    template_name = 'financialreport_confirm_delete.html'
    success_url = '/financialreports/'
