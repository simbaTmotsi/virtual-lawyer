from django.apps import AppConfig

class AnalyticsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'backend.analytics'
    
    def ready(self):
        # Import signal handlers
        import backend.analytics.signals
