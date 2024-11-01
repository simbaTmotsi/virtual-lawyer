from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.conf import settings

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
    storage_quota = models.BigIntegerField(default=2 * 1024 ** 3)  # Default 2 GB quota in byte
    company_name = models.CharField(max_length=255, blank=True, null=True)
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    address = models.TextField(blank=True, null=True)

    objects = CustomUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    objects = CustomUserManager()

    def calculate_storage_used(self):
        # Calculate total size of all documents uploaded by the user
        documents = self.documents_created.all()  # Fetch all documents created by the user
        total_size = sum(document.file.size for document in documents if document.file)  # Sum file sizes
        return total_size
    
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
    recipient = models.CharField(max_length=255, blank=True)  # Field for document sharing recipient
    recipient_email = models.EmailField(blank=True)  # Field for document sharing recipient email

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

class ClientCommunication(models.Model):
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='sent_messages', on_delete=models.CASCADE)
    recipient = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='received_messages', on_delete=models.CASCADE)
    subject = models.CharField(max_length=255)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    def __str__(self):
        return f"Message from {self.sender} to {self.recipient} - {self.subject}"

class Appointment(models.Model):
    STATUS_CHOICES = [
        ('Scheduled', 'Scheduled'),
        ('Completed', 'Completed'),
        ('Cancelled', 'Cancelled')
    ]

    title = models.CharField(max_length=255)
    lawyer = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='lawyer_appointments', on_delete=models.CASCADE)
    client = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='client_appointments', on_delete=models.CASCADE)
    date = models.DateTimeField()
    location = models.CharField(max_length=255, blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Scheduled')
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} with {self.client} on {self.date}"



