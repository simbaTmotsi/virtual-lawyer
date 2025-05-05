#!/bin/sh

# Wait for postgres to be available
if [ "$DATABASE" = "postgres" ]
then
    echo "Waiting for postgres..."

    while ! nc -z $DB_HOST $DB_PORT; do
      sleep 0.1
    done

    echo "PostgreSQL started"
fi

# Run the database creation script
echo "Checking database existence..."
python create_database.py

# Run migrations
python manage.py migrate

# Create superuser if needed
python manage.py createsuperuser --noinput --email admin@example.com --first_name Admin --last_name User --role admin || true

exec "$@"
