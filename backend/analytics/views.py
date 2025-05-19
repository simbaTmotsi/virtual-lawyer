from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from datetime import timedelta, datetime
from django.db.models import Count, Avg, Sum, F, Q
from rest_framework.exceptions import PermissionDenied
from django.db.models.functions import TruncDate, TruncWeek, TruncMonth
import random

from .models import UserActivity, APIUsage, AnalyticsSummary
from accounts.models import User
from cases.models import Case
from billing.models import TimeEntry, Invoice
from documents.models import Document

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def analytics_summary(request):
    """Return summary statistics for dashboard"""
    # Check if user is admin and return admin-specific stats if they are
    if request.user.is_staff or hasattr(request.user, 'is_superuser') and request.user.is_superuser:
        return get_admin_analytics_summary(request)
    else:
        return get_user_analytics_summary(request)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_analytics_summary(request):
    """Return summary statistics for admin dashboard"""
    # Check permissions manually instead of using the decorator
    if not request.user.is_staff and not (hasattr(request.user, 'is_superuser') and request.user.is_superuser):
        # For non-admin users, return a simplified or placeholder response instead of 403
        return get_user_analytics_summary(request)
    return get_admin_analytics_summary(request)


def get_admin_analytics_summary(request):
    """Helper function to get admin analytics summary"""
    # Get total users
    total_users = User.objects.count()
    
    # Get active users in last 24 hours
    now = timezone.now()
    yesterday = now - timedelta(hours=24)
    active_users_24h = UserActivity.objects.filter(
        timestamp__gte=yesterday
    ).values('user').distinct().count()
    
    # Get documents processed
    total_documents = Document.objects.count()
    
    # Get average API response time
    avg_response_time = APIUsage.objects.filter(
        timestamp__gte=yesterday
    ).aggregate(avg_time=Avg('response_time_ms'))['avg_time'] or 0
    
    return Response([
        {
            'name': 'Total Users',
            'value': str(total_users)
        },
        {
            'name': 'Active Users (24h)',
            'value': str(active_users_24h)
        },
        {
            'name': 'Documents Processed',
            'value': str(total_documents)
        },
        {
            'name': 'Avg. API Response Time',
            'value': f"{int(avg_response_time)}ms"
        }
    ])


def get_user_analytics_summary(request):
    """Helper function to get user-specific analytics summary"""
    user = request.user
    
    # Get cases assigned to the user
    active_cases = Case.objects.filter(assigned_attorneys=user, status='active').count()
    
    # Get billable hours for the current month
    month_start = timezone.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    billable_hours = TimeEntry.objects.filter(
        user=user,
        date__gte=month_start,
        is_billable=True
    ).aggregate(total=Sum('hours'))['total'] or 0
    
    # Get revenue for the month (for attorneys)
    monthly_revenue = 0
    if hasattr(user, 'role') and user.role == 'attorney':
        monthly_revenue = Invoice.objects.filter(
            issue_date__gte=month_start,
            status='paid',
            client__in=Case.objects.filter(
                assigned_attorneys=user
            ).values('client')
        ).aggregate(total=Sum('total_amount'))['total'] or 0
    
    # Client satisfaction (mock data for now)
    client_satisfaction = 94  # This would come from actual ratings
    
    return Response([
        {
            'name': 'Active Cases',
            'value': str(active_cases),
            'change': '+2'
        },
        {
            'name': 'Billable Hours',
            'value': f"{round(billable_hours, 1)} hrs",
            'change': '+8%'
        },
        {
            'name': 'Monthly Revenue',
            'value': f"${round(monthly_revenue, 2):,}",
            'change': '+15%'
        },
        {
            'name': 'Client Satisfaction',
            'value': f"{client_satisfaction}%",
            'change': '+3%'
        }
    ])

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_signups(request):
    """Return user signup analytics"""
    # Check if user is admin and return admin-specific stats if they are
    if request.user.is_staff or (hasattr(request.user, 'is_superuser') and request.user.is_superuser):
        return admin_user_signups(request)
    else:
        # For regular users, provide a simplified dataset
        end_date = request.query_params.get('end_date', timezone.now().date().isoformat())
        start_date = request.query_params.get('start_date', (timezone.now().date() - timedelta(days=30)).isoformat())
        return regular_user_signups(request)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_user_signups(request):
    """Return admin-level user signup analytics"""
    # Check permissions manually instead of using the decorator
    if not request.user.is_staff and not (hasattr(request.user, 'is_superuser') and request.user.is_superuser):
        return Response({"detail": "Permission denied. Admin access required."}, status=403)
        
    # Get date range parameters
    end_date = request.query_params.get('end_date', timezone.now().date().isoformat())
    start_date = request.query_params.get('start_date', (timezone.now().date() - timedelta(days=30)).isoformat())
    
    try:
        start_dt = datetime.fromisoformat(start_date)
        end_dt = datetime.fromisoformat(end_date)
    except ValueError:
        # Handle invalid date format
        start_dt = timezone.now().date() - timedelta(days=30)
        end_dt = timezone.now().date()
    
    # Query user signups by date
    signups_by_date = User.objects.filter(
        date_joined__date__gte=start_dt,
        date_joined__date__lte=end_dt
    ).annotate(
        date=TruncDate('date_joined')
    ).values('date').annotate(
        count=Count('id')
    ).order_by('date')
    
    # Generate complete date range with zero counts for missing dates
    date_range = []
    current_dt = start_dt
    
    # Create lookup dictionary from query results
    signup_dict = {item['date'].isoformat(): item['count'] for item in signups_by_date}
    
    while current_dt <= end_dt:
        date_str = current_dt.isoformat()
        date_range.append({
            'date': date_str,
            'count': signup_dict.get(date_str, 0)
        })
        current_dt += timedelta(days=1)
    
    # Calculate totals and growth
    total_signups = sum(item['count'] for item in date_range)
    prev_period_start = start_dt - timedelta(days=(end_dt - start_dt).days)
    prev_period_signups = User.objects.filter(
        date_joined__date__gte=prev_period_start,
        date_joined__date__lt=start_dt
    ).count()
    
    growth_rate = 0
    if prev_period_signups > 0:
        growth_rate = ((total_signups - prev_period_signups) / prev_period_signups) * 100
    
    return Response({
        'data': date_range,
        'total': total_signups,
        'growth': round(growth_rate, 1)
    })

