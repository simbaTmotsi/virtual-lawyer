# Generated by Django 4.2.11 on 2024-11-04 10:31

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('FieldBoost', '0022_case_created_by'),
    ]

    operations = [
        migrations.CreateModel(
            name='Evidence',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=255)),
                ('description', models.TextField(blank=True)),
                ('file', models.FileField(upload_to='evidence/')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('case', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='evidence', to='FieldBoost.case')),
                ('created_by', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='evidence_created', to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]