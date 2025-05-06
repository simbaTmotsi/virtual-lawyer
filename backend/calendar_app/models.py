from django.db import models
from django.conf import settings
from cases.models import Case

class Event(models.Model):
    """Represents a calendar event, appointment, deadline, or task."""
    EVENT_TYPE_CHOICES = [
        ('meeting', 'Meeting'),
        ('deadline', 'Deadline'),
        ('hearing', 'Court Hearing'),
        ('task', 'Task'),
        ('reminder', 'Reminder'),
        ('other', 'Other'),
    ]

    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    event_type = models.CharField(max_length=20, choices=EVENT_TYPE_CHOICES, default='meeting')
    start_time = models.DateTimeField()
    end_time = models.DateTimeField(null=True, blank=True) # Nullable for deadlines/tasks without duration
    all_day = models.BooleanField(default=False)
    
    case = models.ForeignKey(Case, on_delete=models.SET_NULL, null=True, blank=True, related_name='events')
    location = models.CharField(max_length=255, blank=True)
    
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='created_events')
    attendees = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='attended_events', blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} ({self.start_time.strftime('%Y-%m-%d %H:%M')})"

    class Meta:
        ordering = ['start_time']
