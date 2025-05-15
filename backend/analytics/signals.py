from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.signals import user_logged_in, user_logged_out
from django.utils import timezone
from analytics.models import UserActivity
from accounts.models import User

@receiver(user_logged_in)
def user_logged_in_handler(sender, request, user, **kwargs):
    """Track user login activities."""
    UserActivity.objects.create(
        user=user,
        activity_type='login',
        ip_address=get_client_ip(request),
        user_agent=request.META.get('HTTP_USER_AGENT', ''),
        timestamp=timezone.now()
    )

@receiver(user_logged_out)
def user_logged_out_handler(sender, request, user, **kwargs):
    """Track user logout activities."""
    if user:  # User could be None if session expired
        UserActivity.objects.create(
            user=user,
            activity_type='logout',
            ip_address=get_client_ip(request),
            user_agent=request.META.get('HTTP_USER_AGENT', ''),
            timestamp=timezone.now()
        )

def get_client_ip(request):
    """Get the client IP address from the request."""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip
