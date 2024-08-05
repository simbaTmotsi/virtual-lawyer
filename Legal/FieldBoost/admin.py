from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, Task

class CustomUserAdmin(UserAdmin):
    model = CustomUser
    list_display = ('email', 'first_name', 'surname', 'role', 'is_staff', 'is_active', 'is_superuser')
    list_filter = ('role', 'is_staff', 'is_active', 'is_superuser')
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal info', {'fields': ('first_name', 'surname', 'role')}),
        ('Permissions', {'fields': ('is_staff', 'is_active', 'is_superuser')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password1', 'password2', 'first_name', 'surname', 'role', 'is_staff', 'is_active', 'is_superuser')}
        ),
    )
    search_fields = ('email', 'first_name', 'surname')
    ordering = ('email',)

admin.site.register(CustomUser, CustomUserAdmin)
admin.site.register(Task)
