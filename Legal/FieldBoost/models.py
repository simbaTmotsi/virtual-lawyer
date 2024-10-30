from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.contrib.auth import get_user_model
from django.db import models

# Custom User Manager
class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        
        email = self.normalize_email(email)
        display_name = email.split('@')[0]  # Extract the part before '@'

        # Ensure display_name is unique
        counter = 1
        original_display_name = display_name
        while CustomUser.objects.filter(display_name=display_name).exists():
            display_name = f"{original_display_name}{counter}"
            counter += 1
        
        extra_fields.setdefault('display_name', display_name)  # Set the display_name
        
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, password, **extra_fields)

# Custom User Model
class CustomUser(AbstractBaseUser, PermissionsMixin):
    class UserRole(models.TextChoices):
        LAWYER = "lawyer", "Lawyer"
        PARALEGAL = "paralegal", "Paralegal"
        CLIENT = "client", "Client"
        ADMIN = "admin", "Admin"

    email = models.EmailField(unique=True)
    display_name = models.CharField(max_length=255, unique=False, blank=True)
    role = models.CharField(max_length=15, choices=UserRole.choices, default=UserRole.CLIENT)
    first_name = models.CharField(max_length=35, blank=True)
    surname = models.CharField(max_length=15, blank=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    objects = CustomUserManager()

    def __str__(self):
        return self.email

# Document Model
class Document(models.Model):
    title = models.CharField(max_length=255)
    file = models.FileField(upload_to='documents/')
    created_by = models.ForeignKey(CustomUser, related_name='documents_created', on_delete=models.CASCADE)
    assigned_to = models.ForeignKey(CustomUser, related_name='documents_assigned', on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    tags = models.CharField(max_length=255, blank=True)  # New field for classification tags
    analysis_summary = models.TextField(blank=True)  # New field for storing AI analysis results

    def __str__(self):
        return self.title

# Case Model
class Case(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    assigned_to = models.ForeignKey(CustomUser, related_name='cases_assigned', on_delete=models.SET_NULL, null=True, blank=True)
    client = models.ForeignKey(CustomUser, related_name='client_cases', on_delete=models.CASCADE)
    status = models.CharField(max_length=50, choices=[('Open', 'Open'), ('Closed', 'Closed'), ('Pending', 'Pending')], default='Open')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    risk_score = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)  # New field for compliance scoring

    def __str__(self):
        return self.title

# Notification Model
class Notification(models.Model):
    user = models.ForeignKey(CustomUser, related_name='notifications', on_delete=models.CASCADE)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Notification for {self.user.email} - {'Read' if self.is_read else 'Unread'}"

# Folder Model for Document Management
class Folder(models.Model):
    name = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    @property
    def document_count(self):
        return self.documents.count()  # Assuming a reverse relationship from Document to Folder

    @property
    def size(self):
        return sum(doc.file.size for doc in self.documents.all()) / (1024 * 1024)  # size in MB
