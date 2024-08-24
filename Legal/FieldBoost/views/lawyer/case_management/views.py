from django.views.generic import TemplateView, CreateView, ListView
from django.contrib.auth.mixins import LoginRequiredMixin
from django.shortcuts import render, get_object_or_404
from django.views.generic import DetailView
from FieldBoost.models import Case
from django.urls import reverse_lazy
from crispy_forms.helper import FormHelper
from crispy_forms.layout import Submit

class CaseOverviewView(LoginRequiredMixin, TemplateView):
    template_name = "modules/lawyer/case_management/case_overview.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        ongoing_cases = Case.objects.filter(status='ongoing').order_by('-created_at')
        closed_cases = Case.objects.filter(status='closed').order_by('-created_at')
        context['ongoing_cases'] = ongoing_cases
        context['closed_cases'] = closed_cases
        return context

class CaseListView(LoginRequiredMixin, ListView):
    model = Case
    template_name = "modules/lawyer/case_management/case_list.html"
    context_object_name = 'cases'
   
class CaseCreateView(LoginRequiredMixin, CreateView):
    model = Case
    template_name = "modules/lawyer/case_management/case_form.html"
    fields = ['title', 'description', 'assigned_to', 'client', 'status']
    success_url = reverse_lazy('document_list')  # Change this to an existing view name

class CaseDetailView(LoginRequiredMixin, DetailView):
    model = Case
    template_name = 'modules/lawyer/case_management/case_detail.html'
    context_object_name = 'case'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        # Add any additional context data if needed
        return context