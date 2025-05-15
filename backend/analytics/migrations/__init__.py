from django.db import migrations, models
import django.db.models.deletion
from django.conf import settings
from django.utils import timezone


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='AnalyticsSummary',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date', models.DateField(unique=True)),
                ('active_users', models.IntegerField(default=0)),
                ('new_users', models.IntegerField(default=0)),
                ('total_api_calls', models.IntegerField(default=0)),
                ('avg_response_time_ms', models.FloatField(default=0)),
                ('documents_processed', models.IntegerField(default=0)),
                ('billing_amount', models.DecimalField(decimal_places=2, default=0, max_digits=10)),
            ],
            options={
                'verbose_name_plural': 'Analytics Summaries',
                'ordering': ['-date'],
            },
        ),
        migrations.CreateModel(
            name='UserActivity',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('activity_type', models.CharField(max_length=100)),
                ('details', models.JSONField(blank=True, null=True)),
                ('ip_address', models.GenericIPAddressField(blank=True, null=True)),
                ('user_agent', models.TextField(blank=True)),
                ('timestamp', models.DateTimeField(default=timezone.now)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name_plural': 'User Activities',
                'ordering': ['-timestamp'],
            },
        ),
        migrations.CreateModel(
            name='APIUsage',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('endpoint', models.CharField(max_length=255)),
                ('method', models.CharField(max_length=10)),
                ('status_code', models.IntegerField()),
                ('response_time_ms', models.IntegerField()),
                ('timestamp', models.DateTimeField(default=timezone.now)),
                ('request_data', models.JSONField(blank=True, null=True)),
                ('user', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name_plural': 'API Usage',
                'ordering': ['-timestamp'],
            },
        ),
        migrations.AddIndex(
            model_name='useractivity',
            index=models.Index(fields=['user', 'timestamp'], name='analytics_u_user_id_5d2c32_idx'),
        ),
        migrations.AddIndex(
            model_name='useractivity',
            index=models.Index(fields=['activity_type', 'timestamp'], name='analytics_u_activit_ccbf67_idx'),
        ),
        migrations.AddIndex(
            model_name='apiusage',
            index=models.Index(fields=['endpoint', 'timestamp'], name='analytics_a_endpoin_9eb2a8_idx'),
        ),
        migrations.AddIndex(
            model_name='apiusage',
            index=models.Index(fields=['user', 'timestamp'], name='analytics_a_user_id_bc4f95_idx'),
        ),
    ]
