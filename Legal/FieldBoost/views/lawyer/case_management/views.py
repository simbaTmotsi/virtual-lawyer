from django.views.generic import TemplateView, CreateView, ListView
from django.contrib.auth.mixins import LoginRequiredMixin
from django.shortcuts import redirect, get_object_or_404
from django.contrib import messages  
from django.views.generic import DetailView
from FieldBoost.models import Case, Document, CustomUser
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
    
class CaseCollaborationView(LoginRequiredMixin, TemplateView):
    template_name = 'modules/lawyer/case_management/case_collaboration.html'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        case = get_object_or_404(Case, pk=self.kwargs['pk'])
        documents = case.documents.all()
        users = CustomUser.objects.all()
        
        context['case'] = case
        context['documents'] = documents
        context['users'] = users
        return context

    def post(self, request, *args, **kwargs):
        case = get_object_or_404(Case, pk=self.kwargs['pk'])
        documents = case.documents.all()
        
        for document in documents:
            for user in CustomUser.objects.all():
                view_permission = request.POST.get(f'view_{document.id}_{user.id}')
                edit_permission = request.POST.get(f'edit_{document.id}_{user.id}')
                
                permission, created = DocumentPermission.objects.get_or_create(document=document, user=user)
                permission.can_view = bool(view_permission)
                permission.can_edit = bool(edit_permission)
                permission.save()

        messages.success(request, "Permissions updated successfully.")
        return redirect('case_collaboration', pk=case.id)

def archive_case_view(request, case_id):
    case = get_object_or_404(Case, id=case_id)
    case.is_archived = True
    case.save()
    messages.success(request, f"Case '{case.title}' has been archived.")
    return redirect('case_list')  # Redirect to the list of active cases

def restore_case_view(request, case_id):
    case = get_object_or_404(Case, id=case_id)
    case.is_archived = False
    case.save()
    messages.success(request, f"Case '{case.title}' has been restored.")
    return redirect('archived_cases')  # Redirect to the list of archived cases

class ArchivedCaseListView(LoginRequiredMixin, ListView):
    model = Case
    template_name = "modules/lawyer/case_management/archived_cases_list.html"
    context_object_name = 'archived_cases'
    login_url = reverse_lazy('login_home')

    def get_queryset(self):
        return Case.objects.filter(is_archived=True)
