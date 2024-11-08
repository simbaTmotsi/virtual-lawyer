# views.py
import json
import os
from django.core.files.storage import default_storage
import google.generativeai as genai
from django.shortcuts import get_object_or_404, render, redirect
from django.views.generic.edit import CreateView, UpdateView, DeleteView, FormView
from django.urls import reverse_lazy
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib import messages
import requests
from FieldBoost.models import CustomUser, ClientCommunication, Appointment, Document, Case, Evidence, ChatMessage
from django import forms
from django.views.generic import ListView, DetailView, TemplateView
from django.conf import settings
from django.http import JsonResponse
from django.core.mail import send_mail
from django.views import View
import markdown



# Client Management Module
class ClientOnboardingView(LoginRequiredMixin, CreateView):
    model = CustomUser
    fields = ['first_name', 'surname', 'email', 'phone_number', 'company_name', 'address']
    template_name = "modules/lawyer/client_management/client_onboarding.html"
    
    success_url = reverse_lazy('lawyer_client_list')  # Redirect to the client list after successful onboarding
    login_url = reverse_lazy('login_home')

    def form_valid(self, form):
        # Set the role explicitly to 'Client' and activate the account
        form.instance.role = CustomUser.UserRole.CLIENT
        form.instance.is_active = True
        messages.success(self.request, 'Client onboarded successfully.')
        return super().form_valid(form)

class LawyerClientListView(LoginRequiredMixin, ListView):
    model = CustomUser
    #template_name = "modules/lawyer/client_management/client_list.html"
    template_name = "modules/lawyer/client_management/clients/table/data-table/datatable-basic/datatable-basic-init.html"
    context_object_name = 'clients'

    def get_queryset(self):
        # Filter clients only
        return CustomUser.objects.filter(role=CustomUser.UserRole.CLIENT)
    
class ClientDetailView(LoginRequiredMixin, DetailView):
    model = CustomUser
    template_name = "modules/lawyer/client_management/client_detail.html"
    context_object_name = 'client'

class ClientEditView(LoginRequiredMixin, UpdateView):
    model = CustomUser
    fields = ['first_name', 'surname', 'email', 'phone_number', 'company_name', 'address']
    template_name = "modules/lawyer/client_management/client_edit.html"
    success_url = reverse_lazy('lawyer_client_list')

    def form_valid(self, form):
        messages.success(self.request, 'Client information updated successfully.')
        return super().form_valid(form)

class ClientDeleteView(LoginRequiredMixin, DeleteView):
    model = CustomUser
    template_name = "modules/lawyer/client_management/client_confirm_delete.html"
    success_url = reverse_lazy('lawyer_client_list')

    def delete(self, request, *args, **kwargs):
        messages.success(self.request, 'Client deleted successfully.')
        return super().delete(request, *args, **kwargs)

class ClientCommunicationForm(forms.ModelForm):
    class Meta:
        model = ClientCommunication
        fields = ['recipient', 'subject', 'message']
        widgets = {
            'message': forms.Textarea(attrs={'rows': 4}),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Limit recipients to clients only
        self.fields['recipient'].queryset = CustomUser.objects.filter(role=CustomUser.UserRole.CLIENT)
        # Set the display format for the recipient dropdown to include both name and email
        self.fields['recipient'].label_from_instance = lambda obj: f"{obj.first_name} {obj.surname} ({obj.email})"

class ClientCommunicationView(LoginRequiredMixin, FormView):
    template_name = "modules/lawyer/client_management/client_communication.html"
    form_class = ClientCommunicationForm
    success_url = reverse_lazy('lawyer_client_list')

    def form_valid(self, form):
        communication = form.save(commit=False)
        communication.sender = self.request.user  # Set the sender to the logged-in lawyer
        communication.save()

        # Send email notification
        self.send_communication_email(communication)
        
        messages.success(self.request, 'Message sent successfully.')
        return super().form_valid(form)

    def send_communication_email(self, communication):
        subject = communication.subject
        message = (
            f"Hello {communication.recipient.first_name},\n\n"
            f"You have received a new message:\n\n"
            f"Subject: {communication.subject}\n\n"
            f"Message:\n{communication.message}\n\n"
            f"---\nSent by {communication.sender.first_name} {communication.sender.surname} "
            f"({communication.sender.email}) using the Easy Law platform"
        )
        recipient_email = communication.recipient.email
        send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [recipient_email], fail_silently=False)

