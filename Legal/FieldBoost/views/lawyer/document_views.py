from django.views.generic.edit import CreateView
from django.urls import reverse_lazy
from django import forms
from django.utils.decorators import method_decorator
from crispy_forms.helper import FormHelper
from crispy_forms.layout import Submit
from FieldBoost.models import Document
from FieldBoost.decorators import lawyer_required

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
