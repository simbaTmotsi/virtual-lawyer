from django import forms
from django.forms import ModelForm

from .models import *

class TaskForm(forms.ModelForm):
    title = forms.CharField(max_length=200, widget= forms.Textarea(attrs={'placeholder':'Enter new task here. . .'}))

    class Meta:
        model = Task
        fields = '__all__'

class DocumentShareForm(forms.ModelForm):
    recipient_email = forms.EmailField(required=False)

    class Meta:
        model = DocumentShare
        fields = ['recipient', 'external_email', 'message']

    def clean(self):
        cleaned_data = super().clean()
        recipient = cleaned_data.get("recipient")
        external_email = cleaned_data.get("external_email")

        if not recipient and not external_email:
            raise forms.ValidationError("You must provide either a recipient or an external email address.")

        return cleaned_data

class DocumentPermissionForm(forms.ModelForm):
    class Meta:
        model = DocumentPermission
        fields = ['user', 'can_view', 'can_edit']