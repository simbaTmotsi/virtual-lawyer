from django.shortcuts import render, redirect
from django.contrib import messages  
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django.contrib.auth import login, logout, authenticate
from django.contrib.auth.models import User, auth

from django import forms
from crispy_forms.helper import FormHelper
from crispy_forms.layout import Submit

from django.views.generic import ListView, DetailView, UpdateView, DeleteView
from django.views.generic.edit import CreateView, UpdateView
#from django.views.generic.detail import DetailView
#from django.views.generic.list import ListView
from django.views.generic import TemplateView
from django.contrib import messages
from django.urls import reverse_lazy

from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.messages.views import SuccessMessageMixin
from django.urls import reverse_lazy

from crispy_forms.helper import FormHelper
from crispy_forms.layout import Submit

from FieldBoost.models import Document  # Correct the import path
from django import forms

class DocumentForm(forms.ModelForm):
    class Meta:
        model = Document
        fields = ['title', 'content', 'file']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.helper = FormHelper()
        self.helper.form_method = 'post'
        self.helper.template_pack = 'bootstrap5'  # Set the template pack to bootstrap5
        self.helper.add_input(Submit('submit', 'Save Document'))

#--------------- Document Management

class DocumentCreation(LoginRequiredMixin, CreateView):
    template_name = "modules/lawyer/document_management/document_creation/create/create_document.html"
    form_class = DocumentForm
    success_url = reverse_lazy('document_list')
    login_url = reverse_lazy('login_home')

    def form_valid(self, form):
        form.instance.created_by = self.request.user
        messages.success(self.request, "Document created successfully.")
        return super().form_valid(form)

class DocumentListView(LoginRequiredMixin, ListView):
    model = Document
    template_name = "modules/lawyer/document_management/document_creation/table/table/data-table/datatable-basic/datatable-basic-init.html"
    context_object_name = 'documents'
    login_url = reverse_lazy('login_home')

class DocumentDetailView(LoginRequiredMixin, DetailView):
    model = Document
    template_name = "modules/lawyer/document_management/document_detail.html"
    context_object_name = 'document'
    login_url = reverse_lazy('login_home')

class DocumentUpdateView(LoginRequiredMixin, SuccessMessageMixin, UpdateView):
    model = Document
    fields = ['title', 'content', 'file']
    template_name = "modules/lawyer/document_management/document_form.html"
    success_message = "Document updated successfully."
    success_url = reverse_lazy('document_list')
    login_url = reverse_lazy('login_home')

class DocumentDeleteView(LoginRequiredMixin, SuccessMessageMixin, DeleteView):
    model = Document
    template_name = "modules/lawyer/document_management/document_confirm_delete.html"
    success_url = reverse_lazy('document_list')
    success_message = "Document was deleted successfully."

    def delete(self, request, *args, **kwargs):
        response = super().delete(request, *args, **kwargs)
        messages.success(self.request, self.success_message)
        return response

class DocumentUpdateView(LoginRequiredMixin, SuccessMessageMixin, UpdateView):
    model = Document
    fields = ['title', 'content', 'file']
    template_name = "modules/lawyer/document_management/document_form.html"
    success_message = "Document updated successfully."
    success_url = reverse_lazy('document_list')
    login_url = reverse_lazy('login_home')

class DocumentDeleteView(LoginRequiredMixin, SuccessMessageMixin, DeleteView):
    model = Document
    template_name = "modules/lawyer/document_management/document_confirm_delete.html"
    success_message = "Document deleted successfully."
    success_url = reverse_lazy('document_list')
    login_url = reverse_lazy('login_home')

class DocumentStorage(LoginRequiredMixin, TemplateView):
    template_name = "modules/lawyer/document_management/document_storage/file-manager.html"
    login_url = reverse_lazy('login_home')
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        #context['breadcrumb'] = {"parent":"Dashboard","child":"Default"}
        return context
    
class DocumentTable(LoginRequiredMixin, TemplateView):
    template_name = "modules/lawyer/document_management/document_sharing/table/data-table/datatable-basic/datatable-basic-init.html"
    login_url = reverse_lazy('login_home')
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        #context['breadcrumb'] = {"parent":"Dashboard","child":"Default"}
        return context
    
class DocumentCollaboration(LoginRequiredMixin, TemplateView):
    template_name = "modules/lawyer/document_management/document_sharing/table/data-table/datatable-basic/datatable-basic-init.html"
    login_url = reverse_lazy('login_home')
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        #context['breadcrumb'] = {"parent":"Dashboard","child":"Default"}
        return context

class DocumentReview(LoginRequiredMixin, TemplateView):
    template_name = "modules/lawyer/document_management/document_sharing/table/data-table/datatable-basic/datatable-basic-init.html"
    login_url = reverse_lazy('login_home')
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        #context['breadcrumb'] = {"parent":"Dashboard","child":"Default"}
        return context
    
class DocumentSearch(LoginRequiredMixin, TemplateView):
    template_name = "modules/lawyer/document_management/document_sharing/table/data-table/datatable-basic/datatable-basic-init.html"
    login_url = reverse_lazy('login_home')
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        #context['breadcrumb'] = {"parent":"Dashboard","child":"Default"}
        return context 

class DocumentAutomation(LoginRequiredMixin, TemplateView):
    template_name = "modules/lawyer/document_management/document_sharing/table/data-table/datatable-basic/datatable-basic-init.html"
    login_url = reverse_lazy('login_home')
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        #context['breadcrumb'] = {"parent":"Dashboard","child":"Default"}
        return context  

class DocumentImportExport(LoginRequiredMixin, TemplateView):
    template_name = "modules/lawyer/document_management/document_sharing/table/data-table/datatable-basic/datatable-basic-init.html"
    login_url = reverse_lazy('login_home')
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        #context['breadcrumb'] = {"parent":"Dashboard","child":"Default"}
        return context   
#---------------------------------------------------------------------------------------
