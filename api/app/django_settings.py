"""
Django settings file specifically for the FastAPI app integration.
This is a simplified settings file that only includes what's necessary
for Django integration with the FastAPI app.
"""

import os
from pathlib import Path

# Build paths inside the project like this: BASE_DIR / 'subdir'.
# Build paths inside the project like this: BASE_DIR / 'subdir'.
# Pointing to the backend directory
BASE_DIR = Path(__file__).resolve().parent.parent.parent / 'backend'

# Use an absolute path for the database
DB_PATH = BASE_DIR / 'db.sqlite3'
print(f"Using database at path: {DB_PATH}")

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY', 'django-insecure-default-development-key')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.environ.get('DJANGO_DEBUG', 'True') == 'True'

ALLOWED_HOSTS = ['*']

# Application definition - only include what's necessary for FastAPI integration
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'corsheaders',
    'rest_framework',
    'rest_framework_simplejwt',
    
    # Only essential apps for API functionality
    'backend.admin_portal',
    # Temporarily comment out other apps to avoid import conflicts
    # 'backend.accounts',
    # 'backend.analytics',
    # 'backend.billing',
    # 'backend.calendar_app',
    # 'backend.cases',
    # 'backend.clients',
    # 'backend.dashboard',
    # 'backend.documents',
    # 'backend.research',
    # 'backend.diary_app',
    # 'backend.notifications',
    # 'backend.easylaw',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'virtual_lawyer.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

# Database - use the same database as the main Django app
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': str(DB_PATH),  # Use the absolute path as string
    }
}

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# Static files
STATIC_URL = '/static/'

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# CORS Configuration
CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_CREDENTIALS = True
