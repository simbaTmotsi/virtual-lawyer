# Generated by Django 4.2.11 on 2024-11-01 17:22

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('FieldBoost', '0019_clientcommunication'),
    ]

    operations = [
        migrations.CreateModel(
            name='Appointment',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=255)),
                ('date', models.DateTimeField()),
                ('location', models.CharField(blank=True, max_length=255, null=True)),
                ('status', models.CharField(choices=[('Scheduled', 'Scheduled'), ('Completed', 'Completed'), ('Cancelled', 'Cancelled')], default='Scheduled', max_length=20)),
                ('description', models.TextField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('client', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='client_appointments', to=settings.AUTH_USER_MODEL)),
                ('lawyer', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='lawyer_appointments', to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]