from django.contrib import admin
from .models import Notification

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('title', 'user', 'notification_type', 'read', 'created_at')
    list_filter = ('read', 'notification_type', 'created_at')
    search_fields = ('title', 'message', 'user__email')
    date_hierarchy = 'created_at'