class ClientMessageListView(LoginRequiredMixin, ListView):
    model = ClientCommunication
    template_name = "modules/lawyer/client_management/client_messages/table/data-table/datatable-basic/datatable-basic-init.html"
    context_object_name = 'messages'

    def get_queryset(self):
        # Filter messages where the recipient is the logged-in client
        return ClientCommunication.objects.filter(sender=self.request.user)

# Appointments and meetings  
class AppointmentForm(forms.ModelForm):
    class Meta:
        model = Appointment
        fields = ['title', 'client', 'date', 'location', 'description', 'status']
        widgets = {
            'date': forms.DateTimeInput(attrs={'type': 'datetime-local'}),
            'description': forms.Textarea(attrs={'rows': 4}),
            'status': forms.Select(),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Limit clients to users with CLIENT role
        self.fields['client'].queryset = CustomUser.objects.filter(role=CustomUser.UserRole.CLIENT)
        # Set the display format for the client dropdown to include both name and email
        self.fields['client'].label_from_instance = lambda obj: f"{obj.first_name} {obj.surname} ({obj.email})"

def send_appointment_email(appointment, action):
    subject = f"Appointment {action}: {appointment.title}"
    message = (
        f"Hello {appointment.client.first_name},\n\n"
        f"This is to inform you that your appointment titled '{appointment.title}' "
        f"has been {action}.\n\n"
        f"Date: {appointment.date}\n"
        f"Location: {appointment.location}\n"
        f"Status: {appointment.status}\n\n"
        f"Scheduled by: {appointment.lawyer.first_name} {appointment.lawyer.surname} ({appointment.lawyer.email})\n\n"
        f"---\nSent using the Easy Law platform"
    )
    recipient_email = appointment.client.email
    send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [recipient_email], fail_silently=False)

class AppointmentCreateView(LoginRequiredMixin, CreateView):
    model = Appointment
    form_class = AppointmentForm
    template_name = "modules/lawyer/appointments/appointment_create.html"
    success_url = reverse_lazy('appointment_list')

    def form_valid(self, form):
        appointment = form.save(commit=False)
        appointment.lawyer = self.request.user  # Set the lawyer to the logged-in user
        appointment.save()
        
        # Send email notification to client
        send_appointment_email(appointment, action="created")
        
        messages.success(self.request, 'Appointment scheduled successfully.')
        return super().form_valid(form)

class AppointmentListView(LoginRequiredMixin, ListView):
    model = Appointment
    template_name = "modules/lawyer/appointments/appointments/table/data-table/datatable-basic/datatable-basic-init.html"
    context_object_name = 'appointments'

    def get_queryset(self):
        # Filter appointments by the logged-in lawyer
        return Appointment.objects.filter(lawyer=self.request.user)

class AppointmentEditView(LoginRequiredMixin, UpdateView):
    model = Appointment
    form_class = AppointmentForm
    template_name = "modules/lawyer/appointments/appointment_edit.html"
    success_url = reverse_lazy('appointment_list')

    def form_valid(self, form):
        response = super().form_valid(form)
        
        # Send email notification to client
        send_appointment_email(self.object, action="updated")
        
        messages.success(self.request, 'Appointment updated successfully.')
        return response

