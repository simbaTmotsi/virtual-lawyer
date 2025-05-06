import os
from django.db import models
from django.conf import settings
from cases.models import Case # Assuming Case model exists in 'cases' app

def get_document_upload_path(instance, filename):
    """ Determines the upload path for the document. Organizes files based on case ID if available. """
    if instance.case:
        return f"documents/cases/{instance.case.id}/{filename}"
    return f"documents/uncategorized/{filename}"

class Document(models.Model):
    """Represents a document uploaded to the system."""
    case = models.ForeignKey(Case, on_delete=models.CASCADE, related_name='documents', null=True, blank=True)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    file = models.FileField(upload_to=get_document_upload_path)
    uploaded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='uploaded_documents')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Add document type field
    DOCUMENT_TYPES = (
        ('legal', 'Legal Document'),
        ('contract', 'Contract'),
        ('court', 'Court Filing'),
        ('correspondence', 'Correspondence'),
        ('evidence', 'Evidence'),
        ('other', 'Other'),
    )
    doc_type = models.CharField(max_length=50, choices=DOCUMENT_TYPES, blank=True)

    def __str__(self):
        return self.name

    def get_file_size(self):
        """Returns the file size in a human-readable format."""
        try:
            size = self.file.size
            if size < 1024:
                return f"{size} B"
            elif size < 1024**2:
                return f"{size/1024:.1f} KB"
            elif size < 1024**3:
                return f"{size/1024**2:.1f} MB"
            else:
                return f"{size/1024**3:.1f} GB"
        except FileNotFoundError:
            return "File not found"
        except Exception:
            return "N/A"

    class Meta:
        ordering = ['-uploaded_at']

# Consider adding a DocumentVersion model for version history
# class DocumentVersion(models.Model):
#     document = models.ForeignKey(Document, on_delete=models.CASCADE, related_name='versions')
#     version_number = models.PositiveIntegerField()
#     file = models.FileField(upload_to='document_versions/')
#     uploaded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
#     uploaded_at = models.DateTimeField(auto_now_add=True)
#     comment = models.TextField(blank=True)
