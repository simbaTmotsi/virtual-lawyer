from django.views.generic.edit import CreateView
from django.urls import reverse_lazy
from django import forms
from django.utils.decorators import method_decorator
from crispy_forms.helper import FormHelper
from crispy_forms.layout import Submit
from FieldBoost.models import Case, CustomUser
from FieldBoost.decorators import lawyer_required

# Form for creating a case
class CaseForm(forms.ModelForm):
    class Meta:
        model = Case
        fields = ['title', 'description', 'assigned_to', 'client', 'status']

    def __init__(self, *args, **kwargs):
        super(CaseForm, self).__init__(*args, **kwargs)
        self.helper = FormHelper()
        self.helper.form_method = 'post'
        self.helper.add_input(Submit('submit', 'Create Case'))

# Class-based view for creating a case
@method_decorator(lawyer_required, name='dispatch')
class CaseCreateView(CreateView):
    model = Case
    form_class = CaseForm
    template_name = 'lawyer/create_case.html'
    success_url = reverse_lazy('case_list')  # Redirect to a case list page after success

    def form_valid(self, form):
        # Set the current user as the assigned lawyer if not already assigned
        form.instance.assigned_to = form.instance.assigned_to or self.request.user
        return super().form_valid(form)