class AppointmentDeleteView(LoginRequiredMixin, DeleteView):
    model = Appointment
    template_name = "modules/lawyer/appointments/appointment_confirm_delete.html"
    success_url = reverse_lazy('appointment_list')

    def delete(self, request, *args, **kwargs):
        messages.success(self.request, 'Appointment deleted successfully.')
        return super().delete(request, *args, **kwargs)

# Document Management
class DocumentUploadView(LoginRequiredMixin, CreateView):
    model = Document
    fields = ['title', 'file', 'client']
    template_name = "modules/lawyer/client_documents/document_upload.html"
    success_url = reverse_lazy('client_document_list')

    def form_valid(self, form):
        form.instance.created_by = self.request.user
        messages.success(self.request, 'Document uploaded successfully.')
        return super().form_valid(form)

    def get_form(self, *args, **kwargs):
        form = super().get_form(*args, **kwargs)
        form.fields['client'].queryset = CustomUser.objects.filter(role=CustomUser.UserRole.CLIENT)
        form.fields['client'].label_from_instance = lambda obj: f"{obj.first_name} {obj.surname} ({obj.email})"
        return form

class DocumentListView(LoginRequiredMixin, ListView):
    model = Document
    template_name = "modules/lawyer/client_documents/client_documents/table/data-table/datatable-basic/datatable-basic-init.html"
    context_object_name = 'documents'

    def get_queryset(self):
        return Document.objects.filter(created_by=self.request.user)
    
class DocumentUpdateView(LoginRequiredMixin, UpdateView):
    model = Document
    fields = ['title', 'file']
    template_name = "modules/lawyer/client_documents/document_edit.html"
    success_url = reverse_lazy('client_document_list')

    def form_valid(self, form):
        messages.success(self.request, 'Document updated successfully.')
        return super().form_valid(form)

class DocumentDeleteView(LoginRequiredMixin, DeleteView):
    model = Document
    template_name = "modules/lawyer/client_documents/document_confirm_delete.html"
    success_url = reverse_lazy('client_document_list')

    def delete(self, request, *args, **kwargs):
        messages.success(self.request, 'Document deleted successfully.')
        return super().delete(request, *args, **kwargs)

# Case Management
class CaseCreateView(LoginRequiredMixin, CreateView):
    model = Case
    fields = ['title', 'description', 'client', 'assigned_to', 'status', 'risk_score']
    template_name = "modules/lawyer/case_management/case_create.html"
    success_url = reverse_lazy('case_list')

    def form_valid(self, form):
        # Set the `created_by` to the currently logged-in user
        form.instance.created_by = self.request.user
        messages.success(self.request, 'Case created successfully.')
        return super().form_valid(form)

    def get_form(self, *args, **kwargs):
        form = super().get_form(*args, **kwargs)
        
        # Limit client selection to users with CLIENT role
        form.fields['client'].queryset = CustomUser.objects.filter(role=CustomUser.UserRole.CLIENT)
        # Set the display format for client dropdown to include name and email
        form.fields['client'].label_from_instance = lambda obj: f"{obj.first_name} {obj.surname} ({obj.email})"

        # Limit assigned_to selection to users with LAWYER or PARALEGAL role
        form.fields['assigned_to'].queryset = CustomUser.objects.filter(role__in=[CustomUser.UserRole.LAWYER, CustomUser.UserRole.PARALEGAL])
        # Set the display format for assigned_to dropdown to include name and email
        form.fields['assigned_to'].label_from_instance = lambda obj: f"{obj.first_name} {obj.surname} ({obj.email})"

        return form

class CaseListView(LoginRequiredMixin, ListView):
    model = Case
    template_name = "modules/lawyer/case_management/case_management/table/data-table/datatable-basic/datatable-basic-init.html"
    #template_name = "modules/lawyer/case_management/case_list.html"
    context_object_name = 'cases'

    def get_queryset(self):
        return Case.objects.filter(assigned_to=self.request.user) | Case.objects.filter(created_by=self.request.user)

    
