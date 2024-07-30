from django.db import models
from crm.models import Customer

class Transaction(models.Model):
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField()
    date = models.DateField(auto_now_add=True)

    def __str__(self):
        return f"Transaction #{self.pk} - {self.customer} - {self.amount}"

class Expense(models.Model):
    description = models.TextField()
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    date = models.DateField(auto_now_add=True)

    def __str__(self):
        return f"Expense #{self.pk} - {self.description} - {self.amount}"

class Revenue(models.Model):
    description = models.TextField()
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    date = models.DateField(auto_now_add=True)

    def __str__(self):
        return f"Revenue #{self.pk} - {self.description} - {self.amount}"

class FinancialReport(models.Model):
    start_date = models.DateField()
    end_date = models.DateField()
    total_revenue = models.DecimalField(max_digits=10, decimal_places=2)
    total_expenses = models.DecimalField(max_digits=10, decimal_places=2)
    net_income = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"Financial Report #{self.pk} - {self.start_date} to {self.end_date}"
