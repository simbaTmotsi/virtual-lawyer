from django.db import models

# Create your admin_portal models here

class SystemSetting(models.Model):
    """Stores global system settings, assuming a single row (id=1)."""
    app_name = models.CharField(max_length=100, default='EasyLaw')
    default_timezone = models.CharField(max_length=100, default='UTC')
    date_format = models.CharField(max_length=50, default='YYYY-MM-DD')
    maintenance_mode = models.BooleanField(default=False)
    allow_registrations = models.BooleanField(default=True)
    # Add other settings as needed
    # default_currency = models.CharField(max_length=3, default='USD')
    # branding_logo = models.ImageField(upload_to='branding/', blank=True, null=True)
    
    # LLM preference (if stored in DB)
    # preferred_llm = models.CharField(max_length=20, choices=[('openai', 'OpenAI'), ('gemini', 'Gemini')], default='openai')

    # Ensure only one instance can be created (singleton pattern)
    def save(self, *args, **kwargs):
        self.pk = 1
        super(SystemSetting, self).save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        # Prevent deletion of the singleton instance
        pass 

    @classmethod
    def load(cls):
        # Convenience method to get the settings object
        obj, created = cls.objects.get_or_create(pk=1)
        return obj

    def __str__(self):
        return "System Settings"

    class Meta:
        verbose_name_plural = "System Settings"
