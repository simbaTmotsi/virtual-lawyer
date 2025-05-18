#!/bin/bash
# This script sets up the database and creates tables when they don't exist

cd "$(dirname "$0")"

# 1. Create a .env file if it doesn't exist
if [ ! -f .env ]; then
  echo "Creating .env file..."
  cat > .env <<EOL
# Database Configuration
DB_NAME=easylaw
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432

# JWT Settings
DJANGO_SECRET_KEY=$(python -c 'import secrets; print(secrets.token_hex(32))')

# API Keys
OPENAI_API_KEY=
GEMINI_API_KEY=

# External Auth
EXTERNAL_AUTH_LOGIN_URL=http://localhost:8001/auth/login
USE_EXTERNAL_AUTH=True

# Debug Settings
DJANGO_DEBUG=True
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1
EOL

  echo ".env file created successfully."
fi

# 2. Create a copy of the .env file for the API directory
cp .env api/.env
echo "Copied .env to api/.env"

# 3. Check if PostgreSQL is running
echo "Checking if PostgreSQL is running..."
pg_isready -h localhost -p 5432 > /dev/null 2>&1
if [ $? -ne 0 ]; then
  echo "PostgreSQL is not running. Please start PostgreSQL service first."
  exit 1
fi

# 4. Create the database if it doesn't exist
echo "Running database creation script..."
cd backend
python create_database.py

# 5. Create migrations for all apps
echo "Creating migrations for all apps..."
python create_migrations.py

# 6. Apply migrations
echo "Applying migrations..."
python manage.py migrate

# 7. Create a superuser if it doesn't exist
echo "Creating superuser if needed..."
python manage.py shell -c "from django.contrib.auth import get_user_model; User = get_user_model(); User.objects.filter(email='admin@example.com').exists() or User.objects.create_superuser('admin@example.com', 'adminpassword', first_name='Admin', last_name='User', role='admin')"

echo "Setup complete! You can now run the backend with: python backend/manage.py runserver"
echo "Default admin credentials: admin@example.com / adminpassword"
