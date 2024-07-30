from django.db import models

class Product(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()

    def __str__(self):
        return self.name

class QualityCheck(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    date = models.DateField(auto_now_add=True)
    passed = models.BooleanField(default=True)
    remarks = models.TextField(blank=True, null=True)

    def __str__(self):
        status = "Passed" if self.passed else "Failed"
        return f"Quality Check for {self.product} - {status}"
