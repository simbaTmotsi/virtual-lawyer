from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from datetime import timedelta, datetime
import random

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def mock_analytics_summary(request):
    """Temporary mock implementation for analytics summary stats"""
    return Response([
        {
            'name': 'Total Users',
            'value': str(random.randint(80, 150))
        },
        {
            'name': 'Active Users (24h)',
            'value': str(random.randint(20, 50))
        },
        {
            'name': 'Documents Processed',
            'value': str(random.randint(350, 800))
        },
        {
            'name': 'Avg. API Response Time',
            'value': f"{random.randint(80, 300)}ms"
        }
    ])

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def mock_user_signups(request):
    """Temporary mock implementation for user signup analytics"""
    # Get date range parameters or use defaults
    end_date = request.query_params.get('end_date', timezone.now().date().isoformat())
    start_date = request.query_params.get('start_date', (timezone.now().date() - timedelta(days=30)).isoformat())
    
    try:
        start_dt = datetime.fromisoformat(start_date)
        end_dt = datetime.fromisoformat(end_date)
    except ValueError:
        # Handle invalid date format
        start_dt = timezone.now().date() - timedelta(days=30)
        end_dt = timezone.now().date()
    
    # Generate daily data points between start and end dates
    date_range = []
    current_dt = start_dt
    while current_dt <= end_dt:
        date_range.append(current_dt.isoformat())
        current_dt += timedelta(days=1)
    
    # Generate mock signup data
    signups_data = [random.randint(0, 8) for _ in range(len(date_range))]
    
    return Response({
        'labels': date_range,
        'datasets': [
            {
                'label': 'User Signups',
                'data': signups_data,
                'backgroundColor': 'rgba(59, 130, 246, 0.5)',
                'borderColor': 'rgb(59, 130, 246)',
            }
        ]
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def mock_api_usage(request):
    """Temporary mock implementation for API usage analytics"""
    # Generate data for different API endpoints
    endpoints = [
        'user management', 'document processing', 
        'billing', 'cases', 'calendar', 'research'
    ]
    
    usage_data = [random.randint(50, 500) for _ in range(len(endpoints))]
    
    return Response({
        'labels': endpoints,
        'datasets': [
            {
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
                'borderWidth': 1
            }
        ]
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def mock_case_distribution(request):
    """Temporary mock implementation for case distribution analytics"""
    case_types = ['Family Law', 'Criminal', 'Corporate', 'Real Estate', 'Immigration', 'Other']
    case_counts = [random.randint(10, 50) for _ in range(len(case_types))]
    
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

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def mock_user_signups(request):
    """Temporary mock implementation for user signup analytics"""
    # Get date range parameters or use defaults
    end_date = request.query_params.get('end_date', timezone.now().date().isoformat())
    start_date = request.query_params.get('start_date', (timezone.now().date() - timedelta(days=30)).isoformat())
    
    try:
        start_dt = datetime.fromisoformat(start_date)
        end_dt = datetime.fromisoformat(end_date)
    except ValueError:
        # Handle invalid date format
        start_dt = timezone.now().date() - timedelta(days=30)
        end_dt = timezone.now().date()
    
    # Generate daily data points between start and end dates
    date_range = []
    current_dt = start_dt
    while current_dt <= end_dt:
        date_range.append(current_dt.isoformat())
        current_dt += timedelta(days=1)
    
    # Generate mock signup data
    signups_data = [random.randint(0, 8) for _ in range(len(date_range))]
    
    return Response({
        'labels': date_range,
        'datasets': [
            {
                'label': 'User Signups',
                'data': signups_data,
                'backgroundColor': 'rgba(59, 130, 246, 0.5)',
                'borderColor': 'rgb(59, 130, 246)',
            }
        ]
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def mock_api_usage(request):
    """Temporary mock implementation for API usage analytics"""
    # Generate data for different API endpoints
    endpoints = [
        'user management', 'document processing', 
        'billing', 'cases', 'calendar', 'research'
    ]
    
    usage_data = [random.randint(50, 500) for _ in range(len(endpoints))]
    
    return Response({
        'labels': endpoints,
        'datasets': [
            {
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
                'borderWidth': 1
            }
        ]
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def mock_case_distribution(request):
    """Temporary mock implementation for case distribution analytics"""
    case_types = ['Family Law', 'Criminal', 'Corporate', 'Real Estate', 'Immigration', 'Other']
    case_counts = [random.randint(10, 50) for _ in range(len(case_types))]
    
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

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def mock_billing_analytics(request):
    """Temporary mock implementation for billing analytics"""
    # Get date range parameters or use defaults
    end_date = request.query_params.get('end_date', timezone.now().date().isoformat())
    start_date = request.query_params.get('start_date', (timezone.now().date() - timedelta(days=180)).isoformat())
    
    try:
        start_dt = datetime.fromisoformat(start_date)
        end_dt = datetime.fromisoformat(end_date)
    except ValueError:
        # Handle invalid date format
        start_dt = timezone.now().date() - timedelta(days=180)
        end_dt = timezone.now().date()
    
    # Generate monthly data
    months = []
    current_dt = start_dt.replace(day=1)
    while current_dt <= end_dt:
        months.append(current_dt.strftime('%b %Y'))
        if current_dt.month == 12:
            current_dt = current_dt.replace(year=current_dt.year + 1, month=1)
        else:
            current_dt = current_dt.replace(month=current_dt.month + 1)
    
    # Generate mock billing data
    invoiced_data = [random.randint(5000, 20000) for _ in range(len(months))]
    collected_data = [int(invoiced_data[i] * random.uniform(0.7, 0.95)) for i in range(len(months))]
    
    return Response({
        'labels': months,
        'datasets': [
            {
                'label': 'Invoiced Amount',
                'data': invoiced_data,
                'backgroundColor': 'rgba(59, 130, 246, 0.5)',
                'borderColor': 'rgb(59, 130, 246)',
                'borderWidth': 2
            },
            {
                'label': 'Collected Amount',
                'data': collected_data,
                'backgroundColor': 'rgba(16, 185, 129, 0.5)',
                'borderColor': 'rgb(16, 185, 129)',
                'borderWidth': 2
            }
        ]
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def mock_time_tracking_analytics(request):
    """Temporary mock implementation for time tracking analytics"""
    # Generate data for hours tracked per attorney
    attorneys = [
        'John Smith', 'Sarah Johnson', 'Michael Wong', 
        'Emily Davis', 'Robert Taylor'
    ]
    
    billable_hours = [random.randint(20, 120) for _ in range(len(attorneys))]
    non_billable_hours = [random.randint(5, 30) for _ in range(len(attorneys))]
    
    return Response({
        'labels': attorneys,
        'datasets': [
            {
                'label': 'Billable Hours',
                'data': billable_hours,
                'backgroundColor': 'rgba(59, 130, 246, 0.7)',
                'stack': 'Stack 0',
            },
            {
                'label': 'Non-Billable Hours',
                'data': non_billable_hours,
                'backgroundColor': 'rgba(209, 213, 219, 0.7)',
                'stack': 'Stack 0',
            }
        ]
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def mock_analytics_stats(request):
    """Mock implementation for analytics stats"""
    stats = [
        {
            'name': 'Active Cases',
            'value': random.randint(15, 30),
            'change': f"+{random.randint(1, 10)}%"
        },
        {
            'name': 'Total Billable Hours',
            'value': f"{random.randint(120, 200)} hrs",
            'change': f"+{random.randint(3, 8)}%"
        },
        {
            'name': 'Monthly Revenue',
            'value': f"${random.randint(15000, 25000)}",
            'change': f"+{random.randint(5, 15)}%"
        },
        {
            'name': 'Completion Rate',
            'value': f"{random.randint(85, 98)}%",
            'change': f"+{random.randint(1, 5)}%"
        }
    ]
    
    return Response(stats)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def mock_analytics_cases(request):
    """Mock implementation for case metrics"""
    period = request.query_params.get('period', '30d')
    
    # Number of data points based on period
    num_points = 7 if period == '7d' else 12 if period == '30d' else 12
    
    # Get labels based on period
    if period == '7d':
        # Last 7 days
        labels = [(timezone.now() - timedelta(days=i)).strftime('%a') for i in range(6, -1, -1)]
    elif period == '30d':
        # Last 30 days grouped by week
        labels = [f"Week {i+1}" for i in range(4)]
    else:
        # Last 90 days grouped by month
        labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][:num_points]
    
    # Generate random data
    opened = [random.randint(1, 10) for _ in range(len(labels))]
    closed = [random.randint(1, 10) for _ in range(len(labels))]
    
    data = {
        'labels': labels,
        'datasets': [
            {
                'label': 'Cases Opened',
                'data': opened,
                'backgroundColor': 'rgba(59, 130, 246, 0.5)',
                'borderColor': 'rgb(59, 130, 246)',
                'borderWidth': 1
            },
            {
                'label': 'Cases Closed',
                'data': closed,
                'backgroundColor': 'rgba(16, 185, 129, 0.5)',
                'borderColor': 'rgb(16, 185, 129)',
                'borderWidth': 1
            }
        ]
    }
    
    return Response(data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def mock_analytics_time_tracking(request):
    """Temporary mock implementation for time tracking analytics"""
    # Generate attorney names
    attorneys = ['Smith, J.', 'Johnson, A.', 'Williams, R.', 'Brown, M.', 'Davis, S.']
    
    # Generate random hours for each attorney
    hours_data = [random.uniform(20, 120) for _ in range(len(attorneys))]
    hours_data.sort(reverse=True)  # Sort in descending order
    
    # Generate billable percentage for each attorney
    billable_percentage = [random.uniform(60, 95) for _ in range(len(attorneys))]
    
    return Response({
        'labels': attorneys,
        'datasets': [
            {
                'label': 'Hours Logged',
                'data': [round(h, 1) for h in hours_data],
                'backgroundColor': 'rgba(59, 130, 246, 0.7)',
                'borderColor': 'rgb(59, 130, 246)',
            },
            {
                'label': 'Billable %',
                'data': [round(p, 1) for p in billable_percentage],
                'backgroundColor': 'rgba(245, 158, 11, 0.7)',
                'borderColor': 'rgb(245, 158, 11)',
            }
        ]
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def mock_analytics_billing(request):
    """Temporary mock implementation for billing analytics"""
    # Get date range parameters or use defaults
    end_date = request.query_params.get('end_date', timezone.now().date().isoformat())
    start_date = request.query_params.get('start_date', (timezone.now().date() - timedelta(days=30)).isoformat())
    
    # Generate monthly revenue data
    months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    current_month = timezone.now().month - 1  # 0-based index
    
    # Get last 6 months for labels
    labels = []
    for i in range(5, -1, -1):
        month_index = (current_month - i) % 12
        labels.append(months[month_index])
    
    # Generate random data for invoiced and collected amounts
    invoiced_data = [random.randint(15000, 35000) for _ in range(6)]
    collected_data = [int(amount * random.uniform(0.7, 0.95)) for amount in invoiced_data]
    
    return Response({
        'labels': labels,
        'datasets': [
            {
                'label': 'Invoiced',
                'data': invoiced_data,
                'backgroundColor': 'rgba(59, 130, 246, 0.5)',
                'borderColor': 'rgb(59, 130, 246)',
            },
            {
                'label': 'Collected',
                'data': collected_data,
                'backgroundColor': 'rgba(16, 185, 129, 0.5)',
                'borderColor': 'rgb(16, 185, 129)',
            }
        ]
    })
