# Generated by Django 4.2.11 on 2024-11-01 07:34

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('FieldBoost', '0017_document_recipient_document_recipient_email'),
    ]

    operations = [
        migrations.AddField(
            model_name='customuser',
            name='address',
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='customuser',
            name='company_name',
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
        migrations.AddField(
            model_name='customuser',
            name='phone_number',
            field=models.CharField(blank=True, max_length=15, null=True),
        ),
    ]