class CaseDetailView(LoginRequiredMixin, DetailView):
    model = Case
    template_name = "modules/lawyer/case_management/case_detail.html"
    context_object_name = 'case'

class CaseUpdateView(LoginRequiredMixin, UpdateView):
    model = Case
    fields = ['title', 'description', 'assigned_to', 'status', 'risk_score']
    template_name = "modules/lawyer/case_management/case_edit.html"
    success_url = reverse_lazy('case_list')

    def form_valid(self, form):
        messages.success(self.request, 'Case updated successfully.')
        return super().form_valid(form)

class CaseDeleteView(LoginRequiredMixin, DeleteView):
    model = Case
    template_name = "modules/lawyer/case_management/case_confirm_delete.html"
    success_url = reverse_lazy('case_list')

    def delete(self, request, *args, **kwargs):
        messages.success(self.request, 'Case deleted successfully.')
        return super().delete(request, *args, **kwargs)

# Evidence
class EvidenceUploadView(LoginRequiredMixin, CreateView):
    model = Evidence
    fields = ['title', 'description', 'file']
    template_name = "modules/lawyer/evidence_management/evidence_upload.html"
    success_url = reverse_lazy('case_list')  # Redirect to the case list after successful upload

    def form_valid(self, form):
        # Link the evidence to the correct case and set the created_by field
        case = self.get_case()
        form.instance.case = case
        form.instance.created_by = self.request.user
        messages.success(self.request, 'Evidence uploaded successfully.')
        return super().form_valid(form)

    def get_case(self):
        # Retrieve the case object based on the case_id passed in the URL
        case_id = self.kwargs.get('case_id')
        return Case.objects.get(pk=case_id)
   
# View for uploading evidence related to a specific case
class EvidenceCreateView(LoginRequiredMixin, CreateView):
    model = Evidence
    fields = ['title', 'description', 'file', 'case']
    template_name = "modules/lawyer/evidence_management/evidence_upload.html"
    login_url = reverse_lazy('login_home')

    def form_valid(self, form):
        form.instance.created_by = self.request.user
        form.instance.case_id = self.kwargs['case_id']
        messages.success(self.request, 'Evidence uploaded successfully.')
        return super().form_valid(form)

    def get_success_url(self):
        return reverse_lazy('cases_with_evidence')
    
class EvidenceListView(LoginRequiredMixin, ListView):
    model = Evidence
    #template_name = "modules/lawyer/evidence_management/evidence_list.html"
    template_name = "modules/lawyer/evidence_management/evidence_management_list/table/data-table/datatable-basic/datatable-basic-init.html"
    context_object_name = 'evidence_list'

    def get_queryset(self):
        # Filter evidence by the case specified in the URL
        case_id = self.kwargs.get('case_id')
        return Evidence.objects.filter(case_id=case_id)
#

 # View for editing evidence
class EvidenceUpdateView(LoginRequiredMixin, UpdateView):
    model = Evidence
    fields = ['title', 'description', 'file']
    template_name = "modules/lawyer/evidence_management/evidence_edit.html"
    login_url = reverse_lazy('login_home')

    def form_valid(self, form):
        messages.success(self.request, 'Evidence updated successfully.')
        return super().form_valid(form)

    def get_success_url(self):
        return reverse_lazy('cases_with_evidence')   
  
# View for deleting evidence
class EvidenceDeleteView(LoginRequiredMixin, DeleteView):
    model = Evidence
    template_name = "modules/lawyer/evidence_management/evidence_confirm_delete.html"
    login_url = reverse_lazy('login_home')

    def get_success_url(self):
        messages.success(self.request, 'Evidence deleted successfully.')
        return reverse_lazy('cases_with_evidence')    

