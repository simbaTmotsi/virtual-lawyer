from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from datetime import timedelta, datetime
from django.db.models import Count, Avg, Sum, F, Q
from django.db.models.functions import TruncDate, TruncWeek, TruncMonth

from .models import UserActivity, APIUsage, AnalyticsSummary
from accounts.models import User
from cases.models import Case
from billing.models import TimeEntry, Invoice
from documents.models import Document

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def analytics_summary(request):
    """Return summary statistics for admin dashboard"""
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

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def user_signups(request):
    """Return user signup analytics"""
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

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def api_usage(request):
    """Return API usage analytics"""
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

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def case_distribution(request):
    """Return analytics on case distribution"""
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