def regular_user_signups(request):
    """Return limited user signup analytics for regular users"""
    # Get date range parameters
    end_date = request.query_params.get('end_date', timezone.now().date().isoformat())
    start_date = request.query_params.get('start_date', (timezone.now().date() - timedelta(days=30)).isoformat())
    
    try:
        start_dt = datetime.fromisoformat(start_date)
        end_dt = datetime.fromisoformat(end_date)
    except ValueError:
        # Handle invalid date format
        start_dt = timezone.now().date() - timedelta(days=30)
        end_dt = timezone.now().date()
    
    # For regular users, we'll return a simplified dataset
    # with just the dates and some general growth trend data
    # but not actual user counts
    
    # Generate date range
    date_range = []
    current_dt = start_dt
    while current_dt <= end_dt:
        date_range.append(current_dt.isoformat())
        current_dt += timedelta(days=1)
    
    # Generate representative data that shows trends but not actual numbers
    # This provides a useful visualization without exposing sensitive data
    base_value = 5  # Base value for trend visualization
    trend_data = []
    
    for i in range(len(date_range)):
        # Generate a value that follows a slight upward trend with randomness
        value = base_value + (i * 0.2) + (random.random() * 4 - 2)
        trend_data.append(max(0, round(value)))
    
    return Response({
        'labels': date_range,
        'datasets': [
            {
                'label': 'Platform Activity',
                'data': trend_data,
                'backgroundColor': 'rgba(59, 130, 246, 0.5)',
                'borderColor': 'rgb(59, 130, 246)',
            }
        ]
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def api_usage(request):
    """Return API usage analytics"""
    # Check if user is admin and return admin-specific stats if they are
    if request.user.is_staff or hasattr(request.user, 'is_superuser') and request.user.is_superuser:
        return admin_api_usage(request)
    else:
        return regular_api_usage(request)

def admin_api_usage(request):
    """Admin-level API usage analytics"""
    # Get date range parameters
    end_date = request.query_params.get('end_date', timezone.now().date().isoformat())
    start_date = request.query_params.get('start_date', (timezone.now().date() - timedelta(days=7)).isoformat())
    
    try:
        start_dt = datetime.fromisoformat(start_date)
        end_dt = datetime.fromisoformat(end_date)
    except ValueError:
        # Handle invalid date format
        start_dt = timezone.now().date() - timedelta(days=7)
        end_dt = timezone.now().date()
    
    # Get top endpoints by usage
    top_endpoints = APIUsage.objects.filter(
        timestamp__date__gte=start_dt,
        timestamp__date__lte=end_dt
    ).values('endpoint').annotate(
        count=Count('id'),
        avg_response_time=Avg('response_time_ms')
    ).order_by('-count')[:10]
    
    # Get usage by day
    usage_by_day = APIUsage.objects.filter(
        timestamp__date__gte=start_dt,
        timestamp__date__lte=end_dt
    ).annotate(
        date=TruncDate('timestamp')
    ).values('date').annotate(
        count=Count('id'),
        avg_response_time=Avg('response_time_ms')
    ).order_by('date')
    
    # Format data for response
    return Response({
        'topEndpoints': top_endpoints,
        'usageByDay': usage_by_day,
        'total': APIUsage.objects.filter(
            timestamp__date__gte=start_dt,
            timestamp__date__lte=end_dt
        ).count()
    })

def regular_api_usage(request):
    """Regular user API usage analytics"""
    # Get date range parameters
    end_date = request.query_params.get('end_date', timezone.now().date().isoformat())
    start_date = request.query_params.get('start_date', (timezone.now().date() - timedelta(days=7)).isoformat())
    
    try:
        start_dt = datetime.fromisoformat(start_date)
        end_dt = datetime.fromisoformat(end_date)
    except ValueError:
        # Handle invalid date format
        start_dt = timezone.now().date() - timedelta(days=7)
        end_dt = timezone.now().date()
    
    # For regular users, only show their own API usage
    user = request.user
    
    # Get the user's API usage statistics (or generate mock data if not available)
    user_api_usage = APIUsage.objects.filter(
        user=user,
        timestamp__date__gte=start_dt,
        timestamp__date__lte=end_dt
    ).values('endpoint').annotate(
        count=Count('id')
    ).order_by('-count')[:6]
    
    # If no data exists, provide representative data
    if not user_api_usage.exists():
        # Common API endpoints for users
        endpoints = [
            'document processing', 'cases', 'calendar', 
            'billing', 'client management', 'research'
        ]
        
        # Generate mock data
        usage_data = [random.randint(3, 30) for _ in range(len(endpoints))]
        
        return Response({
            'labels': endpoints,
            'datasets': [{
                'label': 'API Calls',
                'data': usage_data,
                'backgroundColor': [
                    'rgba(59, 130, 246, 0.7)',
                    'rgba(16, 185, 129, 0.7)',
                    'rgba(245, 158, 11, 0.7)',
                    'rgba(139, 92, 246, 0.7)',
                    'rgba(236, 72, 153, 0.7)',
                    'rgba(239, 68, 68, 0.7)',
                ],
            }]
        })
    
    # Convert the queryset to the expected format for the chart
    endpoints = [item['endpoint'] for item in user_api_usage]
    usage_counts = [item['count'] for item in user_api_usage]
    
    return Response({
        'labels': endpoints,
        'datasets': [{
            'label': 'Your API Usage',
            'data': usage_counts,
            'backgroundColor': [
                'rgba(59, 130, 246, 0.7)',
                'rgba(16, 185, 129, 0.7)',
                'rgba(245, 158, 11, 0.7)',
                'rgba(139, 92, 246, 0.7)',
                'rgba(236, 72, 153, 0.7)',
                'rgba(239, 68, 68, 0.7)',
            ],
        }]
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def case_distribution(request):
    """Return analytics on case distribution"""
    # Check if user is admin and return admin-specific stats
    if request.user.is_staff or hasattr(request.user, 'is_superuser') and request.user.is_superuser:
        return admin_case_distribution(request)
    else:
        return user_case_distribution(request)

def admin_case_distribution(request):
    """Return analytics on case distribution for admins"""
    # Get cases by type
    cases_by_type = Case.objects.values('case_type').annotate(
        count=Count('id')
    ).order_by('-count')
    
    # Get cases by status
    cases_by_status = Case.objects.values('status').annotate(
        count=Count('id')
    ).order_by('-count')
    
    # Get new cases by month
    cases_by_month = Case.objects.annotate(
        month=TruncMonth('date_opened')
    ).values('month').annotate(
        count=Count('id')
    ).order_by('month')
    
    return Response({
        'byType': cases_by_type,
        'byStatus': cases_by_status,
        'byMonth': cases_by_month
    })

def user_case_distribution(request):
    """Return analytics on case distribution for a regular user"""
    user = request.user
    
    # Get only cases associated with this user
    user_cases = Case.objects.filter(assigned_attorneys=user)
    
    # Get cases by type for this user
    cases_by_type = user_cases.values('case_type').annotate(
        count=Count('id')
    ).order_by('-count')
    
    # Get cases by status for this user
    cases_by_status = user_cases.values('status').annotate(
        count=Count('id')
    ).order_by('-count')
    
    # If the user has no cases, return representative data
    if not user_cases.exists():
        # Common case types
        case_types = ['Family Law', 'Criminal', 'Corporate', 'Real Estate', 'Immigration', 'Other']
        case_counts = [random.randint(0, 5) for _ in range(len(case_types))]
        
        return Response({
            'labels': case_types,
            'datasets': [
                {
                    'label': 'Cases by Type',
                    'data': case_counts,
                    'backgroundColor': [
                        'rgba(59, 130, 246, 0.7)',
                        'rgba(16, 185, 129, 0.7)',
                        'rgba(245, 158, 11, 0.7)',
                        'rgba(139, 92, 246, 0.7)',
                        'rgba(236, 72, 153, 0.7)',
                        'rgba(239, 68, 68, 0.7)',
                    ],
                    'borderWidth': 1
                }
            ]
        })
    
    # Format the response to match the expected chart format
    types = [item['case_type'] for item in cases_by_type]
    counts = [item['count'] for item in cases_by_type]
    
    return Response({
        'labels': types,
        'datasets': [
            {
                'label': 'Your Cases by Type',
                'data': counts,
                'backgroundColor': [
                    'rgba(59, 130, 246, 0.7)',
                    'rgba(16, 185, 129, 0.7)',
                    'rgba(245, 158, 11, 0.7)',
                    'rgba(139, 92, 246, 0.7)',
                    'rgba(236, 72, 153, 0.7)',
                    'rgba(239, 68, 68, 0.7)',
                ],
                'borderWidth': 1
            }
        ]
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def analytics_stats(request):
    """Return analytics stats for the current user"""
    user = request.user
    
    # Get cases assigned to the user (for attorneys/paralegals)
    user_cases = Case.objects.filter(assigned_attorneys=user).count()
    
    # Get time entries for the user
    month_start = timezone.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    billable_hours = TimeEntry.objects.filter(
        user=user,
        date__gte=month_start,
        is_billable=True
    ).aggregate(total=Sum('hours'))['total'] or 0
    
    # Get client count (for attorneys)
    unique_clients = 0
    if user.role == 'attorney':
        # Get unique clients from cases
        unique_clients = Case.objects.filter(
            assigned_attorneys=user
        ).values('client').distinct().count()
    
    return Response({
        'activeCases': user_cases,
        'billableHours': round(billable_hours, 1),
        'clients': unique_clients
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def analytics_cases(request):
    """Return case analytics for the current user"""
    user = request.user
    
    # Get cases assigned to the user by status
    cases_by_status = Case.objects.filter(
        assigned_attorneys=user
    ).values('status').annotate(
        count=Count('id')
    )
    
    # Get cases by age
    today = timezone.now().date()
    cases_age = []
    
    # 0-30 days
    cases_age.append({
        'range': '0-30 days',
        'count': Case.objects.filter(
            assigned_attorneys=user,
            date_opened__gte=today - timedelta(days=30)
        ).count()
    })
    
    # 31-90 days
    cases_age.append({
        'range': '31-90 days',
        'count': Case.objects.filter(
            assigned_attorneys=user,
            date_opened__lt=today - timedelta(days=30),
            date_opened__gte=today - timedelta(days=90)
        ).count()
    })
    
    # 91+ days
    cases_age.append({
        'range': '91+ days',
        'count': Case.objects.filter(
            assigned_attorneys=user,
            date_opened__lt=today - timedelta(days=90)
        ).count()
    })
    
    return Response({
        'byStatus': cases_by_status,
        'byAge': cases_age
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def analytics_time_tracking(request):
    """Return time tracking analytics for the current user"""
    user = request.user
    end_date = timezone.now().date()
    start_date = end_date - timedelta(days=30)
    
    # Get daily time entries
    daily_hours = TimeEntry.objects.filter(
        user=user,
        date__gte=start_date,
        date__lte=end_date
    ).values('date').annotate(
        billable=Sum('hours', filter=Q(is_billable=True)),
        non_billable=Sum('hours', filter=Q(is_billable=False))
    ).order_by('date')
    
    # Get time by case
    time_by_case = TimeEntry.objects.filter(
        user=user,
        date__gte=start_date,
        date__lte=end_date
    ).values('case__title').annotate(
        hours=Sum('hours')
    ).order_by('-hours')[:5]
    
    return Response({
        'dailyHours': daily_hours,
        'timeByCase': time_by_case,
        'totalBillable': TimeEntry.objects.filter(
            user=user,
            date__gte=start_date,
            date__lte=end_date,
            is_billable=True
        ).aggregate(total=Sum('hours'))['total'] or 0
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def analytics_billing(request):
    """Return billing analytics"""
    user = request.user
    
    # For attorneys, get invoices for their cases
    user_invoices = Invoice.objects.filter(
        client__in=Case.objects.filter(
            assigned_attorneys=user
        ).values('client')
    )
    
    # Get invoice status counts
    invoice_status = user_invoices.values('status').annotate(
        count=Count('id'),
        total=Sum('total_amount')
    )
    
    # Get recent invoice summary
    month_start = timezone.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    this_month = user_invoices.filter(
        issue_date__gte=month_start
    ).aggregate(
        count=Count('id'),
        total=Sum('total_amount')
    )
    
    return Response({
        'byStatus': invoice_status,
        'thisMonth': {
            'count': this_month['count'] or 0,
            'total': this_month['total'] or 0
        }
    })
