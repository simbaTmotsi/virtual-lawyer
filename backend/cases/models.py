from django.db import models
from django.conf import settings
from clients.models import Client # Assuming Client model exists in 'clients' app

class Case(models.Model):
    """Represents a legal case managed by the firm."""
    STATUS_CHOICES = [
        ('open', 'Open'),
        ('active', 'Active'),
        ('pending', 'Pending'),
        ('closed', 'Closed'),
        ('archived', 'Archived'),
    ]
    
    title = models.CharField(max_length=255)
    case_number = models.CharField(max_length=100, blank=True, unique=True, null=True) # Optional, could be unique per court/jurisdiction
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='cases')
    description = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='open')
    case_type = models.CharField(max_length=100, blank=True) # e.g., 'Personal Injury', 'Corporate Law'
    date_opened = models.DateField(auto_now_add=True)
    date_closed = models.DateField(null=True, blank=True)
    assigned_attorneys = models.ManyToManyField(
        settings.AUTH_USER_MODEL, 
        related_name='assigned_cases',
        limit_choices_to={'role__in': ['attorney', 'paralegal', 'admin']}, # Limit to relevant staff roles
        blank=True
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_cases'
    )
    # Add other relevant fields: court, judge, opposing counsel, key dates, budget, etc.
    # court = models.CharField(max_length=150, blank=True)
    # judge = models.CharField(max_length=100, blank=True)
    # opposing_counsel = models.CharField(max_length=100, blank=True)
    # budget = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    last_updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} ({self.client.full_name})"

    class Meta:
        ordering = ['-last_updated', '-date_opened']
