from django.db import models
from django.conf import settings
# from accounts.models import Organization # If using multi-tenancy with organizations

class Client(models.Model):
    """Represents a client of the law firm."""
    # organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='clients') # For multi-tenancy
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(unique=True, blank=True, null=True) # Unique within an organization if multi-tenant
    phone = models.CharField(max_length=20, blank=True)
    address = models.TextField(blank=True)
    date_added = models.DateTimeField(auto_now_add=True)
    last_updated = models.DateTimeField(auto_now=True)
    # Link to a User account if the client has portal access
    user_account = models.OneToOneField(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='client_profile',
        limit_choices_to={'role': 'client'} # Ensure only client users can be linked
    )
    # Add other relevant fields: company name, notes, status, etc.
    # company_name = models.CharField(max_length=200, blank=True)
    # status = models.CharField(max_length=20, choices=[('active', 'Active'), ('inactive', 'Inactive'), ('prospect', 'Prospect')], default='active')
    notes = models.TextField(blank=True, default="")

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"

    class Meta:
        ordering = ['last_name', 'first_name']
        # Add unique_together constraint if using organization
        # unique_together = ('organization', 'email')
