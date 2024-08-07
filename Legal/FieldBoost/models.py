from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models

# Custom User Manager
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

# Custom User Model
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
    content = models.TextField(blank=True, null=True)  # Allow documents to have either text content or file
    file = models.FileField(upload_to='documents/', blank=True, null=True)  # File upload field
    created_by = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_template = models.BooleanField(default=False)

    def __str__(self):
        return self.title

class DocumentVersion(models.Model):
    document = models.ForeignKey(Document, related_name='versions', on_delete=models.CASCADE)
    version_number = models.IntegerField()
    content = models.TextField(blank=True, null=True)  # Allow version content to be text or file
    file = models.FileField(upload_to='document_versions/', blank=True, null=True)  # File upload field
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.document.title} - Version {self.version_number}"

class DocumentTag(models.Model):
    document = models.ForeignKey(Document, related_name='tags', on_delete=models.CASCADE)
    tag = models.ForeignKey('Tag', on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.tag.name} - {self.document.title}"

# Tag Model
class Tag(models.Model):
    name = models.CharField(max_length=50)
    created_by = models.ForeignKey(CustomUser, on_delete=models.CASCADE)

    def __str__(self):
        return self.name

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

class CaseDocument(models.Model):
    case = models.ForeignKey(Case, related_name='documents', on_delete=models.CASCADE)
    document = models.ForeignKey(Document, on_delete=models.CASCADE)

    def __str__(self):
        return f"Document for {self.case.title}"

class CaseNote(models.Model):
    case = models.ForeignKey(Case, related_name='notes', on_delete=models.CASCADE)
    author = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    note = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Note by {self.author.email} on {self.case.title}"

class CaseTask(models.Model):
    case = models.ForeignKey(Case, related_name='tasks', on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    assigned_to = models.ForeignKey(CustomUser, related_name='case_tasks', on_delete=models.CASCADE)
    due_date = models.DateField()
    completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Task: {self.title} - Due: {self.due_date}"

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

# Notification Model
class Notification(models.Model):
    user = models.ForeignKey(CustomUser, related_name='notifications', on_delete=models.CASCADE)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Notification for {self.user.email} - {'Read' if self.is_read else 'Unread'}"

# Billing and Payment Models
class Invoice(models.Model):
    client = models.ForeignKey(Client, related_name='invoices', on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    issued_date = models.DateField()
    due_date = models.DateField()
    status = models.CharField(max_length=50, choices=[('Pending', 'Pending'), ('Paid', 'Paid'), ('Overdue', 'Overdue')])

    def __str__(self):
        return f"Invoice {self.id} for {self.client}"

class Payment(models.Model):
    invoice = models.ForeignKey(Invoice, related_name='payments', on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_date = models.DateField()

    def __str__(self):
        return f"Payment {self.id} for Invoice {self.invoice.id}"
