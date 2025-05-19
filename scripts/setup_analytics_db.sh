#!/bin/bash
# This script ensures that the necessary analytics tables are created in the database

cd /Users/simbatmotsi/Documents/Projects/virtual-lawyer/backend

# Make migrations for analytics app
python manage.py makemigrations analytics

# Apply migrations
python manage.py migrate

# Create a management command to populate initial analytics data 
mkdir -p analytics/management/commands
cat > analytics/management/commands/populate_analytics_data.py << 'EOL'
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
import random

from analytics.models import UserActivity, APIUsage, AnalyticsSummary

User = get_user_model()

class Command(BaseCommand):
    help = 'Populates the analytics tables with initial data'

    def handle(self, *args, **options):
        # Generate analytics summary data for the last 30 days
        today = timezone.now().date()
        
        # If there's no analytics data, create it
        if AnalyticsSummary.objects.count() == 0:
            self.stdout.write("Creating Analytics Summary data...")
            for i in range(30):
                date = today - timedelta(days=i)
                active_users = random.randint(5, 20)
                new_users = random.randint(0, 3)
                total_api_calls = random.randint(50, 200)
                avg_response_time = random.uniform(50, 200)
                documents_processed = random.randint(10, 50)
                billing_amount = random.uniform(1000, 5000)
                
                AnalyticsSummary.objects.create(
                    date=date,
                    active_users=active_users,
                    new_users=new_users,
                    total_api_calls=total_api_calls,
                    avg_response_time_ms=avg_response_time,
                    documents_processed=documents_processed,
                    billing_amount=billing_amount
                )
            self.stdout.write(self.style.SUCCESS("Analytics Summary data created successfully"))
        else:
            self.stdout.write("Analytics Summary data already exists")
        
        # Create some user activity data
        if UserActivity.objects.count() == 0:
            self.stdout.write("Creating User Activity data...")
            users = User.objects.all()
            if users.exists():
                activity_types = [
                    'login', 'logout', 'document_view', 'document_edit', 
                    'case_view', 'api_call', 'billing_view'
                ]
                
                for user in users:
                    # Create activities for each user
                    for i in range(random.randint(5, 15)):
                        days_ago = random.randint(0, 14)
                        activity_type = random.choice(activity_types)
                        timestamp = timezone.now() - timedelta(days=days_ago, hours=random.randint(0, 23))
                        
                        UserActivity.objects.create(
                            user=user,
                            activity_type=activity_type,
                            details={'page': f'/{activity_type.replace("_", "/")}'},
                            ip_address='127.0.0.1',
                            user_agent='Mozilla/5.0',
                            timestamp=timestamp
                        )
                self.stdout.write(self.style.SUCCESS("User Activity data created successfully"))
            else:
                self.stdout.write("No users found, skipping user activity data creation")
        else:
            self.stdout.write("User Activity data already exists")
        
        # Create API usage data
        if APIUsage.objects.count() == 0:
            self.stdout.write("Creating API Usage data...")
            if users.exists():
                endpoints = [
                    '/api/cases/', '/api/clients/', '/api/documents/',
                    '/api/calendar/', '/api/billing/', '/api/analytics/'
                ]
                methods = ['GET', 'POST', 'PUT', 'DELETE']
                status_codes = [200, 201, 400, 403, 404, 500]
                
                for i in range(300):  # Create 300 API usage records
                    days_ago = random.randint(0, 14)
                    user = random.choice(users) if random.random() > 0.1 else None  # Some anonymous requests
                    endpoint = random.choice(endpoints)
                    method = random.choice(methods)
                    status_code = random.choice(status_codes)
                    # Success status codes are more likely
                    if method == 'GET':
                        status_code = 200 if random.random() > 0.2 else status_code
                    elif method == 'POST':
                        status_code = 201 if random.random() > 0.3 else status_code
                    
                    timestamp = timezone.now() - timedelta(days=days_ago, hours=random.randint(0, 23))
                    response_time = random.randint(20, 500)  # 20ms to 500ms
                    
                    APIUsage.objects.create(
                        user=user,
                        endpoint=endpoint,
                        method=method,
                        status_code=status_code,
                        response_time_ms=response_time,
                        timestamp=timestamp
                    )
                self.stdout.write(self.style.SUCCESS("API Usage data created successfully"))
            else:
                self.stdout.write("No users found, skipping API usage data creation")
        else:
            self.stdout.write("API Usage data already exists")
EOL

# Run the management command to populate analytics data
python manage.py populate_analytics_data

echo "Analytics database setup complete!"
