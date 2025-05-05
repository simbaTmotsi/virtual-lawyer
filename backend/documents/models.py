import os
from django.db import models
from django.conf import settings
from cases.models import Case # Assuming Case model exists in 'cases' app

def get_document_upload_path(instance, filename):
    """ Returns the upload path for a document, organized by case ID if available. """
    case_id = instance.case.id if instance.case else 'uncategorized'
    return os.path.join('documents', str(case_id), filename)

class Document(models.Model):
    """Represents a document uploaded to the system."""
    case = models.ForeignKey(Case, on_delete=models.CASCADE, related_name='documents', null=True, blank=True)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    file = models.FileField(upload_to=get_document_upload_path)
    uploaded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='uploaded_documents')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    # Add fields for document type, versioning, analysis results etc.
    # doc_type = models.CharField(max_length=50, blank=True)
    # version = models.PositiveIntegerField(default=1)
    # analysis_summary = models.TextField(blank=True, null=True)

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
