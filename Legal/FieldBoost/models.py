from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models

# User Models
class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, password, **extra_fields)

class CustomUser(AbstractBaseUser, PermissionsMixin):
    class UserRole(models.TextChoices):
        FARMER = "farmer", "Farmer"
        SUPPLIER = "supplier", "Supplier"
        DRIVER = "driver", "Driver"
        LAWYER = "lawyer", "Lawyer"

    email = models.EmailField(unique=True)
    role = models.CharField(max_length=15, choices=UserRole.choices, default=UserRole.FARMER)
    first_name = models.CharField(max_length=35, blank=True)
    surname = models.CharField(max_length=15, blank=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)

    objects = CustomUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    def __str__(self):
        return self.email

    def has_perm(self, perm, obj=None):
        return self.is_superuser

    def has_module_perms(self, app_label):
        return self.is_superuser

# Task Model
class Task(models.Model):
    title = models.CharField(max_length=200, null=False)
    complete = models.BooleanField(default=False)
    created = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

# Document Management Models
class Document(models.Model):
    title = models.CharField(max_length=200)
    content = models.TextField()
    created_by = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_template = models.BooleanField(default=False)

    def __str__(self):
        return self.title

class DocumentVersion(models.Model):
    document = models.ForeignKey(Document, related_name='versions', on_delete=models.CASCADE)
    version_number = models.IntegerField()
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.document.title} - Version {self.version_number}"

# Case Management Models
class Case(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    assigned_to = models.ForeignKey(CustomUser, related_name='cases', on_delete=models.CASCADE)
    client = models.ForeignKey('Client', related_name='cases', on_delete=models.CASCADE)
    status = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

class CaseNote(models.Model):
    case = models.ForeignKey(Case, related_name='notes', on_delete=models.CASCADE)
    author = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    note = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Note by {self.author.email} on {self.case.title}"

# Client Management Models
class Client(models.Model):
    first_name = models.CharField(max_length=35)
    last_name = models.CharField(max_length=35)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=15, blank=True)
    address = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

# Compliance Models
class ComplianceChecklist(models.Model):
    case = models.ForeignKey(Case, related_name='compliance_checklists', on_delete=models.CASCADE)
    checklist_item = models.CharField(max_length=200)
    completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.checklist_item

class AuditLog(models.Model):
    document = models.ForeignKey(Document, related_name='audit_logs', on_delete=models.CASCADE)
    action = models.CharField(max_length=50)
    performed_by = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    performed_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Audit log for {self.document.title} by {self.performed_by.email}"

