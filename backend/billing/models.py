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
    rate = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True, help_text="Hourly rate at the time of entry, if different from default.")
    is_billable = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    # Link to an invoice once billed
    invoice = models.ForeignKey('Invoice', on_delete=models.SET_NULL, null=True, blank=True, related_name='time_entries')

    def __str__(self):
        return f"{self.hours}h on {self.date} by {self.user.get_short_name()} for {self.case.title}"

    @property
    def amount(self):
        """Calculate the billable amount for this entry."""
        if not self.is_billable:
            return Decimal('0.00')
        
        # Determine rate (entry-specific, user default, case default, client default?) - Needs logic
        effective_rate = self.rate # Simplistic: use entry rate if set
        if not effective_rate:
             # Placeholder: Get default rate logic here
             effective_rate = Decimal('250.00') # Example default
             
        return (self.hours * effective_rate).quantize(Decimal("0.01"))

    class Meta:
        ordering = ['-date', '-created_at']
        verbose_name_plural = "Time Entries"


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
    invoice_number = models.CharField(max_length=50, unique=True) # Needs generation logic
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
        # Add expense total if Expense model exists
        # expense_total = sum(expense.amount for expense in self.expenses.all())
        self.total_amount = time_total # + expense_total
        self.save()

    class Meta:
        ordering = ['-issue_date']

# Consider adding Expense model
# class Expense(models.Model):
#     case = models.ForeignKey(Case, on_delete=models.CASCADE, related_name='expenses')
#     date = models.DateField()
#     description = models.CharField(max_length=255)
#     amount = models.DecimalField(max_digits=10, decimal_places=2)
#     is_billable = models.BooleanField(default=True)
#     invoice = models.ForeignKey(Invoice, on_delete=models.SET_NULL, null=True, blank=True, related_name='expenses')
