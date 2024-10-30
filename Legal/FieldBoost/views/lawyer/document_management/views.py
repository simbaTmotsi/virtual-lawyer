from django.shortcuts import redirect, get_object_or_404
from django.contrib import messages  
from django.core.mail import send_mail
from django import forms
from crispy_forms.helper import FormHelper
from crispy_forms.layout import Submit

from django.views.generic import ListView, DetailView, DeleteView
from django.views.generic.edit import CreateView, UpdateView
from django.views.generic import TemplateView

import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.application import MIMEApplication
from django.core.files import File

from django.urls import reverse_lazy

from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.messages.views import SuccessMessageMixin

from FieldBoost.models import Document, Folder  # Correct the import path


from django.shortcuts import get_object_or_404
from django.views.generic.edit import FormView




class DocumentListView(LoginRequiredMixin, ListView):
    model = Document
    template_name = "modules/lawyer/document_management/document_creation/table/data-table/datatable-basic/datatable-basic-init.html"
    context_object_name = 'documents'
    login_url = reverse_lazy('login_home')

class DocumentDetailView(LoginRequiredMixin, DetailView):
    model = Document
    template_name = "modules/lawyer/document_management/document_detail.html"
    login_url = reverse_lazy('login_home')
    context_object_name = 'document'


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
        recent_documents = Document.objects.order_by('-updated_at')[:5]  
        
        # Fetch all folders
        folders = Folder.objects.all()
        
        # Fetch all documents
        all_documents = Document.objects.all()

        # Calculate storage used by the current user
        user = self.request.user
        total_used = user.calculate_storage_used()  # This method calculates the used storage 
        storage_quota = user.storage_quota
        used_percentage = (total_used / storage_quota) * 100 if storage_quota > 0 else 0

        # Convert sizes to GB for display
        total_used_gb = total_used / (1024 ** 3)  # Convert bytes to GB
        storage_quota_gb = storage_quota / (1024 ** 3)  # Convert bytes to GB

        context['recent_documents'] = recent_documents
        context['folders'] = folders
        context['all_documents'] = all_documents
        context['total_used_gb'] = total_used_gb
        context['storage_quota_gb'] = storage_quota_gb
        context['used_percentage'] = used_percentage
        return context


class DocumentShareListView(LoginRequiredMixin, ListView):
    model = Document
    template_name = "modules/lawyer/document_management/document_sharing/table/data-table/datatable-basic/datatable-basic-init.html"
    context_object_name = 'documents'
    login_url = reverse_lazy('login_home')


class DocumentTable(LoginRequiredMixin, TemplateView):
    template_name = "modules/lawyer/document_management/document_sharing/table/data-table/datatable-basic/datatable-basic-init.html"
    login_url = reverse_lazy('login_home')
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        #context['breadcrumb'] = {"parent":"Dashboard","child":"Default"}
        return context
    
class DocumentReview(LoginRequiredMixin, ListView):
    model = Document
    template_name = "modules/lawyer/document_management/document_sharing/table/data-table/datatable-basic/datatable-basic-init.html"
    login_url = reverse_lazy('login_home')
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        #context['breadcrumb'] = {"parent":"Dashboard","child":"Default"}
        return context
    
class DocumentSearch(LoginRequiredMixin, ListView):
    template_name = "modules/lawyer/document_management/document_sharing/table/data-table/datatable-basic/datatable-basic-init.html"
    login_url = reverse_lazy('login_home')
    model = Document
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        #context['breadcrumb'] = {"parent":"Dashboard","child":"Default"}
        return context 

#---------------------------------------------------------------------------------------