class StandaloneEvidenceUploadView(LoginRequiredMixin, CreateView):
    model = Evidence
    fields = ['title', 'description', 'file', 'case']
    template_name = "modules/lawyer/evidence_management/evidence_upload_standalone.html"

    def get_success_url(self):
        # Redirect to the appropriate evidence list based on the case chosen
        case_id = self.object.case.id if self.object.case else None
        if case_id:
            return reverse_lazy('case_evidence_list', kwargs={'case_id': case_id})
        else:
            return reverse_lazy('evidence_list')  # Standalone evidence list if no case selected

    def form_valid(self, form):
        form.instance.created_by = self.request.user
        messages.success(self.request, 'Evidence uploaded successfully.')
        return super().form_valid(form)

class CaseEvidenceListView(LoginRequiredMixin, ListView):
    model = Evidence
    template_name = "modules/lawyer/evidence_management/evidence_management_list/table/data-table/datatable-basic/datatable-basic-init.html"
    context_object_name = 'evidence_list'

    def get_queryset(self):
        # Filter evidence by case ID provided in the URL
        case_id = self.kwargs.get('case_id')
        return Evidence.objects.filter(case__id=case_id).select_related('case__client')  # Load client details along with case

    def get_context_data(self, **kwargs):
        # Add case details to context
        context = super().get_context_data(**kwargs)
        case_id = self.kwargs.get('case_id')

        # Fetch the case object or return 404 if not found
        case = get_object_or_404(Case.objects.select_related('client'), id=case_id)
        context['case'] = case

        return context

class ClientsWithEvidenceListView(LoginRequiredMixin, TemplateView):
    template_name = "modules/lawyer/client_documents/clients_with_evidence.html"
    login_url = reverse_lazy('login_home')

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        clients = CustomUser.objects.filter(role=CustomUser.UserRole.CLIENT)
        evidence_data = []

        for client in clients:
            evidence_items = Evidence.objects.filter(created_by=client)
            if evidence_items.exists():
                evidence_data.append({
                    'client': client,
                    'evidence_items': evidence_items,
                })

        context['evidence_data'] = evidence_data
        return context


# View for listing cases with evidence
class CasesWithEvidenceListView(LoginRequiredMixin, TemplateView):
    template_name = "modules/lawyer/evidence_management/evidence_management/table/data-table/datatable-basic/datatable-basic-init.html"
    login_url = reverse_lazy('login_home')

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        cases = Case.objects.prefetch_related('evidence').all()
        context['cases'] = cases
        return context
    
class CasesWithEvidenceListView(LoginRequiredMixin, TemplateView):
    #template_name = "modules/lawyer/evidence_management/cases_with_evidence.html"
    template_name = "modules/lawyer/evidence_management/evidence_management/table/data-table/datatable-basic/datatable-basic-init.html"
    login_url = reverse_lazy('login_home')

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        # Fetch all cases from the database
        context['cases'] = Case.objects.all()
        return context

def debug_session(request):
    return JsonResponse(request.session.get('chat_history', []), safe=False)

import markdown
import time
from django.core.files.storage import FileSystemStorage

# Configure the Google Generative AI API
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

