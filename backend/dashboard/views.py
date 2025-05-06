from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from datetime import datetime, timedelta

# Mock data for dashboard APIs - replace with database queries later
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    """Return key statistics for the dashboard"""
    # In a real implementation, get this data from the database
    stats = [
        {
            'name': 'Active Cases',
            'value': '24',
            'change': '+12%',
        },
        {
            'name': 'Billable Hours',
            'value': '186',
            'change': '+8%',
        },
        {
            'name': 'Monthly Revenue',
            'value': '$25,450',
            'change': '+15%',
        },
        {
            'name': 'New Clients',
            'value': '12',
            'change': '+33%',
        }
    ]
    return Response(stats)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_deadlines(request):
    """Return upcoming deadlines"""
    # In a real implementation, get this data from the database
    deadlines = [
        {
            'id': 1,
            'title': 'File Pre-Trial Motion',
            'case': 'Smith v. Johnson',
            'priority': 'Urgent',
            'dueDate': 'Tomorrow'
        },
        {
            'id': 2,
            'title': 'Submit Patent Application',
            'case': 'TechCorp IP Filing',
            'priority': 'High',
            'dueDate': 'May 10, 2025'
        },
        {
            'id': 3,
            'title': 'Prepare Discovery Documents',
            'case': 'Alvarez Dispute',
            'priority': 'Medium',
            'dueDate': 'May 15, 2025'
        }
    ]
    return Response(deadlines)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_events(request):
    """Return upcoming events"""
    # In a real implementation, get this data from the database
    events = [
        {
            'id': 1,
            'title': 'Client Meeting',
            'client': 'John Smith',
            'date': 'May 7, 2025',
            'time': '10:00 AM',
            'location': 'Office'
        },
        {
            'id': 2,
            'title': 'Court Hearing',
            'client': 'Williams Family',
            'date': 'May 12, 2025',
            'time': '9:30 AM',
            'location': 'County Courthouse'
        },
        {
            'id': 3,
            'title': 'Settlement Conference',
            'client': 'TechCorp',
            'date': 'May 14, 2025',
            'time': '2:00 PM',
            'location': 'Zoom Meeting'
        }
    ]
    return Response(events)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_active_cases(request):
    """Return active cases"""
    # In a real implementation, get this data from the database
    cases = [
        {
            'id': 1,
            'title': 'Smith v. Johnson',
            'type': 'Personal Injury',
            'status': 'Active',
            'progress': 65,
            'lastAction': 'Filed motion',
            'lastActionDate': 'Yesterday'
        },
        {
            'id': 2,
            'title': 'TechCorp IP Filing',
            'type': 'Intellectual Property',
            'status': 'Active',
            'progress': 40,
            'lastAction': 'Draft review',
            'lastActionDate': '3 days ago'
        },
        {
            'id': 3,
            'title': 'Alvarez Dispute',
            'type': 'Contract',
            'status': 'Active',
            'progress': 85,
            'lastAction': 'Settlement proposal',
            'lastActionDate': 'Today'
        }
    ]
    return Response(cases)
