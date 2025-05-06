#!/bin/bash
cd /Users/simbatmotsi/Documents/Projects/virtual-lawyer/backend

# Create migration for calendar_app
python manage.py makemigrations calendar_app

# Apply all pending migrations
python manage.py migrate