class LegalResearchView(LoginRequiredMixin, TemplateView):
    template_name = "modules/lawyer/legal_research/legal_research.html"
    login_url = '/login/'

    def get(self, request, case_id, *args, **kwargs):
        # Load the case object for detailed context
        case = get_object_or_404(Case, id=case_id)

        # Load the chat history for the given case ID from the session or initialize it
        chat_history_key = f'chat_history_{case_id}'
        chat_history = request.session.get(chat_history_key, [])

        return render(request, self.template_name, {
            'chat_history': chat_history,
            'case': case  # Pass the entire case object to context
        })

    def post(self, request, case_id, *args, **kwargs):
        user_query = request.POST.get('query')
        if user_query:
            try:
                # Load the case object for detailed context
                case = get_object_or_404(Case, id=case_id)

                # Load existing chat history for the case ID from session
                chat_history_key = f'chat_history_{case_id}'
                chat_history = request.session.get(chat_history_key, [])

                # Append new user query to the chat history
                chat_history.append({"role": "user", "text": user_query})

                # Use the Generative Model to generate a response
                model = genai.GenerativeModel("gemini-1.5-flash")

                # Start the chat session with the current chat history
                model_history = [
                    {"role": message["role"], "parts": [message["text"]]}
                    for message in chat_history
                ]
                chat_session = model.start_chat(history=model_history)

                # Send the user's question to the model
                response = chat_session.send_message(user_query)

                # Get the text response from the model
                response_text = response.text

                # Convert the response text from Markdown to HTML
                response_html = markdown.markdown(response_text)

                # Append the model's response to the chat history
                chat_history.append({"role": "model", "text": response_html, "is_html": True})

                # Save updated chat history for the case ID to the session
                request.session[chat_history_key] = chat_history
                request.session.modified = True

                # Render the updated chat history in the template
                return render(request, self.template_name, {
                    'chat_history': chat_history,
                    'case': case  # Pass the entire case object to context
                })

            except Exception as e:
                messages.error(request, f"Failed to process your request: {str(e)}")
                # Render the template with the current chat history even if an error occurs
                chat_history = request.session.get(chat_history_key, [])
                return render(request, self.template_name, {
                    'chat_history': chat_history,
                    'case': case  # Pass the entire case object to context
                })
        else:
            messages.error(request, "Please enter a legal query.")
            # Render the template again with existing chat history
            case = get_object_or_404(Case, id=case_id)
            chat_history = request.session.get(chat_history_key, [])
            return render(request, self.template_name, {
                'chat_history': chat_history,
                'case': case  # Pass the entire case object to context
            })

class ClearChatView(View):
    def post(self, request, case_id):
        try:
            # Clear chat history for the given case
            chat_history_key = f'chat_history_{case_id}'
            if chat_history_key in request.session:
                del request.session[chat_history_key]
                request.session.modified = True
            messages.success(request, "Chat history cleared successfully.")
        except Exception as e:
            messages.error(request, f"Failed to clear chat history: {str(e)}")

        # Redirect back to the legal research page for the same case
        return redirect('legal_research', case_id=case_id)
    
# Configure the Gemini API key
API_KEY = os.getenv("GEMINI_API_KEY", "AIzaSyBvR2lvFRruV3_7xa3E43ViZOJuaj3bANg")
genai.configure(api_key=API_KEY)

from django.shortcuts import get_object_or_404, redirect
from django.views.generic import TemplateView, View
from django.http import JsonResponse
from django.contrib import messages
from django.contrib.auth.mixins import LoginRequiredMixin
import PyPDF2
import markdown
import google.generativeai as genai

