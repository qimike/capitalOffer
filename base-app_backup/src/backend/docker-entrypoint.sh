#!/bin/sh

# docker-entrypoint.sh for Django backend
# This script handles database migrations, seeding, and running the server

set -e

echo "=========================================="
echo "Django Backend Startup Script"
echo "=========================================="

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to be ready..."
while ! nc -z db 5432; do
  sleep 0.5
done
echo "PostgreSQL is ready!"

# Wait for Redis to be ready
echo "Waiting for Redis to be ready..."
while ! nc -z redis 6379; do
  sleep 0.5
done
echo "Redis is ready!"

echo "Running database migrations..."
python manage.py migrate --noinput

# Seed database if needed (only if database is empty)
echo "Checking if database needs seeding..."
if ! python -c "from app.models import Offer; import sys; sys.exit(0 if Offer.objects.count() > 0 else 1)" 2>/dev/null; then
  echo "Database is empty, seeding data..."
  python seed_offers.py
else
  echo "Database already has data, skipping seeding."
fi

echo "Collecting static files..."
python manage.py collectstatic --noinput

echo "=========================================="
echo "Starting Django Development Server"
echo "=========================================="

# Run the development server
exec python manage.py runserver 0.0.0.0:3000
