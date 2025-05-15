from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from datetime import datetime, timedelta
from django.db.models import Sum, Count, Q
from django.utils import timezone

# Import necessary models
from cases.models import Case
from billing.models import TimeEntry, Invoice
from clients.models import Client

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    """Return key statistics for the dashboard"""
    # Get data from the database
    now = timezone.now()
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    
    # Count active cases
    active_cases_count = Case.objects.filter(status='active').count()
    
    # Calculate total billable hours this month
    billable_hours = TimeEntry.objects.filter(
        is_billable=True, 
        date__gte=month_start
    ).aggregate(total=Sum('hours'))['total'] or 0
    
    # Calculate revenue this month
    monthly_revenue = Invoice.objects.filter(
        issue_date__gte=month_start
    ).aggregate(total=Sum('total_amount'))['total'] or 0
    
    # Count new clients this month
    new_clients = Client.objects.filter(date_added__gte=month_start).count()
    
    stats = [
        {
            'name': 'Active Cases',
            'value': str(active_cases_count),
            'change': '+12%',  # This would require historical data to calculate properly
        },
        {
            'name': 'Billable Hours',
            'value': str(int(billable_hours)),
            'change': '+8%',  # This would require historical data to calculate properly
        },
        {
            'name': 'Monthly Revenue',
            'value': f'${monthly_revenue:,.2f}',
            'change': '+15%',  # This would require historical data to calculate properly
        },
        {
            'name': 'New Clients',
            'value': str(new_clients),
            'change': '+33%',  # This would require historical data to calculate properly
        }
    ]
    return Response(stats)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_deadlines(request):
    """Return upcoming deadlines"""
    from calendar_app.models import Event
    
    # Get deadline events from the database
    now = timezone.now()
    two_weeks_later = now + timedelta(days=14)
    
    deadlines = Event.objects.filter(
        event_type='deadline',
        start_time__gte=now,
        start_time__lte=two_weeks_later
    ).select_related('case').order_by('start_time')[:5]
    
    formatted_deadlines = []
    for deadline in deadlines:
        # Calculate relative date
        if deadline.start_time.date() == now.date():
            due_date = "Today"
        elif deadline.start_time.date() == (now + timedelta(days=1)).date():
            due_date = "Tomorrow"
        else:
            due_date = deadline.start_time.strftime("%B %d, %Y")
            
        # Determine priority
        days_until = (deadline.start_time.date() - now.date()).days
        priority = "Urgent" if days_until <= 2 else "High" if days_until <= 5 else "Medium"
        
        formatted_deadlines.append({
            'id': deadline.id,
            'title': deadline.title,
            'case': deadline.case.title if deadline.case else "No case assigned",
            'priority': priority,
            'dueDate': due_date
        })
        
    return Response(formatted_deadlines)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_events(request):
    """Return upcoming events"""
    from calendar_app.models import Event
    
    # Get events from the database (excluding deadlines)
    now = timezone.now()
    two_weeks_later = now + timedelta(days=14)
    
    events = Event.objects.filter(
        ~Q(event_type='deadline'),  # Exclude deadlines as they're handled in dashboard_deadlines
        start_time__gte=now,
        start_time__lte=two_weeks_later
    ).select_related('case').order_by('start_time')[:5]
    
    formatted_events = []
    for event in events:
        # Get client name if available
        client_name = "N/A"
        if event.case and event.case.client:
            client_name = event.case.client.full_name
            
        formatted_events.append({
            'id': event.id,
            'title': event.title,
            'client': client_name,
            'date': event.start_time.strftime("%B %d, %Y"),
            'time': event.start_time.strftime("%I:%M %p"),
            'location': event.location or "Not specified"
        })
        
    return Response(formatted_events)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_active_cases(request):
    """Return active cases"""
    from cases.models import Case
    
    # Get active cases from the database
    active_cases = Case.objects.filter(
        status='active'
    ).select_related('client').order_by('-last_updated')[:10]
    
    formatted_cases = []
    now = timezone.now()
    
    for case in active_cases:
        # Calculate relative date for last action
        last_action_date = "Unknown"
        if case.last_updated:
            days_diff = (now.date() - case.last_updated.date()).days
            if days_diff == 0:
                last_action_date = "Today"
            elif days_diff == 1:
                last_action_date = "Yesterday"
            elif days_diff < 7:
                last_action_date = f"{days_diff} days ago"
            else:
                last_action_date = case.last_updated.strftime("%B %d, %Y")
        
        # For a real implementation, these progress values would likely be stored or calculated
        # Here we're using a dummy value based on status
        progress = 25  # Default progress value
        if case.status == 'active':
            progress = 65
        elif case.status == 'pending':
            progress = 40
        elif case.status == 'closed':
            progress = 100
        
        formatted_cases.append({
            'id': case.id,
            'title': case.title,
            'type': case.case_type or "General",
            'status': case.status.capitalize(),
            'progress': progress,
            'lastAction': "Updated",  # In a real implementation, we would track actual actions
            'lastActionDate': last_action_date
        })
        
    return Response(formatted_cases)
