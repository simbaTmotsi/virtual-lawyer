#!/usr/bin/env python
"""
Migration creation script for EasyLaw.
This script creates initial migrations for all apps.
"""
import os
import subprocess
import django

def create_migrations():
    """Create initial migrations for all apps."""
    # List of all apps that need migrations
    apps = [
        'accounts',
        'admin_portal',
        'analytics',
        'clients',
        'cases',
        'documents',
        'research',
        'billing',
        'calendar_app',
        'dashboard',
        'notifications',
    ]
    
    # Create migrations
    for app in apps:
        print(f"Creating migrations for {app}...")
        result = subprocess.run(['python', 'manage.py', 'makemigrations', app], capture_output=True, text=True)
        if result.returncode == 0:
            print(f"✅ Successfully created migrations for {app}")
        else:
            print(f"❌ Failed to create migrations for {app}")
            print(f"Error: {result.stderr}")
    
    # Create migrations for any apps that might have been missed
    print("Creating migrations for any remaining apps...")
    subprocess.run(['python', 'manage.py', 'makemigrations'])
    
    print("\nAll migrations created. Now run 'python manage.py migrate accounts' first, then 'python manage.py migrate'")

if __name__ == "__main__":
    # Set Django settings module
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
    create_migrations()
