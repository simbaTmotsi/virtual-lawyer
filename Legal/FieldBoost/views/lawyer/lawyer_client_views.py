# views.py
from django.views.generic.edit import CreateView, UpdateView, DeleteView, FormView
from django.urls import reverse_lazy
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib import messages
from FieldBoost.models import CustomUser, ClientCommunication, Appointment
from django import forms
from django.views.generic import ListView, DetailView
from django.conf import settings
from django.core.mail import send_mail

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
        # Limit recipients to clients only
        super().__init__(*args, **kwargs)
        self.fields['recipient'].queryset = CustomUser.objects.filter(role=CustomUser.UserRole.CLIENT)

# lawyer_client_views.py
class ClientCommunicationView(LoginRequiredMixin, FormView):
    template_name = "modules/lawyer/client_management/client_communication.html"
    form_class = ClientCommunicationForm
    success_url = reverse_lazy('lawyer_client_list')

    def form_valid(self, form):
        communication = form.save(commit=False)
        communication.sender = self.request.user  # Set the sender to the logged-in lawyer
        
        # Append the signature to the message
        signature = "\n\n---\nSent using the Easy Law platform"
        communication.message += signature
        communication.save()

        # Send an email notification
        subject = communication.subject
        message = f"{communication.message}\n\n"
        recipient_email = communication.recipient.email
        sender_email = settings.DEFAULT_FROM_EMAIL
        send_mail(subject, message, sender_email, [recipient_email], fail_silently=False)

        messages.success(self.request, 'Message sent successfully.')
        return super().form_valid(form)

class ClientMessageListView(LoginRequiredMixin, ListView):
    model = ClientCommunication
    template_name = "modules/lawyer/client_management/client_messages/table/data-table/datatable-basic/datatable-basic-init.html"
    context_object_name = 'messages'

    def get_queryset(self):
        # Filter messages where the recipient is the logged-in client
        return ClientCommunication.objects.filter(sender=self.request.user)
    
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



