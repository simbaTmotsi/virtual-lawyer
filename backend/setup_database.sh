#!/bin/bash
# Initialize database and run migrations

echo "🔄 Setting up database and migrations for EasyLaw..."

# Create database if it doesn't exist
echo "📦 Creating database if needed..."
python create_database.py

# Create migrations
echo "🔄 Creating migrations..."
python create_migrations.py

# Run migrations for accounts first (contains User model)
echo "🔄 Running migrations for accounts app first..."
python manage.py migrate accounts

# Run all other migrations
echo "🔄 Running remaining migrations..."
python manage.py migrate

echo "✅ Database setup completed."
