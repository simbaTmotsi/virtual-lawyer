from django.db import models
from django.conf import settings
from cases.models import Case
from clients.models import Client
from decimal import Decimal

class TimeEntry(models.Model):
    """Represents a block of time spent on a case, usually billable."""
    case = models.ForeignKey(Case, on_delete=models.CASCADE, related_name='time_entries')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='time_entries')
    date = models.DateField()
    hours = models.DecimalField(max_digits=5, decimal_places=2)
    description = models.TextField()
    is_billable = models.BooleanField(default=True)
    rate = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    invoice = models.ForeignKey('Invoice', on_delete=models.SET_NULL, null=True, blank=True, related_name='time_entries')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        # Calculate amount based on hours and rate if billable
        if self.is_billable and self.rate:
            self.amount = self.hours * self.rate
        else:
            self.amount = Decimal('0.00')
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.hours} hours for {self.case.title} on {self.date}"

    class Meta:
        ordering = ['-date', '-created_at']
        verbose_name = 'Time Entry'
        verbose_name_plural = 'Time Entries'


class Invoice(models.Model):
    """Represents an invoice sent to a client."""
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('sent', 'Sent'),
        ('paid', 'Paid'),
        ('overdue', 'Overdue'),
        ('void', 'Void'),
    ]

    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='invoices')
    invoice_number = models.CharField(max_length=50, unique=True)
    issue_date = models.DateField()
    due_date = models.DateField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='draft')
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Invoice {self.invoice_number} for {self.client.full_name}"

    def calculate_total(self):
        """Calculates the total amount based on linked time entries and expenses."""
        time_total = sum(entry.amount for entry in self.time_entries.filter(is_billable=True))
        expense_total = sum(expense.amount for expense in self.expenses.all() if expense.is_billable)
        self.total_amount = time_total + expense_total
        self.save()

    class Meta:
        ordering = ['-issue_date']


class Expense(models.Model):
    """Represents an expense incurred on a case that may be billed to a client."""
    case = models.ForeignKey(Case, on_delete=models.CASCADE, related_name='expenses')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='expenses')
    date = models.DateField()
    description = models.CharField(max_length=255)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    is_billable = models.BooleanField(default=True)
    invoice = models.ForeignKey(Invoice, on_delete=models.SET_NULL, null=True, blank=True, related_name='expenses')
    receipt = models.FileField(upload_to='expense_receipts/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"${self.amount} - {self.description} ({self.case.title})"

    class Meta:
        ordering = ['-date']
