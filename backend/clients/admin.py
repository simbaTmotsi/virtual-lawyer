from django.contrib import admin
from django.urls import reverse
from django.utils.html import format_html
from .models import Client

class FullNameListFilter(admin.SimpleListFilter):
    """Custom filter to search by full name"""
    title = 'Full Name'
    parameter_name = 'full_name'

    def lookups(self, request, model_admin):
        return [
            ('a', 'Starts with A'),
            ('b', 'Starts with B'),
            ('c', 'Starts with C'),
            # Add more as needed
        ]

    def queryset(self, request, queryset):
        if self.value():
            return queryset.filter(last_name__istartswith=self.value())
        return queryset

@admin.register(Client)
class ClientAdmin(admin.ModelAdmin):
    list_display = ('full_name_display', 'email', 'phone', 'date_added', 'last_updated', 'view_cases_link', 'api_link')
    search_fields = ('first_name', 'last_name', 'email', 'phone', 'address')
    list_filter = ('date_added', 'last_updated', FullNameListFilter)
    list_per_page = 25
    date_hierarchy = 'date_added'
    
    fieldsets = (
        ('Personal Information', {
            'fields': ('first_name', 'last_name', 'email', 'phone', 'address')
        }),
        ('System Information', {
            'fields': ('date_added', 'last_updated', 'user_account'),
            'classes': ('collapse',)
        }),
    )
    readonly_fields = ('date_added', 'last_updated')
    
    def full_name_display(self, obj):
        """Display full name with formatting"""
        return f"{obj.first_name} {obj.last_name}"
    full_name_display.short_description = 'Client Name'
    full_name_display.admin_order_field = 'last_name'
    
    def view_cases_link(self, obj):
        """Link to filter case admin by this client"""
        url = reverse('admin:cases_case_changelist') + f'?client={obj.id}'
        return format_html('<a href="{}">View Cases</a>', url)
    view_cases_link.short_description = 'Cases'
    
    def api_link(self, obj):
        """Link to the API endpoint for this client"""
        api_url = f"/api/clients/{obj.id}/"
        return format_html('<a href="{}" target="_blank">API</a>', api_url)
    api_link.short_description = 'API Link'
    
    def save_model(self, request, obj, form, change):
        """Log client changes"""
        print(f"DEBUG: Admin saving client: {obj.first_name} {obj.last_name}")
        super().save_model(request, obj, form, change)
