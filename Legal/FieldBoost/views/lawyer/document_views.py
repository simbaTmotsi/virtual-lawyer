from django.views.generic.edit import CreateView
from django import forms
from django.utils.decorators import method_decorator
from FieldBoost.decorators import lawyer_required
from django.shortcuts import redirect
from django.contrib import messages  
from crispy_forms.helper import FormHelper
from crispy_forms.layout import Submit
from django.views.generic import ListView, DetailView, DeleteView
from django.views.generic.edit import UpdateView
from django.views.generic import TemplateView
from django.urls import reverse_lazy
import mimetypes
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.messages.views import SuccessMessageMixin
from FieldBoost.models import Document, Folder  # Correct the import path


# Form for uploading a document
class DocumentForm(forms.ModelForm):
    class Meta:
        model = Document
        fields = ['title', 'file', 'assigned_to', 'tags']

    def __init__(self, *args, **kwargs):
        super(DocumentForm, self).__init__(*args, **kwargs)
        self.helper = FormHelper()
        self.helper.form_method = 'post'
        self.helper.add_input(Submit('submit', 'Upload Document'))

# Class-based view for uploading a document
@method_decorator(lawyer_required, name='dispatch')
class DocumentUploadView(CreateView):
    model = Document
    form_class = DocumentForm
    template_name = 'modules/lawyer/document_management/document_form.html'
    success_url = reverse_lazy('document_list')  # Redirect after successful document upload

    def form_valid(self, form):
        # Set the user who uploaded the document
        form.instance.created_by = self.request.user
        return super().form_valid(form)

@method_decorator(lawyer_required, name='dispatch')
class DocumentListView(LoginRequiredMixin, ListView):
    model = Document
    template_name = "modules/lawyer/document_management/document_creation/table/data-table/datatable-basic/datatable-basic-init.html"
    context_object_name = 'documents'
    login_url = reverse_lazy('login_home')

@method_decorator(lawyer_required, name='dispatch')
class DocumentDetailView(LoginRequiredMixin, DetailView):
    model = Document
    template_name = "modules/lawyer/document_management/document_detail.html"
    login_url = reverse_lazy('login_home')
    context_object_name = 'document'

@method_decorator(lawyer_required, name='dispatch')
class DocumentUpdateView(LoginRequiredMixin, SuccessMessageMixin, UpdateView):
    model = Document
    fields = ['title', 'content', 'file']
    template_name = "modules/lawyer/document_management/document_form.html"
    success_message = "Document updated successfully."
    success_url = reverse_lazy('document_list')
    login_url = reverse_lazy('login_home')

@method_decorator(lawyer_required, name='dispatch')
class DocumentDeleteView(LoginRequiredMixin, SuccessMessageMixin, DeleteView):
    model = Document
    template_name = "modules/lawyer/document_management/document_confirm_delete.html"
    success_url = reverse_lazy('document_list')
    success_message = "Document was deleted successfully."

    def delete(self, request, *args, **kwargs):
        response = super().delete(request, *args, **kwargs)
        messages.success(self.request, self.success_message)
        return response

@method_decorator(lawyer_required, name='dispatch')
class DocumentUpdateView(LoginRequiredMixin, SuccessMessageMixin, UpdateView):
    model = Document
    fields = ['title', 'content', 'file']
    template_name = "modules/lawyer/document_management/document_form.html"
    success_message = "Document updated successfully."
    success_url = reverse_lazy('document_list')
    login_url = reverse_lazy('login_home')

@method_decorator(lawyer_required, name='dispatch')
class DocumentDeleteView(LoginRequiredMixin, SuccessMessageMixin, DeleteView):
    model = Document
    template_name = "modules/lawyer/document_management/document_confirm_delete.html"
    success_message = "Document deleted successfully."
    success_url = reverse_lazy('document_list')
    login_url = reverse_lazy('login_home')

@method_decorator(lawyer_required, name='dispatch')
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

@method_decorator(lawyer_required, name='dispatch')
class DocumentShareListView(LoginRequiredMixin, ListView):
    model = Document
    template_name = "modules/lawyer/document_management/document_sharing/table/data-table/datatable-basic/datatable-basic-init.html"
    context_object_name = 'documents'
    login_url = reverse_lazy('login_home')

@method_decorator(lawyer_required, name='dispatch')
class DocumentShareView(LoginRequiredMixin, UpdateView):
    model = Document
    fields = ['recipient', 'recipient_email']
    template_name = "modules/lawyer/document_management/document_sharing/document_share.html"
    login_url = reverse_lazy('login_home')
    success_url = reverse_lazy('document_list')

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        
        # Add crispy form helper for better rendering of the form
        helper = FormHelper()
        helper.form_method = 'post'
        helper.add_input(Submit('submit', 'Share Document'))
        context['helper'] = helper

        return context

    def form_valid(self, form):
        # Send email to the recipient with document details
        document = form.save(commit=False)
        recipient_email = form.cleaned_data['recipient_email']
        sender = self.request.user  # The current logged-in user
        message_content = self.request.POST.get('message', '')  # Get the message from the form

        # Create an email with an attachment
        email_body = (
            f"Dear {form.cleaned_data['recipient']},\n\n"
            f"{sender.first_name} {sender.surname} ({sender.email}) has shared a document titled: '{document.title}' with you.\n\n"
            f"Message from {sender.first_name}: {message_content}\n\n"
            f"Please find the document attached.\n\n"
            "Best regards,\n"
            f"{sender.first_name} {sender.surname}\n\n"
            f"- Using the Easy Law Platform"
        )

        email = EmailMessage(
            subject=f"Shared Document: {document.title}",
            body=email_body,
            from_email='notifications@solution42.xyz',
            to=[recipient_email],
        )

        # Attach the document file with the correct MIME type
        if document.file:
            content_type, encoding = mimetypes.guess_type(document.file.path)
            content_type = content_type or 'application/octet-stream'  # Default if content type cannot be guessed
            email.attach(document.file.name, document.file.read(), content_type)

        try:
            email.send()
            messages.success(self.request, 'Document shared successfully.')
        except Exception as e:
            messages.error(self.request, f"Failed to send email: {str(e)}")

        document.save()
        return redirect("document_list")

@method_decorator(lawyer_required, name='dispatch')
class DocumentTable(LoginRequiredMixin, TemplateView):
    template_name = "modules/lawyer/document_management/document_sharing/table/data-table/datatable-basic/datatable-basic-init.html"
    login_url = reverse_lazy('login_home')
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        #context['breadcrumb'] = {"parent":"Dashboard","child":"Default"}
        return context
    
#---------------------------------------------------------------------------------------
