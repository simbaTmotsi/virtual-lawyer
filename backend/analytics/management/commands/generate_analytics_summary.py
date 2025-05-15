"""
Management command to generate daily analytics summaries.
This should be run as a scheduled task (e.g., using cron) once a day.
"""
from django.core.management.base import BaseCommand
from django.utils import timezone
from django.db.models import Count, Avg, Sum
from analytics.models import APIUsage, UserActivity, AnalyticsSummary
from accounts.models import User
from documents.models import Document
from billing.models import Invoice
from datetime import timedelta

class Command(BaseCommand):
    help = 'Generate daily analytics summary'

    def handle(self, *args, **options):
        # Get yesterday's date
        yesterday = timezone.now().date() - timedelta(days=1)
        
        # Check if a summary for yesterday already exists
        if AnalyticsSummary.objects.filter(date=yesterday).exists():
            self.stdout.write(self.style.WARNING(f'Summary for {yesterday} already exists, skipping'))
            return
        
        # Calculate statistics for yesterday
        start_datetime = timezone.datetime.combine(yesterday, timezone.datetime.min.time())
        end_datetime = timezone.datetime.combine(yesterday, timezone.datetime.max.time())
        
        # Active users (users who performed any activity)
        active_users = UserActivity.objects.filter(
            timestamp__range=(start_datetime, end_datetime)
        ).values('user').distinct().count()
        
        # New users
        new_users = User.objects.filter(
            date_joined__range=(start_datetime, end_datetime)
        ).count()
        
        # API usage
        api_calls = APIUsage.objects.filter(
            timestamp__range=(start_datetime, end_datetime)
        )
        total_api_calls = api_calls.count()
        avg_response_time = api_calls.aggregate(avg=Avg('response_time_ms'))['avg'] or 0
        
        # Documents processed
        documents_processed = Document.objects.filter(
            uploaded_at__range=(start_datetime, end_datetime)
        ).count()
        
        # Billing amount
        billing_amount = Invoice.objects.filter(
            issue_date=yesterday
        ).aggregate(total=Sum('total_amount'))['total'] or 0
        
        # Create analytics summary
        summary = AnalyticsSummary.objects.create(
            date=yesterday,
            active_users=active_users,
            new_users=new_users,
            total_api_calls=total_api_calls,
            avg_response_time_ms=avg_response_time,
            documents_processed=documents_processed,
            billing_amount=billing_amount
        )
        
        self.stdout.write(self.style.SUCCESS(f'Successfully generated analytics summary for {yesterday}'))
