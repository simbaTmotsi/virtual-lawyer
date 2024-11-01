# views.py
from django.views.generic.edit import CreateView, UpdateView, DeleteView
from django.urls import reverse_lazy
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib import messages
from FieldBoost.models import CustomUser
from django.views.generic import ListView, DetailView

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




