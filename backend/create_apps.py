import os
import sys

# List of apps to create
apps = [
    'accounts',
    'admin_portal',
    'clients',
    'cases',
    'documents',
    'research',
    'billing',
    'calendar_app',
]

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Basic files to create in each app
files = {
    '__init__.py': '# {app} app initialization',
    'urls.py': '''from django.urls import path
from . import views

urlpatterns = [
    # Add {app} URL patterns here
]''',
    'views.py': '''from django.shortcuts import render
from rest_framework import viewsets, permissions

# Create your {app} views here
''',
    'models.py': '''from django.db import models

# Create your {app} models here
'''
}

def create_apps():
    for app in apps:
        app_dir = os.path.join(BASE_DIR, app)
        
        # Create app directory if it doesn't exist
        if not os.path.exists(app_dir):
            os.makedirs(app_dir)
            print(f"Created directory: {app_dir}")
        
        # Create basic files in the app directory
        for filename, content in files.items():
            file_path = os.path.join(app_dir, filename)
            
            # Only create file if it doesn't exist
            if not os.path.exists(file_path):
                with open(file_path, 'w') as f:
                    f.write(content.format(app=app))
                print(f"Created file: {file_path}")

if __name__ == "__main__":
    create_apps()
    print("All app directories and files created successfully!")