class DocumentAnalysisView(LoginRequiredMixin, TemplateView):
    template_name = "modules/lawyer/document_analysis/document_analysis.html"
    login_url = '/login/'

    def extract_text_from_pdf(self, pdf_file):
        # Extract text from the PDF using PyPDF2
        try:
            pdf_reader = PyPDF2.PdfReader(pdf_file)
            extracted_text = ""
            for page in pdf_reader.pages:
                text = page.extract_text()
                if text:
                    extracted_text += text
            return extracted_text
        except Exception as e:
            return str(e)

    def get(self, request, *args, **kwargs):
        # Load chat history from the session
        chat_history = request.session.get('chat_history_document', [])
        return render(request, self.template_name, {
            'chat_history': chat_history,
            'document_titles': [],
            'response_text': ''
        })

    def post(self, request, *args, **kwargs):
        document_titles = []
        response_text = ""
        chat_history = request.session.get('chat_history_document', [])

        # Check if this is a file upload or a chat question
        if 'file1' in request.FILES or 'file2' in request.FILES:
            # Handle file uploads
            uploaded_file1 = request.FILES.get('file1')
            uploaded_file2 = request.FILES.get('file2')

            try:
                # Extract text from the uploaded files
                if uploaded_file1:
                    text1 = self.extract_text_from_pdf(uploaded_file1)
                    document_titles.append(uploaded_file1.name)
                else:
                    text1 = ""

                if uploaded_file2:
                    text2 = self.extract_text_from_pdf(uploaded_file2)
                    document_titles.append(uploaded_file2.name)
                else:
                    text2 = ""

                # Prepare prompt for analysis
                if text1 and text2:
                    prompt = f"Summarize the differences between these two documents:\n\nDocument 1:\n{text1}\n\nDocument 2:\n{text2}"
                else:
                    prompt = f"Provide a summary of the following document:\n\n{text1 if text1 else text2}"

                # Use Generative Model to generate a response
                model = genai.GenerativeModel("gemini-1.5-flash")
                response = model.generate_content([prompt])
                response_text = response.text

                # Convert response text to Markdown
                response_markdown = markdown.markdown(response_text)

                # Append the model's response to the chat history
                chat_history.append({"role": "model", "text": response_markdown, "is_html": True})

                # Save updated chat history to session
                request.session['chat_history_document'] = chat_history
                request.session.modified = True

                messages.success(request, "Document analysis successful.")

            except Exception as e:
                response_text = f"An error occurred: {str(e)}"
                messages.error(request, response_text)

            # Return JSON response for AJAX
            return JsonResponse({
                'document_titles': document_titles,
                'response_text': response_markdown,
            })

        elif 'query' in request.POST:
            # Handle chat questions about the uploaded document(s)
            user_query = request.POST.get('query')

            if user_query:
                try:
                    # Append user's query to chat history
                    chat_history.append({"role": "user", "text": user_query})

                    # Use Generative Model to generate a response
                    model = genai.GenerativeModel("gemini-1.5-flash")

                    # Start the chat session with the current chat history
                    model_history = [
                        {"role": message["role"], "parts": [message["text"]]}
                        for message in chat_history
                    ]
                    chat_session = model.start_chat(history=model_history)

                    # Send the user's question to the model
                    response = chat_session.send_message(user_query)

                    # Convert the response to Markdown
                    response_markdown = markdown.markdown(response.text)

                    # Append the model's response to the chat history
                    chat_history.append({"role": "model", "text": response_markdown, "is_html": True})

                    # Save updated chat history to session
                    request.session['chat_history_document'] = chat_history
                    request.session.modified = True

                    return JsonResponse({
                        'chat_html': self.render_chat_history(chat_history)
                    })

                except Exception as e:
                    response_text = f"Failed to process your request: {str(e)}"
                    messages.error(request, response_text)
                    return JsonResponse({'error': response_text}, status=400)

            else:
                messages.error(request, "Please enter a query.")
                return JsonResponse({'error': "No query provided."}, status=400)

        else:
            messages.error(request, "Invalid request.")
            return JsonResponse({'error': "Invalid request."}, status=400)

    def render_chat_history(self, chat_history):
        """Render chat history to HTML format for the frontend."""
        chat_html = ""
        for chat in chat_history:
            if chat['role'] == 'user':
                chat_html += f"<div class='card my-2'><div class='card-body'><strong>User:</strong><p>{chat['text']}</p></div></div>"
            elif chat['role'] == 'model':
                chat_html += f"<div class='card my-2'><div class='card-body'><strong>Document Assistant:</strong><div>{chat['text']}</div></div></div>"
        return chat_html

class ClearDocumentAnalysisChatView(View):
    def post(self, request):
        try:
            # Clear chat history for document analysis
            if 'chat_history_document' in request.session:
                del request.session['chat_history_document']
                request.session.modified = True
            messages.success(request, "Document analysis chat history cleared successfully.")
        except Exception as e:
            messages.error(request, f"Failed to clear chat history: {str(e)}")

        return JsonResponse({'message': "Chat history cleared successfully."})
