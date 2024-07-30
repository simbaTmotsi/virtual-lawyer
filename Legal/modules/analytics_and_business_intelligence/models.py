from django.db import models

class Crop(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()
    optimal_conditions = models.TextField()

    def __str__(self):
        return self.name

class CropHealth(models.Model):
    crop = models.ForeignKey(Crop, on_delete=models.CASCADE)
    date = models.DateField()
    health_status = models.CharField(max_length=50)
    pest_incidence = models.DecimalField(max_digits=5, decimal_places=2)

    def __str__(self):
        return f"{self.crop} - {self.date}"

class Weather(models.Model):
    date = models.DateField()
    temperature = models.DecimalField(max_digits=5, decimal_places=2)
    humidity = models.DecimalField(max_digits=5, decimal_places=2)
    rainfall = models.DecimalField(max_digits=5, decimal_places=2)

    def __str__(self):
        return str(self.date)

class FarmActivity(models.Model):
    date = models.DateField()
    activity_type = models.CharField(max_length=100)
    description = models.TextField()

    def __str__(self):
        return f"{self.date} - {self.activity_type}"
