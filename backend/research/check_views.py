import os
import sys

# Get the Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'easylaw.settings')

# Add the parent directory to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import Django and set up the environment
import django
django.setup()

# Now try to import the views module
try:
    from research import views
    print("Successfully imported views module")
    print("Available attributes:", dir(views))
    if hasattr(views, 'ResearchViewSet'):
        print("ResearchViewSet is defined in views module")
    else:
        print("ERROR: ResearchViewSet is NOT defined in views module")
except Exception as e:
    print(f"Error importing views module: {e}")
