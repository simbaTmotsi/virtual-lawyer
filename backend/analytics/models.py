from django.db import models
from django.conf import settings
from django.utils import timezone

class UserActivity(models.Model):
    """Tracks user activities for analytics purposes."""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    activity_type = models.CharField(max_length=100)  # e.g., 'login', 'document_view', 'api_call'
    details = models.JSONField(null=True, blank=True)  # Additional activity details
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    timestamp = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.user.email} - {self.activity_type} at {self.timestamp}"

    class Meta:
        verbose_name_plural = "User Activities"
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['user', 'timestamp']),
            models.Index(fields=['activity_type', 'timestamp']),
        ]


class APIUsage(models.Model):
    """Tracks API calls for monitoring and billing purposes."""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True, blank=True)
    endpoint = models.CharField(max_length=255)  # API endpoint path
    method = models.CharField(max_length=10)  # HTTP method (GET, POST, etc.)
    status_code = models.IntegerField()
    response_time_ms = models.IntegerField()  # Response time in milliseconds
    timestamp = models.DateTimeField(default=timezone.now)
    request_data = models.JSONField(null=True, blank=True)  # Sanitized request data

    def __str__(self):
        return f"{self.method} {self.endpoint} - {self.status_code} ({self.response_time_ms}ms)"

    class Meta:
        verbose_name_plural = "API Usage"
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['endpoint', 'timestamp']),
            models.Index(fields=['user', 'timestamp']),
        ]


class AnalyticsSummary(models.Model):
    """Daily summary of key analytics metrics."""
    date = models.DateField(unique=True)
    active_users = models.IntegerField(default=0)
    new_users = models.IntegerField(default=0)
    total_api_calls = models.IntegerField(default=0)
    avg_response_time_ms = models.FloatField(default=0)
    documents_processed = models.IntegerField(default=0)
    billing_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    def __str__(self):
        return f"Analytics Summary for {self.date}"

    class Meta:
        verbose_name_plural = "Analytics Summaries"
        ordering = ['-date']
